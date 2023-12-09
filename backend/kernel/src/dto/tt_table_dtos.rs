use serde::{Deserialize, Serialize};
use tardis::{
    chrono::{DateTime, Utc},
    db::sea_orm,
    serde_json::Value,
    TardisFuns,
};

use super::tt_layout_dtos::TableLayoutProps;

#[derive(Serialize, Deserialize, Debug)]
pub struct TableAddReq {
    pub pk_column_name: String,
    pub parent_pk_column_name: Option<String>,
    pub columns: Vec<TableColumnProps>,
    pub styles: Option<TableStyleProps>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TableModifyReq {
    pub pk_column_name: Option<String>,
    pub parent_pk_column_name: Option<String>,
    pub new_column: Option<TableColumnProps>,
    pub changed_column: Option<TableColumnProps>,
    pub deleted_column_name: Option<String>,
    pub styles: Option<TableStyleProps>,
}

#[derive(Serialize, Deserialize, Debug, sea_orm::FromQueryResult)]
pub struct TableSummaryResp {
    pub id: String,
    pub pk_column_name: String,
    pub parent_pk_column_name: Option<String>,

    pub owner: String,
    pub create_time: DateTime<Utc>,
    pub update_time: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug, sea_orm::FromQueryResult)]
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

#[derive(Serialize, Deserialize, Debug)]
pub struct TableColumnAddReq {
    pub name: String,
    pub icon: Option<String>,
    pub title: Option<String>,
    pub data_kind: Option<String>,
    pub data_editable: Option<bool>,
    pub use_dict: Option<bool>,
    pub dict_editable: Option<bool>,
    pub multi_value: Option<bool>,
    pub kind_date_time_format: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TableColumnModifyReq {
    pub icon: Option<String>,
    pub title: Option<String>,
    pub data_kind: Option<String>,
    pub data_editable: Option<bool>,
    pub use_dict: Option<bool>,
    pub dict_editable: Option<bool>,
    pub multi_value: Option<bool>,
    pub kind_date_time_format: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TableColumnProps {
    pub name: String,
    pub icon: Option<String>,
    pub title: Option<String>,
    pub data_kind: Option<String>,
    pub data_editable: Option<bool>,
    pub use_dict: Option<bool>,
    pub dict_editable: Option<bool>,
    pub multi_value: Option<bool>,
    pub kind_date_time_format: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
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
pub struct TableStyleProps {
    pub size: Option<String>,
    pub theme: Option<String>,
    pub table_class: Option<String>,
    pub header_class: Option<String>,
    pub row_class: Option<String>,
    pub cell_class: Option<String>,
    pub agg_class: Option<String>,
}
