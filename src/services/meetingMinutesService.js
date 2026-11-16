import { auth, db } from '../lib/firebase.js';
import {
  collection, doc, onSnapshot, query, orderBy, runTransaction,
  serverTimestamp, setDoc, writeBatch,
} from 'firebase/firestore';
import { formatDisplayIdentifier } from '../utils/authHelpers.js';
import { controlMonthOf, formatControlNumber } from '../utils/meetingMinutesDocument.js';

const minutesRef = collection(db, 'meetingMinutes');
const nameOf = user => user.displayName || formatDisplayIdentifier(user.email);
const rows = snap => snap.docs.map(d => ({ id: d.id, ...d.data() }));

function check(condition, message) {
  if (!condition) throw new Error(message);
}

/** Collapses repeated whitespace so typed names match normalized signer records. */
export const normalizeSignerName = value => (value || '').trim().replace(/\s+/g, ' ');

/**
 * Validates and sanitizes form inputs into Meeting Minutes Firestore fields.
 */
export function meetingMinutesFields(form) {
  check(form?.title?.trim(), 'Add a title for the Minutes of Meeting.');

  const signers = {};
  (form.signers || []).forEach((s, index) => {
    const name = (s.name || '').trim().slice(0, 200);
    const title = (s.title || '').trim().slice(0, 200);
    if (s.kind === 'acknowledger' ? name || title : name) {
      signers[s.id] = { kind: s.kind, name, title, order: index + 1 };
    }
  });
  check(Object.keys(signers).length <= 12, 'Use at most 12 signers.');

  return {
    title: form.title.trim().slice(0, 300),
    meetingType: form.meetingType === 'client' ? 'client' : 'internal',
    clientOrGroup: (form.clientOrGroup || '').trim().slice(0, 200),
    meetingDate: (form.meetingDate || '').trim().slice(0, 20),
    startTime: (form.startTime || '').trim().slice(0, 40),
    endTime: (form.endTime || '').trim().slice(0, 40),
    location: (form.location || '').trim().slice(0, 300),
    presidedBy: (form.presidedBy || '').trim().slice(0, 200),
    recordedBy: (form.recordedBy || '').trim().slice(0, 200),
    attendees: (form.attendees || '').trim().slice(0, 2000),
    absent: (form.absent || '').trim().slice(0, 1000),
    nextMeeting: (form.nextMeeting || '').trim().slice(0, 300),
    body: (form.body || '').slice(0, 80000),
    bodyJson: (form.bodyJson || '').slice(0, 400000),
    signers,
  };
}

export function subscribeMeetingMinutes(onData, onError) {
  return onSnapshot(query(minutesRef, orderBy('createdAt', 'desc')), snap => onData(rows(snap)), onError);
}

export function subscribeMeetingMinutesDoc(id, onData, onError) {
  return onSnapshot(doc(db, 'meetingMinutes', id), snap => onData(snap.exists() ? { id: snap.id, ...snap.data() } : null), onError);
}

export function subscribeMeetingSignatures(id, onData, onError) {
  return onSnapshot(collection(db, 'meetingMinutes', id, 'signatures'), snap => onData(Object.fromEntries(snap.docs.map(d => {
    const data = d.data();
    return [d.id, { ...data, signedAt: data.signedAt?.toDate?.().toISOString() || new Date().toISOString() }];
  }))), onError);
}

/**
 * Reserves MOM-YYYY-MM-XXX atomically and writes the draft Minutes of Meeting.
 */
export async function createMeetingMinutes(user, form) {
  const fields = meetingMinutesFields(form);
  const month = controlMonthOf();
  const counter = doc(db, 'meetingMinutesCounters', month);
  const ref = doc(minutesRef);

  await runTransaction(db, async tx => {
    const snap = await tx.get(counter);
    const seq = (snap.exists() ? snap.data().last : 0) + 1;
    tx.set(counter, { last: seq });
    tx.set(ref, {
      ...fields,
      controlMonth: month,
      controlSeq: seq,
      controlNumber: formatControlNumber(month, seq),
      status: 'draft',
      revokedReason: '',
      createdAt: serverTimestamp(),
      createdByUid: user.uid,
      createdByName: nameOf(user),
      updatedAt: serverTimestamp(),
      updatedByUid: user.uid,
      issuedAt: null,
      revokedAt: null,
    });
  });

  return ref.id;
}

export async function updateMeetingMinutes(user, id, form) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'meetingMinutes', id), {
    ...meetingMinutesFields(form),
    updatedAt: serverTimestamp(),
    updatedByUid: user.uid,
  });
  await batch.commit();
}

export async function issueMeetingMinutes(user, id) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'meetingMinutes', id), {
    status: 'issued',
    issuedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    updatedByUid: user.uid,
  });
  await batch.commit();
}

export async function revokeMeetingMinutes(user, id, reason) {
  check(reason?.trim(), 'Provide a reason for revoking these Minutes of Meeting.');
  const batch = writeBatch(db);
  batch.update(doc(db, 'meetingMinutes', id), {
    status: 'revoked',
    revokedReason: reason.trim().slice(0, 500),
    revokedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    updatedByUid: user.uid,
  });
  await batch.commit();
}

export async function deleteMeetingMinutesDraft(id) {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'meetingMinutes', id));
  await batch.commit();
}

/**
 * Records an immutable electronic signature entry for one signer slot without modifying the parent doc.
 */
export async function signMeetingMinutes(id, slotId, name, user = auth.currentUser) {
  const typed = normalizeSignerName(name);
  check(typed.length >= 2, 'Type your full name (at least 2 characters) to sign.');
  await setDoc(doc(db, 'meetingMinutes', id, 'signatures', slotId), {
    name: typed.slice(0, 200),
    signedAt: serverTimestamp(),
    signedByUid: user?.uid || '',
    userAgent: (typeof navigator !== 'undefined' ? navigator.userAgent : '').slice(0, 300),
  });
}
