CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    media_type TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    created_at DATETIME NOT NULL
);
