use super::tt_layout_dtos::TableLayoutProps;
use serde::{Deserialize, Serialize};
#[cfg(feature = "web")]
use tardis::web::poem_openapi;
use tardis::{
    chrono::{DateTime, Utc},
    db::sea_orm,
    serde_json::Value,
    TardisFuns,
};

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct TableAddReq {
    pub pk_column_name: String,
    pub parent_pk_column_name: Option<String>,
    pub columns: Vec<TableColumnProps>,
    pub styles: Option<TableStyleProps>,
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct TableModifyReq {
    pub pk_column_name: Option<String>,
    pub parent_pk_column_name: Option<String>,
    pub new_column: Option<TableColumnAddReq>,
    pub changed_column: Option<TableColumnModifyReq>,
    pub deleted_column_name: Option<String>,
    pub styles: Option<TableStyleProps>,
}

#[derive(Serialize, Deserialize, Debug, sea_orm::FromQueryResult)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct TableSummaryResp {
    pub id: String,
    pub pk_column_name: String,
    pub parent_pk_column_name: Option<String>,

    pub owner: String,
    pub create_time: DateTime<Utc>,
    pub update_time: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug, sea_orm::FromQueryResult)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
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

#[derive(Serialize, Deserialize, Debug, sea_orm::FromQueryResult)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct TableColumnsResp {
    pub pk_column_name: String,
    pub columns: Value,
}

impl TableColumnsResp {
    pub fn columns(&self) -> Vec<TableColumnProps> {
        TardisFuns::json.json_to_obj(self.columns.clone()).expect("ignore")
    }
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
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

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct TableColumnModifyReq {
    pub name: String,
    pub icon: Option<String>,
    pub title: Option<String>,
    pub data_editable: Option<bool>,
    pub use_dict: Option<bool>,
    pub dict_editable: Option<bool>,
    pub kind_date_time_format: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct TableColumnProps {
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

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Enum))]
pub enum TableColumnDataKind {
    #[cfg_attr(feature = "web", oai(rename = "TEXT"))]
    Text,
    #[cfg_attr(feature = "web", oai(rename = "TEXTAREA"))]
    Textarea,
    #[cfg_attr(feature = "web", oai(rename = "NUMBER"))]
    Number,
    #[cfg_attr(feature = "web", oai(rename = "BOOLEAN"))]
    Boolean,
    #[cfg_attr(feature = "web", oai(rename = "FILE"))]
    File,
    #[cfg_attr(feature = "web", oai(rename = "IMAGE"))]
    Image,
    #[cfg_attr(feature = "web", oai(rename = "AMOUNT"))]
    Amount,
    #[cfg_attr(feature = "web", oai(rename = "SELECT"))]
    Select,
    #[cfg_attr(feature = "web", oai(rename = "MULTISELECT"))]
    MultiSelect,
    #[cfg_attr(feature = "web", oai(rename = "CHECKBOX"))]
    Checkbox,
    #[cfg_attr(feature = "web", oai(rename = "DATE"))]
    Date,
    #[cfg_attr(feature = "web", oai(rename = "DATETIME"))]
    Datetime,
    #[cfg_attr(feature = "web", oai(rename = "TIME"))]
    Time,
    #[cfg_attr(feature = "web", oai(rename = "EMAIL"))]
    Email,
    #[cfg_attr(feature = "web", oai(rename = "URL"))]
    Url,
    #[cfg_attr(feature = "web", oai(rename = "PHONE"))]
    Phone,
    #[cfg_attr(feature = "web", oai(rename = "PASSWORD"))]
    Password,
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct TableStyleAddOrModifyReq {
    pub size: Option<String>,
    pub theme: Option<String>,
    pub table_class: Option<String>,
    pub header_class: Option<String>,
    pub row_class: Option<String>,
    pub cell_class: Option<String>,
    pub agg_class: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "web", derive(poem_openapi::Object), oai(rename_all = "SCREAMING_SNAKE_CASE"))]
pub struct TableStyleProps {
    pub size: Option<String>,
    pub theme: Option<String>,
    pub table_class: Option<String>,
    pub header_class: Option<String>,
    pub row_class: Option<String>,
    pub cell_class: Option<String>,
    pub agg_class: Option<String>,
}
