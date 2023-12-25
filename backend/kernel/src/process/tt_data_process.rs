use std::collections::HashMap;

use tardis::serde_json::Value;
use tardis::{
    basic::{dto::TardisContext, result::TardisResult},
    TardisFunsInst,
};

use crate::dto::tt_data_dtos::{TableDataAggregateKind, TableDataFilterReq, TableDataGroupReq, TableDataGroupResp, TableDataResp, TableDataSliceReq, TableDataSortReq};
use crate::process::tt_table_process;

pub async fn add_or_modify_data(table_id: &str, changed_records: Vec<HashMap<String, Value>>, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<HashMap<String, Value>> {
    let table_columns = tt_table_process::get_table_columns(table_id, funs, ctx).await?;

    todo!()
}

pub async fn delete_data(table_id: &str, deleted_pks: Vec<Value>, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<()> {
    let table_columns = tt_table_process::get_table_columns(table_id, funs, ctx).await?;
    todo!()
}

pub async fn load_data_with_group(
    table_id: &str,
    filters: Option<Vec<TableDataFilterReq>>,
    sorts: Option<Vec<TableDataSortReq>>,
    group: Option<TableDataGroupReq>,
    aggs: Option<HashMap<String, TableDataAggregateKind>>,
    slice: Option<TableDataSliceReq>,
    funs: &TardisFunsInst,
    ctx: &TardisContext,
) -> TardisResult<TableDataResp> {
    todo!()
}

pub async fn load_data_without_group(
    table_id: &str,
    filters: Option<Vec<TableDataFilterReq>>,
    sorts: Option<Vec<TableDataSortReq>>,
    aggs: Option<HashMap<String, TableDataAggregateKind>>,
    slice: Option<TableDataSliceReq>,
    funs: &TardisFunsInst,
    ctx: &TardisContext,
) -> TardisResult<Vec<TableDataGroupResp>> {
    todo!()
}
