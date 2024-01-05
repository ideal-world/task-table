use std::env;

use tardis::basic::dto::TardisContext;
use tardis::basic::result::TardisResult;
use tardis::test::test_container::TardisTestContainer;
use tardis::{testcontainers, tokio, TardisFuns};
use task_table_kernel::dto::tt_basic_dtos::RbumBasicFilterReq;
use task_table_kernel::dto::tt_table_dtos::{TableAddReq, TableColumnAddReq, TableColumnDataKind, TableColumnModifyReq, TableModifyReq, TableStyleProps};
use task_table_kernel::process::tt_table_process;

#[tokio::test]
async fn test_all() -> TardisResult<()> {
    env::set_var("RUST_LOG", "debug,test_all=trace,sqlx::query=off");
    let docker = testcontainers::clients::Cli::default();
    let reldb_container = TardisTestContainer::postgres_custom(None, &docker);
    let port = reldb_container.get_host_port_ipv4(5432);
    let url = format!("postgres://postgres:123456@localhost:{port}/test");
    env::set_var("TARDIS_FW.DB.URL", url);

    test_table().await?;
    Ok(())
}

pub async fn test_table() -> TardisResult<TardisContext> {
    let mut funs = TardisFuns::inst_with_db_conn("".to_string(), None);
    funs.begin().await?;

    let ctx = TardisContext {
        own_paths: "".to_string(),
        owner: "".to_string(),
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
                header_class:None,
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
    assert_eq!(table_detail.styles.unwrap()[0].as_str().unwrap(), "medium");

    // ----------------------------------
    // ----- test modify table
    // ----------------------------------
    assert!(tt_table_process::modify_table(
        &table_id,
        TableModifyReq {
            new_column: Some(TableColumnAddReq {
                name: "COLUMNXX".to_string(),
                ..Default::default()
            }),
            ..Default::default()
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
            ..Default::default()
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
                ..Default::default()
            }),
            styles: Some(TableStyleProps {
                size: Some("mini".to_string()),
                ..Default::default()
            }),
            ..Default::default()
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
                ..Default::default()
            }),
            ..Default::default()
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
                ..Default::default()
            }),
            ..Default::default()
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
    assert_eq!(table_detail.columns()[3].title, "");
    assert_eq!(table_detail.columns()[3].data_kind, TableColumnDataKind::Number);
    assert_eq!(table_detail.styles.unwrap()[0].as_str().unwrap(), "mini");

    // ----------------------------------
    // ----- test paginate table
    // ----------------------------------
    let table_summary = tt_table_process::paginate_tables(
        &RbumBasicFilterReq {
            ignore_scope: false,
            rel_ctx_owner: true,
            ..Default::default()
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
            ..Default::default()
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
                    ..Default::default()
                },
                TableColumnAddReq {
                    name: "cate".to_string(),
                    use_dict: Some(true),
                    dict_editable: Some(true),
                    multi_value: Some(true),
                    ..Default::default()
                },
                TableColumnAddReq {
                    name: "age".to_string(),
                    data_kind: Some(TableColumnDataKind::Number),
                    ..Default::default()
                },
                TableColumnAddReq {
                    name: "ts".to_string(),
                    data_kind: Some(TableColumnDataKind::Datetime),
                    ..Default::default()
                },
            ],
            styles: Some(TableStyleProps {
                size: Some("medium".to_string()),
                ..Default::default()
            }),
        },
        &funs,
        &ctx,
    )
    .await?;

    funs.commit().await?;
    Ok(())
}
