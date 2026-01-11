#![allow(non_snake_case)]

use dioxus::prelude::*;
use tracing::Level;

mod pages;
mod components;

use pages::{Gallery, Upload, Detail};
use components::Navbar;

#[derive(Clone, Routable, Debug, PartialEq)]
enum Route {
    #[layout(Navbar)]
    #[route("/")]
    Gallery,
    #[route("/upload")]
    Upload,
    #[route("/media/:id")]
    Detail { id: i64 },
}

fn main() {
    // Init logger
    dioxus_logger::init(Level::INFO).expect("failed to init logger");
    console_error_panic_hook::set_once();
    
    launch(App);
}

fn App() -> Element {
    rsx! {
        // Link to CSS
        link { rel: "stylesheet", href: "assets/style.css" }
        Router::<Route> {}
    }
}
