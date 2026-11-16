import test from 'node:test';
import assert from 'node:assert';
import {
  meetingMinutesFields,
  normalizeSignerName,
  signMeetingMinutes,
} from '../src/services/meetingMinutesService.js';

test('meetingMinutesFields validates and sanitizes complete form values', () => {
  const validForm = {
    title: '  Q4 Roadmap & Client Review  ',
    meetingType: 'client',
    clientOrGroup: 'Mud Hound Corp',
    meetingDate: '2026-11-16',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    location: 'Google Meet',
    presidedBy: 'Jetch Merald S. Madaya',
    recordedBy: 'Tiffany Escalante',
    attendees: 'Jetch Madaya, Tiffany Escalante, John Judilla',
    absent: 'None',
    nextMeeting: 'November 23, 2026',
    body: '<h2>1. Overview</h2><p>Notes</p>',
    bodyJson: '{"type":"doc","content":[]}',
    signers: [
      { id: 's1', kind: 'prepared', name: 'Tiffany Escalante', title: 'Operations Manager' },
      { id: 's2', kind: 'approved', name: 'Jetch Merald S. Madaya', title: 'Founder' },
      { id: 's3', kind: 'acknowledger', name: '', title: 'Client Representative' },
      { id: 's4', kind: 'prepared', name: '', title: 'Blank non-acknowledger skipped' },
    ],
  };

  const fields = meetingMinutesFields(validForm);
  assert.strictEqual(fields.title, 'Q4 Roadmap & Client Review');
  assert.strictEqual(fields.meetingType, 'client');
  assert.strictEqual(fields.clientOrGroup, 'Mud Hound Corp');
  assert.strictEqual(fields.meetingDate, '2026-11-16');
  assert.ok(fields.signers.s1, 'prepared signer kept');
  assert.ok(fields.signers.s2, 'approved signer kept');
  assert.ok(fields.signers.s3, 'open acknowledger slot kept via title');
  assert.strictEqual(fields.signers.s4, undefined, 'blank non-acknowledger omitted');
});

test('meetingMinutesFields rejects empty title and normalizes invalid meetingType to internal', () => {
  assert.throws(() => {
    meetingMinutesFields({ title: '   ', meetingType: 'internal' });
  }, /title/i);

  const normalized = meetingMinutesFields({
    title: 'Weekly Sync',
    meetingType: 'unknown_type',
    signers: [],
  });
  assert.strictEqual(normalized.meetingType, 'internal');
});

test('normalizeSignerName collapses whitespace cleanly', () => {
  assert.strictEqual(normalizeSignerName('  Ana   Maria   Santos '), 'Ana Maria Santos');
  assert.strictEqual(normalizeSignerName(''), '');
});

test('signMeetingMinutes rejects signer names shorter than 2 characters before calling Firestore', async () => {
  await assert.rejects(
    () => signMeetingMinutes('doc1', 's1', ' A '),
    /at least 2 characters|full name/i,
  );
  await assert.rejects(
    () => signMeetingMinutes('doc1', 's3', '   '),
    /at least 2 characters|full name/i,
  );
});
