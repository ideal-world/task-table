use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use tardis::serde_json::Value;

use super::tt_data_dtos::{TableDataFilterReq, TableDataGroupReq, TableDataSortReq};

#[derive(Serialize, Deserialize, Debug)]
pub struct TableLayoutProps {
    id: String,
    title: String,
    layout_kind: String,
    icon: Option<String>,
    columns: Vec<TableLayoutColumnProps>,
    filters: Option<Vec<TableDataFilterReq>>,
    sorts: Option<Vec<TableDataSortReq>>,
    group: Option<TableDataGroupReq>,
    aggs: Option<HashMap<String, String>>,
    expand_data_pks: Option<Vec<Value>>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TableLayoutColumnProps {
    name: String,
    wrap: Option<bool>,
    fixed: Option<bool>,
    width: Option<f64>,
    hide: Option<bool>,
    date_start: Option<bool>,
    date_end: Option<bool>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TableLayoutModifyReq {
    id: Option<String>,
    title: Option<String>,
    icon: Option<String>,
    filters: Option<Vec<TableDataFilterReq>>,
    sorts: Option<Vec<TableDataSortReq>>,
    group: Option<TableDataGroupReq>,
    aggs: Option<HashMap<String, String>>,
    new_expand_data_pk: Option<Value>,
    delete_expand_data_pk: Option<Value>,
    fetch_data_number: Option<i32>,
    column_sorted_names: Option<(String, String)>,
    new_column: Option<TableLayoutColumnProps>,
    changed_column: Option<TableLayoutColumnProps>,
    deleted_column_name: Option<String>,
}
