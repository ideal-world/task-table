use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ShareAddReq {
    pub table_id: String,
    pub owner: String,
    pub full_control: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ShareDeleteReq {
    pub table_id: String,
    pub owner: String,
}
