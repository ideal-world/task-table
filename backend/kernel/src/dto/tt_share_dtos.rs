use serde::{Deserialize, Serialize};
#[cfg(feature = "web")]
use tardis::web::poem_openapi;

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct ShareAddReq {
    pub table_id: String,
    pub owner: String,
    pub full_control: bool,
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct ShareDeleteReq {
    pub table_id: String,
    pub owner: String,
}
