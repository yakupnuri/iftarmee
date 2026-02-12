CREATE TABLE IF NOT EXISTS hosts (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  host_id TEXT NOT NULL,
  guest_group_name TEXT NOT NULL,
  participant_count INTEGER NOT NULL,
  is_delivery INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (host_id) REFERENCES hosts(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS date_group_idx ON events (date, guest_group_name);
