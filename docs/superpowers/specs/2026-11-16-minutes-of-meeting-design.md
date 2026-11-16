# Design Specification: Minutes of Meeting Subsystem

**Date:** 2026-11-16  
**Document Code:** MOM  
**Target:** OdysseyPH IT Solutions Platform  
**Status:** Design Spec Ready for Review  

---

## 1. Overview & Business Intent

OdysseyPH IT Solutions needs a **Minutes of Meeting (MoM)** document generator following the exact brand architecture, workflow, and visual polish of existing company documents: Office Orders (`OO`), Incident Reports (`IR`), Audit Reports (`AR`), and Price Quotations (`QT`).

The Minutes of Meeting module supports both **internal team/board meetings** and **external client syncs**, providing structured meeting metadata (date, time, venue/link, presider, recorder, attendees, absent), rich-text discussion notes and inline **Action Items** tables powered by TipTap, AI-assisted drafting, multi-page Brand Bible PDF/PNG export, and digital signature sign-offs via shareable verification links.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          OdysseyPH Admin App                            │
│                                                                         │
│  ┌───────────────────────┐             ┌─────────────────────────────┐  │
│  │ navigationConfig.js   │             │ AdminMinutes.jsx            │  │
│  │ minutes:manage        │ ──────────> │ (Metrics, Search, Filters,  │  │
│  │ Admin.jsx (Tab)       │             │  Detail Preview, Actions)   │  │
│  └───────────────────────┘             └──────────────┬──────────────┘  │
│                                                       │                 │
│                                                       ▼                 │
│                                        ┌─────────────────────────────┐  │
│                                        │ MeetingMinutesEditor.jsx    │  │
│                                        │ • Meeting Meta Card         │  │
│                                        │ • TipTap Rich Text + Table  │  │
│                                        │ • Smart AI / Paste Parser   │  │
│                                        └──────────────┬──────────────┘  │
│                                                       │                 │
└───────────────────────────────────────────────────────┼─────────────────┘
                                                        │
                       ┌────────────────────────────────┴────────────────┐
                       │                                                 │
                       ▼                                                 ▼
       ┌───────────────────────────────┐                 ┌───────────────────────────────┐
       │ meetingMinutesDocument.js     │                 │ meetingMinutesService.js      │
       │ • HTML Builder (brandPage)    │                 │ • subscribeMeetingMinutes()   │
       │ • Control No (MOM-YYYY-MM-XXX)│                 │ • createMeetingMinutes()      │
       │ • Rich JSON/Markdown Render   │                 │ • updateMeetingMinutes()      │
       │ • MeetingMinutesFrame.jsx     │                 │ • issueMeetingMinutes()       │
       │   (ResizeObserver + PDF/PNG)  │                 │ • revokeMeetingMinutes()      │
       └───────────────┬───────────────┘                 │ • signMeetingMinutes()        │
                       │                                 └───────────────┬───────────────┘
                       │                                                 │
                       ▼                                                 ▼
       ┌───────────────────────────────┐                 ┌───────────────────────────────┐
       │ MeetingMinutesPage.jsx        │                 │ Firestore Database            │
       │ Route: /minutes-of-meeting/:id│                 │ • /meetingMinutes/{id}        │
       │ • Public/Client Review        │ ──────────────> │ • /meetingMinutesCounters/{m} │
       │ • Print PDF / Save PNG        │                 │ • .../signatures/{slotId}     │
       │ • ?sign=slot E-Signing        │                 │ Rules: firestore.rules        │
       └───────────────────────────────┘                 └───────────────────────────────┘
