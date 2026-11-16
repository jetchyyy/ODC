import test from 'node:test';
import assert from 'node:assert';
import {
  MEETING_PREFIX,
  MEETING_TYPES,
  SIGNER_KINDS,
  controlMonthOf,
  formatControlNumber,
  meetingMinutesLink,
  emptyMeetingSigners,
  parseMeetingMinutesText,
  looksLikeDraftedMinutes,
  markdownToHtml,
  normalizeTableHtml,
  editorContentOf,
  buildMeetingMinutesHtml,
} from '../src/utils/meetingMinutesDocument.js';

test('formatControlNumber and controlMonthOf generate MOM-YYYY-MM-XXX identifiers', () => {
  assert.strictEqual(MEETING_PREFIX, 'MOM');
  assert.strictEqual(formatControlNumber('2026-11', 1), 'MOM-2026-11-001');
  assert.strictEqual(formatControlNumber('2026-11', 27), 'MOM-2026-11-027');
  assert.strictEqual(controlMonthOf(new Date('2026-11-16T00:00:00Z')), '2026-11');
  assert.strictEqual(meetingMinutesLink('doc42', 'https://odysseyph.com'), 'https://odysseyph.com/minutes-of-meeting/doc42');
});

test('MEETING_TYPES, SIGNER_KINDS, and emptyMeetingSigners define internal/client and signer slots', () => {
  assert.strictEqual(MEETING_TYPES.internal, 'Internal Meeting');
  assert.strictEqual(MEETING_TYPES.client, 'Client Meeting');
  assert.strictEqual(SIGNER_KINDS.prepared, 'Prepared by');
  assert.strictEqual(SIGNER_KINDS.approved, 'Approved by');
  assert.strictEqual(SIGNER_KINDS.acknowledger, 'Acknowledged by');

  const signers = emptyMeetingSigners();
  assert.strictEqual(signers.s1.kind, 'prepared');
  assert.strictEqual(signers.s2.kind, 'approved');
  assert.ok(signers.s2.name.length > 0);
});

test('parseMeetingMinutesText extracts meeting particulars, markdown action-items table, and signers', () => {
  const sample = `
TITLE: Q4 Architecture & Client Sync
TYPE: Client Meeting
CLIENT / GROUP: Acme Logistics Corp
DATE: November 16, 2026
TIME: 10:00 AM - 11:15 AM
LOCATION: Google Meet
PRESIDED BY: Jetch Merald S. Madaya
RECORDED BY: Tiffany Escalante
ATTENDEES: Jetch Madaya, Tiffany Escalante, John Doe (Acme)
ABSENT: Jane Smith
NEXT MEETING: November 23, 2026 at 10:00 AM

## 1. Meeting Overview & Agenda
Reviewed Q4 release timeline and API deliverables.

## 2. Action Items
| Action Item | Owner | Due Date | Status |
| Finalize API schema | Jetch Madaya | Nov 20, 2026 | In Progress |

Prepared by:
Tiffany Escalante, Operations Manager

Approved by:
Jetch Merald S. Madaya, Founder

Acknowledged by:
John Doe, Operations Lead
  `;

  assert.strictEqual(looksLikeDraftedMinutes(sample), true);
  const parsed = parseMeetingMinutesText(sample);
  assert.strictEqual(parsed.title, 'Q4 Architecture & Client Sync');
  assert.strictEqual(parsed.meetingType, 'client');
  assert.strictEqual(parsed.clientOrGroup, 'Acme Logistics Corp');
  assert.strictEqual(parsed.meetingDate, '2026-11-16');
  assert.strictEqual(parsed.startTime, '10:00 AM');
  assert.strictEqual(parsed.endTime, '11:15 AM');
  assert.strictEqual(parsed.location, 'Google Meet');
  assert.strictEqual(parsed.presidedBy, 'Jetch Merald S. Madaya');
  assert.strictEqual(parsed.recordedBy, 'Tiffany Escalante');
  assert.match(parsed.attendees, /John Doe/);
  assert.strictEqual(parsed.absent, 'Jane Smith');
  assert.match(parsed.nextMeeting, /November 23/);
  assert.match(parsed.body, /\| Finalize API schema \|/);
  assert.strictEqual(parsed.prepared.length, 1);
  assert.strictEqual(parsed.prepared[0].name, 'Tiffany Escalante');
  assert.strictEqual(parsed.approved.length, 1);
  assert.strictEqual(parsed.acknowledgers.length, 1);
  assert.strictEqual(parsed.acknowledgers[0].name, 'John Doe');
});

test('markdownToHtml converts markdown action-items table for TipTap import', () => {
  const md = `
## 3. Action Items
| Action Item | Owner | Due Date | Status |
| Deploy staging | Engineering | Nov 18 | Open |
  `.trim();
  const html = markdownToHtml(md);
  assert.match(html, /<h2>3\. Action Items<\/h2>/);
  assert.match(html, /<table>/);
  assert.match(html, /<th><p>Action Item<\/p><\/th>/);
  assert.match(html, /<td><p>Deploy staging<\/p><\/td>/);
});

