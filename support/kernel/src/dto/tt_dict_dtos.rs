use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;
use tardis::{db::sea_orm, serde_json::Value};

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TableDictAddReq {
    pub title: String,
    pub value: Value,
    pub color: Option<String>,
    pub avatar: Option<String>,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TableDictModifyReq {
    pub title: Option<String>,
    pub color: Option<String>,
    pub avatar: Option<String>,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, sea_orm::FromQueryResult)]
#[serde(rename_all = "camelCase")]
pub struct TableDictInfo {
    pub dict_code: String,
    pub title: String,
    pub value: Value,
    pub color: String,
    pub avatar: String,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TableDictItemResp {
    pub records: Vec<TableDictInfo>,
    pub total_number: i32,
}