```

---

## 3. Data Schema & State Specification

### 3.1 Firestore Collections

#### Collection: `meetingMinutesCounters/{YYYY-MM}`
Atomic sequential monthly counters:
- `last`: `number` (increments sequentially: `1, 2, 3...`)

#### Collection: `meetingMinutes/{minutesId}`
Primary meeting record:
- `controlNumber`: `string` (`MOM-YYYY-MM-XXX`, e.g., `MOM-2026-11-001`)
- `controlMonth`: `string` (`YYYY-MM`)
- `controlSeq`: `number` (`int > 0`)
- `status`: `'draft' | 'issued' | 'revoked'`
- `revokedReason`: `string` (up to 500 chars)

**Meeting Metadata:**
- `title`: `string` (required, 1..300 chars; e.g., `"Sprint Planning & Client Kickoff"`)
- `meetingType`: `'internal' | 'client'` (default `'internal'`)
- `clientOrGroup`: `string` (0..200 chars; client organization, project, or department)
- `meetingDate`: `string` (ISO `YYYY-MM-DD`, 0..20 chars)
- `startTime`: `string` (0..40 chars, e.g., `"10:00 AM"`)
- `endTime`: `string` (0..40 chars, e.g., `"11:15 AM"`)
- `location`: `string` (0..300 chars; office room or video call link/platform)
- `presidedBy`: `string` (0..200 chars; chairperson / meeting lead)
- `recordedBy`: `string` (0..200 chars; minute-taker / secretary)
- `attendees`: `string` (0..2000 chars; comma- or newline-separated participants)
- `absent`: `string` (0..1000 chars; optional absent / excused invitees)
- `nextMeeting`: `string` (0..300 chars; optional next meeting date/notes)

**Content & Signatories:**
- `body`: `string` (0..80000 chars; rendered HTML or markdown fallback)
- `bodyJson`: `string` (0..400000 chars; serialized TipTap JSON document)
- `signers`: `map` (up to 12 entries):
  - Key: slot ID (`s1`, `s2`, `s3`, ...)
  - Value: `{ kind: 'prepared' | 'approved' | 'acknowledger', name: string, title: string, order: number }`
- Audit timestamps & actors: `createdAt`, `createdByUid`, `createdByName`, `updatedAt`, `updatedByUid`, `issuedAt`, `revokedAt`.

#### Subcollection: `meetingMinutes/{minutesId}/signatures/{slotId}`
Immutable audit entries (no updates or deletes):
- `name`: `string` (2..200 chars; normalized whitespace, must match pre-assigned `signers[slotId].name` case-insensitively unless `signers[slotId].name == ''`)
- `signedAt`: `timestamp` (`serverTimestamp()`)
- `signedByUid`: `string` (`auth.currentUser?.uid || ''`)
- `userAgent`: `string` (0..300 chars)

---

## 4. Document Design & Brand Bible Compliance

### 4.1 Layout & Typography (`src/utils/meetingMinutesDocument.js`)
- Uses `brandPage()` from `src/utils/brandDocument.js` with clean plain-text `title: 'MINUTES OF MEETING'`, `numberLabel: 'CONTROL / TRACKING NO.'`, and `number: controlNumber`.
- Navy title band keeps title (`white-space: nowrap; overflow: hidden; text-overflow: ellipsis`) and control number (`flex-shrink: 0; white-space: nowrap`) on a single line.
- `@media screen and (max-width:840px)` overrides preserve exact `816px` letter page layout inside the scaled iframe.
- **Meeting Summary Grid:** Two-column `.mom-meta` block displaying Meeting Title, Meeting Type pill (`Internal Meeting` / `Client Meeting`), Client / Group, Date & Time (`startTime – endTime`), Location, Presided by, Recorded by, Attendees, Absent, and Next Meeting.
- **Body & Tables:** Supports TipTap JSON (`renderDocJson`) and Markdown (`renderMarkdownBody` / `markdownToHtml`):
  - `<h2>` renders with the OdysseyPH orange vertical pill/numbered badge and `break-after: avoid`.
  - Tables render with `#ebe5dc` uppercase headers, `#3a4a5c` rounded border containers, `normalizeScopeHtml`-style leading `<th>` promotion into `<thead>` so multi-page prints repeat table column headers, and `tr { break-inside: avoid }`.
  - Lists (`ul`, `ol`) keep `padding-left: 22px` indentation and crisp line spacing.
- **Print Pagination:** `@page { size: letter; margin: 12mm 0 }` with `@page :first { margin-top: 0; margin-bottom: 12mm }` prevents continuation pages from touching top/bottom paper edges while preserving Page 1's full-bleed company header and title band.
- **Signatures & Watermarks:** `Great Vibes` cursive `.sig-mark` above `.sig-line` with electronic timestamp (`Asia/Manila`); `DRAFT` / `REVOKED` subtle watermark `.stamp` and `.revoked-note` when applicable.

### 4.2 Starter Template & AI Draft Parser
Default TipTap content includes:
1. `## 1. Meeting Overview & Agenda`
2. `## 2. Key Discussions & Decisions`
3. `## 3. Action Items` (4-column TipTap table: `Action Item | Owner | Due Date | Status`)
4. `## 4. Next Meeting & Adjournment`

