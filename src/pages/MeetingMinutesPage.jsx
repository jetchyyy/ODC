import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Printer, ImageDown, Link2, Check, PenLine, ShieldCheck } from 'lucide-react';
import LoadingButton from '../components/ui/LoadingButton';
import MeetingMinutesFrame from '../components/meetingMinutes/MeetingMinutesFrame';
import { SIGNER_KINDS, MEETING_TYPES, saveFramePng } from '../utils/meetingMinutesDocument';
import { longDate } from '../utils/brandDocument';
import { copyTextToClipboard } from '../utils/billingStatementDocument';
import {
  subscribeMeetingMinutesDoc, subscribeMeetingSignatures,
  signMeetingMinutes, normalizeSignerName,
} from '../services/meetingMinutesService';
import { useBrandFonts } from '../hooks/useBrandFonts';
import './MeetingMinutesPage.css';

const STATUS_LABEL = {
  issued: 'Issued & Official',
  revoked: 'Revoked',
  draft: 'Draft',
};

/**
 * Public verification and attendee/client acknowledgement portal for Minutes of Meeting.
 */
export default function MeetingMinutesPage() {
  useBrandFonts();
  const { id } = useParams();
  const [params] = useSearchParams();
  const frame = useRef(null);
  const holder = useRef(null);

  const [minutes, setMinutes] = useState(undefined);
  const [signatures, setSignatures] = useState({});
  const [scale, setScale] = useState(1);
  const [slot, setSlot] = useState(params.get('sign') || '');
  const [name, setName] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState({ tone: '', text: '' });
  const [copied, setCopied] = useState(false);

  useEffect(() => subscribeMeetingMinutesDoc(id, setMinutes, () => setMinutes(null)), [id]);
  useEffect(() => subscribeMeetingSignatures(id, setSignatures, () => setSignatures({})), [id]);

  useEffect(() => {
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);

  useEffect(() => {
    if (minutes) {
      document.title = `${minutes.controlNumber} — ${minutes.title} | OdysseyPH Minutes of Meeting`;
    }
  }, [minutes]);

  useLayoutEffect(() => {
    const fit = () => setScale(Math.min(1, ((holder.current?.clientWidth || 816) - 2) / 816));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [minutes]);

  if (minutes === undefined) {
    return (
      <main className="mmp">
        <p className="mmp-state" role="status">Loading Minutes of Meeting…</p>
      </main>
    );
  }

  if (minutes === null) {
    return (
      <main className="mmp">
        <div className="mmp-state">
          <h1>Minutes of Meeting unavailable</h1>
          <p>
            The link may be incorrect, revoked, or not yet issued. Check with the organizer who shared it.
          </p>
        </div>
      </main>
    );
  }

  const signers = Object.entries(minutes.signers || {})
    .map(([key, s]) => ({ slot: key, ...s }))
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const pendingAck = signers.filter(s => s.kind === 'acknowledger' && !signatures[s.slot]);
  const chosen = pendingAck.find(s => s.slot === slot) || (pendingAck.length === 1 ? pendingAck[0] : null);

  const run = async (key, work, success) => {
    setBusy(key);
    setMessage({ tone: '', text: '' });
    try {
      await work();
      if (success) setMessage({ tone: 'ok', text: success });
    } catch (err) {
      setMessage({
        tone: 'error',
        text: err?.code === 'permission-denied'
          ? 'This signature could not be recorded. Please verify your typed name or refresh and try again.'
          : err?.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setBusy('');
    }
  };

  const handleSign = e => {
    e.preventDefault();
    if (!chosen) return;
    if (!agree) {
      setMessage({ tone: 'error', text: 'Please confirm that you reviewed and acknowledge these meeting minutes.' });
      return;
    }
    if (chosen.name && normalizeSignerName(name).toLowerCase() !== normalizeSignerName(chosen.name).toLowerCase()) {
      setMessage({
        tone: 'error',
        text: `Type the name exactly as listed on the document: “${normalizeSignerName(chosen.name)}”.`,
      });
      return;
    }

    run(
      'sign',
      async () => {
        await signMeetingMinutes(minutes.id, chosen.slot, name);
        setSlot('');
        setName('');
        setAgree(false);
      },
      'Thank you — your signature has been recorded.',
    );
  };

  const copyLink = async () => {
    if (await copyTextToClipboard(window.location.href.split('?')[0])) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="mmp">
      <header className="mmp-bar">
        <div className="mmp-id">
          <img src="/brand/odc-mark.svg" alt="ODC" />
          <div>
            <small>MINUTES OF MEETING · CONTROL NO.</small>
            <strong>{minutes.controlNumber}</strong>
          </div>
          <span className={`mmp-status mmp-status-${minutes.status}`}>
            {STATUS_LABEL[minutes.status] || minutes.status}
          </span>
        </div>

        <div className="mmp-actions">
          <button type="button" onClick={() => frame.current?.print()}>
            <Printer size={15} /> Print / Save as PDF
          </button>
          <LoadingButton
            type="button"
            loading={busy === 'png'}
            loadingLabel="Rendering…"
            onClick={() => run('png', () => saveFramePng(frame.current, `${minutes.controlNumber}.png`))}
          >
            <ImageDown size={15} /> Save as PNG
          </LoadingButton>
          <button type="button" onClick={copyLink}>
            {copied ? <Check size={15} /> : <Link2 size={15} />} {copied ? 'Copied Link' : 'Share Link'}
          </button>
        </div>
      </header>

      <div className="mmp-layout">
        <div className="mmp-doc" ref={holder}>
          <MeetingMinutesFrame
            ref={frame}
            minutes={minutes}
            signatures={signatures}
            scale={scale}
            title={`Minutes of Meeting ${minutes.controlNumber}`}
          />
        </div>

        <aside className="mmp-side">
          <section>
            <h2><ShieldCheck size={16} /> Meeting Particulars</h2>
            <dl>
              <dt>Control no.</dt><dd>{minutes.controlNumber}</dd>
              <dt>Title</dt><dd>{minutes.title}</dd>
              <dt>Type</dt><dd>{MEETING_TYPES[minutes.meetingType] || 'Internal Meeting'}</dd>
              {minutes.clientOrGroup && <><dt>Group / Client</dt><dd>{minutes.clientOrGroup}</dd></>}
              {minutes.meetingDate && <><dt>Date</dt><dd>{longDate(minutes.meetingDate)}</dd></>}
              {minutes.location && <><dt>Location</dt><dd>{minutes.location}</dd></>}
              {minutes.presidedBy && <><dt>Presided by</dt><dd>{minutes.presidedBy}</dd></>}
              <dt>Status</dt>
              <dd>{STATUS_LABEL[minutes.status]}{minutes.status === 'revoked' && minutes.revokedReason ? ` — ${minutes.revokedReason}` : ''}</dd>
            </dl>
          </section>

          <section>
            <h2>
              <PenLine size={16} /> Signatories <small>{signers.filter(s => signatures[s.slot]).length}/{signers.length}</small>
            </h2>
            {message.text && (
              <p className={`mmp-msg mmp-msg-${message.tone}`} role="alert">{message.text}</p>
            )}

            <ul className="mmp-signers">
              {signers.map(s => {
                const sig = signatures[s.slot];
                return (
                  <li key={s.slot} className={sig ? 'is-signed' : ''}>
                    <b>{sig?.name || s.name || s.title}</b>
                    <small>{SIGNER_KINDS[s.kind]}{s.title && (sig?.name || s.name) ? ` · ${s.title}` : ''}</small>
                    <small style={{ color: sig ? '#16a34a' : 'inherit' }}>
                      {sig
                        ? `Signed ${new Date(sig.signedAt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}`
                        : 'Pending signature'}
                    </small>
                  </li>
                );
              })}
            </ul>

            {minutes.status === 'issued' && pendingAck.length > 0 && (
              <form className="mmp-sign" onSubmit={handleSign}>
                {pendingAck.length > 1 && (
                  <label>
                    <span>Select your signature line:</span>
                    <select value={chosen?.slot || ''} onChange={e => setSlot(e.target.value)} required>
                      <option value="">Choose attendee / client slot…</option>
                      {pendingAck.map(s => (
                        <option key={s.slot} value={s.slot}>
                          {s.name || s.title || 'Attendee Acknowledgement'}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {chosen && (
                  <>
                    <label>
                      <span>Your Full Legal Name:</span>
                      <input
                        required
                        value={name}
                        placeholder={chosen.name || 'Full Legal Name'}
                        onChange={e => setName(e.target.value)}
                      />
                    </label>

                    {name.trim() && (
                      <label>
                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Digital Signature Mark:</span>
                        <p className="mmp-preview">{name}</p>
                      </label>
                    )}

                    <label className="mmp-check">
                      <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
                      <span>I confirm that I reviewed these Minutes of Meeting and acknowledge their accuracy.</span>
                    </label>

                    <LoadingButton
                      type="submit"
                      className="mmp-primary"
                      loading={busy === 'sign'}
                      loadingLabel="Signing…"
                    >
                      <PenLine size={15} /> Acknowledge &amp; Sign Minutes
                    </LoadingButton>
                  </>
                )}
              </form>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}

