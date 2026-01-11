use dioxus::prelude::*;
use shared::MediaItem;
use reqwest::Client;
use crate::Route;

const API_BASE: &str = "http://localhost:3000/api"; // Dev default

pub fn Gallery() -> Element {
    let items = use_resource(|| async move {
        // In real deploy, use relative path if served from same origin, or configured ENV
        // For dev, assume localhost:3000
        let client = Client::new();
        let res = client.get(format!("{}/media", API_BASE)).send().await;
        match res {
            Ok(r) => r.json::<Vec<MediaItem>>().await.unwrap_or_default(),
            Err(_) => vec![],
        }
    });

    rsx! {
        div {
            class: "gallery-container",
            h1 { "Latest Works" }
            
            match &*items.read_unchecked() {
                Some(list) => rsx! {
                    div { class: "gallery-grid",
                        for item in list {
                            Link {
                                to: Route::Detail { id: item.id },
                                div { class: "media-card",
                                    // Use thumbnail logic if available, else use raw url if image
                                    // For video, maybe a placeholder or try to load it
                                    img {
                                        class: "media-thumbnail",
                                        src: "{API_BASE}/../static/{item.url.split('/').last().unwrap_or_default()}", 
                                        // Note: item.url in DB is stored as /static/filename. But simple hack for now to ensure absolute URL if needed or relative
                                        // Actually item.url is "/static/..." so we just need origin.
                                        // If running FE on 8080 and BE on 3000, we need full path.
                                        // Let's assume we handle this better. 
                                        // For now: http://localhost:3000{item.url}
                                    }
                                    div { class: "media-info",
                                        div { class: "media-title", "{item.title}" }
                                    }
                                }
                            }
                        }
                    }
                },
                None => rsx! { "Loading..." }
            }
        }
    }
}
