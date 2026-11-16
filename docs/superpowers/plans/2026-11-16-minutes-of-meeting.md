# Minutes of Meeting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an end-to-end Minutes of Meeting (`MOM`) document generator with Brand Bible HTML/PDF/PNG rendering, TipTap rich-text + table editing, AI draft parsing, sequential `MOM-YYYY-MM-XXX` numbering, admin management tab, and shareable e-signing portal.

**Architecture:** Dedicated standalone module mirroring `OfficeOrders` and `Quotations`: a pure document builder (`src/utils/meetingMinutesDocument.js`), Firestore service + rules (`src/services/meetingMinutesService.js`, `firestore.rules`), isolated auto-scaling iframe renderer (`MeetingMinutesFrame.jsx`), on-page TipTap paper editor (`MeetingMinutesEditor.jsx`), Admin tab (`AdminMinutes.jsx`), and public `/minutes-of-meeting/:id` route (`MeetingMinutesPage.jsx`).

**Tech Stack:** React 19, Vite, TipTap (`@tiptap/react`, `StarterKit`, `TableKit`, `TextAlign`, `Placeholder`), `html-to-image`, Firebase Firestore (`runTransaction`, `writeBatch`, `onSnapshot`), Lucide React, Node native test runner (`node --test`).

**Spec:** [2026-11-16-minutes-of-meeting-design.md](file:///Users/jetchmerald/Documents/jetch/ODC/docs/superpowers/specs/2026-11-16-minutes-of-meeting-design.md)

## Global Constraints

- Control number format: `MOM-<YYYY>-<MM>-<XXX>` (3-digit sequence, e.g., `MOM-2026-11-001`) via `meetingMinutesCounters/{YYYY-MM}`.
- Brand Bible tokens: Navy `#16273a`, Orange `#ff6a13`, `Poppins` headings, `Inter` body, `Great Vibes` cursive signatures, `816px × 1056px` US Letter shell via `brandPage()`.
- Status lifecycle: `'draft' | 'issued' | 'revoked'` (`draft -> issued -> revoked`).
- Admin permission action ID: `meetingminutes:manage`; Admin navigation ID: `meetingminutes`; Public route: `/minutes-of-meeting/:id`.
- `signMeetingMinutes()` must write ONLY to `meetingMinutes/{id}/signatures/{slotId}` and never update parent `meetingMinutes/{id}` during signing.
- Pure `.js` ESM test execution via `node --test` must work without browser globals (`typeof window !== 'undefined'` guards, `.js` relative import extensions).

## Review Focus

- AI-drafted or raw pasted meeting notes with Markdown tables (`| Action Item | Owner | Due Date | Status |`) and `Prepared by:` / `Approved by:` / `Acknowledged by:` blocks parse into fields, TipTap HTML tables, and signer arrays cleanly.
- Multi-page PDF prints of TipTap tables starting with `<tbody><tr><th>...` promote the header row to `<thead>` via `normalizeTableHtml()` so column headers repeat on continuation pages alongside `@page` margins.
- Corrupted `bodyJson` strings or markdown-only `body` strings degrade safely in `editorContentOf()` and `buildMeetingMinutesHtml()` without throwing runtime errors.
- Typing names with irregular whitespace or short (< 2 char) names in signing flows is caught and normalized by `normalizeSignerName()` before hitting Firestore `permission-denied`.
- Narrow viewports in Admin detail view do not clip the `816px` paper horizontally (`ResizeObserver` auto-scaling in `MeetingMinutesFrame` + `minmax(0, 1fr)` grid track in `AdminMinutes.css`).

---

### Task 1: Meeting Minutes Document Builder, AI Parser & CSS

**Files:**
- Create: `src/utils/meetingMinutesDocument.js`
- Test: `tests/meetingMinutesDocument.test.js`

**Interfaces:**
- Consumes: `BRAND_CO`, `esc`, `longDate`, `brandPage` from `./brandDocument.js`
- Produces:
  - `MEETING_PREFIX` (`'MOM'`), `MEETING_TYPES` (`{ internal: 'Internal Meeting', client: 'Client Meeting' }`), `SIGNER_KINDS` (`{ prepared: 'Prepared by', approved: 'Approved by', acknowledger: 'Acknowledged by' }`)
  - `controlMonthOf(date?) -> string`, `formatControlNumber(month, seq) -> string`, `meetingMinutesLink(id, origin?) -> string`
  - `emptyMeetingSigners() -> Record<string, { kind, name, title, order }>`
  - `AI_MEETING_PROMPT: string`, `parseMeetingMinutesText(raw: string) -> object`, `looksLikeDraftedMinutes(raw: string) -> boolean`
  - `markdownToHtml(text: string) -> string`, `renderMarkdownBody(text: string) -> string`, `renderDocJson(doc: object) -> string`
  - `normalizeTableHtml(html: string) -> string`, `editorContentOf(minutes: object) -> object | string`
  - `buildMeetingMinutesHtml(minutes: object, signatures?: object, options?: { origin?, timeZone?, autoPrint? }) -> string`

- [ ] **Step 1: Write failing tests in `tests/meetingMinutesDocument.test.js`**

Write tests covering:
1. `formatControlNumber('2026-11', 1) === 'MOM-2026-11-001'` and `controlMonthOf(new Date('2026-11-16T00:00:00Z')) === '2026-11'`.
2. `meetingMinutesLink('abc123', 'https://odysseyph.com') === 'https://odysseyph.com/minutes-of-meeting/abc123'`.
3. `emptyMeetingSigners()` returns `s1` (`kind: 'prepared'`) and `s2` (`kind: 'approved'`, `name: BRAND_CO.approvedBy`).
4. `parseMeetingMinutesText()` extracts `title`, `meetingType` (`'client'` vs `'internal'`), `clientOrGroup`, `meetingDate`, `startTime`, `endTime`, `location`, `presidedBy`, `recordedBy`, `attendees`, `absent`, `nextMeeting`, body sections with markdown action-item table, and `prepared` / `approved` / `acknowledgers` signers.
5. `markdownToHtml()` converts markdown action-items table into `<table><tr><th><p>...</p></th></tr><tr><td><p>...</p></td></tr></table>`.
6. `editorContentOf()` returns parsed `bodyJson` object when valid JSON, falls back safely to `markdownToHtml(body)` when `bodyJson` is malformed or absent, and returns `''` for `null`.
7. `normalizeTableHtml()` promotes leading `<th>`-only row inside `<table><tbody>` to `<thead>...</thead><tbody>...</tbody>` while leaving headerless `<td>` tables unchanged.
8. `buildMeetingMinutesHtml()` produces clean `<h1>MINUTES OF MEETING</h1>` (no escaped HTML), single-line `.docno` CSS, `Internal Meeting` / `Client Meeting` badge in metadata, meeting summary fields (attendees, time range, location, presider, recorder), TipTap JSON body with orange section badges (`renderDocJson`), normalized `<thead>` table, cursive `.sig-mark` + `'Great Vibes'` stylesheet when signed, `DRAFT`/`REVOKED` watermark stamps, and `@page :first` / `@media screen and (max-width:840px)` rules.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/meetingMinutesDocument.test.js`  
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `../src/utils/meetingMinutesDocument.js`.

- [ ] **Step 3: Implement `src/utils/meetingMinutesDocument.js`**

Implement all exported constants, date/control-number helpers, `parseMeetingMinutesText`, `looksLikeDraftedMinutes`, `markdownToHtml`, `renderMarkdownBody`, `renderDocJson`, `normalizeTableHtml`, `editorContentOf`, and `buildMeetingMinutesHtml` using `brandPage()` from `./brandDocument.js` (reuse pattern from `officeOrderDocument.js` + `quotationDocument.js` table/print rules).

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/meetingMinutesDocument.test.js`  
Expected: PASS (all tests pass, 0 failures).

- [ ] **Step 5: Commit**

```bash
git add src/utils/meetingMinutesDocument.js tests/meetingMinutesDocument.test.js
git commit -m "feat(minutes): add Minutes of Meeting document builder, parser, and unit tests"
```

---

### Task 2: Firestore Service & Security Rules

**Files:**
- Create: `src/services/meetingMinutesService.js`
- Modify: `firestore.rules:1166-1172`
- Test: `tests/meetingMinutesService.test.js`

**Interfaces:**
- Consumes: `auth`, `db` from `../lib/firebase.js`; `formatDisplayIdentifier` from `../utils/authHelpers.js`; `controlMonthOf`, `formatControlNumber` from `../utils/meetingMinutesDocument.js`
- Produces:
  - `normalizeSignerName(value: string) -> string`
  - `meetingMinutesFields(form: object) -> object`
  - `subscribeMeetingMinutes(onData, onError) -> unsubscribe`
  - `subscribeMeetingMinutesDoc(id, onData, onError) -> unsubscribe`
  - `subscribeMeetingSignatures(id, onData, onError) -> unsubscribe`
  - `createMeetingMinutes(user, form) -> Promise<string>`
  - `updateMeetingMinutes(user, id, form) -> Promise<void>`
  - `issueMeetingMinutes(user, id) -> Promise<void>`
  - `revokeMeetingMinutes(user, id, reason) -> Promise<void>`
  - `deleteMeetingMinutesDraft(id) -> Promise<void>`
  - `signMeetingMinutes(id, slotId, name, user?) -> Promise<void>`

- [ ] **Step 1: Write failing tests in `tests/meetingMinutesService.test.js`**

Write tests covering:
1. `meetingMinutesFields()` validates and sanitizes valid form values (`title`, `meetingType` normalized to `'internal' | 'client'`, `clientOrGroup`, `meetingDate`, `startTime`, `endTime`, `location`, `presidedBy`, `recordedBy`, `attendees`, `absent`, `nextMeeting`, `body`, `bodyJson`, `signers` capped at 12 and filtering empty non-acknowledger names while allowing open acknowledger slots with `title`).
2. `meetingMinutesFields()` throws descriptive error when `title` is empty/whitespace.
3. `meetingMinutesFields()` normalizes invalid `meetingType` to `'internal'`.
4. `normalizeSignerName('  Ana   Maria  Santos ') === 'Ana Maria Santos'`.
5. `signMeetingMinutes()` rejects names shorter than 2 characters after normalization without issuing a Firestore write.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/meetingMinutesService.test.js`  
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `../src/services/meetingMinutesService.js`.

- [ ] **Step 3: Implement `src/services/meetingMinutesService.js` and update `firestore.rules`**

Implement `src/services/meetingMinutesService.js`:
- `createMeetingMinutes(user, form)` atomically reserves `meetingMinutesCounters/{month}` sequence inside `runTransaction` and sets `status: 'draft'`, `controlNumber`, `controlMonth`, `controlSeq`.
- `updateMeetingMinutes`, `issueMeetingMinutes`, `revokeMeetingMinutes`, `deleteMeetingMinutesDraft`.
- `signMeetingMinutes(id, slotId, name, user = auth.currentUser)` validates `typed.length >= 2` and calls `setDoc(doc(db, 'meetingMinutes', id, 'signatures', slotId), { name: typed.slice(0, 200), signedAt: serverTimestamp(), signedByUid: user?.uid || '', userAgent: ... })` only (never touches parent `meetingMinutes` doc).

Add `// ─── Minutes of Meeting ───` block in `firestore.rules` before `match /{document=**}`:
- `minutesAdmin()` checks `operationsRoot() || (request.auth != null && staffAction('meetingminutes:manage'))`.
- `validMeetingMinutes(d)` checks allowed keys, `docText` lengths, `meetingType in ['internal', 'client']`, `status in ['draft', 'issued', 'revoked']`, `controlNumber == 'MOM-' + d.controlMonth + '-' + seqText(d.controlSeq)`.
- `meetingMinutesCounters/{month}`: admin get/create/update monotonic `last`.
- `meetingMinutes/{minutesId}`: get (`minutesAdmin() || resource.data.status in ['issued', 'revoked']`), list (`minutesAdmin()`), create (`draft`), update (`draft` edits, `draft -> issued`, `issued -> revoked`), delete (`draft`).
- `signatures/{slotId}`: read when parent readable; create when parent `status == 'issued'`, valid keys `['name', 'signedAt', 'signedByUid', 'userAgent']`, `docText(name, 2, 200)`, `signedAt == request.time`, `signedByUid == (request.auth == null ? '' : request.auth.uid)`, exact case-insensitive name match (or blank slot name), and `(signers[slotId].kind == 'acknowledger' || minutesAdmin())`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/meetingMinutesService.test.js`  
Expected: PASS (all 5 tests pass).

- [ ] **Step 5: Commit**

```bash
git add src/services/meetingMinutesService.js firestore.rules tests/meetingMinutesService.test.js
git commit -m "feat(minutes): add Firestore service, security rules, and unit tests"
```

---

### Task 3: Isolated Branded Iframe Renderer (`MeetingMinutesFrame`)

**Files:**
- Create: `src/components/meetingMinutes/MeetingMinutesFrame.jsx`
- Create: `src/components/meetingMinutes/MeetingMinutesFrame.css`

**Interfaces:**
- Consumes: `buildMeetingMinutesHtml` from `../../utils/meetingMinutesDocument`; `toPng` from `html-to-image`
- Produces: `MeetingMinutesFrame` (`forwardRef` accepting `{ minutes, signatures, title?, scale? }`, exposing `ref.print()` and `ref.savePng(filename)`)

- [ ] **Step 1: Create `src/components/meetingMinutes/MeetingMinutesFrame.css`**

Define `.mom-frame` (`position: relative; width: 100%; overflow: hidden`) and `.mom-frame iframe` (`display: block; border: 0; background: #fff; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35); border-radius: 4px`).

- [ ] **Step 2: Implement `src/components/meetingMinutes/MeetingMinutesFrame.jsx`**

Mirror `QuotationFrame.jsx`:
- Auto-scales `816px` letter document via `ResizeObserver` when `scale` prop is omitted so admin detail view fits cleanly at any viewport width without horizontal clipping.
- Measures `contentDocument.body.scrollHeight + 8` on load & `fonts.ready`.
- Exposes `print()` and `savePng(filename)` (inlining iframe Google Fonts into `html-to-image` for crisp `Poppins`, `Inter`, and `Great Vibes` exports).

- [ ] **Step 3: Lint and verify**

Run: `npx eslint src/components/meetingMinutes/MeetingMinutesFrame.jsx`  
Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Commit**

```bash
git add src/components/meetingMinutes/MeetingMinutesFrame.jsx src/components/meetingMinutes/MeetingMinutesFrame.css
git commit -m "feat(minutes): add isolated auto-scaling MeetingMinutesFrame component"
```

---

### Task 4: Interactive TipTap Rich-Text Editor (`MeetingMinutesEditor`)

**Files:**
- Create: `src/components/meetingMinutes/MeetingMinutesEditor.jsx`
- Create: `src/components/meetingMinutes/MeetingMinutesEditor.css`

**Interfaces:**
- Consumes: `BRAND_CO` from `../../utils/brandDocument`; `AI_MEETING_PROMPT`, `SIGNER_KINDS`, `MEETING_TYPES`, `parseMeetingMinutesText`, `markdownToHtml`, `looksLikeDraftedMinutes` from `../../utils/meetingMinutesDocument`; `useBrandFonts` from `../../hooks/useBrandFonts`
- Produces: `MeetingMinutesEditor({ form, controlNumber, initialContent, onField, onDoc, onParsed })`

- [ ] **Step 1: Create `src/components/meetingMinutes/MeetingMinutesEditor.css`**

Style `.mom-wrap`, `.mom-toolbar`, `.mom-ai`, `.mom-desk`, `.mom-paper` (`816px × 1056px`), `.mom-hd`, `.mom-band`, `.mom-memo` 2-column meeting metadata grid, `.mom-prose` headings (`h2` orange badge, `h3`, `h1`), lists (`ul`, `ol`), blockquotes, and TipTap tables (`table`, `th`, `td`, `.selectedCell` using `border-collapse: separate; border-spacing: 0; border-radius: 8px; overflow: hidden`).

- [ ] **Step 2: Implement `src/components/meetingMinutes/MeetingMinutesEditor.jsx`**

- Configure TipTap `useEditor` with `StarterKit` (`heading: { levels: [1, 2, 3] }`), `TableKit`, `TextAlign`, and `Placeholder`.
- Pre-populate `DEFAULT_MOM_HTML` with 4 sections (`1. Meeting Overview & Agenda`, `2. Key Discussions & Decisions`, `3. Action Items` containing a 4-column table `Action Item | Owner | Due Date | Status`, and `4. Next Meeting & Adjournment`) when `initialContent` is empty.
- Render inline paper metadata inputs for `title`, `meetingType` (`internal` / `client`), `clientOrGroup`, `meetingDate`, `startTime`, `endTime`, `location`, `presidedBy`, `recordedBy`, `attendees`, `absent`, and `nextMeeting`.
- Provide sticky formatting toolbar (including Table dropdown) and `Paste from AI` drawer (`copyPrompt` + `applyPaste`) plus automatic `handlePaste` detection via `looksLikeDraftedMinutes()`.

- [ ] **Step 3: Lint and verify**

Run: `npx eslint src/components/meetingMinutes/MeetingMinutesEditor.jsx`  
Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Commit**

```bash
git add src/components/meetingMinutes/MeetingMinutesEditor.jsx src/components/meetingMinutes/MeetingMinutesEditor.css
git commit -m "feat(minutes): add interactive TipTap MeetingMinutesEditor component"
```

---

### Task 5: Admin Minutes Management Tab (`AdminMinutes`)

**Files:**
- Create: `src/pages/AdminMinutes.jsx`
- Create: `src/pages/AdminMinutes.css`

**Interfaces:**
- Consumes: `MeetingMinutesFrame`, `MeetingMinutesEditor`, `meetingMinutesService.js` CRUD/subscribe/sign methods, `SIGNER_KINDS`, `MEETING_TYPES`, `emptyMeetingSigners`, `editorContentOf`, `meetingMinutesLink`, `longDate`, `useSystemModal`, `LoadingButton`
- Produces: `AdminMinutes({ firebaseUser, can })`

- [ ] **Step 1: Create `src/pages/AdminMinutes.css`**

Style `.mom-module`, `.mom-table-wrap`, `.mom-doc-layout` (`grid-template-columns: minmax(0, 1fr) 320px`), `.mom-detail` (`grid-template-columns: 340px minmax(0, 1fr); gap: 28px`), `.mom-detail-side`, `.mom-detail-doc`, signer roster rows, status pills (`draft`, `issued`, `revoked`), and responsive breakpoints.

- [ ] **Step 2: Implement `src/pages/AdminMinutes.jsx`**

Implement three views inside `AdminMinutes` (`can('meetingminutes:manage')` gate):
- **List view:** Metrics strip (Total, Drafts, Issued, Client Syncs), search (`controlNumber`, `title`, `clientOrGroup`, `presidedBy`, `attendees`), status filter (`all`, `draft`, `issued`, `revoked`), type filter (`all`, `internal`, `client`), and table of minutes.
- **Edit view:** Hosts `MeetingMinutesEditor` + sticky sidebar with `Prepared by`, `Approved by`, and repeatable `Attendee / Client Signers` (`acknowledger` slots with add/remove), `Save draft` / `Save changes`, and AI parse merge handler.
- **Detail view:** Shows `MeetingMinutesFrame`, control number, status pill, `Edit`, `Issue`, `Copy link`, `Save as PDF`, `Save as PNG`, `Revoke` inline reason form, `Delete draft`, live signature checklist with per-slot `?sign=` copy link buttons, and inline admin signing form for pending `prepared`/`approved` slots (pre-validating normalized name match).

- [ ] **Step 3: Lint and verify**

Run: `npx eslint src/pages/AdminMinutes.jsx`  
Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Commit**

```bash
git add src/pages/AdminMinutes.jsx src/pages/AdminMinutes.css
git commit -m "feat(minutes): add AdminMinutes management page"
```

---

### Task 6: Public Verification Portal, Navigation, App Routing & End-to-End Build Check

**Files:**
- Create: `src/pages/MeetingMinutesPage.jsx`
- Create: `src/pages/MeetingMinutesPage.css`
- Modify: `src/utils/navigationConfig.js:19-20,200-202`
- Modify: `src/pages/Admin.jsx:66-68,906-909`
- Modify: `src/App.jsx:26-28,102-104`

**Interfaces:**
- Consumes: `AdminMinutes`, `MeetingMinutesFrame`, `meetingMinutesService.js` (`subscribeMeetingMinutesDoc`, `subscribeMeetingSignatures`, `signMeetingMinutes`, `normalizeSignerName`), `SIGNER_KINDS`, `MEETING_TYPES`, `longDate`, `useBrandFonts`
- Produces: Route `/minutes-of-meeting/:id`, Admin tab `'meetingminutes'` (`minutes:manage`)

- [ ] **Step 1: Create `src/pages/MeetingMinutesPage.css` and `src/pages/MeetingMinutesPage.jsx`**

Mirror `QuotationPage` / `OfficeOrderPage`:
- Sticky Navy/Orange header bar showing `ODC` logo, `MINUTES OF MEETING · TRACKING NO.`, status badge, `Print / Save as PDF`, `Save as PNG`, `Share Link`.
- Responsive `MeetingMinutesFrame` paper viewer + right sidebar showing Meeting Particulars (`Title`, `Type`, `Date`, `Time`, `Location`, `Presided by`) and Signatories audit trail.
- Interactive e-signing form when `status === 'issued'` targeting pending slots (auto-selecting `?sign=slotId`, showing `Great Vibes` signature preview, checking `normalizeSignerName` against listed slot name when pre-filled).

- [ ] **Step 2: Wire navigation, Admin tab, and public router**

- `src/utils/navigationConfig.js`: import `NotebookPen` from `lucide-react` and add `meetingminutes` module (`id: 'meetingminutes'`, `label: 'Minutes of Meeting'`, action `'meetingminutes:manage'`).
- `src/pages/Admin.jsx`: lazy-import `AdminMinutes` and render `{activeTab === 'meetingminutes' && hasPermission('meetingminutes') && <AdminMinutes firebaseUser={firebaseUser} can={can} />}`.
- `src/App.jsx`: lazy-import `MeetingMinutesPage` and add `<Route path="/minutes-of-meeting/:id" element={<MeetingMinutesPage />} />`.

- [ ] **Step 3: Run full test suite, ESLint, and Vite production build**

Run:
```bash
node --test tests/meetingMinutesDocument.test.js tests/meetingMinutesService.test.js tests/quotationDocument.test.js tests/quotationService.test.js
npx eslint src/utils/meetingMinutesDocument.js src/services/meetingMinutesService.js src/components/meetingMinutes/MeetingMinutesFrame.jsx src/components/meetingMinutes/MeetingMinutesEditor.jsx src/pages/AdminMinutes.jsx src/pages/MeetingMinutesPage.jsx src/utils/navigationConfig.js src/pages/Admin.jsx src/App.jsx tests/meetingMinutesDocument.test.js tests/meetingMinutesService.test.js
npm run build
```
Expected: All tests pass, 0 ESLint errors, Vite build compiles cleanly.

- [ ] **Step 4: Commit**

```bash
git add src/pages/MeetingMinutesPage.jsx src/pages/MeetingMinutesPage.css src/utils/navigationConfig.js src/pages/Admin.jsx src/App.jsx
git commit -m "feat(minutes): add public verification portal, admin tab wiring, and router entry"
```
