// One Worker for the website: static assets, the /api/email routes and Cloudflare Email Routing.
import PostalMime, { addressParser } from 'postal-mime';
import { authorize } from './auth.js';
import { LIMITS, MAILBOXES, MailError, buildMailjetMessage, isEmail, mailboxAddress, mailboxForRecipient, normalizeEmail, readMailjetResult, recipientBase, validateDraft, validatePersonalLocal } from './mail.js';
import { FOLDERS, activePersonal, deactivatePersonal, getAttachment, getThread, listThreads, newId, publicPersonal, replyHeaders, saveInbound, saveOutbound, savePersonal, threadMailbox, unreadCounts, updateThread } from './store.js';

const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const fail = (message, status) => reply({ error: { message } }, status);
const ID = /^[a-f0-9]{32}$/;
const STAFF_ID = /^[A-Za-z0-9_-]{1,64}$/;

async function readJson(request, maxBytes) {
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > maxBytes) throw new MailError('The request is too large.', 413);
  const text = await request.text();
  if (text.length > maxBytes) throw new MailError('The request is too large.', 413);
  try { return JSON.parse(text); } catch { throw new MailError('Invalid request body.'); }
}

async function allowedThread(env, user, id) {
  if (!ID.test(id)) throw new MailError('Conversation not found.', 404);
  const mailbox = await threadMailbox(env.EMAIL_DB, id);
  if (!mailbox || !user.mailboxes.includes(mailbox)) throw new MailError('Conversation not found.', 404);
  return mailbox;
}

async function sendMail(env, user, input) {
  if (!env.MJ_APIKEY_PUBLIC || !env.MJ_APIKEY_PRIVATE) throw new MailError('Email sending is not configured yet.', 503);
  const draft = validateDraft(input, user.mailboxes, addressParser);
  let headers = { inReplyTo: null, references: [] };
  if (draft.threadId) {
    const mailbox = await allowedThread(env, user, draft.threadId);
    if (mailbox !== draft.mailbox) throw new MailError('Reply from the mailbox that received this conversation.');
    headers = await replyHeaders(env.EMAIL_DB, draft.threadId);
  }
  const company = env.EMAIL_FROM_NAME || 'OdysseyPH IT Solutions';
  const personalBox = user.personal.find(p => p.local === draft.mailbox);
  // The superadmin may read a staff member's personal inbox, but only its owner sends as them.
  if (personalBox && normalizeEmail(personalBox.owner_email) !== user.email) throw new MailError('Only the owner can send from a personal address.', 403);
  const own = personalBox?.active ? personalBox : null;
  if (personalBox && !own) throw new MailError('This personal address is turned off.', 403);
  const fromName = own?.name ? `${own.name} · ${company}` : company; // personal mail goes out under the owner's name
  const message = buildMailjetMessage(draft, { domain: env.EMAIL_DOMAIN, fromName, ...headers, customId: newId() });
  const response = await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(`${env.MJ_APIKEY_PUBLIC}:${env.MJ_APIKEY_PRIVATE}`)}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ Messages: [message] }),
  });
  const result = readMailjetResult(response.status, await response.json().catch(() => null));
  if (!result.ok) {
    console.error('Mailjet rejected a message', { mailbox: draft.mailbox, status: response.status, error: result.error });
    throw new MailError(`Mailjet did not send the email: ${result.error}`, 502);
  }
  return saveOutbound(env.EMAIL_DB, env.EMAIL_FILES, { draft, domain: env.EMAIL_DOMAIN, fromName, sender: user, providerId: result.messageId, ...headers });
}

