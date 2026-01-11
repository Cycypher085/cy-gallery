use dioxus::prelude::*;
use crate::Route;

pub fn Navbar() -> Element {
    rsx! {
        nav {
            class: "navbar",
            div { class: "logo", "CyGallery" }
            div { class: "links",
                Link { to: Route::Gallery {}, "Home" }
                Link { to: Route::Upload {}, "Upload" }
            }
        }
        Outlet::<Route> {}
    }
}
