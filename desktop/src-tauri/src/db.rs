use rusqlite::{Connection, params};
use std::path::PathBuf;
use std::sync::Mutex;
use once_cell::sync::Lazy;

fn db_path() -> PathBuf {
    let mut dir = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
    dir.push("com.clarity.app");
    std::fs::create_dir_all(&dir).ok();
    dir.push("clarity.db");
    dir
}

static DB: Lazy<Mutex<Connection>> = Lazy::new(|| {
    let conn = Connection::open(db_path()).expect("Failed to open database");
    conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;").ok();
    init_tables(&conn);
    Mutex::new(conn)
});

pub fn get_db() -> std::sync::MutexGuard<'static, Connection> {
    DB.lock().expect("DB lock poisoned")
}

fn init_tables(conn: &Connection) {
    conn.execute_batch("
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            username    TEXT NOT NULL UNIQUE,
            email       TEXT NOT NULL UNIQUE,
            password    TEXT NOT NULL,
            diary_pin   TEXT,
            created_at  TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS tasks (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id),
            title       TEXT NOT NULL,
            description TEXT,
            completed   INTEGER NOT NULL DEFAULT 0,
            due_at      TEXT,
            created_at  TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS diary_entries (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id),
            date        TEXT NOT NULL,
            body        TEXT NOT NULL DEFAULT '',
            mood        TEXT,
            created_at  TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
            UNIQUE(user_id, date)
        );

        CREATE TABLE IF NOT EXISTS calendar_events (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id),
            title       TEXT NOT NULL,
            description TEXT,
            event_date  TEXT NOT NULL,
            start_at    TEXT,
            end_at      TEXT,
            event_type  TEXT NOT NULL DEFAULT 'NOTE',
            created_at  TEXT NOT NULL DEFAULT (datetime('now'))
        );
    ").expect("Failed to create tables");
}
