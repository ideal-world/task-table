use std::collections::HashMap;

use tardis::basic::dto::TardisContext;
use tardis::basic::result::TardisResult;
use tardis::serde_json::json;
use tardis::TardisFuns;
use task_table_kernel::dto::tt_data_dtos::{
    TableDataAggregateKind, TableDataFilterItemReq, TableDataFilterReq, TableDataGroupReq, TableDataOperatorKind, TableDataSliceReq, TableDataSortReq,
};
use task_table_kernel::process::tt_data_process;

pub async fn test(table_id: &str) -> TardisResult<()> {
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
    // ----- test add data
    // ----------------------------------
    let data = tt_data_process::add_or_modify_data(
        table_id,
        vec![
            HashMap::from_iter(vec![("name".to_string(), json!("xh")), ("cate".to_string(), json!(["A", "B"])), ("age".to_string(), json!(6))].into_iter()),
            HashMap::from_iter(vec![("name".to_string(), json!("xy")), ("cate".to_string(), json!(["B"])), ("age".to_string(), json!(3))].into_iter()),
        ],
        &funs,
        &ctx,
    )
    .await?;

    let id = data[1]["id"].clone();
    assert_eq!(data.len(), 2);
    assert_eq!(data[0]["id"], json!(1));
    assert_eq!(data[0]["name"], json!("xh"));
    assert_eq!(data[0]["cate"], json!(["A", "B"]));
    assert_eq!(data[0]["age"], json!(6.0));
    assert_eq!(data[1]["id"], json!(2));
    assert_eq!(data[1]["name"], json!("xy"));
    assert_eq!(data[1]["cate"], json!(["B"]));
    assert_eq!(data[1]["age"], json!(3.0));

    // ----------------------------------
    // ----- test modify data
    // ----------------------------------
    let data = tt_data_process::add_or_modify_data(
        table_id,
        vec![HashMap::from_iter(
            vec![
                ("id".to_string(), id),
                ("name".to_string(), json!("xymm")),
                ("ts".to_string(), json!("2024-1-4T11:11:11.111Z")),
            ]
            .into_iter(),
        )],
        &funs,
        &ctx,
    )
    .await?;

    assert_eq!(data.len(), 1);
    assert_eq!(data[0]["id"], json!(2));
    assert_eq!(data[0]["name"], json!("xymm"));
    assert_eq!(data[0]["cate"], json!(["B"]));
    assert_eq!(data[0]["age"], json!(3.0));
    assert_eq!(data[0]["ts"], json!("2024-01-04T11:11:11.111Z"));

    tt_data_process::add_or_modify_data(
        table_id,
        vec![
            HashMap::from_iter(
                vec![
                    ("name".to_string(), json!("xymm2")),
                    ("cate".to_string(), json!(["A"])),
                    ("age".to_string(), json!(4)),
                    ("ts".to_string(), json!("2024-1-5T11:11:11.111Z")),
                ]
                .into_iter(),
            ),
            HashMap::from_iter(
                vec![
                    ("name".to_string(), json!("xymm3")),
                    ("cate".to_string(), json!(["B"])),
                    ("age".to_string(), json!(5)),
                    ("ts".to_string(), json!("2024-1-6T11:11:11.111Z")),
                ]
                .into_iter(),
            ),
            HashMap::from_iter(
                vec![
                    ("name".to_string(), json!("xymm4")),
                    ("cate".to_string(), json!(["D"])),
                    ("age".to_string(), json!(6)),
                    ("ts".to_string(), json!("2024-1-7T11:11:11.111Z")),
                ]
                .into_iter(),
            ),
        ],
        &funs,
        &ctx,
    )
    .await?;

    // id -- name -- cate -- age -- ts
    // 1 -- xh -- A, B -- 6 -- null
    // 2 -- xymm -- B -- 3 -- 2024-1-4T11:11:11.111Z
    // 3 -- xymm2 -- A -- 4 -- 2024-1-5T11:11:11.111Z
    // 4 -- xymm3 -- B -- 5 -- 2024-1-6T11:11:11.111Z
    // 5 -- xymm4 -- D -- 6 -- 2024-1-7T11:11:11.111Z

    // ----------------------------------
    // ----- test load simple data
    // ----------------------------------
    let data = tt_data_process::load_data_without_group(&table_id, None, None, None, None, None, &funs, &ctx).await?;
    assert_eq!(data.total_number, 5);
    assert_eq!(data.aggs, HashMap::new());
    assert_eq!(data.records.len(), 5);
    assert_eq!(data.records[0]["id"], json!(1));
    assert_eq!(data.records[0]["name"], json!("xh"));
    assert_eq!(data.records[0]["cate"], json!(["A", "B"]));
    assert_eq!(data.records[0]["age"], json!(6.0));
    assert_eq!(data.records[1]["id"], json!(2));
    assert_eq!(data.records[1]["name"], json!("xymm"));
    assert_eq!(data.records[1]["cate"], json!(["B"]));
    assert_eq!(data.records[1]["age"], json!(3.0));
    assert_eq!(data.records[1]["ts"], json!("2024-01-04T11:11:11.111Z"));

    // ----------------------------------
    // ----- test load data with sort
    // ----------------------------------
    let data = tt_data_process::load_data_without_group(
        &table_id,
        None,
        Some(vec![TableDataSortReq {
            column_name: "id".to_string(),
            order_desc: true,
        }]),
        None,
        None,
        None,
        &funs,
        &ctx,
    )
    .await?;
    assert_eq!(data.total_number, 5);
    assert_eq!(data.aggs, HashMap::new());
    assert_eq!(data.records[0]["id"], json!(5));
    assert_eq!(data.records[1]["id"], json!(4));

    // ----------------------------------
    // ----- test load data with sorts & aggs
    // ----------------------------------
    let data = tt_data_process::load_data_without_group(
        &table_id,
        None,
        Some(vec![TableDataSortReq {
            column_name: "id".to_string(),
            order_desc: true,
        }]),
        Some(HashMap::from_iter(
            vec![("age".to_string(), TableDataAggregateKind::Avg), ("name".to_string(), TableDataAggregateKind::Count)].into_iter(),
        )),
        None,
        None,
        &funs,
        &ctx,
    )
    .await?;
    assert_eq!(data.total_number, 5);
    assert_eq!(
        data.aggs,
        HashMap::from_iter(vec![("age".to_string(), json!(4.8)), ("name".to_string(), json!(5))].into_iter())
    );
    assert_eq!(data.records[0]["id"], json!(5));
    assert_eq!(data.records[1]["id"], json!(4));

    // ----------------------------------
    // ----- test load data with sorts & aggs & slice
    // ----------------------------------
    let data = tt_data_process::load_data_without_group(
        &table_id,
        None,
        Some(vec![TableDataSortReq {
            column_name: "id".to_string(),
            order_desc: true,
        }]),
        Some(HashMap::from_iter(
            vec![("age".to_string(), TableDataAggregateKind::Avg), ("name".to_string(), TableDataAggregateKind::Count)].into_iter(),
        )),
        Some(TableDataSliceReq {
            offset_number: 2,
            fetch_number: 3,
        }),
        None,
        &funs,
        &ctx,
    )
    .await?;
    assert_eq!(data.total_number, 3);
    assert_eq!(
        data.aggs,
        HashMap::from_iter(vec![("age".to_string(), json!(4.8)), ("name".to_string(), json!(5))].into_iter())
    );
    assert_eq!(data.records[0]["id"], json!(5));
    assert_eq!(data.records[1]["id"], json!(4));
    assert_eq!(data.records[1]["id"], json!(3));

    // ----------------------------------
    // ----- test load data with sorts & aggs & slice & filter
    // ----------------------------------
    let data = tt_data_process::load_data_without_group(
        &table_id,
        // 2 xymm 3
        // 4 xymm3 5
        // 5 xymm4 6
        Some(vec![TableDataFilterReq {
            items: vec![
                TableDataFilterItemReq {
                    column_name: "id".to_string(),
                    operator: TableDataOperatorKind::Ne,
                    value: Some(json!(3)),
                },
                TableDataFilterItemReq {
                    column_name: "name".to_string(),
                    operator: TableDataOperatorKind::StartWith,
                    value: Some(json!("xymm")),
                },
            ],
            and: true,
        }]),
        Some(vec![TableDataSortReq {
            column_name: "id".to_string(),
            order_desc: false,
        }]),
        Some(HashMap::from_iter(
            vec![("age".to_string(), TableDataAggregateKind::Avg), ("name".to_string(), TableDataAggregateKind::Count)].into_iter(),
        )),
        Some(TableDataSliceReq {
            offset_number: 2,
            fetch_number: 3,
        }),
        None,
        &funs,
        &ctx,
    )
    .await?;
    assert_eq!(data.total_number, 3);
    assert_eq!(
        data.aggs,
        HashMap::from_iter(vec![("age".to_string(), json!(4.66)), ("name".to_string(), json!(3))].into_iter())
    );
    assert_eq!(data.records.len(), 1);
    assert_eq!(data.records[0]["id"], json!(5));
    assert_eq!(data.records[0]["name"], json!("xymm4"));

    // ----------------------------------
    // ----- test load data with group
    // ----------------------------------
    let data = tt_data_process::load_data_with_group(
        &table_id,
        TableDataGroupReq {
            column_names: vec!["cate".to_string()],
            group_order_desc: true,
            hide_empty_record: true,
        },
        None,
        Some(vec![TableDataSortReq {
            column_name: "id".to_string(),
            order_desc: true,
        }]),
        Some(HashMap::from_iter(
            vec![("age".to_string(), TableDataAggregateKind::Avg), ("name".to_string(), TableDataAggregateKind::Count)].into_iter(),
        )),
        Some(TableDataSliceReq {
            offset_number: 2,
            fetch_number: 3,
        }),
        &funs,
        &ctx,
    )
    .await?;
    assert_eq!(data.len(), 4);
    assert_eq!(data[0].group_value, "D");
    assert_eq!(data[0].total_number, 1);
    assert_eq!(
        data[0].aggs,
        HashMap::from_iter(vec![("age".to_string(), json!(6)), ("name".to_string(), json!(1))].into_iter())
    );
    assert_eq!(data[0].records[0]["name"], json!("xymm4"));
    assert_eq!(data[1].group_value, "B");
    assert_eq!(data[1].total_number, 2);
    assert_eq!(
        data[1].aggs,
        HashMap::from_iter(vec![("age".to_string(), json!(4)), ("name".to_string(), json!(2))].into_iter())
    );
    assert_eq!(data[1].records[0]["name"], json!("xymm3"));
    assert_eq!(data[1].records[1]["name"], json!("xymm"));
    assert_eq!(data[2].group_value, "A");
    assert_eq!(data[2].total_number, 1);
    assert_eq!(
        data[2].aggs,
        HashMap::from_iter(vec![("age".to_string(), json!(4)), ("name".to_string(), json!(1))].into_iter())
    );
    assert_eq!(data[2].records[0]["name"], json!("xymm2"));
    assert_eq!(data[3].group_value, "A,B");
    assert_eq!(data[3].total_number, 1);
    assert_eq!(
        data[3].aggs,
        HashMap::from_iter(vec![("age".to_string(), json!(6)), ("name".to_string(), json!(1))].into_iter())
    );
    assert_eq!(data[3].records[0]["name"], json!("xh"));

    // ----------------------------------
    // ----- test delete layout
    // ----------------------------------
    tt_data_process::delete_data(&table_id, vec![json!(2)], &funs, &ctx).await?;
    let data = tt_data_process::load_data_without_group(&table_id, None, None, None, None, None, &funs, &ctx).await?;
    assert_eq!(data.total_number, 4);

    funs.commit().await?;
    Ok(())
}
