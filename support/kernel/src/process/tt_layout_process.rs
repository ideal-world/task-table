use super::{tt_share_process, tt_table_process};
use crate::{
    domain::tt_table,
    dto::tt_layout_dtos::{TableLayoutAddReq, TableLayoutModifyReq, TableLayoutProps},
};
use tardis::{
    basic::{dto::TardisContext, result::TardisResult},
    db::sea_orm::Set,
    TardisFuns, TardisFunsInst,
};

pub async fn add_layout(table_id: &str, add_req: TableLayoutAddReq, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<String> {
    tt_share_process::check_share_full_control(table_id, funs, ctx).await?;
    let storage_table_detail = tt_table_process::get_table(table_id, funs, ctx).await?;
    let storage_columns = storage_table_detail.columns();

    if add_req.columns.iter().any(|req_column| !storage_columns.iter().any(|column| column.name == req_column.name)) {
        return Err(funs.err().not_found("layout", "add", &format!("Table.{} column not found by {}", table_id, ctx.owner), "404-column-not-found"));
    }

    let layout_id: String = TardisFuns::field.nanoid();
    let layout_props = TableLayoutProps {
        id: layout_id.clone(),
        title: add_req.title,
        layout_kind: add_req.layout_kind,
        icon: add_req.icon,
        columns: add_req.columns,
        filters: add_req.filters,
        sorts: add_req.sorts,
        group: add_req.group,
        aggs: add_req.aggs,
        expand_data_pks: add_req.expand_data_pks,
        fetch_data_number: add_req.fetch_data_number,
    };
    let storage_layouts = tt_table_process::get_table(table_id, funs, ctx).await?.layouts();
    let layouts = if let Some(mut storage_layouts) = storage_layouts {
        storage_layouts.push(layout_props);
        storage_layouts
    } else {
        vec![layout_props]
    };
    let table_domain: tt_table::ActiveModel = tt_table::ActiveModel {
        id: Set(table_id.to_string()),
        layouts: Set(Some(TardisFuns::json.obj_to_json(&layouts).expect("ignore"))),
        ..Default::default()
    };
    funs.db().update_one(table_domain, ctx).await?;
    Ok(layout_id)
}

pub async fn modify_layout(table_id: &str, layout_id: &str, modify_req: TableLayoutModifyReq, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<()> {
    let mut storage_layouts = find_layouts(table_id, funs, ctx).await?;
    if let Some(storage_layout) = storage_layouts.iter_mut().find(|layout| layout.id == layout_id) {
        if let Some(title) = modify_req.title {
            storage_layout.title = title;
        }
        if let Some(icon) = modify_req.icon {
            storage_layout.icon = Some(icon);
        }
        if let Some(filters) = modify_req.filters {
            storage_layout.filters = Some(filters);
        }
        if let Some(sorts) = modify_req.sorts {
            storage_layout.sorts = Some(sorts);
        }
        if let Some(aggs) = modify_req.aggs {
            storage_layout.aggs = Some(aggs);
        }
        if let Some(fetch_data_number) = modify_req.fetch_data_number {
            storage_layout.fetch_data_number = Some(fetch_data_number);
        }
        if let Some(expand_data_pks) = modify_req.expand_data_pks {
            storage_layout.expand_data_pks = Some(expand_data_pks);
        }
        // group
        if let Some(new_group) = modify_req.new_group {
            storage_layout.group = Some(new_group);
        }
        if let Some(delete_group) = modify_req.delete_group {
            if delete_group {
                storage_layout.group = None;
            }
        }
        // column
        if let Some(new_column) = modify_req.new_column {
            let storage_table_detail = tt_table_process::get_table(table_id, funs, ctx).await?;
            let storage_columns = storage_table_detail.columns();
            if !storage_columns.iter().any(|column| column.name == new_column.name) {
                return Err(funs.err().not_found("layout", "modify", &format!("Table.{} column not found by {}", table_id, ctx.owner), "404-column-not-found"));
            }

            storage_layout.columns.push(new_column);
        }
        if let Some(deleted_column_name) = modify_req.deleted_column_name {
            if let Some(idx) = storage_layout.columns.iter().position(|column| column.name == deleted_column_name) {
                storage_layout.columns.remove(idx);
            }
        }
        if let Some(changed_column) = modify_req.changed_column {
            if let Some(idx) = storage_layout.columns.iter().position(|column| column.name == changed_column.name) {
                storage_layout.columns.remove(idx);
                storage_layout.columns.insert(idx, changed_column);
            }
        }
        if let Some(sorted_names) = modify_req.column_sorted_names {
            let left_idx = storage_layout.columns.iter().position(|column| column.name == sorted_names[0]);
            let right_idx = storage_layout.columns.iter().position(|column| column.name == sorted_names[1]);
            if left_idx.is_some() && right_idx.is_some() {
                let left_idx = left_idx.expect("ignore");
                let right_idx = right_idx.expect("ignore");
                storage_layout.columns.swap(left_idx, right_idx);
            }
        }

        let table_domain = tt_table::ActiveModel {
            id: Set(table_id.to_string()),
            layouts: Set(Some(TardisFuns::json.obj_to_json(&storage_layouts).expect("ignore"))),
            ..Default::default()
        };
        funs.db().update_one(table_domain, ctx).await?;
        Ok(())
    } else {
        Err(funs.err().not_found(
            "layout",
            "modify",
            &format!("Table.{}.layout.{} not found by {}", table_id, layout_id, ctx.owner),
            "404-layout-not-found",
        ))
    }
}

pub async fn delete_layout(table_id: &str, layout_id: &str, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<()> {
    let mut storage_layouts = find_layouts(table_id, funs, ctx).await?;
    let storage_layout_idx = storage_layouts.iter().position(|layout| layout.id == layout_id);
    if storage_layout_idx.is_none() {
        return Err(funs.err().not_found(
            "layout",
            "delete",
            &format!("Table.{}.layout.{} not found by {}", table_id, layout_id, ctx.owner),
            "404-layout-not-found",
        ));
    }
    storage_layouts.remove(storage_layout_idx.expect("ignore"));

    let table_domain = tt_table::ActiveModel {
        id: Set(table_id.to_string()),
        layouts: Set(Some(TardisFuns::json.obj_to_json(&storage_layouts).expect("ignore"))),
        ..Default::default()
    };
    funs.db().update_one(table_domain, ctx).await?;
    Ok(())
}

pub async fn get_layout(table_id: &str, layout_id: &str, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<TableLayoutProps> {
    let storage_layouts = find_layouts(table_id, funs, ctx).await?;
    let storage_layout = storage_layouts.into_iter().find(|layout| layout.id == layout_id);
    if storage_layout.is_none() {
        return Err(funs.err().not_found(
            "layout",
            "get",
            &format!("Table.{}.layout.{} not found by {}", table_id, layout_id, ctx.owner),
            "404-layout-not-found",
        ));
    }
    Ok(storage_layout.expect("ignore"))
}

pub async fn find_layouts(table_id: &str, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<Vec<TableLayoutProps>> {
    tt_share_process::check_share_full_control(table_id, funs, ctx).await?;
    let storage_layouts = tt_table_process::get_table(table_id, funs, ctx).await?.layouts();
    if storage_layouts.is_none() {
        return Err(funs.err().not_found("layout", "find", &format!("Table.{} not found by {}", table_id, ctx.owner), "404-layout-not-found"));
    }
    Ok(storage_layouts.expect("ignore"))
}
