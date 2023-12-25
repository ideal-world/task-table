use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use tardis::serde_json::Value;
#[cfg(feature = "web")]
use tardis::web::poem_openapi;
use super::tt_data_dtos::{TableDataFilterReq, TableDataGroupReq, TableDataSortReq};

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct TableLayoutAddReq {
    pub title: String,
    pub layout_kind: String,
    pub icon: Option<String>,
    pub columns: Vec<TableLayoutColumnProps>,
    pub filters: Option<Vec<TableDataFilterReq>>,
    pub sorts: Option<Vec<TableDataSortReq>>,
    pub group: Option<TableDataGroupReq>,
    pub aggs: Option<HashMap<String, String>>,
    pub expand_data_pks: Option<Vec<Value>>,
    pub fetch_data_number: Option<i32>,
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct TableLayoutModifyReq {
    pub title: Option<String>,
    pub icon: Option<String>,
    pub filters: Option<Vec<TableDataFilterReq>>,
    pub sorts: Option<Vec<TableDataSortReq>>,
    pub aggs: Option<HashMap<String, String>>,
    pub fetch_data_number: Option<i32>,
    pub expand_data_pks: Option<Vec<Value>>,
    pub new_group: Option<TableDataGroupReq>,
    pub delete_group: Option<bool>,
    pub column_sorted_names: Option<Vec<String>>,
    pub new_column: Option<TableLayoutColumnProps>,
    pub changed_column: Option<TableLayoutColumnProps>,
    pub deleted_column_name: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct TableLayoutProps {
    pub id: String,
    pub title: String,
    pub layout_kind: String,
    pub icon: Option<String>,
    pub columns: Vec<TableLayoutColumnProps>,
    pub filters: Option<Vec<TableDataFilterReq>>,
    pub sorts: Option<Vec<TableDataSortReq>>,
    pub group: Option<TableDataGroupReq>,
    pub aggs: Option<HashMap<String, String>>,
    pub expand_data_pks: Option<Vec<Value>>,
    pub fetch_data_number: Option<i32>,
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct TableLayoutColumnProps {
    pub name: String,
    pub wrap: Option<bool>,
    pub fixed: Option<bool>,
    pub width: Option<f64>,
    pub hide: Option<bool>,
    pub date_start: Option<bool>,
    pub date_end: Option<bool>,
}
