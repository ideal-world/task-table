use serde::{Serialize, Deserialize};

use super::tt_layout_dtos::TableLayoutProps;

#[derive(Serialize, Deserialize, Debug)]
pub struct TableProps {
    parent_pk_column_name: Option<String>,
    columns: Vec<TableColumnProps>,
    layouts: Option<Vec<TableLayoutProps>>,
    styles: Option<TableStyleProps>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TableColumnProps {
    name: String,
    icon: Option<String>,
    title: Option<String>,
    data_kind: Option<String>,
    data_editable: Option<bool>,
    use_dict: Option<bool>,
    dict_editable: Option<bool>,
    multi_value: Option<bool>,
    kind_date_time_format: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TableStyleProps {
    size: Option<String>,
    theme: Option<String>,
    table_class: Option<String>,
    header_class: Option<String>,
    row_class: Option<String>,
    cell_class: Option<String>,
    agg_class: Option<String>,
}