`AI_MEETING_PROMPT` and `parseMeetingMinutesText(raw)` extract `TITLE`, `TYPE`, `CLIENT / GROUP`, `DATE`, `TIME`, `LOCATION`, `PRESIDED BY`, `RECORDED BY`, `ATTENDEES`, `ABSENT`, `NEXT MEETING`, body sections (including Markdown action-item tables), and `Prepared by` / `Approved by` / `Acknowledged by` signers.

---

## 5. Interactive UI, Routes & Permissions

### 5.1 Components & Pages
- `src/components/meetingMinutes/MeetingMinutesEditor.jsx` (+ `.css`): Sticky TipTap formatting bar (headings, lists, blockquote, alignment, Table actions dropdown, `Paste from AI` drawer) over an on-page letter sheet with inline inputs for meeting fields and pre-populated Action Items table.
- `src/components/meetingMinutes/MeetingMinutesFrame.jsx` (+ `.css`): Isolated `816px` iframe with `ResizeObserver` automatic downscaling (avoiding right-edge clipping on smaller admin viewports), `print()`, and `savePng()`.
- `src/pages/AdminMinutes.jsx` (+ `.css`): Admin tab featuring summary metrics (Total, Drafts, Issued, Client Syncs), search box, status & meeting-type segmented filters, table view, editor view with dynamic signer management (`Prepared by`, `Approved by`, `+ Add attendee / client signer`), and detail preview with `Issue`, `Copy Verification Link`, per-signer `?sign=` copy buttons, `Save as PDF`, `Save as PNG`, `Revoke`, `Delete draft`, and inline admin signing for `prepared`/`approved` slots.
- `src/pages/MeetingMinutesPage.jsx` (+ `.css`): Public shareable route `/minutes-of-meeting/:id` showing live `MeetingMinutesFrame`, PDF/PNG download buttons, share link, particulars sidebar, signature audit trail, and e-signature form for open slots (auto-selecting `?sign=slotId` when present).

### 5.2 Navigation, App Routing & Security Rules
- **`src/utils/navigationConfig.js`:** Add module `{ id: 'meetingminutes', label: 'Minutes of Meeting', desc: 'Meeting notes, decisions, action items & signoffs', icon: NotebookPen, color: '#38bdf8', actions: [{ id: 'minutes:manage', label: 'Manage Meeting Minutes', desc: 'Draft, issue, sign and revoke meeting minutes' }] }`.
- **`src/pages/Admin.jsx` & `src/App.jsx`:** Wire `activeTab === 'meetingminutes'` to `<AdminMinutes />` and public route `/minutes-of-meeting/:id` to `<MeetingMinutesPage />`.
- **`firestore.rules`:**
  - `minutesAdmin()` checks `operationsRoot() || (request.auth != null && staffAction('minutes:manage'))`.
  - `meetingMinutesCounters/{month}` allows `get`, monotonic `create`/`update` for `minutesAdmin()`.
  - `meetingMinutes/{minutesId}` allows `get` (`minutesAdmin()` or `status in ['issued', 'revoked']`), `list` (`minutesAdmin()`), `create` (`draft` only + counter check), `update` (`draft` edits, `draft -> issued`, `issued -> revoked`), `delete` (`draft` only).
  - `meetingMinutes/{minutesId}/signatures/{slotId}` allows `read` when parent readable; `create` only when parent `status == 'issued'`, valid `slotId`, valid keys & timestamp, normalized name match (or open if slot name is `''`), and `prepared`/`approved` slots restricted to `minutesAdmin()`, while `acknowledger` slots allow external/attendee e-signing via the shareable link. **Signing writes only to `signatures/{slotId}` and never modifies the parent `meetingMinutes` doc.**

---

## 6. Verification Plan
- `tests/meetingMinutesDocument.test.js`: Control number formatting (`MOM-YYYY-MM-XXX`), `parseMeetingMinutesText` field/table/signer extraction, `markdownToHtml` table rendering, `editorContentOf`, `normalizeScopeHtml` `<thead>` lifting, `buildMeetingMinutesHtml` Brand Bible shell, single-line header safety, signature marks, and CSS pagination rules.
- `tests/meetingMinutesService.test.js`: `meetingMinutesFields` validation, required `title` check, sanitization limits, `normalizeSignerName`, and signer mapping rules.
- Run `npx eslint` on all touched files, `npm run build` for production compilation check, and deploy `firestore.rules` when approved.
