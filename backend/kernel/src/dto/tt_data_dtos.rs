use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use tardis::serde_json::Value;
#[cfg(feature = "web")]
use tardis::web::poem_openapi;

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct TableDataFilterReq {
    pub items: Vec<TableDataFilterItemReq>,
    pub and: bool,
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct TableDataFilterItemReq {
    pub column_name: String,
    pub operator: TableDataOperatorKind,
    pub value: Option<Value>,
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct TableDataSortReq {
    pub column_name: String,
    pub order_desc: bool,
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct TableDataGroupReq {
    pub column_names: Vec<String>,
    pub group_order_desc: bool,
    pub hide_empty_record: bool,
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct TableDataSliceReq {
    pub offset_number: i32,
    pub fetch_number: i32,
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct TableDataResp {
    pub records: Vec<Value>,
    pub aggs: HashMap<String, Value>,
    pub total_number: i32,
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct TableDataGroupResp {
    pub records: Vec<Value>,
    pub aggs: HashMap<String, Value>,
    pub total_number: i32,
    pub group_value: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Enum))]
pub enum TableDataAggregateKind {
    #[cfg_attr(feature = "web", oai(rename = "SUM"))]
    Sum,
    #[cfg_attr(feature = "web", oai(rename = "COUNT"))]
    Count,
    #[cfg_attr(feature = "web", oai(rename = "MIN"))]
    Min,
    #[cfg_attr(feature = "web", oai(rename = "MAX"))]
    Max,
    #[cfg_attr(feature = "web", oai(rename = "AVG"))]
    Avg,
    #[cfg_attr(feature = "web", oai(rename = "MEDIAN"))]
    median,
    #[cfg_attr(feature = "web", oai(rename = "STDDEV"))]
    Stddev,
    #[cfg_attr(feature = "web", oai(rename = "DISTINCT"))]
    Distinct,
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Enum))]
pub enum TableDataOperatorKind {
    #[cfg_attr(feature = "web", oai(rename = "="))]
    Eq,
    #[cfg_attr(feature = "web", oai(rename = "!="))]
    Ne,
    #[cfg_attr(feature = "web", oai(rename = "<"))]
    Lt,
    #[cfg_attr(feature = "web", oai(rename = "<="))]
    Le,
    #[cfg_attr(feature = "web", oai(rename = ">"))]
    Gt,
    #[cfg_attr(feature = "web", oai(rename = ">="))]
    Ge,
    #[cfg_attr(feature = "web", oai(rename = "In"))]
    In,
    #[cfg_attr(feature = "web", oai(rename = "NOT IN"))]
    NotIn,
    #[cfg_attr(feature = "web", oai(rename = "CONTAINS"))]
    Contains,
    #[cfg_attr(feature = "web", oai(rename = "NCONTAINS"))]
    NotContains,
    #[cfg_attr(feature = "web", oai(rename = "STARTWITH"))]
    StartWith,
    #[cfg_attr(feature = "web", oai(rename = "NSTARTWITH"))]
    NotStartWith,
    #[cfg_attr(feature = "web", oai(rename = "ENDWITH"))]
    EndWith,
    #[cfg_attr(feature = "web", oai(rename = "NENDWITH"))]
    NotEndWith,
    #[cfg_attr(feature = "web", oai(rename = "ISEMPTY"))]
    IsEmpty,
    #[cfg_attr(feature = "web", oai(rename = "NOTEMPTY"))]
    NotEmpty,
}
