use tardis::db::sea_orm::sea_query::{Expr, Query};
use tardis::db::sea_orm::*;
use tardis::{
    basic::{dto::TardisContext, result::TardisResult},
    db::sea_orm::Set,
    TardisFuns, TardisFunsInst,
};

use crate::dto::tt_basic_dtos::RbumBasicFilterReq;
use crate::dto::tt_table_dtos::{TableDetailResp, TableModifyReq, TableSummaryResp};
use crate::{domain::tt_table, dto::tt_table_dtos::TableAddReq};

use super::tt_basic_process::{self, CREATE_TIME_FIELD, ID_FIELD, UPDATE_TIME_FIELD};
use super::tt_share_process;

pub async fn add_table(add_req: TableAddReq, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<String> {
    let table_id: String = TardisFuns::field.nanoid();
    let table_domain = tt_table::ActiveModel {
        id: Set(table_id.clone()),
        pk_column_name: Set(add_req.pk_column_name),
        parent_pk_column_name: Set(add_req.parent_pk_column_name),
        columns: Set(TardisFuns::json.obj_to_json(&add_req.columns).expect("ignore")),
        styles: Set(if add_req.styles.is_some() {
            Some(TardisFuns::json.obj_to_json(&add_req.styles).expect("ignore"))
        } else {
            None
        }),
        ..Default::default()
    };
    funs.db().insert_one(table_domain, ctx).await?;
    Ok(table_id)
}

pub async fn modify_table(table_id: &str, modify_req: TableModifyReq, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<()> {
    tt_share_process::check_share_full_control(table_id, funs, ctx).await?;
    let mut table_domain = tt_table::ActiveModel {
        id: Set(table_id.to_string()),
        ..Default::default()
    };
    if let Some(pk_column_name) = &modify_req.pk_column_name {
        table_domain.pk_column_name = Set(pk_column_name.to_string());
    }
    if let Some(parent_pk_column_name) = &modify_req.parent_pk_column_name {
        table_domain.parent_pk_column_name = Set(Some(parent_pk_column_name.to_string()));
    }
    if let Some(styles) = &modify_req.styles {
        table_domain.styles = Set(Some(TardisFuns::json.obj_to_json(styles).expect("ignore")));
    }
    // column
    if modify_req.new_column.is_some() || modify_req.deleted_column_name.is_some() || modify_req.changed_column.is_some() {
        let mut storage_columns = get_table(table_id, funs, ctx).await?.columns();

        if let Some(new_column) = modify_req.new_column {
            storage_columns.push(new_column);
        }
        if let Some(deleted_column_name) = modify_req.deleted_column_name {
            if let Some(idx) = storage_columns.iter().position(|column| column.name == deleted_column_name) {
                storage_columns.remove(idx);
            }
        }
        if let Some(changed_column) = modify_req.changed_column {
            if let Some(idx) = storage_columns.iter().position(|column| column.name == changed_column.name) {
                storage_columns.insert(idx, changed_column);
                storage_columns.remove(idx);
            }
        }
        table_domain.columns = Set(TardisFuns::json.obj_to_json(&storage_columns).expect("ignore"));
    }

    funs.db().update_one(table_domain, ctx).await?;
    Ok(())
}

pub async fn delete_table(table_id: &str, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<()> {
    tt_basic_process::check_owner(table_id, &get_table_name(), funs, ctx).await?;
    funs.db().execute(Query::delete().from_table(tt_table::Entity).and_where(Expr::col(tt_table::Column::Id).eq(table_id))).await?;
    // TODO process delete records
    Ok(())
}

pub async fn get_table(table_id: &str, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<TableDetailResp> {
    tt_share_process::check_share(table_id, funs, ctx).await?;
    let mut query_statement = Query::select();
    query_statement
        .columns(vec![
            (tt_table::Entity, tt_table::Column::Id),
            (tt_table::Entity, tt_table::Column::PkColumnName),
            (tt_table::Entity, tt_table::Column::ParentPkColumnName),
            (tt_table::Entity, tt_table::Column::Columns),
            (tt_table::Entity, tt_table::Column::Layouts),
            (tt_table::Entity, tt_table::Column::Styles),
            (tt_table::Entity, tt_table::Column::Owner),
            (tt_table::Entity, tt_table::Column::CreateTime),
            (tt_table::Entity, tt_table::Column::UpdateTime),
        ])
        .from(tt_table::Entity)
        .and_where(Expr::col((tt_table::Entity, ID_FIELD.clone())).eq(table_id));
    let query = funs.db().get_dto::<TableDetailResp>(&query_statement).await?;
    match query {
        Some(resp) => Ok(resp),
        None => Err(funs.err().not_found("table", "get", &format!("not found table.{} by {}", table_id, ctx.owner), "404-rbum-*-obj-not-exist")),
    }
}

pub async fn paginate_tables(
    filter: &RbumBasicFilterReq,
    page_number: u32,
    page_size: u32,
    desc_sort_by_create: Option<bool>,
    desc_sort_by_update: Option<bool>,
    funs: &TardisFunsInst,
    ctx: &TardisContext,
) -> TardisResult<(Vec<TableSummaryResp>, u64)> {
    let mut query_statement = Query::select();
    query_statement
        .columns(vec![
            (tt_table::Entity, tt_table::Column::Id),
            (tt_table::Entity, tt_table::Column::PkColumnName),
            (tt_table::Entity, tt_table::Column::ParentPkColumnName),
            (tt_table::Entity, tt_table::Column::Owner),
            (tt_table::Entity, tt_table::Column::CreateTime),
            (tt_table::Entity, tt_table::Column::UpdateTime),
        ])
        .from(tt_table::Entity);
    query_statement = tt_basic_process::with_filter(query_statement, &get_table_name(), filter, ctx);
    query_statement = tt_share_process::with_share_filter(query_statement, ctx);
    if let Some(sort) = desc_sort_by_create {
        query_statement.order_by((tt_table::Entity, CREATE_TIME_FIELD.clone()), if sort { Order::Desc } else { Order::Asc });
    }
    if let Some(sort) = desc_sort_by_update {
        query_statement.order_by((tt_table::Entity, UPDATE_TIME_FIELD.clone()), if sort { Order::Desc } else { Order::Asc });
    }
    funs.db().paginate_dtos(&query_statement, page_number as u64, page_size as u64).await
}

pub fn get_table_name() -> String {
    tt_table::Entity.table_name().to_string()
}
