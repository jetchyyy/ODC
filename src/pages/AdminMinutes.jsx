import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Plus, Search, NotebookPen, Link2, Check, Printer, ImageDown,
  Pencil, Send, Ban, Trash2, ArrowLeft, PenLine, UserPlus, X,
} from 'lucide-react';
import LoadingButton from '../components/ui/LoadingButton';
import { useSystemModal } from '../components/ui/SystemModalContext';
import MeetingMinutesFrame from '../components/meetingMinutes/MeetingMinutesFrame';
import MeetingMinutesEditor from '../components/meetingMinutes/MeetingMinutesEditor';
import {
  emptyMeetingSigners, meetingMinutesLink, SIGNER_KINDS, MEETING_TYPES, editorContentOf,
} from '../utils/meetingMinutesDocument';
import { BRAND_CO, longDate } from '../utils/brandDocument';
import {
  subscribeMeetingMinutes, subscribeMeetingMinutesDoc, subscribeMeetingSignatures,
  createMeetingMinutes, updateMeetingMinutes, issueMeetingMinutes, revokeMeetingMinutes,
  deleteMeetingMinutesDraft, signMeetingMinutes, normalizeSignerName,
} from '../services/meetingMinutesService';
import './AdminTasks.css';
import './AdminMinutes.css';

