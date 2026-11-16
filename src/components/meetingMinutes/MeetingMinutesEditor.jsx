import { useEffect, useRef, useState } from 'react';
import { useEditor, useEditorState, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TableKit } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extensions';
import {
  Undo2, Redo2, Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, Quote, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, Eraser, Wand2, ClipboardCopy,
} from 'lucide-react';
import { BRAND_CO } from '../../utils/brandDocument';
import {
  AI_MEETING_PROMPT, SIGNER_KINDS, MEETING_TYPES,
  parseMeetingMinutesText, markdownToHtml, looksLikeDraftedMinutes,
} from '../../utils/meetingMinutesDocument';
import { useBrandFonts } from '../../hooks/useBrandFonts';
import './MeetingMinutesEditor.css';

const BLOCKS = [
  { id: 'p', label: 'Normal text' },
  { id: 'h2', label: 'Section heading' },
  { id: 'h3', label: 'Sub-heading' },
];

const TABLE_ACTIONS = [
  ['insert', 'Insert table'],
  ['addRowAfter', 'Add row below'],
  ['addColumnAfter', 'Add column right'],
  ['deleteRow', 'Delete row'],
  ['deleteColumn', 'Delete column'],
  ['toggleHeaderRow', 'Header row'],
  ['deleteTable', 'Delete table'],
];

const DEFAULT_MOM_HTML = `
<h2>1. Meeting Overview &amp; Agenda</h2>
<p>Summarize the purpose of this session, key topics covered, and agenda progression.</p>
<h2>2. Key Discussions &amp; Decisions</h2>
<ul>
  <li>Topic / Decision Point 1 — summary of discussion and approved resolution.</li>
  <li>Topic / Decision Point 2 — consensus reached and open questions noted.</li>
</ul>
<h2>3. Action Items</h2>
<table>
  <tbody>
    <tr>
      <th><p>Action Item</p></th>
      <th><p>Owner</p></th>
      <th><p>Due Date</p></th>
      <th><p>Status</p></th>
    </tr>
    <tr>
      <td><p>Complete deliverable or follow-up item</p></td>
      <td><p>Assignee Name</p></td>
      <td><p>Target Date</p></td>
      <td><p>Open</p></td>
    </tr>
  </tbody>
</table>
<h2>4. Next Meeting &amp; Adjournment</h2>
<p>Record closing time, next scheduled check-in, and any follow-up materials required beforehand.</p>
`;

