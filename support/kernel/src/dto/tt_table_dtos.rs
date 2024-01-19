use super::tt_layout_dtos::TableLayoutProps;
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;
use tardis::{
    chrono::{DateTime, Utc},
    db::sea_orm,
    serde_json::Value,
    TardisFuns,
};

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TableAddReq {
    pub pk_column_name: String,
    pub parent_pk_column_name: Option<String>,
    pub columns: Vec<TableColumnAddReq>,
    pub styles: Option<TableStyleProps>,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TableModifyReq {
    pub new_column: Option<TableColumnAddReq>,
    pub changed_column: Option<TableColumnModifyReq>,
    pub deleted_column_name: Option<String>,
    pub styles: Option<TableStyleProps>,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, sea_orm::FromQueryResult)]
#[serde(rename_all = "camelCase")]
pub struct TableSummaryResp {
    pub id: String,
    pub pk_column_name: String,
    pub parent_pk_column_name: Option<String>,

    pub owner: String,
    pub create_time: DateTime<Utc>,
    pub update_time: DateTime<Utc>,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, sea_orm::FromQueryResult)]
#[serde(rename_all = "camelCase")]
pub struct TableDetailResp {
    pub id: String,
    pub pk_column_name: String,
    pub parent_pk_column_name: Option<String>,
    pub columns: Value,
    pub layouts: Option<Value>,
    pub styles: Option<Value>,

    pub owner: String,
    pub create_time: DateTime<Utc>,
    pub update_time: DateTime<Utc>,
}

impl TableDetailResp {
    pub fn columns(&self) -> Vec<TableColumnProps> {
        TardisFuns::json.json_to_obj(self.columns.clone()).expect("ignore")
    }

    pub fn layouts(&self) -> Option<Vec<TableLayoutProps>> {
        if let Some(layouts) = &self.layouts {
            Some(TardisFuns::json.json_to_obj(layouts.clone()).expect("ignore"))
        } else {
            None
        }
    }

    pub fn styles(&self) -> Option<TableStyleProps> {
        if let Some(styles) = &self.styles {
            Some(TardisFuns::json.json_to_obj(styles.clone()).expect("ignore"))
        } else {
            None
        }
    }
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, sea_orm::FromQueryResult)]
#[serde(rename_all = "camelCase")]
pub struct TableColumnsResp {
    pub pk_column_name: String,
        pub columns: Value,
}

impl TableColumnsResp {
    pub fn columns(&self) -> Vec<TableColumnProps> {
        TardisFuns::json.json_to_obj(self.columns.clone()).expect("ignore")
    }
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TableColumnAddReq {
    pub name: String,
    pub icon: Option<String>,
    pub title: Option<String>,
    pub data_kind: Option<TableColumnDataKind>,
    pub data_editable: Option<bool>,
    pub use_dict: Option<bool>,
    pub dict_editable: Option<bool>,
    pub multi_value: Option<bool>,
    pub kind_date_time_format: Option<String>,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TableColumnModifyReq {
    pub name: String,
    pub icon: Option<String>,
    pub title: Option<String>,
    pub data_editable: Option<bool>,
    pub use_dict: Option<bool>,
    pub dict_editable: Option<bool>,
    pub kind_date_time_format: Option<String>,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TableColumnProps {
    pub name: String,
    pub icon: Option<String>,
    pub title: String,
    pub data_kind: TableColumnDataKind,
    pub data_editable: bool,
    pub use_dict: bool,
    pub dict_editable: bool,
    pub multi_value: bool,
    pub kind_date_time_format: Option<String>,
}

#[derive(Serialize, Deserialize, PartialEq, Eq, Debug)]
pub enum TableColumnDataKind {
    #[serde(rename = "TEXT")]
    Text,
    #[serde(rename = "TEXTAREA")]
    Textarea,
    #[serde(rename = "SERIAL")]
    Serial,
    #[serde(rename = "NUMBER")]
    Number,
    #[serde(rename = "BOOLEAN")]
    Boolean,
    #[serde(rename = "FILE")]
    File,
    #[serde(rename = "IMAGE")]
    Image,
    #[serde(rename = "AMOUNT")]
    Amount,
    #[serde(rename = "SELECT")]
    Select,
    #[serde(rename = "MULTISELECT")]
    MultiSelect,
    #[serde(rename = "CHECKBOX")]
    Checkbox,
    #[serde(rename = "DATE")]
    Date,
    #[serde(rename = "DATETIME")]
    Datetime,
    #[serde(rename = "TIME")]
    Time,
    #[serde(rename = "EMAIL")]
    Email,
    #[serde(rename = "URL")]
    Url,
    #[serde(rename = "PHONE")]
    Phone,
    #[serde(rename = "PASSWORD")]
    Password,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TableStyleAddOrModifyReq {
    pub size: Option<String>,
    pub theme: Option<String>,
    pub table_class: Option<String>,
    pub header_class: Option<String>,
    pub row_class: Option<String>,
    pub cell_class: Option<String>,
    pub agg_class: Option<String>,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TableStyleProps {
    pub size: Option<String>,
    pub theme: Option<String>,
    pub table_class: Option<String>,
    pub header_class: Option<String>,
    pub row_class: Option<String>,
    pub cell_class: Option<String>,
    pub agg_class: Option<String>,
}
