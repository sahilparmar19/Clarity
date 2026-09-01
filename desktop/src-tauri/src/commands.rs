use rusqlite::params;
use crate::db::get_db;
use crate::models::*;

// ─── Auth ────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn register(username: String, email: String, password: String) -> Result<AuthResponse, String> {
    let db = get_db();
    let hashed = bcrypt::hash(&password, 10).map_err(|e| e.to_string())?;
    db.execute(
        "INSERT INTO users (username, email, password) VALUES (?1, ?2, ?3)",
        params![username, email, hashed],
    ).map_err(|e| format!("Registration failed: {}", e))?;
    let id = db.last_insert_rowid();
    Ok(AuthResponse { user_id: id, username })
}

#[tauri::command]
pub fn login(username: String, password: String) -> Result<AuthResponse, String> {
    let db = get_db();
    let mut stmt = db.prepare("SELECT id, password FROM users WHERE username = ?1")
        .map_err(|e| e.to_string())?;
    let (id, hash): (i64, String) = stmt.query_row(params![username], |row| {
        Ok((row.get(0)?, row.get(1)?))
    }).map_err(|_| "Invalid username or password".to_string())?;

    if !bcrypt::verify(&password, &hash).unwrap_or(false) {
        return Err("Invalid username or password".to_string());
    }
    Ok(AuthResponse { user_id: id, username })
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn get_tasks(user_id: i64, pending_only: bool) -> Result<Vec<Task>, String> {
    let db = get_db();
    let sql = if pending_only {
        "SELECT id, title, description, completed, due_at, created_at, updated_at FROM tasks WHERE user_id = ?1 AND completed = 0 ORDER BY created_at DESC"
    } else {
        "SELECT id, title, description, completed, due_at, created_at, updated_at FROM tasks WHERE user_id = ?1 ORDER BY created_at DESC"
    };
    let mut stmt = db.prepare(sql).map_err(|e| e.to_string())?;
    let tasks = stmt.query_map(params![user_id], |row| {
        Ok(Task {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            completed: row.get::<_, i32>(3)? != 0,
            due_at: row.get(4)?,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();
    Ok(tasks)
}

#[tauri::command]
pub fn create_task(user_id: i64, title: String, description: Option<String>, due_at: Option<String>) -> Result<Task, String> {
    let db = get_db();
    db.execute(
        "INSERT INTO tasks (user_id, title, description, due_at) VALUES (?1, ?2, ?3, ?4)",
        params![user_id, title, description, due_at],
    ).map_err(|e| e.to_string())?;
    let id = db.last_insert_rowid();
    let mut stmt = db.prepare("SELECT id, title, description, completed, due_at, created_at, updated_at FROM tasks WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    stmt.query_row(params![id], |row| {
        Ok(Task {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            completed: row.get::<_, i32>(3)? != 0,
            due_at: row.get(4)?,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    }).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_task(id: i64, title: Option<String>, description: Option<String>, completed: Option<bool>, due_at: Option<String>) -> Result<Task, String> {
    let db = get_db();
    // Build dynamic update
    if let Some(t) = &title {
        db.execute("UPDATE tasks SET title = ?1, updated_at = datetime('now') WHERE id = ?2", params![t, id])
            .map_err(|e| e.to_string())?;
    }
    if let Some(d) = &description {
        db.execute("UPDATE tasks SET description = ?1, updated_at = datetime('now') WHERE id = ?2", params![d, id])
            .map_err(|e| e.to_string())?;
    }
    if let Some(c) = completed {
        let val: i32 = if c { 1 } else { 0 };
        db.execute("UPDATE tasks SET completed = ?1, updated_at = datetime('now') WHERE id = ?2", params![val, id])
            .map_err(|e| e.to_string())?;
    }
    if let Some(d) = &due_at {
        db.execute("UPDATE tasks SET due_at = ?1, updated_at = datetime('now') WHERE id = ?2", params![d, id])
            .map_err(|e| e.to_string())?;
    }

    let mut stmt = db.prepare("SELECT id, title, description, completed, due_at, created_at, updated_at FROM tasks WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    stmt.query_row(params![id], |row| {
        Ok(Task {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            completed: row.get::<_, i32>(3)? != 0,
            due_at: row.get(4)?,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    }).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_task(id: i64) -> Result<(), String> {
    let db = get_db();
    db.execute("DELETE FROM tasks WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ─── Diary ───────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn set_diary_pin(user_id: i64, pin: String) -> Result<(), String> {
    let db = get_db();
    let hashed = bcrypt::hash(&pin, 10).map_err(|e| e.to_string())?;
    db.execute("UPDATE users SET diary_pin = ?1 WHERE id = ?2", params![hashed, user_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn check_diary_pin(user_id: i64) -> Result<bool, String> {
    let db = get_db();
    let mut stmt = db.prepare("SELECT diary_pin FROM users WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    let pin: Option<String> = stmt.query_row(params![user_id], |row| row.get(0))
        .map_err(|e| e.to_string())?;
    Ok(pin.is_some())
}

#[tauri::command]
pub fn verify_diary_pin(user_id: i64, pin: String) -> Result<bool, String> {
    let db = get_db();
    let mut stmt = db.prepare("SELECT diary_pin FROM users WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    let stored: Option<String> = stmt.query_row(params![user_id], |row| row.get(0))
        .map_err(|e| e.to_string())?;
    match stored {
        None => Err("Diary PIN not set".to_string()),
        Some(hash) => Ok(bcrypt::verify(&pin, &hash).unwrap_or(false)),
    }
}

#[tauri::command]
pub fn get_diary_entries(user_id: i64) -> Result<Vec<DiaryEntry>, String> {
    let db = get_db();
    let mut stmt = db.prepare(
        "SELECT id, date, body, mood, created_at, updated_at FROM diary_entries WHERE user_id = ?1 ORDER BY date DESC"
    ).map_err(|e| e.to_string())?;
    let entries = stmt.query_map(params![user_id], |row| {
        Ok(DiaryEntry {
            id: row.get(0)?,
            date: row.get(1)?,
            body: row.get(2)?,
            mood: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();
    Ok(entries)
}

#[tauri::command]
pub fn save_diary_entry(user_id: i64, date: String, body: String, mood: Option<String>) -> Result<DiaryEntry, String> {
    let db = get_db();
    db.execute(
        "INSERT INTO diary_entries (user_id, date, body, mood) VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(user_id, date) DO UPDATE SET body = ?3, mood = ?4, updated_at = datetime('now')",
        params![user_id, date, body, mood],
    ).map_err(|e| e.to_string())?;

    let mut stmt = db.prepare(
        "SELECT id, date, body, mood, created_at, updated_at FROM diary_entries WHERE user_id = ?1 AND date = ?2"
    ).map_err(|e| e.to_string())?;
    stmt.query_row(params![user_id, date], |row| {
        Ok(DiaryEntry {
            id: row.get(0)?,
            date: row.get(1)?,
            body: row.get(2)?,
            mood: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    }).map_err(|e| e.to_string())
}

// ─── Calendar ────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn get_calendar_day(user_id: i64, date: String) -> Result<Vec<CalendarEvent>, String> {
    let db = get_db();
    let mut stmt = db.prepare(
        "SELECT id, title, description, event_date, start_at, end_at, event_type, created_at FROM calendar_events WHERE user_id = ?1 AND event_date = ?2 ORDER BY start_at"
    ).map_err(|e| e.to_string())?;
    let events = stmt.query_map(params![user_id, date], |row| {
        Ok(CalendarEvent {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            event_date: row.get(3)?,
            start_at: row.get(4)?,
            end_at: row.get(5)?,
            event_type: row.get(6)?,
            created_at: row.get(7)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();
    Ok(events)
}

#[tauri::command]
pub fn get_calendar_range(user_id: i64, from: String, to: String) -> Result<Vec<CalendarEvent>, String> {
    let db = get_db();
    let mut stmt = db.prepare(
        "SELECT id, title, description, event_date, start_at, end_at, event_type, created_at FROM calendar_events WHERE user_id = ?1 AND event_date >= ?2 AND event_date <= ?3 ORDER BY event_date, start_at"
    ).map_err(|e| e.to_string())?;
    let events = stmt.query_map(params![user_id, from, to], |row| {
        Ok(CalendarEvent {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            event_date: row.get(3)?,
            start_at: row.get(4)?,
            end_at: row.get(5)?,
            event_type: row.get(6)?,
            created_at: row.get(7)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();
    Ok(events)
}

#[tauri::command]
pub fn get_year_heatmap(user_id: i64, year: i32) -> Result<std::collections::HashMap<u32, u32>, String> {
    let db = get_db();
    let year_str = format!("{}", year);
    let mut stmt = db.prepare(
        "SELECT CAST(strftime('%m', event_date) AS INTEGER) as month, COUNT(*) as cnt FROM calendar_events WHERE user_id = ?1 AND strftime('%Y', event_date) = ?2 GROUP BY month"
    ).map_err(|e| e.to_string())?;
    let mut map = std::collections::HashMap::new();
    let rows = stmt.query_map(params![user_id, year_str], |row| {
        Ok((row.get::<_, u32>(0)?, row.get::<_, u32>(1)?))
    }).map_err(|e| e.to_string())?;
    for r in rows {
        if let Ok((month, count)) = r {
            map.insert(month, count);
        }
    }
    Ok(map)
}

#[tauri::command]
pub fn create_calendar_event(
    user_id: i64,
    title: String,
    description: Option<String>,
    event_date: String,
    start_at: Option<String>,
    end_at: Option<String>,
    event_type: String,
) -> Result<CalendarEvent, String> {
    let db = get_db();
    db.execute(
        "INSERT INTO calendar_events (user_id, title, description, event_date, start_at, end_at, event_type) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![user_id, title, description, event_date, start_at, end_at, event_type],
    ).map_err(|e| e.to_string())?;
    let id = db.last_insert_rowid();
    let mut stmt = db.prepare(
        "SELECT id, title, description, event_date, start_at, end_at, event_type, created_at FROM calendar_events WHERE id = ?1"
    ).map_err(|e| e.to_string())?;
    stmt.query_row(params![id], |row| {
        Ok(CalendarEvent {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            event_date: row.get(3)?,
            start_at: row.get(4)?,
            end_at: row.get(5)?,
            event_type: row.get(6)?,
            created_at: row.get(7)?,
        })
    }).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_calendar_event(id: i64) -> Result<(), String> {
    let db = get_db();
    db.execute("DELETE FROM calendar_events WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn update_calendar_event(id: i64, title: String) -> Result<(), String> {
    let db = get_db();
    db.execute("UPDATE calendar_events SET title = ?1 WHERE id = ?2", params![title, id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ─── Expenses ────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn get_expenses(user_id: i64) -> Result<Vec<Expense>, String> {
    let db = get_db();
    let mut stmt = db.prepare("SELECT id, amount, category, description, date, type, created_at FROM expenses WHERE user_id = ?1 ORDER BY date DESC, id DESC")
        .map_err(|e| e.to_string())?;
    
    let expenses = stmt.query_map(params![user_id], |row| {
        Ok(Expense {
            id: row.get(0)?,
            amount: row.get(1)?,
            category: row.get(2)?,
            description: row.get(3)?,
            date: row.get(4)?,
            expense_type: row.get(5)?,
            created_at: row.get(6)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(Result::ok)
    .collect();
    
    Ok(expenses)
}

#[tauri::command]
pub fn create_expense(
    user_id: i64, amount: f64, category: String, description: Option<String>, date: String, expense_type: String
) -> Result<Expense, String> {
    let db = get_db();
    db.execute(
        "INSERT INTO expenses (user_id, amount, category, description, date, type) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![user_id, amount, category, description, date, expense_type],
    ).map_err(|e| e.to_string())?;
    
    let id = db.last_insert_rowid();
    Ok(Expense {
        id, amount, category, description, date, expense_type, created_at: String::new(),
    })
}

#[tauri::command]
pub fn delete_expense(id: i64) -> Result<(), String> {
    let db = get_db();
    db.execute("DELETE FROM expenses WHERE id = ?1", params![id]).map_err(|e| e.to_string())?;
    Ok(())
}

// ─── Projects ────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn get_projects(user_id: i64) -> Result<Vec<Project>, String> {
    let db = get_db();
    let mut stmt = db.prepare("SELECT id, title, description, created_at FROM projects WHERE user_id = ?1 ORDER BY id DESC")
        .map_err(|e| e.to_string())?;
    let projects = stmt.query_map(params![user_id], |row| {
        Ok(Project {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            created_at: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(Result::ok)
    .collect();
    Ok(projects)
}

#[tauri::command]
pub fn create_project(user_id: i64, title: String, description: Option<String>) -> Result<Project, String> {
    let db = get_db();
    db.execute(
        "INSERT INTO projects (user_id, title, description) VALUES (?1, ?2, ?3)",
        params![user_id, title, description],
    ).map_err(|e| e.to_string())?;
    let id = db.last_insert_rowid();
    Ok(Project {
        id, title, description, created_at: String::new(),
    })
}

#[tauri::command]
pub fn delete_project(id: i64) -> Result<(), String> {
    let db = get_db();
    db.execute("DELETE FROM projects WHERE id = ?1", params![id]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_project_tasks(project_id: i64) -> Result<Vec<ProjectTask>, String> {
    let db = get_db();
    let mut stmt = db.prepare("SELECT id, project_id, title, description, status, created_at FROM project_tasks WHERE project_id = ?1")
        .map_err(|e| e.to_string())?;
    let tasks = stmt.query_map(params![project_id], |row| {
        Ok(ProjectTask {
            id: row.get(0)?,
            project_id: row.get(1)?,
            title: row.get(2)?,
            description: row.get(3)?,
            status: row.get(4)?,
            created_at: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(Result::ok)
    .collect();
    Ok(tasks)
}

#[tauri::command]
pub fn create_project_task(project_id: i64, title: String, description: Option<String>, status: String) -> Result<ProjectTask, String> {
    let db = get_db();
    db.execute(
        "INSERT INTO project_tasks (project_id, title, description, status) VALUES (?1, ?2, ?3, ?4)",
        params![project_id, title, description, status],
    ).map_err(|e| e.to_string())?;
    let id = db.last_insert_rowid();
    Ok(ProjectTask {
        id, project_id, title, description, status, created_at: String::new(),
    })
}

#[tauri::command]
pub fn update_project_task_status(id: i64, status: String) -> Result<(), String> {
    let db = get_db();
    db.execute("UPDATE project_tasks SET status = ?1 WHERE id = ?2", params![status, id]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_project_task(id: i64) -> Result<(), String> {
    let db = get_db();
    db.execute("DELETE FROM project_tasks WHERE id = ?1", params![id]).map_err(|e| e.to_string())?;
    Ok(())
}
