use serde::{Deserialize, Serialize};
use tardis::serde_json::Value;

#[derive(Serialize, Deserialize, Debug)]
pub struct TableDataFilterReq {
    pub items: Vec<TableDataFilterItemReq>,
    pub and: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TableDataFilterItemReq {
    pub column_name: String,
    pub operator: String,
    pub value: Option<Value>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TableDataSortReq {
    pub column_name: String,
    pub order_desc: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TableDataGroupReq {
    pub column_names: Vec<String>,
    pub group_order_desc: bool,
    pub hide_empty_record: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TableDataSliceReq {
    pub offset_number: i32,
    pub fetch_number: i32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TableDataResp {
    pub records: Vec<Value>,
    pub aggs: Value,
    pub total_number: i32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TableDataGroupResp {
    pub records: Vec<Value>,
    pub aggs: Value,
    pub total_number: i32,
    pub group_value: String,
}
