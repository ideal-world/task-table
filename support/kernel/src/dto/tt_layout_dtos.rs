use std::collections::HashMap;

use super::tt_data_dtos::{TableDataFilterReq, TableDataGroupReq, TableDataSortReq};
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;
use tardis::serde_json::Value;

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
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

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
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

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
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

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TableLayoutColumnProps {
    pub name: String,
    pub wrap: Option<bool>,
    pub fixed: Option<bool>,
    pub width: Option<u32>,
    pub hide: Option<bool>,
    pub date_start: Option<bool>,
    pub date_end: Option<bool>,
}
