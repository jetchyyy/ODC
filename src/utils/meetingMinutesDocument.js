// Minutes of Meeting: official internal and client meeting record document.
// Control number format: MOM-<year>-<month>-<sequence>, e.g. MOM-2026-11-001.
// Strictly adheres to the company Brand Bible (brandDocument.js) via brandPage().

import { BRAND_CO, esc, longDate, brandPage } from './brandDocument.js';

export const MEETING_PREFIX = 'MOM';
const pad = (n, size = 2) => String(n).padStart(size, '0');
export const controlMonthOf = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
export const formatControlNumber = (month, seq) => `${MEETING_PREFIX}-${month}-${pad(seq, 3)}`;
export const meetingMinutesLink = (id, origin = (typeof window !== 'undefined' ? window.location.origin : '')) =>
  `${origin}/minutes-of-meeting/${id}`;

export const MEETING_TYPES = {
  internal: 'Internal Meeting',
  client: 'Client Meeting',
};

export const SIGNER_KINDS = {
  prepared: 'Prepared by',
  approved: 'Approved by',
  acknowledger: 'Acknowledged by',
};

export const emptyMeetingSigners = () => ({
  s1: { kind: 'prepared', name: '', title: 'Minutes Secretary', order: 1 },
  s2: { kind: 'approved', name: BRAND_CO.approvedBy, title: 'Founder', order: 2 },
});

/* ─── AI Prompt & Paste Parsing ─── */

export const AI_MEETING_PROMPT = `Write formal Minutes of Meeting for OdysseyPH IT Solutions based on the notes/transcript below. Use exactly this plain-text format, no extra commentary:

TITLE: (Concise meeting title / agenda subject)
TYPE: (Internal Meeting | Client Meeting)
CLIENT / GROUP: (Client organization name, project name, or internal team)
DATE: (Month Day, Year)
TIME: (e.g. 10:00 AM - 11:30 AM)
LOCATION: (Office / Google Meet / Zoom / Venue)
PRESIDED BY: (Chairperson full name)
RECORDED BY: (Secretary / note-taker full name)
ATTENDEES: (Names and roles, comma-separated)
ABSENT: (Names or None)
NEXT MEETING: (Month Day, Year and time, or TBD)

## 1. Meeting Overview & Agenda
(Brief context, meeting objectives, and listed agenda items)

## 2. Key Discussions & Decisions
(Concise bullet points or numbered takeaways summarizing discussions and formal decisions approved)

## 3. Action Items
| Action Item | Owner | Due Date | Status |
| (Specific task or deliverable) | (Assignee) | (Target date) | Open |

## 4. Next Meeting & Adjournment
(Time adjourned, next meeting schedule, and closing notes)

Prepared by:
(Full name, Position)

Approved by:
Jetch Merald S. Madaya, Founder

Acknowledged by:
(Attendee or Client name, Position)

Meeting Notes / Transcript:
`;

const FIELD_PATTERNS = [
  ['title', /^TITLE\s*[:\-–]\s*(.+)$/i],
  ['rawType', /^TYPE\s*[:\-–]\s*(.+)$/i],
  ['clientOrGroup', /^(?:CLIENT\s*(?:\/\s*GROUP)?|GROUP|PROJECT|DEPARTMENT)\s*[:\-–]\s*(.+)$/i],
  ['date', /^(?:MEETING\s*)?DATE\s*[:\-–]\s*(.+)$/i],
  ['time', /^(?:MEETING\s*)?TIME\s*[:\-–]\s*(.+)$/i],
  ['location', /^(?:LOCATION|VENUE|PLATFORM)\s*[:\-–]\s*(.+)$/i],
  ['presidedBy', /^(?:PRESIDED\s*BY|CHAIRPERSON|HOST)\s*[:\-–]\s*(.+)$/i],
  ['recordedBy', /^(?:RECORDED\s*BY|SECRETARY|PREPARED\s*BY)\s*[:\-–]\s*(.+)$/i],
  ['attendees', /^ATTENDEES?\s*[:\-–]\s*(.+)$/i],
  ['absent', /^ABSENT(?:\s*\/\s*EXCUSED)?\s*[:\-–]\s*(.+)$/i],
  ['nextMeeting', /^NEXT\s*MEETING\s*[:\-–]\s*(.+)$/i],
];

