use tardis::basic::dto::TardisContext;
use tardis::basic::result::TardisResult;
use tardis::TardisFuns;
use task_table_kernel::dto::tt_basic_dtos::RbumBasicFilterReq;
use task_table_kernel::dto::tt_table_dtos::{TableAddReq, TableColumnAddReq, TableColumnDataKind, TableColumnModifyReq, TableModifyReq, TableStyleProps};
use task_table_kernel::process::tt_table_process;

pub async fn test() -> TardisResult<String> {
    let mut funs = TardisFuns::inst_with_db_conn("".to_string(), None);
    funs.begin().await?;

    let ctx = TardisContext {
        own_paths: "".to_string(),
        owner: "xh".to_string(),
        ak: "".to_string(),
        roles: vec![],
        groups: vec![],
        ..Default::default()
    };

    // ----------------------------------
    // ----- test add table
    // ----------------------------------
    let table_id = tt_table_process::add_table(
        TableAddReq {
            pk_column_name: "id".to_string(),
            parent_pk_column_name: Some("pid".to_string()),
            columns: Vec::new(),
            styles: Some(TableStyleProps {
                size: Some("medium".to_string()),
                theme: None,
                table_class: None,
                header_class: None,
                row_class: None,
                cell_class: None,
                agg_class: None,
            }),
        },
        &funs,
        &ctx,
    )
    .await?;

    // ----------------------------------
    // ----- test get table
    // ----------------------------------
    let table_detail = tt_table_process::get_table(&table_id, &funs, &ctx).await?;
    assert_eq!(table_detail.columns().len(), 2);
    assert_eq!(table_detail.columns()[0].title, "ID");
    assert_eq!(table_detail.styles.unwrap().as_object().unwrap().get("size").unwrap().as_str().unwrap(), "medium");

    // ----------------------------------
    // ----- test modify table
    // ----------------------------------
    assert!(tt_table_process::modify_table(
        &table_id,
        TableModifyReq {
            new_column: Some(TableColumnAddReq {
                name: "COLUMNXX".to_string(),
                icon: None,
                title: None,
                data_kind: None,
                data_editable: None,
                use_dict: None,
                dict_editable: None,
                multi_value: None,
                kind_date_time_format: None,
                from_column_name: None,
            }),
            changed_column: None,
            deleted_column_name: None,
            styles: None,
        },
        &funs,
        &ctx
    )
    .await
    .is_err());

    assert!(tt_table_process::modify_table(
        &table_id,
        TableModifyReq {
            deleted_column_name: Some("id".to_string()),
            new_column: None,
            changed_column: None,
            styles: None,
        },
        &funs,
        &ctx
    )
    .await
    .is_err());

    tt_table_process::modify_table(
        &table_id,
        TableModifyReq {
            new_column: Some(TableColumnAddReq {
                name: "col_1".to_string(),
                icon: None,
                title: None,
                data_kind: None,
                data_editable: None,
                use_dict: None,
                dict_editable: None,
                multi_value: None,
                kind_date_time_format: None,
                from_column_name: None,
            }),
            styles: Some(TableStyleProps {
                size: Some("mini".to_string()),
                theme: None,
                table_class: None,
                header_class: None,
                row_class: None,
                cell_class: None,
                agg_class: None,
            }),
            changed_column: None,
            deleted_column_name: None,
        },
        &funs,
        &ctx,
    )
    .await?;
    tt_table_process::modify_table(
        &table_id,
        TableModifyReq {
            new_column: Some(TableColumnAddReq {
                name: "col_2".to_string(),
                data_kind: Some(TableColumnDataKind::Number),
                icon: None,
                title: None,
                data_editable: None,
                use_dict: None,
                dict_editable: None,
                multi_value: None,
                kind_date_time_format: None,
                from_column_name: None,
            }),
            changed_column: None,
            deleted_column_name: None,
            styles: None,
        },
        &funs,
        &ctx,
    )
    .await?;
    tt_table_process::modify_table(
        &table_id,
        TableModifyReq {
            changed_column: Some(TableColumnModifyReq {
                name: "col_1".to_string(),
                title: Some("字段1".to_string()),
                icon: None,
                data_editable: None,
                use_dict: None,
                dict_editable: None,
                kind_date_time_format: None,
            }),
            new_column: None,
            deleted_column_name: None,
            styles: None,
        },
        &funs,
        &ctx,
    )
    .await?;

    let table_detail = tt_table_process::get_table(&table_id, &funs, &ctx).await?;
    assert_eq!(table_detail.columns().len(), 4);
    assert_eq!(table_detail.columns()[0].title, "ID");
    assert_eq!(table_detail.columns()[1].title, "Parent ID");
    assert_eq!(table_detail.columns()[2].title, "字段1");
    assert_eq!(table_detail.columns()[3].title, "col_2");
    assert_eq!(table_detail.columns()[3].data_kind, TableColumnDataKind::Number);
    assert_eq!(table_detail.styles.unwrap().as_object().unwrap().get("size").unwrap().as_str().unwrap(), "mini");

    // ----------------------------------
    // ----- test paginate table
    // ----------------------------------
    let table_summary = tt_table_process::paginate_tables(
        &RbumBasicFilterReq {
            ignore_scope: false,
            rel_ctx_owner: true,
            ids: None,
            name: None,
            names: None,
        },
        1,
        10,
        None,
        None,
        &funs,
        &ctx,
    )
    .await?;
    assert_eq!(table_summary.1, 1);

    // ----------------------------------
    // ----- test delete table
    // ----------------------------------
    tt_table_process::delete_table(&table_id, &funs, &ctx).await?;
    let table_summary = tt_table_process::paginate_tables(
        &RbumBasicFilterReq {
            ignore_scope: false,
            rel_ctx_owner: true,
            ids: None,
            name: None,
            names: None,
        },
        1,
        10,
        None,
        None,
        &funs,
        &ctx,
    )
    .await?;
    assert_eq!(table_summary.1, 0);

    let table_id = tt_table_process::add_table(
        TableAddReq {
            pk_column_name: "id".to_string(),
            parent_pk_column_name: Some("pid".to_string()),
            columns: vec![
                TableColumnAddReq {
                    name: "name".to_string(),
                    data_editable: Some(true),
                    icon: None,
                    title: None,
                    data_kind: None,
                    use_dict: None,
                    dict_editable: None,
                    multi_value: None,
                    kind_date_time_format: None,
                    from_column_name: None,
                },
                TableColumnAddReq {
                    name: "cate".to_string(),
                    use_dict: Some(true),
                    dict_editable: Some(true),
                    multi_value: Some(true),
                    icon: None,
                    title: None,
                    data_kind: None,
                    data_editable: None,
                    kind_date_time_format: None,
                    from_column_name: None,
                },
                TableColumnAddReq {
                    name: "age".to_string(),
                    data_kind: Some(TableColumnDataKind::Number),
                    icon: None,
                    title: None,
                    data_editable: None,
                    use_dict: None,
                    dict_editable: None,
                    multi_value: None,
                    kind_date_time_format: None,
                    from_column_name: None,
                },
                TableColumnAddReq {
                    name: "ts".to_string(),
                    data_kind: Some(TableColumnDataKind::Datetime),
                    icon: None,
                    title: None,
                    data_editable: None,
                    use_dict: None,
                    dict_editable: None,
                    multi_value: None,
                    kind_date_time_format: None,
                    from_column_name: None,
                },
            ],
            styles: Some(TableStyleProps {
                size: Some("medium".to_string()),
                theme: None,
                table_class: None,
                header_class: None,
                row_class: None,
                cell_class: None,
                agg_class: None,
            }),
        },
        &funs,
        &ctx,
    )
    .await?;

    funs.commit().await?;
    Ok(table_id)
}
