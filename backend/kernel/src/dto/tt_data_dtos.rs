use serde::{Serialize, Deserialize};
use tardis::serde_json::Value;

#[derive(Serialize, Deserialize, Debug)]
pub struct TableDataFilterReq {
    items: Vec<TableDataFilterItemReq>,
    and: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TableDataFilterItemReq {
    column_name: String,
    operator: String,
    value: Option<Value>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TableDataSortReq {
    column_name: String,
    order_desc: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TableDataGroupReq {
    column_names: Vec<String>,
    group_order_desc: bool,
    hide_empty_record: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TableDataSliceReq {
    offset_number: i32,
    fetch_number: i32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TableDataResp {
    records: Vec<Value>,
    aggs: Value,
    total_number: i32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TableDataGroupResp {
    records: Vec<Value>,
    aggs: Value,
    total_number: i32,
    group_value: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TableCellDictItem {
    title: String,
    value: Value,
    color: Option<String>,
    avatar: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TableCellDictItemResp {
    records: Vec<TableCellDictItem>,
    total_number: i32,
}