const PREP_START = /^PREPARED\s+BY\s*:?\s*$/i;
const APPR_START = /^(?:APPROVED|NOTED)\s+BY\s*:?\s*$/i;
const ACK_START = /^(?:ACKNOWLEDGED|CONFORME|ATTENDEES?\s*SIGNOFF)\s*(?:BY)?\s*:?\s*$/i;
const NOISE = /^(?:MINUTES\s+OF\s+(?:THE\s+)?MEETING|MEETING\s+MINUTES|ODYSSEYPH\s+IT\s+SOLUTIONS)$/i;
const ROLE = /\b(founder|ceo|coo|cto|director|manager|lead|engineer|developer|secretary|admin|representative|officer|head|coordinator|client)\b/i;

const clean = s => String(s || '').replace(/^[#>*\s]+|\*\*|__/g, '').replace(/\s+$/, '').trim();

function toIsoDate(text) {
  if (!text) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(text.trim())) return text.trim();
  const d = new Date(text);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function splitTimeRange(text) {
  if (!text) return { startTime: '', endTime: '' };
  const parts = String(text).split(/\s*(?:[-–—]|to)\s*/i).map(s => s.trim()).filter(Boolean);
  return {
    startTime: parts[0] || '',
    endTime: parts[1] || '',
  };
}

function splitPerson(text) {
  const [name, ...rest] = clean(text).split(/\s*(?:,|—|–| - |\|)\s*/);
  return { name: name || '', title: rest.join(', ') };
}

function normalizeBody(text) {
  let lastSection = 0;
  return String(text || '').split('\n').map(line => {
    const t = line.trim();
    if (!t) return '';
    if (/^\|.*\|$/.test(t)) return line.replace(/\s+$/, '');
    const heading = t.replace(/^#{1,6}\s*/, '').replace(/^\*\*(.+)\*\*:?$/, '$1').match(/^(?:section\s+)?(\d{1,2}|[IVX]{1,5})[.):\-–]?\s+([^.]{2,90}?)[:.]?$/i);
    const isHeadingStyle = /^#{1,6}\s/.test(t) || /^\*\*.+\*\*:?$/.test(t);
    const continues = heading && /^\d+$/.test(heading[1]) && Number(heading[1]) === lastSection + 1 && lastSection > 0
      && !/[.!?]$/.test(t) && heading[2].split(/\s+/).length <= 7;
    if (heading && (isHeadingStyle || continues)) {
      if (/^\d+$/.test(heading[1])) lastSection = Number(heading[1]);
      return `## ${heading[1]}. ${heading[2]}`;
    }
    if (/^#{1,6}\s/.test(t)) return `## ${t.replace(/^#{1,6}\s*/, '')}`;
    if (/^[•●▪◦‣–]\s+/.test(t)) return `- ${t.replace(/^[•●▪◦‣–]\s+/, '')}`;
    return line.replace(/\s+$/, '');
  }).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function looksLikeDraftedMinutes(raw) {
  const t = String(raw || '');
  if (t.trim().length < 30) return false;
  const lines = t.split(/\r?\n/).map(l => l.trim());
  const fields = lines.filter(l => FIELD_PATTERNS.some(([, re]) => re.test(clean(l)))).length;
  const markdown = lines.filter(l => /^#{1,3}\s|^\|.*\|$|^\*\*.+\*\*:?$/.test(l)).length;
  return fields >= 2 || markdown >= 2 || lines.some(l => PREP_START.test(clean(l)) || APPR_START.test(clean(l)));
}

export function parseMeetingMinutesText(raw) {
  const lines = String(raw || '').replace(/\r\n?/g, '\n').replace(/\u00a0/g, ' ').split('\n');
  const fields = {};
  const body = [];
  const prepared = [];
  const approved = [];
  const acknowledgers = [];
  let mode = 'body';
  let pending = null;
  let headerDone = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const text = clean(line);

    if (mode === 'body' && !headerDone) {
      const match = FIELD_PATTERNS.find(([, re]) => re.test(text));
      if (match) {
        fields[match[0]] = clean(text.match(match[1])[1]);
        continue;
      }
      if (!text || NOISE.test(text)) continue;
      headerDone = true;
    }

    if (PREP_START.test(text)) { mode = 'prepared'; pending = null; continue; }
    if (APPR_START.test(text)) { mode = 'approved'; pending = null; continue; }
    if (ACK_START.test(text)) { mode = 'ack'; pending = null; continue; }

    if (mode !== 'body') {
      if (!text || /^_{3,}$/.test(text) || /^(?:signature|date)\s*:?.*$/i.test(text)) continue;
      const target = mode === 'prepared' ? prepared : mode === 'approved' ? approved : acknowledgers;
      if (/[,—–|]| - /.test(text)) { target.push(splitPerson(text)); pending = null; continue; }
      if (pending && !pending.title && !ROLE.test(pending.name) && ROLE.test(text)) {
        pending.title = text;
        pending = null;
        continue;
      }
      pending = { name: text, title: '' };
      target.push(pending);
      continue;
    }

    body.push(line);
  }

  const { startTime, endTime } = splitTimeRange(fields.time);
  const rawType = (fields.rawType || '').toLowerCase();
  const meetingType = rawType.includes('client') ? 'client' : 'internal';

  return {
    title: fields.title || '',
    meetingType,
    clientOrGroup: fields.clientOrGroup || '',
    meetingDate: toIsoDate(fields.date),
    startTime,
    endTime,
    location: fields.location || '',
    presidedBy: fields.presidedBy || '',
    recordedBy: fields.recordedBy || '',
    attendees: fields.attendees || '',
    absent: fields.absent || '',
    nextMeeting: fields.nextMeeting || '',
    body: normalizeBody(body.join('\n')),
    prepared,
    approved,
    acknowledgers,
  };
}

/* ─── Markdown, TipTap JSON & Table Normalization ─── */

const inline = s => esc(s)
  .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<i>$2</i>')
  .replace(/__(.+?)__/g, '<b>$1</b>');

export function markdownToHtml(text) {
  const out = [];
  const lines = String(text || '').split('\n');
  let i = 0;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (!t) { i += 1; continue; }
    const h = t.match(/^(#{1,3})\s+(.+)$/);
    if (h) {
      const level = h[1].length;
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      i += 1;
      continue;
    }
    if (/^\|.*\|$/.test(t)) {
      const rows = [];
      while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) { rows.push(lines[i].trim()); i += 1; }
      const cells = r => r.slice(1, -1).split('|').map(c => c.trim());
      const [head, ...rest] = rows.filter(r => !/^\|[\s:|-]+\|$/.test(r));
      if (head) {
        out.push(`<table><tr>${cells(head).map(c => `<th><p>${inline(c)}</p></th>`).join('')}</tr>${rest.map(r => `<tr>${cells(r).map(c => `<td><p>${inline(c)}</p></td>`).join('')}</tr>`).join('')}</table>`);
      }
      continue;
    }
    if (/^[-*]\s+/.test(t) || /^\d+[.)]\s+/.test(t)) {
      const ordered = /^\d+[.)]\s+/.test(t);
      const marker = ordered ? /^\d+[.)]\s+/ : /^[-*]\s+/;
      const items = [];
      while (i < lines.length && marker.test(lines[i].trim())) { items.push(lines[i].trim().replace(marker, '')); i += 1; }
      out.push(`<${ordered ? 'ol' : 'ul'}>${items.map(x => `<li><p>${inline(x)}</p></li>`).join('')}</${ordered ? 'ol' : 'ul'}>`);
      continue;
    }
    if (/^>\s?/.test(t)) {
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) { quote.push(lines[i].trim().replace(/^>\s?/, '')); i += 1; }
      out.push(`<blockquote><p>${inline(quote.join(' '))}</p></blockquote>`);
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|\||[-*]\s|\d+[.)]\s|>)/.test(lines[i].trim())) {
      para.push(lines[i].trim());
      i += 1;
    }
    out.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return out.join('');
}