function ToolButton({ label, active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      className="mom-tool"
      aria-label={label}
      title={label}
      aria-pressed={active === undefined ? undefined : active}
      disabled={disabled}
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, onAiPaste }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      block: e.isActive('heading', { level: 2 }) ? 'h2' : e.isActive('heading', { level: 3 }) ? 'h3' : 'p',
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      strike: e.isActive('strike'),
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
      quote: e.isActive('blockquote'),
      align: ['center', 'right', 'justify'].find(a => e.isActive({ textAlign: a })) || 'left',
      inTable: e.isActive('table'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();
  const setBlock = id => {
    if (id === 'p') chain().setParagraph().run();
    else chain().setHeading({ level: Number(id[1]) }).run();
  };
  const tableAction = id => {
    if (id === 'insert') chain().insertTable({ rows: 3, cols: 4, withHeaderRow: true }).run();
    else chain()[id]().run();
  };

  return (
    <div className="mom-toolbar" role="toolbar" aria-label="Formatting">
      <ToolButton label="Undo" disabled={!state.canUndo} onClick={() => chain().undo().run()}><Undo2 size={16} /></ToolButton>
      <ToolButton label="Redo" disabled={!state.canRedo} onClick={() => chain().redo().run()}><Redo2 size={16} /></ToolButton>
      <span className="mom-sep" />

      <select aria-label="Text style" value={state.block} onChange={e => setBlock(e.target.value)}>
        {BLOCKS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
      </select>
      <span className="mom-sep" />

      <ToolButton label="Bold" active={state.bold} onClick={() => chain().toggleBold().run()}><Bold size={16} /></ToolButton>
      <ToolButton label="Italic" active={state.italic} onClick={() => chain().toggleItalic().run()}><Italic size={16} /></ToolButton>
      <ToolButton label="Underline" active={state.underline} onClick={() => chain().toggleUnderline().run()}><Underline size={16} /></ToolButton>
      <ToolButton label="Strikethrough" active={state.strike} onClick={() => chain().toggleStrike().run()}><Strikethrough size={16} /></ToolButton>
      <span className="mom-sep" />

      <ToolButton label="Bullet list" active={state.bullet} onClick={() => chain().toggleBulletList().run()}><List size={16} /></ToolButton>
      <ToolButton label="Numbered list" active={state.ordered} onClick={() => chain().toggleOrderedList().run()}><ListOrdered size={16} /></ToolButton>
      <ToolButton label="Highlighted note" active={state.quote} onClick={() => chain().toggleBlockquote().run()}><Quote size={16} /></ToolButton>
      <span className="mom-sep" />

      <ToolButton label="Align left" active={state.align === 'left'} onClick={() => chain().setTextAlign('left').run()}><AlignLeft size={16} /></ToolButton>
      <ToolButton label="Align center" active={state.align === 'center'} onClick={() => chain().setTextAlign('center').run()}><AlignCenter size={16} /></ToolButton>
      <ToolButton label="Align right" active={state.align === 'right'} onClick={() => chain().setTextAlign('right').run()}><AlignRight size={16} /></ToolButton>
      <ToolButton label="Justify" active={state.align === 'justify'} onClick={() => chain().setTextAlign('justify').run()}><AlignJustify size={16} /></ToolButton>
      <span className="mom-sep" />

      <select
        aria-label="Table actions"
        value=""
        onChange={e => {
          if (e.target.value) tableAction(e.target.value);
        }}
      >
        <option value="">Table…</option>
        {TABLE_ACTIONS.map(([id, label]) => (
          <option key={id} value={id} disabled={id !== 'insert' && !state.inTable}>{label}</option>
        ))}
      </select>

      <ToolButton label="Clear formatting" onClick={() => chain().unsetAllMarks().clearNodes().run()}><Eraser size={16} /></ToolButton>
      <span className="mom-grow" />

      <button type="button" className="mom-ai-btn" onMouseDown={e => e.preventDefault()} onClick={onAiPaste}>
        <Wand2 size={14} /> Paste from AI
      </button>
    </div>
  );
}

/**
 * Interactive Brand Bible editor for Minutes of Meeting with meeting particulars,
 * inline Action Items table support, and smart AI/transcript draft pasting.
 */
export default function MeetingMinutesEditor({ form, controlNumber, initialContent, onField, onDoc, onParsed }) {
  useBrandFonts();
  const [aiOpen, setAiOpen] = useState(false);
  const [pasteBuffer, setPasteBuffer] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const editorRef = useRef(null);

  const importParsedDraft = rawText => {
    const parsed = parseMeetingMinutesText(rawText);
    onParsed(parsed);
    if (parsed.body && editorRef.current) {
      editorRef.current.commands.setContent(markdownToHtml(parsed.body), { emitUpdate: true });
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      TableKit.configure({ table: { resizable: false } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: 'Record the agenda, key decisions, action items, and closing notes...',
      }),
    ],
    content: initialContent || DEFAULT_MOM_HTML,
    editorProps: {
      attributes: { class: 'mom-prose', 'aria-label': 'Minutes of meeting body' },
      handlePaste: (_view, event) => {
        const text = event.clipboardData?.getData('text/plain') || '';
        const html = event.clipboardData?.getData('text/html') || '';
        if (html || !looksLikeDraftedMinutes(text)) return false;
        event.preventDefault();
        importParsedDraft(text);
        return true;
      },
    },
    onCreate: ({ editor: e }) => {
      if (!initialContent) onDoc(e.getJSON(), e.getHTML());
    },
    onUpdate: ({ editor: e }) => {
      onDoc(e.getJSON(), e.getHTML());
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  const copyPrompt = () => {
    navigator.clipboard.writeText(AI_MEETING_PROMPT).then(() => {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    });
  };

  const applyPaste = () => {
    if (!pasteBuffer.trim()) return;
    importParsedDraft(pasteBuffer);
    setPasteBuffer('');
    setAiOpen(false);
  };

  return (
    <div className="mom-wrap">
      {editor && <Toolbar editor={editor} onAiPaste={() => setAiOpen(v => !v)} />}

      {aiOpen && (
        <div className="mom-ai">
          <p>
            Copy the prompt for ChatGPT, Claude, or Gemini and append your raw meeting notes or call transcript.
            Paste the structured draft below to auto-populate the meeting details, discussion points, action-items table, and signers.
          </p>
          <div className="mom-ai-actions">
            <button type="button" className="mom-primary" onClick={copyPrompt}>
              <ClipboardCopy size={14} /> {copiedPrompt ? 'Copied Prompt!' : 'Copy AI Prompt'}
            </button>
          </div>
          <textarea
            rows={6}
            placeholder="Paste drafted Minutes of Meeting text here..."
            value={pasteBuffer}
            onChange={e => setPasteBuffer(e.target.value)}
          />
          <div className="mom-ai-actions">
            <button type="button" onClick={() => setAiOpen(false)}>Close</button>
            <button type="button" className="mom-primary" onClick={applyPaste}>Apply to Minutes</button>
          </div>
        </div>
      )}

      <div className="mom-desk">
        <div className="mom-paper">
          <div className="mom-hd">
            <img src="/brand/odc-mark.svg" alt="ODC" />
            <div>
              <div className="mom-co">{BRAND_CO.name}</div>
              <div className="mom-co-line">{BRAND_CO.address}</div>
              <div className="mom-co-line">{BRAND_CO.email} · {BRAND_CO.phone} · {BRAND_CO.site}</div>
            </div>
          </div>

          <div className="mom-band">
            <i />
            <div>
              <h2>MINUTES OF MEETING</h2>
              <div className="mom-docno">
                <small>CONTROL / TRACKING NO.</small>
                <b>{controlNumber || 'MOM-DRAFT'}</b>
              </div>
            </div>
          </div>

          <div className="mom-body">
            <div className="mom-memo">
              <div className="mom-memo-row full">
                <label>Meeting Title / Subject</label>
                <input
                  className="mom-title-input"
                  value={form.title || ''}
                  maxLength={300}
                  placeholder="e.g. Client Kickoff & Sprint 1 Planning"
                  onChange={e => onField('title', e.target.value)}
                />
              </div>

              <div className="mom-memo-row">
                <label>Meeting Type</label>
                <select
                  aria-label="Meeting type"
                  value={form.meetingType || 'internal'}
                  onChange={e => onField('meetingType', e.target.value)}
                >
                  {Object.entries(MEETING_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="mom-memo-row">
                <label>{form.meetingType === 'client' ? 'Client / Project' : 'Department / Group'}</label>
                <input
                  value={form.clientOrGroup || ''}
                  maxLength={200}
                  placeholder={form.meetingType === 'client' ? 'Client Company / Project' : 'Engineering / Operations / All Hands'}
                  onChange={e => onField('clientOrGroup', e.target.value)}
                />
              </div>

              <div className="mom-memo-row">
                <label>Meeting Date</label>
                <input
                  type="date"
                  value={form.meetingDate || ''}
                  onChange={e => onField('meetingDate', e.target.value)}
                />
              </div>

              <div className="mom-memo-row">
                <label>Time (Start – End)</label>
                <div className="mom-time-pair">
                  <input
                    value={form.startTime || ''}
                    maxLength={40}
                    placeholder="10:00 AM"
                    onChange={e => onField('startTime', e.target.value)}
                  />
                  <span>–</span>
                  <input
                    value={form.endTime || ''}
                    maxLength={40}
                    placeholder="11:00 AM"
                    onChange={e => onField('endTime', e.target.value)}
                  />
                </div>
              </div>

              <div className="mom-memo-row">
                <label>Location / Platform</label>
                <input
                  value={form.location || ''}
                  maxLength={300}
                  placeholder="ODC Cebu Office / Google Meet"
                  onChange={e => onField('location', e.target.value)}
                />
              </div>

              <div className="mom-memo-row">
                <label>Next Meeting</label>
                <input
                  value={form.nextMeeting || ''}
                  maxLength={300}
                  placeholder="Optional date / agenda reminder"
                  onChange={e => onField('nextMeeting', e.target.value)}
                />
              </div>

              <div className="mom-memo-row">
                <label>Presided by</label>
                <input
                  value={form.presidedBy || ''}
                  maxLength={200}
                  placeholder="Meeting Chair / Lead"
                  onChange={e => onField('presidedBy', e.target.value)}
                />
              </div>

              <div className="mom-memo-row">
                <label>Recorded by</label>
                <input
                  value={form.recordedBy || ''}
                  maxLength={200}
                  placeholder="Minutes Secretary"
                  onChange={e => onField('recordedBy', e.target.value)}
                />
              </div>

              <div className="mom-memo-row full">
                <label>Attendees</label>
                <textarea
                  rows={2}
                  value={form.attendees || ''}
                  maxLength={2000}
                  placeholder="List attendees (names & roles, comma-separated)..."
                  onChange={e => onField('attendees', e.target.value)}
                />
              </div>

              <div className="mom-memo-row full">
                <label>Absent / Excused (optional)</label>
                <input
                  value={form.absent || ''}
                  maxLength={1000}
                  placeholder="Optional list of absent or excused invitees"
                  onChange={e => onField('absent', e.target.value)}
                />
              </div>
            </div>

            {editor && <EditorContent editor={editor} />}

            <div className="mom-signers-preview">
              {(form.signers || []).map(s => (
                <div className="mom-sig-card" key={s.id}>
                  <small>{SIGNER_KINDS[s.kind] || 'Signatory'}</small>
                  <div className="mom-sig-line" />
                  <b>{s.name || 'Name & signature'}</b>
                  <span>{s.title || (s.kind === 'acknowledger' ? 'Attendee / Client' : 'OdysseyPH')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mom-ft">
            <span>{BRAND_CO.name} · Official Meeting Record</span>
            <span>Minutes of Meeting</span>
          </div>
          <div className="mom-foot-bar"><i /><b /></div>
        </div>
      </div>
    </div>
  );
}
