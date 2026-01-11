use axum::{
    extract::{Multipart, State},
    http::StatusCode,
    Json,
};
use shared::{MediaItem, MediaType};
use tokio::{fs::File, io::AsyncWriteExt};
use uuid::Uuid;
use std::path::Path;
use chrono::Utc;

use crate::db::DbPool;

pub async fn list_media(
    State(pool): State<DbPool>,
) -> Result<Json<Vec<MediaItem>>, (StatusCode, String)> {
    let recs = sqlx::query!(
        r#"
        SELECT id, title, description, media_type, url, thumbnail_url, created_at
        FROM media
        ORDER BY created_at DESC
        "#
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let items = recs
        .into_iter()
        .map(|r| MediaItem {
            id: r.id,
            title: r.title,
            description: r.description,
            media_type: serde_json::from_str(&r.media_type).unwrap_or(MediaType::Image),
            url: r.url,
            thumbnail_url: r.thumbnail_url,
            // SQLite DATETIME maps to NaiveDateTime in sqlx (unless timezone info is present in string, but usually naive)
            created_at: r.created_at.and_utc(),
        })
        .collect();

    Ok(Json(items))
}

pub async fn upload_media(
    State(pool): State<DbPool>,
    mut multipart: Multipart,
) -> Result<Json<MediaItem>, (StatusCode, String)> {
    let mut title = None;
    let mut description = None;
    let mut file_url = None;
    let mut media_type = MediaType::Image;

    while let Some(field) = multipart.next_field().await.map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))? {
        let name = field.name().unwrap_or("").to_string();

        if name == "title" {
            title = Some(field.text().await.unwrap_or_default());
        } else if name == "description" {
            description = Some(field.text().await.unwrap_or_default());
        } else if name == "file" {
            let filename = field.file_name().unwrap_or("unknown").to_string();
            let content_type = field.content_type().unwrap_or("application/octet-stream").to_string();
            
            // Basic type detection
            if content_type.starts_with("video/") {
                media_type = MediaType::Video;
            } else {
                media_type = MediaType::Image;
            }

            let data = field.bytes().await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
            
            let ext = Path::new(&filename).extension().and_then(|s| s.to_str()).unwrap_or("bin");
            let new_filename = format!("{}.{}", Uuid::new_v4(), ext);
            let filepath = format!("uploads/{}", new_filename);

            let mut file = File::create(&filepath).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
            file.write_all(&data).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

            file_url = Some(format!("/static/{}", new_filename));
        }
    }

    let title = title.ok_or((StatusCode::BAD_REQUEST, "Missing title".to_string()))?;
    let url = file_url.ok_or((StatusCode::BAD_REQUEST, "Missing file".to_string()))?;
    let media_type_str = serde_json::to_string(&media_type).unwrap();

    let id = sqlx::query!(
        r#"
        INSERT INTO media (title, description, media_type, url, created_at)
        VALUES (?1, ?2, ?3, ?4, datetime('now'))
        RETURNING id
        "#,
        title,
        description,
        media_type_str,
        url
    )
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .id;

    // Retrieve the full item to return
    // Simple construction for now since we just inserted it
    let item = MediaItem {
        id,
        title,
        description,
        media_type,
        url,
        thumbnail_url: None, // TODO
        created_at: Utc::now(), // Approximation
    };

    Ok(Json(item))
}
