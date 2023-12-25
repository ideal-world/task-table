use tardis::db::sea_orm::sea_query::{Expr, Query};
use tardis::db::sea_orm::*;
use tardis::{
    basic::{dto::TardisContext, result::TardisResult},
    db::sea_orm::Set,
    TardisFuns, TardisFunsInst,
};

use crate::dto::tt_basic_dtos::RbumBasicFilterReq;
use crate::dto::tt_table_dtos::{TableColumnDataKind, TableColumnProps, TableColumnsResp, TableDetailResp, TableModifyReq, TableSummaryResp};
use crate::{domain::tt_table, dto::tt_table_dtos::TableAddReq};

use super::tt_basic_process::{self, CREATE_TIME_FIELD, ID_FIELD, UPDATE_TIME_FIELD};
use super::tt_share_process;

pub const INST_PREFIX: &str = "inst_";

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
    // create instance table
    let columns = add_req
        .columns
        .iter()
        .map(|column| {
            format!(
                "{} {}",
                column.name,
                covert_column_data_kind_to_postgre_type(column.data_kind.as_ref().unwrap_or(&TableColumnDataKind::Text), column.multi_value.unwrap_or(false))
            )
        })
        .collect::<Vec<String>>()
        .join(",\r\n");
    funs.db()
        .execute_one(
            &format!(
                r#"CREATE TABLE {INST_PREFIX}_{table_id}(
            {columns}
        )"#
            ),
            vec![],
        )
        .await?;
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
            let new_db_column = format!(
                "{} {}",
                new_column.name,
                covert_column_data_kind_to_postgre_type(new_column.data_kind.as_ref().unwrap_or(&TableColumnDataKind::Text), new_column.multi_value.unwrap_or(false))
            );
            storage_columns.push(TableColumnProps {
                name: new_column.name,
                icon: new_column.icon,
                title: new_column.title,
                data_kind: new_column.data_kind,
                data_editable: new_column.data_editable,
                use_dict: new_column.use_dict,
                dict_editable: new_column.dict_editable,
                multi_value: new_column.multi_value,
                kind_date_time_format: new_column.kind_date_time_format,
            });
            // add instance column
            funs.db().execute_one(&format!(r#"ALTER TABLE {INST_PREFIX}_{table_id} ADD COLUMN {new_db_column}"#), vec![]).await?;
        }
        if let Some(deleted_column_name) = modify_req.deleted_column_name {
            if let Some(idx) = storage_columns.iter().position(|column| column.name == deleted_column_name) {
                storage_columns.remove(idx);
            }
            // delete instance column
            funs.db().execute_one(&format!(r#"ALTER TABLE {INST_PREFIX}_{table_id} DROP COLUMN {deleted_column_name}"#), vec![]).await?;
        }
        if let Some(changed_column) = modify_req.changed_column {
            if let Some(idx) = storage_columns.iter().position(|column| column.name == changed_column.name) {
                let storage_column = storage_columns.get_mut(idx).unwrap();
                if changed_column.icon.is_some() {
                    storage_column.icon = changed_column.icon;
                }
                if changed_column.title.is_some() {
                    storage_column.title = changed_column.title;
                }
                if changed_column.data_editable.is_some() {
                    storage_column.data_editable = changed_column.data_editable;
                }
                if changed_column.use_dict.is_some() {
                    storage_column.use_dict = changed_column.use_dict;
                }
                if changed_column.dict_editable.is_some() {
                    storage_column.dict_editable = changed_column.dict_editable;
                }
                if changed_column.kind_date_time_format.is_some() {
                    storage_column.kind_date_time_format = changed_column.kind_date_time_format;
                }
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
    // delete instance table
    funs.db().execute_one(&format!(r#"DROP TABLE {INST_PREFIX}_{table_id}"#), vec![]).await?;
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

pub async fn get_table_columns(table_id: &str, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<TableColumnsResp> {
    tt_share_process::check_share(table_id, funs, ctx).await?;
    let mut query_statement = Query::select();
    query_statement
        .columns(vec![(tt_table::Entity, tt_table::Column::PkColumnName)])
        .columns(vec![(tt_table::Entity, tt_table::Column::Columns)])
        .from(tt_table::Entity)
        .and_where(Expr::col((tt_table::Entity, ID_FIELD.clone())).eq(table_id));

    let query = funs.db().get_dto::<TableColumnsResp>(&query_statement).await?;
    match query {
        Some(resp) => Ok(resp),
        None => Err(funs.err().not_found(
            "table",
            "get_table_pk_column_name",
            &format!("not found table.{} by {}", table_id, ctx.owner),
            "404-rbum-*-obj-not-exist",
        )),
    }
}

pub fn get_table_name() -> String {
    tt_table::Entity.table_name().to_string()
}

fn covert_column_data_kind_to_postgre_type(column_data_kind: &TableColumnDataKind, multi_value: bool) -> String {
    let tp = match column_data_kind {
        TableColumnDataKind::Text => "character varying",
        TableColumnDataKind::Textarea => "text",
        TableColumnDataKind::Number => "numeric",
        TableColumnDataKind::Boolean => "boolean",
        TableColumnDataKind::File => "character varying",
        TableColumnDataKind::Image => "character varying",
        TableColumnDataKind::Amount => "money",
        TableColumnDataKind::Select => "character varying",
        TableColumnDataKind::MultiSelect => "character varying",
        TableColumnDataKind::Checkbox => "character varying",
        TableColumnDataKind::Date => "date",
        TableColumnDataKind::Datetime => "timestamp",
        TableColumnDataKind::Time => "time",
        TableColumnDataKind::Email => "character varying",
        TableColumnDataKind::Url => "character varying",
        TableColumnDataKind::Phone => "character varying",
        TableColumnDataKind::Password => "character varying",
    };
    if multi_value {
        format!("{}[]", tp)
    } else {
        tp.to_string()
    }
}
