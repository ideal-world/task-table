use tardis::basic::dto::TardisContext;
use tardis::basic::result::TardisResult;
use tardis::serde_json::json;
use tardis::TardisFuns;
use task_table_kernel::dto::tt_data_dtos::{TableDataFilterItemProps, TableDataFilterProps, TableDataOperatorKind};
use task_table_kernel::dto::tt_layout_dtos::{TableLayoutColumnProps, TableLayoutModifyProps, TableLayoutNewReq};
use task_table_kernel::process::tt_layout_process;

pub async fn test(table_id: &str) -> TardisResult<String> {
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
    // ----- test add layout
    // ----------------------------------
    let layout_id = tt_layout_process::new_layout(
        table_id,
        TableLayoutNewReq {
            title: "default".to_string(),
            layout_kind: "LIST".to_string(),
            icon: None,
            columns: vec![
                TableLayoutColumnProps {
                    name: "id".to_string(),
                    wrap: None,
                    fixed: None,
                    width: None,
                    hide: None,
                    date_start: None,
                    date_end: None,
                },
                TableLayoutColumnProps {
                    name: "name".to_string(),
                    wrap: None,
                    fixed: Some(true),
                    width: None,
                    hide: None,
                    date_start: None,
                    date_end: None,
                },
                TableLayoutColumnProps {
                    name: "cate".to_string(),
                    wrap: Some(true),
                    fixed: None,
                    width: Some(200),
                    hide: None,
                    date_start: None,
                    date_end: None,
                },
                TableLayoutColumnProps {
                    name: "age".to_string(),
                    wrap: None,
                    fixed: None,
                    width: None,
                    hide: Some(true),
                    date_start: None,
                    date_end: None,
                },
            ],
            filters: None,
            sorts: None,
            group: None,
            aggs: None,
            slice: None,
            expand_data_pks: None,
        },
        &funs,
        &ctx,
    )
    .await?;

    // ----------------------------------
    // ----- test get layout
    // ----------------------------------
    let layout_detail = tt_layout_process::get_layout(&table_id, &layout_id, &funs, &ctx).await?;
    assert_eq!(layout_detail.columns.len(), 4);
    assert_eq!(layout_detail.columns[3].hide, Some(true));

    // ----------------------------------
    // ----- test modify layout
    // ----------------------------------
    tt_layout_process::modify_layout(
        &table_id,
        &layout_id,
        TableLayoutModifyProps {
            title: None,
            icon: Some("TEXT".to_string()),
            filters: Some(vec![TableDataFilterProps {
                items: vec![TableDataFilterItemProps {
                    column_name: "name".to_string(),
                    operator: TableDataOperatorKind::Eq,
                    value: Some(json!("xh")),
                }],
                and: true,
            }]),
            sorts: None,
            aggs: None,
            slice: None,
            group: None,
            expand_data_pks: None,
            column_sorted_names: None,
            new_column: Some(TableLayoutColumnProps {
                name: "ts".to_string(),
                wrap: None,
                fixed: None,
                width: None,
                hide: None,
                date_start: None,
                date_end: None,
            }),
            changed_column: Some(TableLayoutColumnProps {
                name: "name".to_string(),
                wrap: None,
                fixed: None,
                width: Some(100),
                hide: None,
                date_start: None,
                date_end: None,
            }),
            deleted_column_name: Some("age".to_string()),
        },
        &funs,
        &ctx,
    )
    .await?;

    let layout_detail = tt_layout_process::get_layout(&table_id, &layout_id, &funs, &ctx).await?;
    assert_eq!(layout_detail.columns.len(), 4);
    assert_eq!(layout_detail.columns[0].name, "id".to_string());
    assert_eq!(layout_detail.columns[1].name, "name".to_string());
    assert_eq!(layout_detail.columns[1].width, Some(100));
    assert_eq!(layout_detail.columns[2].name, "cate".to_string());
    assert_eq!(layout_detail.columns[3].name, "ts".to_string());
    assert_eq!(layout_detail.icon, Some("TEXT".to_string()));
    assert_eq!(layout_detail.filters.as_ref().unwrap().len(), 1);
    assert_eq!(layout_detail.filters.as_ref().unwrap()[0].and, true);
    assert_eq!(layout_detail.filters.as_ref().unwrap()[0].items.len(), 1);
    assert_eq!(layout_detail.filters.as_ref().unwrap()[0].items[0].value, Some(json!("xh")));

    tt_layout_process::modify_layout(
        &table_id,
        &layout_id,
        TableLayoutModifyProps {
            title: None,
            icon: None,
            filters: None,
            sorts: None,
            aggs: None,
            slice: None,
            group: None,
            expand_data_pks: None,
            column_sorted_names: Some(vec!["ts".to_string(), "name".to_string()]),
            new_column: None,
            changed_column: None,
            deleted_column_name: None,
        },
        &funs,
        &ctx,
    )
    .await?;

    let layout_detail = tt_layout_process::get_layout(&table_id, &layout_id, &funs, &ctx).await?;
    assert_eq!(layout_detail.columns.len(), 4);
    assert_eq!(layout_detail.columns[0].name, "id".to_string());
    assert_eq!(layout_detail.columns[1].name, "ts".to_string());
    assert_eq!(layout_detail.columns[2].name, "cate".to_string());
    assert_eq!(layout_detail.columns[3].name, "name".to_string());

    // ----------------------------------
    // ----- test paginate layout
    // ----------------------------------
    let layout_summary = tt_layout_process::find_layouts(&table_id, &funs, &ctx).await?;
    assert_eq!(layout_summary.len(), 1);
    assert_eq!(layout_summary[0].columns.len(), 4);

    // ----------------------------------
    // ----- test delete layout
    // ----------------------------------
    tt_layout_process::delete_layout(&table_id, &layout_id, &funs, &ctx).await?;
    let layout_summary = tt_layout_process::find_layouts(&table_id, &funs, &ctx).await?;
    assert_eq!(layout_summary.len(), 0);

    let layout_id = tt_layout_process::new_layout(
        table_id,
        TableLayoutNewReq {
            title: "default".to_string(),
            layout_kind: "LIST".to_string(),
            icon: None,
            columns: vec![
                TableLayoutColumnProps {
                    name: "id".to_string(),
                    wrap: None,
                    fixed: None,
                    width: None,
                    hide: None,
                    date_start: None,
                    date_end: None,
                },
                TableLayoutColumnProps {
                    name: "name".to_string(),
                    wrap: None,
                    fixed: Some(true),
                    width: None,
                    hide: None,
                    date_start: None,
                    date_end: None,
                },
                TableLayoutColumnProps {
                    name: "cate".to_string(),
                    wrap: Some(true),
                    fixed: None,
                    width: Some(200),
                    hide: None,
                    date_start: None,
                    date_end: None,
                },
                TableLayoutColumnProps {
                    name: "age".to_string(),
                    wrap: None,
                    fixed: None,
                    width: None,
                    hide: Some(true),
                    date_start: None,
                    date_end: None,
                },
                TableLayoutColumnProps {
                    name: "ts".to_string(),
                    wrap: None,
                    fixed: None,
                    width: None,
                    hide: None,
                    date_start: None,
                    date_end: None,
                },
            ],
            filters: None,
            sorts: None,
            group: None,
            aggs: None,
            slice: None,
            expand_data_pks: None,
        },
        &funs,
        &ctx,
    )
    .await?;

    funs.commit().await?;
    Ok(layout_id)
}
