use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;
use tardis::serde_json::Value;

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TableDataFilterReq {
    pub items: Vec<TableDataFilterItemReq>,
    pub and: bool,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TableDataFilterItemReq {
    pub column_name: String,
    pub operator: TableDataOperatorKind,
    pub value: Option<Value>,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TableDataSortReq {
    pub column_name: String,
    pub order_desc: bool,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TableDataGroupReq {
    pub column_names: Vec<String>,
    pub group_order_desc: bool,
    pub hide_empty_record: bool,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TableDataSliceReq {
    pub offset_number: i32,
    pub fetch_number: i32,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TableDataResp {
    pub records: Vec<HashMap<String, Value>>,
    pub aggs: HashMap<String, Value>,
    pub total_number: i32,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TableDataGroupResp {
    pub records: Vec<HashMap<String, Value>>,
    pub aggs: HashMap<String, Value>,
    pub total_number: i32,
    pub group_value: String,
}

#[derive(Serialize, Deserialize, PartialEq, Eq, Debug)]
pub enum TableDataAggregateKind {
    #[serde(rename = "SUM")]
    Sum,
    #[serde(rename = "COUNT")]
    Count,
    #[serde(rename = "MIN")]
    Min,
    #[serde(rename = "MAX")]
    Max,
    #[serde(rename = "AVG")]
    Avg,
    #[serde(rename = "STDDEV")]
    Stddev,
    #[serde(rename = "DISTINCT")]
    Distinct,
}

#[derive(Serialize, Deserialize, PartialEq, Eq, Debug)]
pub enum TableDataOperatorKind {
    #[serde(rename = "=")]
    Eq,
    #[serde(rename = "!=")]
    Ne,
    #[serde(rename = "<")]
    Lt,
    #[serde(rename = "<=")]
    Le,
    #[serde(rename = ">")]
    Gt,
    #[serde(rename = ">=")]
    Ge,
    #[serde(rename = "In")]
    In,
    #[serde(rename = "NOT IN")]
    NotIn,
    #[serde(rename = "CONTAINS")]
    Contains,
    #[serde(rename = "NCONTAINS")]
    NotContains,
    #[serde(rename = "STARTWITH")]
    StartWith,
    #[serde(rename = "NSTARTWITH")]
    NotStartWith,
    #[serde(rename = "ENDWITH")]
    EndWith,
    #[serde(rename = "NENDWITH")]
    NotEndWith,
    #[serde(rename = "ISEMPTY")]
    IsEmpty,
    #[serde(rename = "NOTEMPTY")]
    NotEmpty,
}

impl TableDataOperatorKind {
    pub fn to_sql(&self, column_name: &str, placeholders: Vec<String>) -> String {
        match self {
            TableDataOperatorKind::Eq => format!("{} = {}", column_name, placeholders[0]),
            TableDataOperatorKind::Ne => format!("{} != {}", column_name, placeholders[0]),
            TableDataOperatorKind::Lt => format!("{} < {}", column_name, placeholders[0]),
            TableDataOperatorKind::Le => format!("{} <= {}", column_name, placeholders[0]),
            TableDataOperatorKind::Gt => format!("{} > {}", column_name, placeholders[0]),
            TableDataOperatorKind::Ge => format!("{} >= {}", column_name, placeholders[0]),
            TableDataOperatorKind::In => format!("{} IN ({})", column_name, placeholders.join(",")),
            TableDataOperatorKind::NotIn => format!("{} NOT IN ({})", column_name, placeholders.join(",")),
            TableDataOperatorKind::Contains => format!("{} LIKE {}", column_name, placeholders[0]),
            TableDataOperatorKind::NotContains => format!("{} NOT LIKE {}", column_name, placeholders[0]),
            TableDataOperatorKind::StartWith => format!("{} LIKE {}", column_name, placeholders[0]),
            TableDataOperatorKind::NotStartWith => format!("{} NOT LIKE {}", column_name, placeholders[0]),
            TableDataOperatorKind::EndWith => format!("{} LIKE {}", column_name, placeholders[0]),
            TableDataOperatorKind::NotEndWith => format!("{} NOT LIKE {}", column_name, placeholders[0]),
            TableDataOperatorKind::IsEmpty => format!("{} = ''", column_name),
            TableDataOperatorKind::NotEmpty => format!("{} != ''", column_name),
        }
    }
}