test('editorContentOf safely parses bodyJson or falls back cleanly to markdownToHtml', () => {
  const withJson = { bodyJson: '{"type":"doc","content":[{"type":"paragraph"}]}', body: 'fallback' };
  assert.deepStrictEqual(editorContentOf(withJson), { type: 'doc', content: [{ type: 'paragraph' }] });

  const brokenJson = { bodyJson: '{not valid json', body: '## 1. Agenda\nKickoff notes' };
  assert.match(editorContentOf(brokenJson), /<h2>1\. Agenda<\/h2>/);
  assert.match(editorContentOf(brokenJson), /<p>Kickoff notes<\/p>/);

  assert.strictEqual(editorContentOf(null), '');
});

test('normalizeTableHtml lifts TipTap leading <th> row into <thead> while leaving td-only tables unchanged', () => {
  const tipTap = '<table><tbody><tr><th><p>Action</p></th><th><p>Owner</p></th></tr><tr><td><p>Ship</p></td><td><p>Team</p></td></tr></tbody></table>';
  assert.match(
    normalizeTableHtml(tipTap),
    /^<table><thead><tr><th><p>Action<\/p><\/th><th><p>Owner<\/p><\/th><\/tr><\/thead><tbody><tr><td><p>Ship<\/p>/,
  );

  const plain = '<table><tbody><tr><td><p>Row</p></td></tr></tbody></table>';
  assert.strictEqual(normalizeTableHtml(plain), plain);
});

test('buildMeetingMinutesHtml renders Brand Bible shell, single-line header, TipTap JSON body, repeating table headers, and signature marks', () => {
  const docJson = JSON.stringify({
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '1. Agenda & Summary' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Confirmed milestones.' }] },
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Action Item' }] }] },
              { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Owner' }] }] },
            ],
          },
          {
            type: 'tableRow',
            content: [
              { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ship v1' }] }] },
              { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Jetch' }] }] },
            ],
          },
        ],
      },
    ],
  });

  const minutes = {
    id: 'm1',
    controlNumber: 'MOM-2026-11-001',
    status: 'issued',
    title: 'Client Kickoff & Roadmap',
    meetingType: 'client',
    clientOrGroup: 'Mud Hound',
    meetingDate: '2026-11-16',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    location: 'Google Meet',
    presidedBy: 'Jetch Merald S. Madaya',
    recordedBy: 'Tiffany Escalante',
    attendees: 'Jetch Madaya, Tiffany Escalante, John Judilla',
    absent: 'None',
    nextMeeting: 'November 23, 2026',
    bodyJson: docJson,
    signers: {
      s1: { kind: 'prepared', name: 'Tiffany Escalante', title: 'Operations Manager', order: 1 },
      s2: { kind: 'approved', name: 'Jetch Merald S. Madaya', title: 'Founder', order: 2 },
      s3: { kind: 'acknowledger', name: 'John Judilla', title: 'Client Representative', order: 3 },
    },
  };

  const signatures = {
    s1: { name: 'Tiffany Escalante', signedAt: '2026-11-16T07:00:00Z' },
  };

  const html = buildMeetingMinutesHtml(minutes, signatures, { origin: 'https://odysseyph.com' });

  // Clean header & single-line control number
  assert.match(html, /<h1>MINUTES OF MEETING<\/h1>/);
  assert.doesNotMatch(html, /&lt;span/);
  assert.match(html, /MOM-2026-11-001/);
  assert.match(html, /\.docno\{flex-shrink:0;white-space:nowrap\}/);

  // Meta fields & badge
  assert.match(html, /Client Meeting/);
  assert.match(html, /Client Kickoff &amp; Roadmap/);
  assert.match(html, /02:00 PM – 03:00 PM/);
  assert.match(html, /Google Meet/);
  assert.match(html, /John Judilla/);

  // Orange numbered section & thead table normalization
  assert.match(html, /<h2><span>1<\/span>Agenda &amp; Summary<\/h2>/);
  assert.match(html, /<thead><tr><th><p>Action Item<\/p><\/th><th><p>Owner<\/p><\/th><\/tr><\/thead>/);

  // Cursive signature mark & Great Vibes font
  assert.match(html, /Great\+Vibes/);
  assert.match(html, /<div class="sig-mark">Tiffany Escalante<\/div>/);
  assert.match(html, /<div class="sig-mark empty"><\/div>/);

  // Print & screen rules
  assert.match(html, /@page :first\{margin-top:0;margin-bottom:12mm\}/);
  assert.match(html, /@media screen and \(max-width:840px\)\{\.pg\{width:816px/);
});