const STATUS_LABEL = { draft: 'Draft', issued: 'Issued', revoked: 'Revoked' };
const newSlotId = () => `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const errorText = err => (err?.code === 'permission-denied'
  ? 'You do not have permission for this action, or the document changed. Refresh and try again.'
  : err?.message || 'Something went wrong. Please try again.');

function formFrom(minutes) {
  const signers = Object.entries(minutes?.signers || emptyMeetingSigners())
    .map(([id, s]) => ({ id, ...s }))
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return {
    title: minutes?.title || '',
    meetingType: minutes?.meetingType === 'client' ? 'client' : 'internal',
    clientOrGroup: minutes?.clientOrGroup || '',
    meetingDate: minutes?.meetingDate || todayIso(),
    startTime: minutes?.startTime || '',
    endTime: minutes?.endTime || '',
    location: minutes?.location || '',
    presidedBy: minutes?.presidedBy || BRAND_CO.approvedBy,
    recordedBy: minutes?.recordedBy || '',
    attendees: minutes?.attendees || '',
    absent: minutes?.absent || '',
    nextMeeting: minutes?.nextMeeting || '',
    body: minutes?.body || '',
    bodyJson: minutes?.bodyJson || '',
    signers,
  };
}

function mergeParsedIntoForm(form, parsed) {
  const next = { ...form };
  for (const key of [
    'title', 'meetingType', 'clientOrGroup', 'meetingDate', 'startTime', 'endTime',
    'location', 'presidedBy', 'recordedBy', 'attendees', 'absent', 'nextMeeting',
  ]) {
    if (parsed[key]) next[key] = parsed[key];
  }
  if (parsed.body) next.body = parsed.body;

  const extraSigners = [];
  (parsed.prepared || []).forEach((p, idx) => extraSigners.push({ id: idx === 0 ? 's1' : newSlotId(), kind: 'prepared', name: p.name, title: p.title || 'Minutes Secretary' }));
  (parsed.approved || []).forEach((p, idx) => extraSigners.push({ id: idx === 0 ? 's2' : newSlotId(), kind: 'approved', name: p.name, title: p.title || 'Founder' }));
  (parsed.acknowledgers || []).forEach(p => extraSigners.push({ id: newSlotId(), kind: 'acknowledger', name: p.name, title: p.title || 'Attendee' }));
  if (extraSigners.length) next.signers = extraSigners;

  return next;
}

function Editor({ user, minutes, onClose, onSaved }) {
  const [form, setForm] = useState(() => formFrom(minutes));
  const [initialContent] = useState(() => editorContentOf(minutes));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const onDoc = useCallback((json, html) => {
    setForm(f => ({ ...f, bodyJson: JSON.stringify(json), body: html }));
  }, []);
  const onParsed = useCallback(parsed => {
    setForm(f => mergeParsedIntoForm(f, parsed));
    setNotice('Draft parsed into the meeting summary, agenda, action-items table, and signers.');
  }, []);

  const setSigner = (id, key, value) => {
    setForm(f => ({
      ...f,
      signers: f.signers.map(s => (s.id === id ? { ...s, [key]: value } : s)),
    }));
  };

  const addAcknowledger = () => {
    setForm(f => ({
      ...f,
      signers: [...f.signers, { id: newSlotId(), kind: 'acknowledger', name: '', title: 'Attendee / Client' }],
    }));
  };

  const removeSigner = id => {
    setForm(f => ({ ...f, signers: f.signers.filter(s => s.id !== id) }));
  };

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const id = minutes
        ? (await updateMeetingMinutes(user, minutes.id, form), minutes.id)
        : await createMeetingMinutes(user, form);
      onSaved(id);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mom-doc-editor">
      <div className="mom-doc-head">
        <button type="button" className="task-back" onClick={onClose}>
          <ArrowLeft size={14} /> Back to meeting minutes
        </button>
        <h3>{minutes ? `Editing ${minutes.controlNumber}` : 'New Minutes of Meeting'}</h3>
        <span className="task-muted">
          {minutes
            ? 'Draft — only authorized managers can view until issued.'
            : 'Control number (MOM-YYYY-MM-XXX) is assigned sequentially upon first save.'}
        </span>
      </div>

      {error && <p className="task-error" role="alert">{error}</p>}
      {notice && <p className="mom-notice" role="status">{notice}</p>}

      <div className="mom-doc-layout">
        <MeetingMinutesEditor
          form={form}
          controlNumber={minutes?.controlNumber}
          initialContent={initialContent}
          onField={set}
          onDoc={onDoc}
          onParsed={onParsed}
        />

        <aside className="mom-doc-side" aria-label="Signatories and publishing">
          <h4>Signatories &amp; Acknowledgements</h4>
          {form.signers.map(s => (
            <div className="mom-signer-block" key={s.id}>
              <div className="mom-signer-head">
                <span>{SIGNER_KINDS[s.kind] || 'Signer'}</span>
                {s.kind === 'acknowledger' && (
                  <button type="button" title="Remove signer slot" onClick={() => removeSigner(s.id)}>
                    <X size={13} />
                  </button>
                )}
              </div>
              <input
                aria-label={`${s.kind} name`}
                value={s.name}
                maxLength={200}
                placeholder={s.kind === 'acknowledger' ? 'Leave blank for open attendee sign-off' : 'Full Legal Name'}
                onChange={e => setSigner(s.id, 'name', e.target.value)}
              />
              <input
                aria-label={`${s.kind} title`}
                value={s.title}
                maxLength={200}
                placeholder="Role / Position"
                onChange={e => setSigner(s.id, 'title', e.target.value)}
              />
            </div>
          ))}

          <button type="button" className="mom-add-btn" onClick={addAcknowledger}>
            <UserPlus size={14} /> Add attendee / client signer
          </button>

          <div className="mom-doc-save">
            <LoadingButton type="button" className="task-primary" loading={busy} loadingLabel="Saving…" onClick={save}>
              {minutes ? 'Save changes' : 'Save draft'}
            </LoadingButton>
            <button type="button" onClick={onClose} disabled={busy}>Cancel</button>
          </div>
          <p className="task-muted" style={{ fontSize: '11px', lineHeight: '1.45', margin: 0 }}>
            Save as a draft first, then review the formatted document and issue it to generate the shareable e-signing link.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Detail({ user, id, onBack, onEdit }) {
  const modal = useSystemModal();
  const frame = useRef(null);
  const [minutes, setMinutes] = useState(undefined);
  const [signatures, setSignatures] = useState({});
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [revoking, setRevoking] = useState(false);
  const [reason, setReason] = useState('');
  const [signName, setSignName] = useState('');

  useEffect(() => subscribeMeetingMinutesDoc(id, setMinutes, err => setError(errorText(err))), [id]);
  useEffect(() => subscribeMeetingSignatures(id, setSignatures, () => setSignatures({})), [id]);

  if (minutes === undefined) return <div className="task-skeleton" role="status" aria-label="Loading minutes of meeting" />;
  if (minutes === null) return <p className="task-error" role="alert">These Minutes of Meeting no longer exist.</p>;

  const link = meetingMinutesLink(minutes.id);
  const signers = Object.entries(minutes.signers || {})
    .map(([slot, s]) => ({ slot, ...s }))
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const internalPending = signers.find(s => (s.kind === 'prepared' || s.kind === 'approved') && !signatures[s.slot]);

  const run = async (key, work) => {
    setBusy(key);
    setError('');
    try {
      await work();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy('');
    }
  };

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const issue = async () => {
    if (!await modal.confirm({
      title: `Issue ${minutes.controlNumber}?`,
      message: 'Issuing locks the meeting record and activates its shareable verification and e-signing link.',
      confirmLabel: 'Issue Minutes',
    })) return;
    run('issue', () => issueMeetingMinutes(user, minutes.id));
  };

  const remove = async () => {
    if (!await modal.confirm({
      title: `Delete draft ${minutes.controlNumber}?`,
      message: 'The draft will be permanently removed. The control number will not be reused.',
      confirmLabel: 'Delete Draft',
    })) return;
    run('delete', async () => {
      await deleteMeetingMinutesDraft(minutes.id);
      onBack();
    });
  };

  return (
    <div className="mom-detail">
      <div className="mom-detail-side">
        <button type="button" className="task-back" onClick={onBack}>
          <ArrowLeft size={14} /> Back to meeting minutes
        </button>

        <div>
          <p className="task-eyebrow">Control / Tracking No.</p>
          <h3 className="mom-number">{minutes.controlNumber}</h3>
          <p className="mom-title-side">{minutes.title}</p>
          <p className="mom-sub-side">{minutes.clientOrGroup || MEETING_TYPES[minutes.meetingType] || 'Internal Meeting'}</p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
            <span className={`task-pill mom-status-${minutes.status}`}>{STATUS_LABEL[minutes.status]}</span>
            <span className={`task-pill mom-type-${minutes.meetingType || 'internal'}`}>
              {MEETING_TYPES[minutes.meetingType] || 'Internal Meeting'}
            </span>
          </div>
        </div>

        {error && <p className="task-error" role="alert">{error}</p>}

        <div className="mom-actions">
          {minutes.status === 'draft' && (
            <button type="button" onClick={() => onEdit(minutes)}>
              <Pencil size={14} /> Edit Draft
            </button>
          )}
          {minutes.status === 'draft' && (
            <LoadingButton type="button" className="task-primary" loading={busy === 'issue'} loadingLabel="Issuing…" onClick={issue}>
              <Send size={14} /> Issue Minutes
            </LoadingButton>
          )}
          {minutes.status !== 'draft' && (
            <button type="button" onClick={() => copy(link, 'link')}>
              {copied === 'link' ? <Check size={14} /> : <Link2 size={14} />}
              {copied === 'link' ? 'Link copied' : 'Copy Share Link'}
            </button>
          )}
          <button type="button" onClick={() => frame.current?.print()}>
            <Printer size={14} /> Print / Save as PDF
          </button>
          <LoadingButton
            type="button"
            loading={busy === 'png'}
            loadingLabel="Rendering…"
            onClick={() => run('png', () => frame.current.savePng(`${minutes.controlNumber}.png`))}
          >
            <ImageDown size={14} /> Save as PNG
          </LoadingButton>
          {minutes.status === 'issued' && (
            <button type="button" className="task-danger" onClick={() => setRevoking(v => !v)}>
              <Ban size={14} /> Revoke
            </button>
          )}
          {minutes.status === 'draft' && (
            <LoadingButton type="button" className="task-danger" loading={busy === 'delete'} loadingLabel="Deleting…" onClick={remove}>
              <Trash2 size={14} /> Delete Draft
            </LoadingButton>
          )}
        </div>

        {minutes.status !== 'draft' && (
          <p className="mom-link-box"><code>{link}</code></p>
        )}

        {revoking && (
          <form
            className="task-inline-form"
            onSubmit={e => {
              e.preventDefault();
              run('revoke', async () => {
                await revokeMeetingMinutes(user, minutes.id, reason);
                setRevoking(false);
                setReason('');
              });
            }}
          >
            <label className="task-field">
              <span>Reason for revocation:</span>
              <textarea
                required
                maxLength={500}
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Corrections needed or superseded by revised minutes..."
              />
            </label>
            <LoadingButton type="submit" className="task-danger" loading={busy === 'revoke'} loadingLabel="Revoking…">
              Confirm Revoke
            </LoadingButton>
          </form>
        )}

        <h4 style={{ margin: 0, fontSize: '13.5px', color: '#fff' }}>
          Signatures ({signers.filter(s => signatures[s.slot]).length}/{signers.length})
        </h4>
        <ul className="mom-sign-list">
          {signers.map(s => {
            const sig = signatures[s.slot];
            return (
              <li key={s.slot}>
                <span className={`mom-dot${sig ? ' is-signed' : ''}`} aria-hidden="true" />
                <div className="mom-sign-meta">
                  <b>{sig?.name || s.name || s.title}</b>
                  <small>{SIGNER_KINDS[s.kind]}{s.title && (sig?.name || s.name) ? ` · ${s.title}` : ''}</small>
                  <small>{sig ? `Signed ${new Date(sig.signedAt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}` : 'Pending signature'}</small>
                </div>
                {!sig && minutes.status === 'issued' && (
                  <button
                    type="button"
                    className="mom-slot-copy"
                    onClick={() => copy(`${link}?sign=${s.slot}`, s.slot)}
                    title={`Copy sign link for ${s.name || s.title}`}
                    aria-label={`Copy sign link for ${s.name || s.title}`}
                  >
                    {copied === s.slot ? <Check size={13} /> : <Link2 size={13} />}
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {internalPending && minutes.status === 'issued' && (
          <form
            style={{ display: 'grid', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}
            onSubmit={e => {
              e.preventDefault();
              const typed = normalizeSignerName(signName || internalPending.name);
              if (internalPending.name && typed.toLowerCase() !== normalizeSignerName(internalPending.name).toLowerCase()) {
                setError(`Please type the exact name: “${internalPending.name}”.`);
                return;
              }
              run('sign', async () => {
                await signMeetingMinutes(minutes.id, internalPending.slot, typed, user);
                setSignName('');
              });
            }}
          >
            <label className="task-field">
              <span>Sign ({SIGNER_KINDS[internalPending.kind]}) — type “{internalPending.name}”:</span>
              <input
                value={signName}
                onChange={e => setSignName(e.target.value)}
                placeholder={internalPending.name}
              />
            </label>
            <LoadingButton type="submit" className="task-primary" loading={busy === 'sign'} loadingLabel="Signing…">
              <PenLine size={14} /> Sign Minutes
            </LoadingButton>
          </form>
        )}
      </div>

      <div className="mom-detail-doc">
        <MeetingMinutesFrame
          ref={frame}
          minutes={minutes}
          signatures={signatures}
          title={`Minutes ${minutes.controlNumber}`}
        />
      </div>
    </div>
  );
}

export default function AdminMinutes({ firebaseUser, can }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [meetingType, setMeetingType] = useState('all');
  const [view, setView] = useState({ mode: 'list' });
  const user = firebaseUser;

  useEffect(() => subscribeMeetingMinutes(
    rows => { setList(rows); setLoading(false); setError(''); },
    err => { setError(errorText(err)); setLoading(false); },
  ), []);

  if (!can('meetingminutes:manage')) {
    return (
      <div className="task-module">
        <p className="task-error" role="alert">
          You need the “Manage Meeting Minutes” permission to access this module.
        </p>
      </div>
    );
  }

  const visible = list.filter(m => {
    const matchStatus = status === 'all' || m.status === status;
    const matchType = meetingType === 'all' || (m.meetingType || 'internal') === meetingType;
    const matchSearch = !search || `${m.controlNumber} ${m.title} ${m.clientOrGroup} ${m.presidedBy} ${m.attendees}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const draftCount = list.filter(m => m.status === 'draft').length;
  const issuedCount = list.filter(m => m.status === 'issued').length;
  const clientCount = list.filter(m => m.meetingType === 'client').length;

  return (
    <div className="task-module mom-module">
      {view.mode === 'list' && (
        <>
          <header className="task-heading">
            <div>
              <p className="task-eyebrow">Governance &amp; Coordination</p>
              <h2>Minutes of Meeting</h2>
              <p>Document internal syncs and client meetings with agenda takeaways, action-item tables, and electronic sign-offs.</p>
            </div>
            <button type="button" className="task-primary task-heading-action" onClick={() => setView({ mode: 'edit' })}>
              <Plus size={16} /> New Minutes
            </button>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 18 }}>
            <div className="task-metric-card" style={{ padding: '12px 16px', background: '#ffffff05', border: '1px solid var(--task-line)', borderRadius: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--task-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Total Recorded</span>
              <strong style={{ display: 'block', fontSize: 22, marginTop: 4 }}>{list.length}</strong>
            </div>
            <div className="task-metric-card" style={{ padding: '12px 16px', background: '#ffffff05', border: '1px solid var(--task-line)', borderRadius: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--task-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Drafts</span>
              <strong style={{ display: 'block', fontSize: 22, marginTop: 4 }}>{draftCount}</strong>
            </div>
            <div className="task-metric-card" style={{ padding: '12px 16px', background: '#ffffff05', border: '1px solid var(--task-line)', borderRadius: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--task-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Issued</span>
              <strong style={{ display: 'block', fontSize: 22, color: '#34d399', marginTop: 4 }}>{issuedCount}</strong>
            </div>
            <div className="task-metric-card" style={{ padding: '12px 16px', background: '#ffffff05', border: '1px solid var(--task-line)', borderRadius: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--task-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Client Syncs</span>
              <strong style={{ display: 'block', fontSize: 22, color: '#fb923c', marginTop: 4 }}>{clientCount}</strong>
            </div>
          </div>

          <div className="task-toolbar" style={{ flexWrap: 'wrap', gap: 10 }}>
            <label className="task-search" style={{ minWidth: 260 }}>
              <Search size={15} aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search control no., title, client, attendees..."
                aria-label="Search minutes of meeting"
              />
            </label>
            <div className="task-segmented" role="group" aria-label="Status filter">
              {['all', 'draft', 'issued', 'revoked'].map(s => (
                <button type="button" key={s} aria-pressed={status === s} onClick={() => setStatus(s)}>
                  {s === 'all' ? 'All Status' : STATUS_LABEL[s]}
                </button>
              ))}
            </div>
            <div className="task-segmented" role="group" aria-label="Meeting type filter">
              {['all', 'internal', 'client'].map(t => (
                <button type="button" key={t} aria-pressed={meetingType === t} onClick={() => setMeetingType(t)}>
                  {t === 'all' ? 'All Types' : MEETING_TYPES[t]}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="task-error" role="alert">{error}</p>}

          {loading ? (
            <div className="task-skeleton" role="status" aria-label="Loading meeting minutes" />
          ) : visible.length === 0 ? (
            <div className="task-empty">
              <NotebookPen size={32} aria-hidden="true" />
              <h3>{list.length ? 'No meeting minutes match' : 'No Minutes of Meeting yet'}</h3>
              <p>
                {list.length
                  ? 'Try clearing your search query or filters.'
                  : 'Click "+ New Minutes" to record your first meeting.'}
              </p>
            </div>
          ) : (
            <div className="mom-table-wrap">
              <table className="mom-table">
                <thead>
                  <tr>
                    <th scope="col">Control No.</th>
                    <th scope="col">Meeting Title / Subject</th>
                    <th scope="col">Type</th>
                    <th scope="col">Date</th>
                    <th scope="col">Presided by</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(m => (
                    <tr key={m.id}>
                      <th scope="row">
                        <button type="button" className="mom-link-btn" onClick={() => setView({ mode: 'detail', id: m.id })}>
                          {m.controlNumber}
                        </button>
                      </th>
                      <td>
                        <b>{m.title}</b>
                        {m.clientOrGroup && <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: 2 }}>{m.clientOrGroup}</div>}
                      </td>
                      <td>
                        <span className={`task-pill mom-type-${m.meetingType || 'internal'}`}>
                          {m.meetingType === 'client' ? 'Client' : 'Internal'}
                        </span>
                      </td>
                      <td>{m.meetingDate ? longDate(m.meetingDate) : '—'}</td>
                      <td>{m.presidedBy || '—'}</td>
                      <td>
                        <span className={`task-pill mom-status-${m.status}`}>{STATUS_LABEL[m.status]}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {view.mode === 'edit' && (
        <Editor
          user={user}
          minutes={view.minutes}
          onClose={() => setView(view.minutes ? { mode: 'detail', id: view.minutes.id } : { mode: 'list' })}
          onSaved={id => setView({ mode: 'detail', id })}
        />
      )}

      {view.mode === 'detail' && (
        <Detail
          user={user}
          id={view.id}
          onBack={() => setView({ mode: 'list' })}
          onEdit={minutes => setView({ mode: 'edit', minutes })}
        />
      )}
    </div>
  );
}
