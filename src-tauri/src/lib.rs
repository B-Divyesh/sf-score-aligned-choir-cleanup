#[tauri::command]
fn save_bytes(suggested_name: String, data: Vec<u8>) -> Result<Option<String>, String> {
    let path = rfd::FileDialog::new().set_file_name(&suggested_name).save_file();
    let Some(path) = path else { return Ok(None) };
    std::fs::write(&path, data).map_err(|error| error.to_string())?;
    Ok(Some(path.to_string_lossy().into_owned()))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_bytes])
        .run(tauri::generate_context!())
        .expect("error while running Choir Cleanup");
}
