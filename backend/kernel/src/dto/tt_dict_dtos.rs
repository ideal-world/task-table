use serde::{Deserialize, Serialize};
use tardis::{db::sea_orm, serde_json::Value};
#[cfg(feature = "web")]
use tardis::web::poem_openapi;

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct TableDictAddOrModifyReq {
    pub title: String,
    pub value: Value,
    pub color: Option<String>,
    pub avatar: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, sea_orm::FromQueryResult)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct TableDictInfo {
    pub title: String,
    pub value: Value,
    pub color: Option<String>,
    pub avatar: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct TableDictItemResp {
    pub records: Vec<TableDictInfo>,
    pub total_number: i32,
}