export function renderMarkdownBody(text) {
  const out = [];
  const lines = String(text || '').split('\n');
  let sectionOpen = false;
  const close = () => { if (sectionOpen) { out.push('</section>'); sectionOpen = false; } };
  let i = 0;

  while (i < lines.length) {
    const t = lines[i].trim();
    if (!t) { i += 1; continue; }

    const h = t.match(/^##\s+(?:(\d{1,2}|[IVX]{1,5})[.)]?\s+)?(.+)$/);
    if (h) {
      close();
      sectionOpen = true;
      out.push(`<section class="sec"><h2>${h[1] ? `<span>${esc(h[1])}</span>` : '<span class="dot"></span>'}${inline(h[2])}</h2>`);
      i += 1;
      continue;
    }

    const h3 = t.match(/^###\s+(.+)$/);
    if (h3) {
      out.push(`<h3 class="sub">${inline(h3[1])}</h3>`);
      i += 1;
      continue;
    }

    if (/^\|.*\|$/.test(t)) {
      const rows = [];
      while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) { rows.push(lines[i].trim()); i += 1; }
      const cells = r => r.slice(1, -1).split('|').map(c => c.trim());
      const [head, ...rest] = rows.filter(r => !/^\|[\s:|-]+\|$/.test(r));
      if (head) {
        out.push(`<div class="tbl"><table><thead><tr>${cells(head).map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rest.map(r => `<tr>${cells(r).map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      }
      continue;
    }

    if (/^[-*]\s+/.test(t) || /^\d+[.)]\s+/.test(t)) {
      const ordered = /^\d+[.)]\s+/.test(t);
      const marker = ordered ? /^\d+[.)]\s+/ : /^[-*]\s+/;
      const items = [];
      while (i < lines.length && marker.test(lines[i].trim())) { items.push(lines[i].trim().replace(marker, '')); i += 1; }
      out.push(`<${ordered ? 'ol' : 'ul'}>${items.map(x => `<li>${inline(x)}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`);
      continue;
    }

    if (/^>\s?/.test(t)) {
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) { quote.push(lines[i].trim().replace(/^>\s?/, '')); i += 1; }
      out.push(`<div class="callout">${inline(quote.join(' '))}</div>`);
      continue;
    }

    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|\||[-*]\s|\d+[.)]\s|>)/.test(lines[i].trim())) {
      para.push(lines[i].trim());
      i += 1;
    }
    out.push(`<p>${inline(para.join(' '))}</p>`);
  }

  close();
  return out.join('\n');
}

const SAFE_HREF = /^(https?:|mailto:|tel:)/i;
const ALIGN = new Set(['left', 'center', 'right', 'justify']);
const textOf = node => (node.text || '') + (node.content || []).map(textOf).join('');
const alignAttr = node => (ALIGN.has(node.attrs?.textAlign) && node.attrs.textAlign !== 'left' ? ` style="text-align:${node.attrs.textAlign}"` : '');
const span = n => { const v = Number(n); return Number.isInteger(v) && v > 1 && v < 50 ? v : 0; };

function marksHtml(node) {
  let html = esc(node.text || '');
  for (const mark of node.marks || []) {
    if (mark.type === 'bold') html = `<b>${html}</b>`;
    else if (mark.type === 'italic') html = `<i>${html}</i>`;
    else if (mark.type === 'underline') html = `<u>${html}</u>`;
    else if (mark.type === 'strike') html = `<s>${html}</s>`;
    else if (mark.type === 'code') html = `<code>${html}</code>`;
    else if (mark.type === 'link' && SAFE_HREF.test(mark.attrs?.href || '')) html = `<a href="${esc(mark.attrs.href)}">${html}</a>`;
  }
  return html;
}

function blockHtml(node) {
  const kids = (node.content || []).map(child => (
    child.type === 'text' ? marksHtml(child) : child.type === 'hardBreak' ? '<br>' : blockHtml(child)
  )).join('');

  switch (node.type) {
    case 'paragraph': return kids ? `<p${alignAttr(node)}>${kids}</p>` : '<p class="gap"></p>';
    case 'heading': return `<h3 class="sub"${alignAttr(node)}>${kids}</h3>`;
    case 'bulletList': return `<ul>${kids}</ul>`;
    case 'orderedList': return `<ol${span(node.attrs?.start) ? ` start="${span(node.attrs.start)}"` : ''}>${kids}</ol>`;
    case 'listItem': return `<li>${kids.replace(/^<p>([\s\S]*?)<\/p>/, '$1')}</li>`;
    case 'blockquote': return `<div class="callout">${kids}</div>`;
    case 'horizontalRule': return '<hr>';
    case 'table': return `<div class="tbl"><table><tbody>${kids}</tbody></table></div>`;
    case 'tableRow': return `<tr>${kids}</tr>`;
    case 'tableHeader':
    case 'tableCell': {
      const tag = node.type === 'tableHeader' ? 'th' : 'td';
      const attrs = `${span(node.attrs?.colspan) ? ` colspan="${span(node.attrs.colspan)}"` : ''}${span(node.attrs?.rowspan) ? ` rowspan="${span(node.attrs.rowspan)}"` : ''}`;
      return `<${tag}${attrs}>${kids.replace(/<p class="gap"><\/p>/g, '')}</${tag}>`;
    }
    default: return '';
  }
}

export function renderDocJson(doc) {
  const out = [];
  let sectionOpen = false;
  const closeSection = () => { if (sectionOpen) { out.push('</section>'); sectionOpen = false; } };

  for (const node of doc?.content || []) {
    if (node.type === 'heading' && (node.attrs?.level === 2 || node.attrs?.level === 1)) {
      closeSection();
      const title = textOf(node).trim();
      const num = title.match(/^(\d{1,2}|[IVX]{1,5})[.)]\s+(.+)$/);
      const heading = num
        ? { badge: `<span>${esc(num[1])}</span>`, text: esc(num[2]) }
        : { badge: '<span class="dot"></span>', text: (node.content || []).map(marksHtml).join('') };
      out.push(`<section class="sec"><h2>${heading.badge}${heading.text}</h2>`);
      sectionOpen = true;
      continue;
    }
    out.push(blockHtml(node));
  }
  closeSection();
  return out.join('\n');
}

/** Promote a leading <th>-only row inside <table><tbody> into <thead> so multi-page prints repeat table headers. */
export function normalizeTableHtml(html) {
  return String(html || '').replace(
    /(<table\b[^>]*>(?:\s*<colgroup>[\s\S]*?<\/colgroup>)?)\s*<tbody>\s*(<tr>(?:(?!<\/tr>)(?!<td\b)[\s\S])*?<th\b[\s\S]*?<\/tr>)\s*/gi,
    '$1<thead>$2</thead><tbody>',
  );
}

export function editorContentOf(minutes) {
  if (minutes?.bodyJson) {
    try {
      const parsed = JSON.parse(minutes.bodyJson);
      if (parsed && typeof parsed === 'object' && parsed.type === 'doc') return parsed;
    } catch {
      /* fall back to body text */
    }
  }
  const text = minutes?.body || '';
  if (!text) return '';
  return text.trim().startsWith('<') ? text : markdownToHtml(text);
}

/* ─── Branded HTML Builder ─── */

const MOM_CSS = `
.pg{position:relative}
.band .bar{gap:24px}
.band h1{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.docno{flex-shrink:0;white-space:nowrap}
.stamp{position:absolute;top:340px;left:50%;transform:translateX(-50%) rotate(-18deg);font-family:Poppins,sans-serif;font-size:110px;font-weight:800;letter-spacing:8px;color:rgba(22,39,58,.07);pointer-events:none;white-space:nowrap;z-index:2}
.stamp.revoked{color:rgba(220,38,38,.13)}
.revoked-note{margin:0 0 18px;padding:10px 14px;border:1px solid #fca5a5;background:#fef2f2;color:#991b1b;border-radius:8px;font-size:12px}
.mom-meta-card{background:#f8f9fa;border:1px solid var(--line);border-radius:10px;padding:16px 20px;margin-bottom:22px;break-inside:avoid}
.mom-meta-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding-bottom:12px;margin-bottom:12px;border-bottom:1px solid var(--line)}
.mom-title{font-family:Poppins,sans-serif;font-size:17px;font-weight:700;color:var(--navy);line-height:1.3;margin-top:4px}
.mom-badges{display:flex;gap:6px;flex-wrap:wrap;flex-shrink:0}
.mom-pill{display:inline-block;padding:3px 9px;border-radius:999px;font-size:9.5px;font-weight:700;letter-spacing:.9px;text-transform:uppercase;white-space:nowrap}
.mom-pill-internal{background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe}
.mom-pill-client{background:#fff7ed;color:#c2410c;border:1px solid #fed7aa}
.mom-pill-draft{background:#f1f5f9;color:#475569;border:1px solid #cbd5e1}
.mom-pill-issued{background:#ecfdf3;color:#027a48;border:1px solid #a6f4c5}
.mom-pill-revoked{background:#fef3f2;color:#b42318;border:1px solid #fecdca}
.mom-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;font-size:12px}
.mom-item dt{font-size:9.5px;font-weight:700;letter-spacing:1.3px;color:var(--muted);text-transform:uppercase;margin-bottom:2px}
.mom-item dd{color:var(--ink);font-weight:500;line-height:1.5;overflow-wrap:break-word}
.mom-item.full{grid-column:1 / -1}
.sec{margin-bottom:18px}
.sec h2{font-family:Poppins,sans-serif;font-size:13.5px;font-weight:700;color:var(--navy);display:flex;align-items:center;gap:10px;margin:18px 0 8px;break-after:avoid;page-break-after:avoid}
.sec h2 span{display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 5px;border-radius:6px;background:var(--orange);color:#fff;font-size:11px;flex-shrink:0}
.sec h2 span.dot{min-width:8px;width:8px;height:8px;padding:0;border-radius:50%}
.mom-body p,.mom-body li{line-height:1.65;font-size:12.3px;color:var(--ink)}
.mom-body p{margin:0 0 8px}
.mom-body p.gap{height:8px;margin:0}
.mom-body ol,.mom-body ul{padding-left:22px;margin:6px 0 12px}
.mom-body li{margin-bottom:4px}
.mom-body li p{margin:0}
.mom-body h3.sub{font-family:Poppins,sans-serif;font-size:12.5px;font-weight:600;color:#c2410c;margin:14px 0 6px;break-after:avoid;page-break-after:avoid}
.mom-body .callout{margin:10px 0 12px;border-left:3px solid var(--orange);background:#f8f6f2;padding:9px 14px;font-size:12px;line-height:1.6;border-radius:0 8px 8px 0;color:#3d4756}
.mom-body .callout p{margin:0}
.mom-body hr{border:0;border-top:1px solid var(--line);margin:14px 0}
.mom-body a{color:#c2410c}
.mom-body .tbl{border:1px solid #3a4a5c;border-radius:8px;overflow:hidden;margin:10px 0 14px}
.mom-body table{width:100%;border-collapse:collapse}
.mom-body thead{display:table-header-group}
.mom-body th{background:#ebe5dc;font-size:10px;letter-spacing:1.1px;text-align:left;text-transform:uppercase;padding:9px 14px;border-bottom:1px solid #3a4a5c;color:var(--navy);font-weight:700}
.mom-body td{padding:9px 14px;border-top:1px solid var(--line);font-size:12px;line-height:1.55;vertical-align:top}
.mom-body tbody tr:first-child td{border-top:none}
.mom-body tr{break-inside:avoid;page-break-inside:avoid}
.mom-body td p,.mom-body th p{margin:0}
.mom-signers{display:grid;grid-template-columns:1fr 1fr;gap:24px 36px;margin:36px 0 22px;break-inside:avoid;page-break-inside:avoid}
.mom-signers.has-ack .mom-signer.ack-card{background:#fcfcfd}
.mom-signer{border:1px solid var(--line);border-radius:8px;padding:14px 16px;background:#fcfcfd}
.mom-signer .eyebrow{color:var(--navy)}
.sig-mark{font-family:'Great Vibes',cursive;font-size:32px;line-height:1;color:#111;height:44px;display:flex;align-items:flex-end;padding-bottom:2px;margin:6px 0 -4px;white-space:nowrap;overflow:visible}
.sig-mark.empty{height:44px}
.mom-signer .sig-line{margin:0 0 8px;border-bottom:1px solid #3a4a5c}
.sig-meta{font-size:9.5px;color:var(--muted);margin-top:3px;line-height:1.4}
.sig-name.blank{color:var(--muted);font-weight:500}
@page{size:letter;margin:12mm 0}
@page :first{margin-top:0;margin-bottom:12mm}
@media print{.pg{min-height:995px}.mom-body .tbl{overflow:visible}}
/* Always keep letter width on screen so frame scaling handles fit without responsive collapse. */
@media screen and (max-width:840px){.pg{width:816px;min-height:1056px}.hd,.body,.ft{padding-left:64px;padding-right:64px}.band .bar{padding:0 64px 0 28px}.band .tab{width:64px}.band h1{font-size:24px}.mom-signers{grid-template-columns:1fr 1fr}}
`;

function signerCard(signer, signature, timeZone) {
  const isSigned = Boolean(signature?.signedAt);
  let signedDisplay = '';
  if (isSigned) {
    const parsedDate = new Date(signature.signedAt);
    signedDisplay = !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleString('en-PH', { timeZone, dateStyle: 'medium', timeStyle: 'short' })
      : longDate(signature.signedAt?.split?.('T')?.[0] || signature.signedAt);
  }
  const displayName = signature?.name || signer.name;
  const meta = isSigned
    ? `<div class="sig-meta">Signed electronically ${esc(signedDisplay)}</div>`
    : '<div class="sig-meta">Date: ____________</div>';
  return `
    <div class="mom-signer${signer.kind === 'acknowledger' ? ' ack-card' : ''}">
      <div class="eyebrow">${esc(SIGNER_KINDS[signer.kind] || 'Signatory')}</div>
      ${isSigned ? `<div class="sig-mark">${esc(signature.name)}</div>` : '<div class="sig-mark empty"></div>'}
      <div class="sig-line"></div>
      ${displayName ? `<div class="sig-name">${esc(displayName)}</div>` : '<div class="sig-name blank">Name &amp; signature</div>'}
      <div class="sig-tag">${esc((signer.title || '').toUpperCase())}</div>
      ${meta}
    </div>
  `;
}

export function buildMeetingMinutesHtml(minutes, signatures = {}, options = {}) {
  const m = minutes || {};
  const origin = options.origin || (typeof window !== 'undefined' ? window.location.origin : '');
  const timeZone = options.timeZone || 'Asia/Manila';
  const autoPrint = Boolean(options.autoPrint);

  const number = m.controlNumber || 'MOM-DRAFT';
  const typeKey = m.meetingType === 'client' ? 'client' : 'internal';
  const statusKey = ['draft', 'issued', 'revoked'].includes(m.status) ? m.status : 'draft';

  let rawBody = '';
  if (m.bodyJson) {
    try {
      const parsed = JSON.parse(m.bodyJson);
      if (parsed && typeof parsed === 'object' && parsed.type === 'doc') rawBody = renderDocJson(parsed);
    } catch {
      rawBody = '';
    }
  }
  if (!rawBody && m.body) {
    rawBody = m.body.trim().startsWith('<') ? m.body : renderMarkdownBody(m.body);
  }
  const contentHtml = normalizeTableHtml(rawBody);

  const timeRange = [m.startTime, m.endTime].filter(Boolean).join(' – ');
  const metaItem = (label, value, full = false) => (
    value ? `<div class="mom-item${full ? ' full' : ''}"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>` : ''
  );

  const stamp = statusKey === 'revoked'
    ? '<div class="stamp revoked">REVOKED</div>'
    : statusKey === 'draft'
      ? '<div class="stamp">DRAFT</div>'
      : '';

  const signers = Object.entries(m.signers || emptyMeetingSigners())
    .map(([id, s]) => ({ id, ...s }))
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const verify = m.id
    ? `Verify: ${origin.replace(/^https?:\/\//, '')}/minutes-of-meeting/${m.id}`
    : `${BRAND_CO.name} · Minutes of Meeting`;

  const body = `${stamp}
    ${statusKey === 'revoked' ? `<div class="revoked-note"><b>These Minutes of Meeting have been revoked</b>${m.revokedReason ? ` — ${esc(m.revokedReason)}` : ''}. Kept for record purposes only.</div>` : ''}
    <div class="mom-meta-card">
      <div class="mom-meta-top">
        <div>
          <div class="eyebrow">Meeting Title / Subject</div>
          <div class="mom-title">${esc(m.title || 'Untitled Meeting')}</div>
        </div>
        <div class="mom-badges">
          <span class="mom-pill mom-pill-${typeKey}">${esc(MEETING_TYPES[typeKey])}</span>
          <span class="mom-pill mom-pill-${statusKey}">${esc(statusKey.toUpperCase())}</span>
        </div>
      </div>
      <dl class="mom-grid">
        ${metaItem('Date', longDate(m.meetingDate) || m.meetingDate)}
        ${metaItem('Time', timeRange)}
        ${metaItem('Location / Platform', m.location)}
        ${metaItem(typeKey === 'client' ? 'Client / Project' : 'Department / Group', m.clientOrGroup)}
        ${metaItem('Presided by', m.presidedBy)}
        ${metaItem('Recorded by', m.recordedBy)}
        ${metaItem('Attendees', m.attendees, true)}
        ${metaItem('Absent / Excused', m.absent, true)}
        ${metaItem('Next Meeting', m.nextMeeting, true)}
      </dl>
    </div>

    <div class="mom-body">${contentHtml}</div>

    ${signers.length ? `<div class="mom-signers">${signers.map(s => signerCard(s, signatures[s.id], timeZone)).join('')}</div>` : ''}
  `;

  return brandPage({
    title: 'MINUTES OF MEETING',
    numberLabel: 'CONTROL / TRACKING NO.',
    number,
    body,
    footLeft: verify,
    footRight: `Minutes of Meeting ${number}`,
    extraCss: MOM_CSS,
    origin,
    autoPrint,
  })
    .replace('</head>', '<link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet"></head>')
    .replace(/<title>.*?<\/title>/, `<title>${esc(number)} — ${esc(m.title || 'Minutes of Meeting')}</title>`);
}
