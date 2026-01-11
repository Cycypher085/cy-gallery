use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum MediaType {
    Image,
    Video,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaItem {
    pub id: i64,
    pub title: String,
    pub description: Option<String>,
    pub media_type: MediaType,
    pub url: String,
    pub thumbnail_url: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateMediaRequest {
    pub title: String,
    pub description: Option<String>,
    pub media_type: MediaType,
}
