use tardis::basic::dto::TardisContext;
use tardis::basic::result::TardisResult;
use tardis::serde_json::json;
use tardis::TardisFuns;
use task_table_kernel::dto::tt_dict_dtos::TableDictNewOrModifyReq;
use task_table_kernel::process::tt_dict_process;

pub async fn test() -> TardisResult<()> {
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
    // ----- test add dict
    // ----------------------------------
    let dict_code = "feed_kind";
    tt_dict_process::new_or_modify_dict_item(
        dict_code,
        TableDictNewOrModifyReq {
            title: "任务".to_string(),
            value: json!("task"),
            color: Some("blue".to_string()),
            avatar: None,
        },
        &funs,
        &ctx,
    )
    .await?;
    let data = tt_dict_process::get_dict_item(dict_code, &json!("task"), &funs, &ctx).await?;
    assert_eq!(data.title, "任务".to_string());
    assert_eq!(data.value, json!("task"));
    assert_eq!(data.color, "blue".to_string());

    // ----------------------------------
    // ----- test modify dict
    // ----------------------------------
    tt_dict_process::new_or_modify_dict_item(
        dict_code,
        TableDictNewOrModifyReq {
            title: "任务2".to_string(),
            value: json!("task"),
            color: None,
            avatar: Some("debug".to_string()),
        },
        &funs,
        &ctx,
    )
    .await?;
    let data = tt_dict_process::get_dict_item(dict_code, &json!("task"), &funs, &ctx).await?;
    assert_eq!(data.title, "任务2".to_string());
    assert_eq!(data.value, json!("task"));
    assert_eq!(data.color, "blue".to_string());
    assert_eq!(data.avatar, "debug".to_string());

    // ----------------------------------
    // ----- test delete dict
    // ----------------------------------
    tt_dict_process::delete_dict_item(dict_code, &json!("task"), &funs, &ctx).await?;
    assert!(tt_dict_process::get_dict_item(dict_code, &json!("task"), &funs, &ctx).await.is_err());

    // ----------------------------------
    // ----- test find dicts
    // ----------------------------------
    tt_dict_process::new_or_modify_dict_item(
        dict_code,
        TableDictNewOrModifyReq {
            title: "缺陷".to_string(),
            value: json!("bug"),
            color: Some("red".to_string()),
            avatar: None,
        },
        &funs,
        &ctx,
    )
    .await?;
    tt_dict_process::new_or_modify_dict_item(
        dict_code,
        TableDictNewOrModifyReq {
            title: "需求".to_string(),
            value: json!("req"),
            color: None,
            avatar: None,
        },
        &funs,
        &ctx,
    )
    .await?;
    tt_dict_process::new_or_modify_dict_item(
        dict_code,
        TableDictNewOrModifyReq {
            title: "任务".to_string(),
            value: json!("task"),
            color: None,
            avatar: None,
        },
        &funs,
        &ctx,
    )
    .await?;
    let data = tt_dict_process::find_all_dict_items(dict_code, &funs, &ctx).await?;
    assert_eq!(data.len(), 3);
    assert_eq!(data[0].value, json!("bug"));
    assert_eq!(data[0].color, "red".to_string());
    assert_eq!(data[0].avatar, "".to_string());

    // ----------------------------------
    // ----- test paginate dicts
    // ----------------------------------
    let data = tt_dict_process::paginate_dict_items(None, None, Some(1), Some(2), None, None, &funs, &ctx).await?;
    assert_eq!(data.records.len(), 2);
    assert_eq!(data.total_number, 3);
    assert_eq!(data.records[0].value, json!("bug"));
    assert_eq!(data.records[0].color, "red".to_string());
    assert_eq!(data.records[0].avatar, "".to_string());

    funs.commit().await?;
    Ok(())
}
