use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;
use tardis::serde_json::Value;

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TableDataFilterProps {
    pub items: Vec<TableDataFilterItemProps>,
    pub and: bool,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TableDataFilterItemProps {
    pub column_name: String,
    pub operator: TableDataOperatorKind,
    pub value: Option<Value>,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TableDataSortProps {
    pub column_name: String,
    pub order_desc: bool,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TableDataGroupProps {
    pub column_names: Vec<String>,
    pub group_order_desc: bool,
    pub hide_empty_record: bool,
    pub slices: HashMap<String, TableDataSliceProps>,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TableDataSliceProps {
    pub offset_number: i32,
    pub fetch_number: i32,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TableDataResp {
    pub records: Vec<HashMap<String, Value>>,
    pub aggs: HashMap<String, Value>,
    pub total_number: i32,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TableDataGroupResp {
    pub records: Vec<HashMap<String, Value>>,
    pub aggs: HashMap<String, Value>,
    pub total_number: i32,
    pub group_value: String,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
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

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
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
    #[serde(rename = "IN")]
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
    pub fn to_sql(&self, column_name: &str, multi_value: bool, placeholders: Vec<String>) -> Option<String> {
        if multi_value {
            match self {
                TableDataOperatorKind::Eq if !placeholders.is_empty() => Some(format!("{} = ARRAY[{}]", column_name, placeholders.join(","))),
                TableDataOperatorKind::Eq if placeholders.is_empty() => None,
                TableDataOperatorKind::Ne if !placeholders.is_empty() => Some(format!("{} != ARRAY[{}]", column_name, placeholders.join(","))),
                TableDataOperatorKind::Ne if placeholders.is_empty() => None,
                TableDataOperatorKind::In if !placeholders.is_empty() => Some(format!("{} @> ARRAY[{}]", column_name, placeholders.join(","))),
                TableDataOperatorKind::In if placeholders.is_empty() => None,
                TableDataOperatorKind::NotIn if !placeholders.is_empty() => Some(format!("NOT {} @> ARRAY[{}]", column_name, placeholders.join(","))),
                TableDataOperatorKind::NotIn if placeholders.is_empty() => None,
                TableDataOperatorKind::IsEmpty => Some(format!("array_length({}, 1) IS NULL", column_name)),
                TableDataOperatorKind::NotEmpty => Some(format!("array_length({}, 1) IS NOT NULL", column_name)),
                _ => None,
            }
        } else {
            match self {
                TableDataOperatorKind::Eq => Some(format!("{} = {}", column_name, placeholders[0])),
                TableDataOperatorKind::Ne => Some(format!("{} != {}", column_name, placeholders[0])),
                TableDataOperatorKind::Lt => Some(format!("{} < {}", column_name, placeholders[0])),
                TableDataOperatorKind::Le => Some(format!("{} <= {}", column_name, placeholders[0])),
                TableDataOperatorKind::Gt => Some(format!("{} > {}", column_name, placeholders[0])),
                TableDataOperatorKind::Ge => Some(format!("{} >= {}", column_name, placeholders[0])),
                TableDataOperatorKind::In => Some(format!("{} IN ({})", column_name, placeholders.join(","))),
                TableDataOperatorKind::NotIn => Some(format!("{} NOT IN ({})", column_name, placeholders.join(","))),
                TableDataOperatorKind::Contains => Some(format!("{} LIKE {}", column_name, placeholders[0])),
                TableDataOperatorKind::NotContains => Some(format!("{} NOT LIKE {}", column_name, placeholders[0])),
                TableDataOperatorKind::StartWith => Some(format!("{} LIKE {}", column_name, placeholders[0])),
                TableDataOperatorKind::NotStartWith => Some(format!("{} NOT LIKE {}", column_name, placeholders[0])),
                TableDataOperatorKind::EndWith => Some(format!("{} LIKE {}", column_name, placeholders[0])),
                TableDataOperatorKind::NotEndWith => Some(format!("{} NOT LIKE {}", column_name, placeholders[0])),
                TableDataOperatorKind::IsEmpty => Some(format!("{} = ''", column_name)),
                TableDataOperatorKind::NotEmpty => Some(format!("{} != ''", column_name)),
            }
        }
    }
}
