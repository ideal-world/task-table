use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ShareAddReq {
    pub table_id: String,
    pub owner: String,
    pub full_control: bool,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ShareDeleteReq {
    pub table_id: String,
    pub owner: String,
}
