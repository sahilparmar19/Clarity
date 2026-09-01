pub mod db;
pub mod models;
pub mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::register,
            commands::login,
            commands::get_tasks,
            commands::create_task,
            commands::update_task,
            commands::delete_task,
            commands::set_diary_pin,
            commands::check_diary_pin,
            commands::verify_diary_pin,
            commands::get_diary_entries,
            commands::save_diary_entry,
            commands::get_calendar_day,
            commands::get_calendar_range,
            commands::get_year_heatmap,
            commands::create_calendar_event,
            commands::delete_calendar_event,
            commands::update_calendar_event,
            commands::get_expenses,
            commands::create_expense,
            commands::delete_expense,
            commands::get_projects,
            commands::create_project,
            commands::delete_project,
            commands::get_project_tasks,
            commands::create_project_task,
            commands::update_project_task_status,
            commands::delete_project_task,
        ])
        .run(tauri::generate_context!())
        .expect("error running Clarity");
}
