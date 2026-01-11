use dioxus::prelude::*;
use shared::{MediaItem, MediaType};
use reqwest::Client;

const API_BASE: &str = "http://localhost:3000/api";

#[component]
pub fn Detail(id: i64) -> Element {
    let item = use_resource(move || async move {
        // We rely on list_media for simplicity or could implement get_media(id)
        // Let's fetch all and find (inefficient but works for prototype)
        // Better: implement /api/media/:id in backend.
        // For now, I'll Quick-Fix backend to support getting by ID or just filter client side.
        // Let's filter client side from the full list for now to avoid branching tasks.
        let client = Client::new();
        let res = client.get(format!("{}/media", API_BASE)).send().await;
        if let Ok(r) = res {
             let list: Vec<MediaItem> = r.json().await.unwrap_or_default();
             list.into_iter().find(|i| i.id == id)
        } else {
            None
        }
    });

    rsx! {
        div {
            class: "detail-container", // Add style for this later or reuse gallery container
            style: "padding: 2rem; max-width: 1200px; margin: 0 auto;",
            match &*item.read_unchecked() {
                Some(Some(media)) => rsx! {
                    div {
                        h1 { "{media.title}" }
                        if media.media_type == MediaType::Video {
                            video {
                                controls: true,
                                style: "width: 100%; max-height: 80vh;",
                                src: "http://localhost:3000{media.url}",
                                "Your browser does not support the video tag."
                            }
                        } else {
                            img {
                                style: "width: 100%; max-height: 80vh; object-fit: contain;",
                                src: "http://localhost:3000{media.url}"
                            }
                        }
                        p { "{media.description.clone().unwrap_or_default()}" }
                    }
                },
                Some(None) => rsx! { "Item not found" },
                None => rsx! { "Loading..." }
            }
        }
    }
}