// Superadmin only: assign, rename or turn off staff members' personal addresses.
async function personalRoutes(request, env, user, path, method) {
  if (!user.admin) throw new MailError('Only the superadmin can manage personal addresses.', 403);
  if (method === 'GET' && path === '/personal') return reply({ mailboxes: publicPersonal(user.personal) });
  const staffId = path.match(/^\/personal\/([^/]+)$/)?.[1];
  if (!staffId || !STAFF_ID.test(staffId)) throw new MailError('Not found.', 404);
  if (method === 'PUT') {
    const body = await readJson(request, 2000);
    const ownerEmail = normalizeEmail(body.ownerEmail);
    if (!isEmail(ownerEmail)) throw new MailError('The staff member needs a login email first.');
    const name = String(body.name || '').replace(/[\r\n"<>]+/g, ' ').trim().slice(0, 80);
    return reply(await savePersonal(env.EMAIL_DB, { staffId, ownerEmail, name, local: validatePersonalLocal(body.local) }));
  }
  if (method === 'DELETE') { await deactivatePersonal(env.EMAIL_DB, staffId); return reply({ ok: true }); }
  throw new MailError('Not found.', 404);
}

async function api(request, env, url) {
  const user = await authorize(request, env);
  const path = url.pathname.replace(/^\/api\/email/, '') || '/';
  const method = request.method;

  if (method === 'GET' && path === '/context') {
    const unread = await unreadCounts(env.EMAIL_DB, user.mailboxes);
    return reply({
      domain: env.EMAIL_DOMAIN,
      sendingEnabled: Boolean(env.MJ_APIKEY_PUBLIC && env.MJ_APIKEY_PRIVATE),
      mailboxes: [
        ...MAILBOXES.filter(m => user.mailboxes.includes(m.id)).map(m => ({ ...m, personal: false })),
        ...user.personal.filter(p => user.mailboxes.includes(p.local)).map(p => ({
          id: p.local, label: p.name || p.local, personal: true, active: Boolean(p.active),
          own: normalizeEmail(p.owner_email) === user.email,
          description: normalizeEmail(p.owner_email) === user.email ? 'Your personal inbox' : `Personal inbox of ${p.name || p.owner_email}${p.active ? '' : ' (address turned off)'}`,
        })),
      ].map(m => ({ ...m, address: mailboxAddress(m.id, env.EMAIL_DOMAIN), unread: unread[m.id] || 0 })),
    });
  }
  if (path === '/personal' || path.startsWith('/personal/')) return personalRoutes(request, env, user, path, method);
  if (method === 'GET' && path === '/threads') {
    const mailbox = url.searchParams.get('mailbox') || 'all';
    const folder = url.searchParams.get('folder') || 'inbox';
    if (!FOLDERS.includes(folder)) throw new MailError('Unknown folder.');
    if (mailbox !== 'all' && !user.mailboxes.includes(mailbox)) throw new MailError('You cannot open this mailbox.', 403);
    const before = url.searchParams.has('before') ? Number(url.searchParams.get('before')) : null;
    return reply(await listThreads(env.EMAIL_DB, { mailboxes: mailbox === 'all' ? user.allView : [mailbox], folder, q: url.searchParams.get('q') || '', before }));
  }
  const threadMatch = path.match(/^\/threads\/([^/]+)$/);
  if (threadMatch && method === 'GET') {
    await allowedThread(env, user, threadMatch[1]);
    return reply(await getThread(env.EMAIL_DB, threadMatch[1]));
  }
  if (threadMatch && method === 'PATCH') {
    await allowedThread(env, user, threadMatch[1]);
    const body = await readJson(request, 1000);
    await updateThread(env.EMAIL_DB, threadMatch[1], { read: typeof body.read === 'boolean' ? body.read : undefined, archived: typeof body.archived === 'boolean' ? body.archived : undefined });
    return reply({ ok: true });
  }
  if (method === 'POST' && path === '/send') {
    // Base64 inflates attachments by a third; leave room for the body text too.
    return reply(await sendMail(env, user, await readJson(request, Math.ceil(LIMITS.outboundAttachmentBytes * 1.4) + LIMITS.body * 4)));
  }
  const attachmentMatch = path.match(/^\/attachments\/([^/]+)$/);
  if (attachmentMatch && method === 'GET') {
    const row = ID.test(attachmentMatch[1]) ? await getAttachment(env.EMAIL_DB, attachmentMatch[1]) : null;
    if (!row || !user.mailboxes.includes(row.mailbox)) throw new MailError('Attachment not found.', 404);
    const object = await env.EMAIL_FILES.get(row.r2_key);
    if (!object) throw new MailError('Attachment not found.', 404);
    return new Response(object.body, { headers: {
      // Always a download, never rendered on our origin: attachments are sender-controlled.
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(row.filename)}`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
    } });
  }
  throw new MailError('Not found.', 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (!url.pathname.startsWith('/api/email/')) return fail('Not found.', 404);
    try { return await api(request, env, url); }
    catch (error) {
      if (error instanceof MailError) return fail(error.message, error.status);
      console.error('Email API failed', error);
      return fail('Something went wrong. Retry shortly.', 500);
    }
  },

  // Cloudflare Email Routing → catch-all → this Worker.
  async email(message, env) {
    const base = recipientBase(message.to, env.EMAIL_DOMAIN);
    const personal = base && await activePersonal(env.EMAIL_DB, base) ? [base] : [];
    const mailbox = mailboxForRecipient(message.to, env.EMAIL_DOMAIN, personal);
    const refuse = async reason => { message.setReject(reason); await message.raw.cancel().catch(() => {}); };
    if (!mailbox) return refuse('This address does not receive email.');
    if (message.rawSize > LIMITS.inboundBytes) return refuse('Message is larger than 25 MB.');
    const raw = await new Response(message.raw).arrayBuffer();
    const parsed = await PostalMime.parse(raw);
    const result = await saveInbound(env.EMAIL_DB, env.EMAIL_FILES, { mailbox, parsed, raw, envelopeFrom: message.from });
    console.log('Stored inbound email', { mailbox, duplicate: Boolean(result.duplicate), size: message.rawSize });
  },
};
