use dioxus::prelude::*;
use reqwest::Client; // dioxus-reqwest or standard reqwest
// Note: In Dioxus Web, we usually use web-sys for FileList, or Dioxus's file input helpers.
// Since Dioxus 0.6+, there's better support.
// However, constructing a Multipart request in Wasm requires careful handling.
// We can use `reqwest::multipart` if the `multipart` feature is enabled AND we can get the `File` object or bytes.
// Dioxus `input { type: "file" }` events give `FormData` or event.
// Let's use `dioxus_web::WebEventExt` types if needed, or simple `onchange` to read bytes.
// Actually, `reqwest` in WASM supports `From<web_sys::FormData>`.
// So we can construct a `web_sys::FormData` and pass it.

pub fn Upload() -> Element {
    let mut title = use_signal(|| String::new());
    let mut description = use_signal(|| String::new());
    let mut status = use_signal(|| String::new());

    let submit = move |evt: FormEvent| async move {
        status.set("Uploading...".to_string());
        
        // This relies on web-sys interop. Dioxus 0.6 abstracts some events.
        // We might need to access the underlying HTMLFormElement to construct FormData easily.
        // Or manually construct it.
        // evt.data is FormData in recent Dioxus versions for onsubmit?
        // Actually, let's look at `evt.values()`. It gives text values. It doesn't give files easily.
        
        // Easier approach: Use `oninput` on file input to capture the file in a signal? 
        // No, file inputs are tricky.
        // Standard way: Get the `web_sys::HtmlFormElement` via ID or ref, then `FormData::new_with_form`.

        // Let's assume we can get the form element.
        // But for portability in Dioxus, maybe we just use `web_sys`.
        
        use wasm_bindgen::JsCast;
        let document = web_sys::window().unwrap().document().unwrap();
        let form_element = document.get_element_by_id("upload-form").unwrap()
            .dyn_into::<web_sys::HtmlFormElement>().unwrap();
        
        let form_data = web_sys::FormData::new_with_form(&form_element).unwrap();
        
        let client = Client::new();
        // reqwest::Body::from(form_data) ? reqwest 0.12 wasm supports FormData?
        // Actually, reqwest::multipart::Form is for native mainly unless specific wasm support.
        // BUT, `reqwest::Body` on WASM can take JsValue (FormData).
        // Let's try sending raw fetch via gloo or just reqwest if it wraps it.
        // Reqwest `body(val)` where val is JsValue? No.
        
        // Let's use `gloo_net` or `web_sys::window().fetch`.
        // Or simpler: reqwest can accept a Body that is bytes. 
        // But multipart is hard with bytes manually.
        
        // To save time and complexity, let's use `web_sys` fetch directly for the upload.
        
        let promise = web_sys::window().unwrap().fetch_with_request_and_init(
            &web_sys::Request::new_with_str("http://localhost:3000/api/media").unwrap(),
            web_sys::RequestInit::new().method("POST").body(Some(&form_data))
        );
        
        match wasm_bindgen_futures::JsFuture::from(promise).await {
            Ok(resp) => {
                let resp: web_sys::Response = resp.dyn_into().unwrap();
                if resp.ok() {
                    status.set("Upload successful!".to_string());
                } else {
                    status.set("Upload failed.".to_string());
                }
            },
            Err(_) => status.set("Network error".to_string()),
        }
    };

    rsx! {
        div {
            class: "upload-form",
            h1 { "Upload Media" }
            form {
                id: "upload-form",
                onsubmit: submit,
                prevent_default: "onsubmit", // Prevent reload
                
                div {
                    label { "Title" }
                    input { name: "title", required: true, value: "{title}", oninput: move |e| title.set(e.value()) }
                }
                div {
                    label { "Description" }
                    textarea { name: "description", value: "{description}", oninput: move |e| description.set(e.value()) }
                }
                div {
                    label { "File (Image or Video)" }
                    input { r#type: "file", name: "file", required: true, accept: "image/*,video/*" }
                }
                button { r#type: "submit", "Upload" }
            }
            div { "{status}" }
        }
    }
}
