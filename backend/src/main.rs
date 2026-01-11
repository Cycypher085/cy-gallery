use axum::{
    extract::DefaultBodyLimit,
    response::Html,
    routing::get,
    Router,
};
use std::net::SocketAddr;
use tower_http::{
    cors::CorsLayer,
    services::ServeDir,
    trace::TraceLayer,
    limit::RequestBodyLimitLayer,
    compression::CompressionLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod db;
mod handlers;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "backend=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Ensure uploads directory exists
    tokio::fs::create_dir_all("uploads").await?;

    let database_url = std::env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite:gallery.db?mode=rwc".to_string());
    let pool = db::init_db(&database_url).await?;

    let app = Router::new()
        .route("/", get(handler))
        .route("/api/media", get(handlers::list_media).post(handlers::upload_media))
        .nest_service("/static", ServeDir::new("uploads"))
        .layer(DefaultBodyLimit::disable())
        .layer(RequestBodyLimitLayer::new(100 * 1024 * 1024)) // 100MB limit
        .layer(CompressionLayer::new())
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
        .with_state(pool);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    tracing::debug!("listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn handler() -> Html<&'static str> {
    Html("<h1>Backend is running</h1>")
}
