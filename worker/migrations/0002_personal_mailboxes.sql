-- Personal @odysseyph.com inboxes, one per staff member. The mailbox id in the email tables is `local`.
-- Inactive rows keep their mail visible to the superadmin; new mail to that address falls back to hello@.
CREATE TABLE IF NOT EXISTS personal_mailboxes (
  local TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL UNIQUE,
  owner_email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS personal_mailboxes_owner ON personal_mailboxes (owner_email, active);
