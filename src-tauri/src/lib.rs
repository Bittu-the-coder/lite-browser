use tauri::{
    webview::WebviewBuilder, AppHandle, LogicalPosition, LogicalSize, Manager, WebviewUrl,
};
use url::Url;

/// Validates and normalizes a URL string
fn normalize_url(input: &str) -> String {
    let trimmed = input.trim();

    if let Ok(url) = Url::parse(trimmed) {
        if url.scheme() == "http" || url.scheme() == "https" {
            return url.to_string();
        }
    }

    if trimmed.contains('.') && !trimmed.contains(' ') {
        if let Ok(url) = Url::parse(&format!("https://{}", trimmed)) {
            return url.to_string();
        }
    }

    let encoded = urlencoding::encode(trimmed);
    format!("https://www.google.com/search?q={}", encoded)
}

#[tauri::command]
fn navigate_to(url: String) -> Result<String, String> {
    Ok(normalize_url(&url))
}

/// Create an embedded child webview inside the main window
#[tauri::command]
async fn create_webview(
    app: AppHandle,
    url: String,
    tab_id: u32,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Result<(), String> {
    let normalized = normalize_url(&url);
    let webview_label = format!("browser-{}", tab_id);

    // Close existing webview with same label if it exists
    if let Some(existing_wv) = app.get_webview(&webview_label) {
        let _ = existing_wv.close();
        tokio::time::sleep(std::time::Duration::from_millis(100)).await;
    }

    // Get the main window
    let main_window = app.get_window("main").ok_or("Main window not found")?;

    // Parse the URL
    let external_url: url::Url = normalized
        .parse()
        .map_err(|e| format!("URL parse error: {}", e))?;

    // Create webview builder - use Logical coordinates directly (no scaling needed)
    let builder =
        WebviewBuilder::new(&webview_label, WebviewUrl::External(external_url)).auto_resize();

    // Add as child webview at logical position (sidebar width, 0)
    main_window
        .add_child(
            builder,
            LogicalPosition::new(x, y),
            LogicalSize::new(width, height),
        )
        .map_err(|e| format!("Failed to create webview: {}", e))?;

    Ok(())
}

/// Resize/reposition an existing webview
#[tauri::command]
async fn resize_webview(
    app: AppHandle,
    tab_id: u32,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Result<(), String> {
    let webview_label = format!("browser-{}", tab_id);

    if let Some(webview) = app.get_webview(&webview_label) {
        // Use logical coordinates directly
        let _ = webview.set_position(LogicalPosition::new(x, y));
        let _ = webview.set_size(LogicalSize::new(width, height));
    }

    Ok(())
}

/// Close a webview
#[tauri::command]
async fn close_webview(app: AppHandle, tab_id: u32) -> Result<(), String> {
    let webview_label = format!("browser-{}", tab_id);
    if let Some(webview) = app.get_webview(&webview_label) {
        let _ = webview.close();
    }
    Ok(())
}

/// Show/hide webviews based on active tab
#[tauri::command]
async fn switch_tab(
    app: AppHandle,
    active_tab_id: u32,
    all_tab_ids: Vec<u32>,
) -> Result<(), String> {
    for tab_id in all_tab_ids {
        let webview_label = format!("browser-{}", tab_id);
        if let Some(webview) = app.get_webview(&webview_label) {
            if tab_id == active_tab_id {
                let _ = webview.show();
            } else {
                let _ = webview.hide();
            }
        }
    }
    Ok(())
}

/// Reload webview
#[tauri::command]
async fn reload_webview(app: AppHandle, tab_id: u32) -> Result<(), String> {
    let webview_label = format!("browser-{}", tab_id);
    if let Some(webview) = app.get_webview(&webview_label) {
        let _ = webview.eval("location.reload()");
    }
    Ok(())
}

/// Navigate back
#[tauri::command]
async fn go_back(app: AppHandle, tab_id: u32) -> Result<(), String> {
    let webview_label = format!("browser-{}", tab_id);
    if let Some(webview) = app.get_webview(&webview_label) {
        let _ = webview.eval("history.back()");
    }
    Ok(())
}

/// Navigate forward
#[tauri::command]
async fn go_forward(app: AppHandle, tab_id: u32) -> Result<(), String> {
    let webview_label = format!("browser-{}", tab_id);
    if let Some(webview) = app.get_webview(&webview_label) {
        let _ = webview.eval("history.forward()");
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            navigate_to,
            create_webview,
            resize_webview,
            close_webview,
            switch_tab,
            reload_webview,
            go_back,
            go_forward
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
