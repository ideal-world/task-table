use crate::dto::tt_basic_dtos::RbumBasicFilterReq;
use crate::dto::tt_share_dtos::ShareAddReq;
use crate::dto::tt_table_dtos::{TableColumnAddReq, TableColumnDataKind, TableColumnProps, TableColumnsResp, TableDetailResp, TableModifyReq, TableSummaryResp};
use crate::{domain::tt_table, dto::tt_table_dtos::TableAddReq};
use lazy_static::lazy_static;
use tardis::db::sea_orm::sea_query::{Expr, Query};
use tardis::db::sea_orm::*;
use tardis::regex::Regex;
use tardis::{
    basic::{dto::TardisContext, result::TardisResult},
    db::sea_orm::Set,
    TardisFuns, TardisFunsInst,
};

use super::tt_basic_process::{self, CREATE_TIME_FIELD, ID_FIELD, UPDATE_TIME_FIELD};
use super::tt_share_process;

lazy_static! {
    pub static ref R_COLUMN_NAME: Regex = Regex::new(r"^[a-z0-9_]+$").expect("Regular parsing error");
}

pub const INST_PREFIX: &str = "inst";
const ALPHABET: [char; 62] = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y',
    'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];

pub async fn add_table(mut add_req: TableAddReq, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<String> {
    let table_id: String = TardisFuns::field.nanoid_custom(10, &ALPHABET);

    if add_req.columns.iter().any(|column| !R_COLUMN_NAME.is_match(&column.name)) {
        return Err(funs.err().bad_request("table", "add_table", "Column name is illegal", "400-column-name-is-illegal"));
    }

    if add_req.columns.is_empty() || !add_req.columns.iter().any(|column| column.name == add_req.pk_column_name) {
        // add default id column
        add_req.columns.push(TableColumnAddReq {
            name: add_req.pk_column_name.to_string(),
            icon: None,
            title: Some("ID".to_string()),
            data_kind: Some(TableColumnDataKind::Serial),
            data_editable: Some(false),
            use_dict: Some(false),
            dict_editable: Some(false),
            multi_value: Some(false),
            kind_date_time_format: None,
            from_column_name: None,
        });
    }
    if add_req.parent_pk_column_name.is_some()
        && (add_req.columns.is_empty() || !add_req.columns.iter().any(|column| &column.name == add_req.parent_pk_column_name.as_ref().unwrap_or(&"".to_string())))
    {
        // add default parent_id column
        add_req.columns.push(TableColumnAddReq {
            name: add_req.parent_pk_column_name.as_ref().unwrap_or(&"".to_string()).to_string(),
            icon: None,
            title: Some("Parent ID".to_string()),
            data_kind: Some(TableColumnDataKind::Number),
            data_editable: Some(false),
            use_dict: Some(false),
            dict_editable: Some(false),
            multi_value: Some(false),
            kind_date_time_format: None,
            from_column_name: None,
        });
    }

    let columns = add_req
        .columns
        .into_iter()
        .map(|req_column| TableColumnProps {
            name: req_column.name.clone(),
            icon: req_column.icon,
            title: req_column.title.unwrap_or(req_column.name),
            data_kind: req_column.data_kind.unwrap_or(TableColumnDataKind::Text),
            data_editable: req_column.data_editable.unwrap_or(false),
            use_dict: req_column.use_dict.unwrap_or(false),
            dict_editable: req_column.dict_editable.unwrap_or(false),
            multi_value: req_column.multi_value.unwrap_or(false),
            kind_date_time_format: req_column.kind_date_time_format,
        })
        .collect::<Vec<_>>();

    let table_domain = tt_table::ActiveModel {
        id: Set(table_id.clone()),
        pk_column_name: Set(add_req.pk_column_name),
        parent_pk_column_name: Set(add_req.parent_pk_column_name),
        columns: Set(TardisFuns::json.obj_to_json(&columns).expect("ignore")),
        styles: Set(if add_req.styles.is_some() {
            Some(TardisFuns::json.obj_to_json(&add_req.styles).expect("ignore"))
        } else {
            None
        }),
        ..Default::default()
    };
    funs.db().insert_one(table_domain, ctx).await?;
    // create instance table
    let columns = columns
        .iter()
        .map(|column| format!("{} {}", column.name, covert_column_data_kind_to_postgres_type(&column.data_kind, column.multi_value)))
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
    tt_share_process::add_share(
        ShareAddReq {
            table_id: table_id.clone(),
            owner: ctx.owner.clone(),
            full_control: true,
        },
        funs,
        ctx,
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
    if let Some(styles) = &modify_req.styles {
        table_domain.styles = Set(Some(TardisFuns::json.obj_to_json(styles).expect("ignore")));
    }
    // column
    if modify_req.new_column.is_some() || modify_req.deleted_column_name.is_some() || modify_req.changed_column.is_some() {
        let storage_table_detail = get_table(table_id, funs, ctx).await?;
        let mut storage_columns = storage_table_detail.columns();

        if let Some(new_column) = modify_req.new_column {
            if !R_COLUMN_NAME.is_match(&new_column.name) {
                return Err(funs.err().bad_request("table", "modify_table", "Column name is illegal", "400-column-name-is-illegal"));
            }
            if storage_table_detail.columns().iter().any(|column| column.name == new_column.name) {
                return Err(funs.err().bad_request("table", "modify_table", "Column name already exist", "400-column-name-already-exist"));
            }

            let new_db_column = format!(
                "{} {}",
                new_column.name,
                covert_column_data_kind_to_postgres_type(new_column.data_kind.as_ref().unwrap_or(&TableColumnDataKind::Text), new_column.multi_value.unwrap_or(false))
            );
            storage_columns.push(TableColumnProps {
                name: new_column.name.clone(),
                icon: new_column.icon,
                title: new_column.title.unwrap_or(new_column.name.clone()),
                data_kind: new_column.data_kind.unwrap_or(TableColumnDataKind::Text),
                data_editable: new_column.data_editable.unwrap_or(false),
                use_dict: new_column.use_dict.unwrap_or(false),
                dict_editable: new_column.dict_editable.unwrap_or(false),
                multi_value: new_column.multi_value.unwrap_or(false),
                kind_date_time_format: new_column.kind_date_time_format,
            });
            // add instance column
            funs.db().execute_one(&format!(r#"ALTER TABLE {INST_PREFIX}_{table_id} ADD COLUMN {new_db_column}"#), vec![]).await?;
            if let Some(from_column_name) = new_column.from_column_name {
                funs.db().execute_one(&format!(r#"UPDATE {INST_PREFIX}_{table_id} SET {} = {}"#, new_column.name, from_column_name), vec![]).await?;
            }
        }
        if let Some(deleted_column_name) = modify_req.deleted_column_name {
            if storage_table_detail.pk_column_name == deleted_column_name
                || storage_table_detail.parent_pk_column_name.map(|column_name| column_name == deleted_column_name).unwrap_or(false)
            {
                return Err(funs.err().bad_request("table", "modify_table", "Primary key column cannot be deleted", "400-primary-key-column-cannot-be-deleted"));
            }

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
                if let Some(title) = changed_column.title {
                    storage_column.title = title;
                }
                if let Some(data_editable) = changed_column.data_editable {
                    storage_column.data_editable = data_editable;
                }
                if let Some(use_dict) = changed_column.use_dict {
                    storage_column.use_dict = use_dict;
                }
                if let Some(dict_editable) = changed_column.dict_editable {
                    storage_column.dict_editable = dict_editable;
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
        None => Err(funs.err().not_found("table", "get", &format!("Table.{} not found by {}", table_id, ctx.owner), "404-table-not-found")),
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
            &format!("Table.{} not found by {}", table_id, ctx.owner),
            "404-table-not-found",
        )),
    }
}

pub fn get_table_name() -> String {
    tt_table::Entity.table_name().to_string()
}

fn covert_column_data_kind_to_postgres_type(column_data_kind: &TableColumnDataKind, multi_value: bool) -> String {
    let tp = match column_data_kind {
        TableColumnDataKind::Serial => "serial primary key",
        TableColumnDataKind::Number => "double precision",
        TableColumnDataKind::Boolean => "boolean",
        TableColumnDataKind::Amount => "money",
        TableColumnDataKind::Date => "date",
        TableColumnDataKind::Datetime => "timestamp with time zone",
        TableColumnDataKind::Time => "time",
        _ => "text",
    };
    if multi_value {
        format!("{}[]", tp)
    } else {
        tp.to_string()
    }
}
