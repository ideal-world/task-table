use serde::{Deserialize, Serialize};
use tardis::{db::sea_orm, serde_json::Value};

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TableDictAddOrModifyReq {
    pub title: String,
    pub value: Value,
    pub color: Option<String>,
    pub avatar: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, sea_orm::FromQueryResult)]
#[serde(rename_all = "camelCase")]
pub struct TableDictInfo {
    pub title: String,
    pub value: Value,
    pub color: Option<String>,
    pub avatar: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TableDictItemResp {
    pub records: Vec<TableDictInfo>,
    pub total_number: i32,
}
