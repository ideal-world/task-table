use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use tardis::basic::dto::TardisContext;
use tardis::basic::result::TardisResult;
use tardis::serde_json::Value;
use tardis::tokio::sync::broadcast::Sender;
use tardis::web::poem::web::websocket::BoxWebSocketUpgraded;
use tardis::web::poem::web::{websocket::WebSocket, Data};
use tardis::web::poem_openapi::{self};
use tardis::web::ws_processor::{ws_broadcast, TardisWebsocketMgrMessage, TardisWebsocketResp};
use tardis::{TardisFuns, TardisFunsInst};

use task_table_kernel::dto::tt_basic_dtos::RbumBasicFilterReq;
use task_table_kernel::dto::tt_data_dtos::{TableDataAggregateKind, TableDataFilterReq, TableDataGroupReq, TableDataSliceReq, TableDataSortReq};
use task_table_kernel::dto::tt_dict_dtos::{TableDictAddReq, TableDictModifyReq};
use task_table_kernel::dto::tt_layout_dtos::{TableLayoutAddReq, TableLayoutModifyReq};
use task_table_kernel::dto::tt_share_dtos::{ShareAddReq, ShareDeleteReq};
use task_table_kernel::dto::tt_table_dtos::{TableAddReq, TableModifyReq};
use task_table_kernel::process::{tt_data_process, tt_dict_process, tt_layout_process, tt_share_process, tt_table_process};

#[derive(Debug, Clone)]
pub struct WsProcessor;

#[poem_openapi::OpenApi]
impl WsProcessor {
    #[oai(path = "/ws", method = "get")]
    async fn process(&self, websocket: WebSocket, sender: Data<&Sender<TardisWebsocketMgrMessage>>) -> BoxWebSocketUpgraded {
        ws_broadcast(
            vec!["default".to_string()],
            false,
            false,
            [].into(),
            websocket,
            sender.clone(),
            |req_msg, _ext| async move {
                let funs = TardisFuns::inst_with_db_conn("", None);
                // TODO
                let ctx = TardisContext {
                    own_paths: "".to_string(),
                    owner: "xh".to_string(),
                    ak: "".to_string(),
                    roles: vec![],
                    groups: vec![],
                    ..Default::default()
                };

                let msg = TardisFuns::json.json_to_obj::<WsMessage>(req_msg.msg);
                if msg.is_err() {
                    return Some(TardisWebsocketResp {
                        msg: TardisFuns::json.obj_to_json(&msg).expect("ignore"),
                        to_avatars: req_msg.to_avatars.unwrap_or(vec![]),
                        ignore_avatars: vec![],
                    });
                }
                let msg = msg.expect("ignore");

                match distribute(msg, funs, &ctx).await {
                    Ok(resp) => Some(TardisWebsocketResp {
                        msg: resp,
                        to_avatars: req_msg.to_avatars.unwrap_or(vec![]),
                        ignore_avatars: vec![],
                    }),
                    Err(err) => Some(TardisWebsocketResp {
                        msg: TardisFuns::json.obj_to_json(&err).expect("ignore"),
                        to_avatars: req_msg.to_avatars.unwrap_or(vec![]),
                        ignore_avatars: vec![],
                    }),
                }
            },
            |_, _| async move {},
        )
        .await
    }
}

async fn distribute(msg: WsMessage, mut funs: TardisFunsInst, ctx: &TardisContext) -> TardisResult<Value> {
    match msg.kind {
        WsMessageKind::AddTable => {
            let body = TardisFuns::json.json_to_obj::<TableAddReq>(msg.body)?;
            funs.begin().await?;
            let resp = tt_table_process::add_table(body, &funs, &ctx).await;
            funs.commit().await?;
            TardisFuns::json.obj_to_json(&resp)
        }
        WsMessageKind::ModifyTable => {
            let table_id = msg
                .params
                .get("table_id")
                .map(|table_id| table_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "modify_table", "table_id is required", "400-params-error"))?;
            let body = TardisFuns::json.json_to_obj::<TableModifyReq>(msg.body)?;
            funs.begin().await?;
            let resp = tt_table_process::modify_table(table_id, body, &funs, &ctx).await;
            funs.commit().await?;
            TardisFuns::json.obj_to_json(&resp)
        }
        WsMessageKind::DeleteTable => {
            let table_id = msg
                .params
                .get("table_id")
                .map(|table_id| table_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "delete_table", "table_id is required", "400-params-error"))?;
            funs.begin().await?;
            let resp = tt_table_process::delete_table(table_id, &funs, &ctx).await;
            funs.commit().await?;
            TardisFuns::json.obj_to_json(&resp)
        }
        WsMessageKind::GetTable => {
            let table_id = msg
                .params
                .get("table_id")
                .map(|table_id| table_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "get_table", "table_id is required", "400-params-error"))?;
            let resp = tt_table_process::get_table(table_id, &funs, &ctx).await;
            TardisFuns::json.obj_to_json(&resp)
        }
        WsMessageKind::PaginateTables => {
            let page_number = msg
                .params
                .get("page_number")
                .map(|page_number| page_number.as_u64())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "paginate_tables", "page_number is required", "400-params-error"))?;
            let page_size = msg
                .params
                .get("page_size")
                .map(|page_size| page_size.as_u64())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "paginate_tables", "page_size is required", "400-params-error"))?;
            let desc_sort_by_create = msg.params.get("desc_sort_by_create").map(|desc_sort_by_create| desc_sort_by_create.as_bool()).flatten();
            let desc_sort_by_update = msg.params.get("desc_sort_by_update").map(|desc_sort_by_update| desc_sort_by_update.as_bool()).flatten();
            let resp = tt_table_process::paginate_tables(
                &RbumBasicFilterReq {
                    ignore_scope: false,
                    rel_ctx_owner: true,
                    ids: None,
                    name: None,
                    names: None,
                },
                page_number as u32,
                page_size as u32,
                desc_sort_by_create,
                desc_sort_by_update,
                &funs,
                &ctx,
            )
            .await;
            TardisFuns::json.obj_to_json(&resp)
        }
        WsMessageKind::AddLayout => {
            let table_id = msg
                .params
                .get("table_id")
                .map(|table_id| table_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "add_layout", "table_id is required", "400-params-error"))?;
            let body = TardisFuns::json.json_to_obj::<TableLayoutAddReq>(msg.body)?;
            funs.begin().await?;
            let resp = tt_layout_process::add_layout(table_id, body, &funs, &ctx).await;
            funs.commit().await?;
            TardisFuns::json.obj_to_json(&resp)
        }
        WsMessageKind::ModifyLayout => {
            let table_id = msg
                .params
                .get("table_id")
                .map(|table_id| table_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "modify_layout", "table_id is required", "400-params-error"))?;
            let layout_id = msg
                .params
                .get("layout_id")
                .map(|layout_id| layout_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "modify_layout", "layout_id is required", "400-params-error"))?;
            let body = TardisFuns::json.json_to_obj::<TableLayoutModifyReq>(msg.body)?;
            funs.begin().await?;
            let resp = tt_layout_process::modify_layout(table_id, layout_id, body, &funs, &ctx).await;
            funs.commit().await?;
            TardisFuns::json.obj_to_json(&resp)
        }
        WsMessageKind::DeleteLayout => {
            let table_id = msg
                .params
                .get("table_id")
                .map(|table_id| table_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "delete_layout", "table_id is required", "400-params-error"))?;
            let layout_id = msg
                .params
                .get("layout_id")
                .map(|layout_id| layout_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "delete_layout", "layout_id is required", "400-params-error"))?;
            funs.begin().await?;
            let resp = tt_layout_process::delete_layout(table_id, layout_id, &funs, &ctx).await;
            funs.commit().await?;
            TardisFuns::json.obj_to_json(&resp)
        }
        WsMessageKind::GetLayout => {
            let table_id = msg
                .params
                .get("table_id")
                .map(|table_id| table_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "get_layout", "table_id is required", "400-params-error"))?;
            let layout_id = msg
                .params
                .get("layout_id")
                .map(|layout_id| layout_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "get_layout", "layout_id is required", "400-params-error"))?;
            let resp = tt_layout_process::get_layout(table_id, layout_id, &funs, &ctx).await;
            TardisFuns::json.obj_to_json(&resp)
        }
        WsMessageKind::FindLayouts => {
            let table_id = msg
                .params
                .get("table_id")
                .map(|table_id| table_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "find_layouts", "table_id is required", "400-params-error"))?;
            let resp = tt_layout_process::find_layouts(table_id, &funs, &ctx).await;
            TardisFuns::json.obj_to_json(&resp)
        }
        WsMessageKind::AddDict => {
            let dict_code = msg
                .params
                .get("dict_code")
                .map(|dict_code| dict_code.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "add_dict", "dict_code is required", "400-params-error"))?;
            let body = TardisFuns::json.json_to_obj::<TableDictAddReq>(msg.body)?;
            funs.begin().await?;
            let resp = tt_dict_process::add_dict(dict_code, body, &funs, &ctx).await;
            funs.commit().await?;
            TardisFuns::json.obj_to_json(&resp)
        }
        WsMessageKind::ModifyDict => {
            let dict_code = msg
                .params
                .get("dict_code")
                .map(|dict_code| dict_code.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "modify_dict", "dict_code is required", "400-params-error"))?;
            let value = msg.params.get("value").ok_or_else(|| funs.err().bad_request("ws", "modify_dict", "value is required", "400-params-error"))?;
            let body = TardisFuns::json.json_to_obj::<TableDictModifyReq>(msg.body)?;
            funs.begin().await?;
            let resp = tt_dict_process::modify_dict(dict_code, value.clone(), body, &funs, &ctx).await;
            funs.commit().await?;
            TardisFuns::json.obj_to_json(&resp)
        }
        WsMessageKind::DeleteDict => {
            let dict_code = msg
                .params
                .get("dict_code")
                .map(|dict_code| dict_code.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "delete_dict", "dict_code is required", "400-params-error"))?;
            let value = msg.params.get("value").ok_or_else(|| funs.err().bad_request("ws", "delete_dict", "value is required", "400-params-error"))?;
            funs.begin().await?;
            let resp = tt_dict_process::delete_dict(dict_code, value, &funs, &ctx).await;
            funs.commit().await?;
            TardisFuns::json.obj_to_json(&resp)
        }
        WsMessageKind::GetDict => {
            let dict_code = msg
                .params
                .get("dict_code")
                .map(|dict_code| dict_code.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "get_dict", "dict_code is required", "400-params-error"))?;
            let value = msg.params.get("value").ok_or_else(|| funs.err().bad_request("ws", "get_dict", "value is required", "400-params-error"))?;
            let resp = tt_dict_process::get_dict(dict_code, value, &funs, &ctx).await;
            TardisFuns::json.obj_to_json(&resp)
        }
        WsMessageKind::FindDicts => {
            let dict_code = msg
                .params
                .get("dict_code")
                .map(|dict_code| dict_code.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "find_dicts", "dict_code is required", "400-params-error"))?;
            let resp = tt_dict_process::find_dicts(dict_code, &funs, &ctx).await;
            TardisFuns::json.obj_to_json(&resp)
        }
        WsMessageKind::PaginateDicts => {
            let page_number = msg
                .params
                .get("page_number")
                .map(|page_number| page_number.as_u64())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "paginate_dicts", "page_number is required", "400-params-error"))?;
            let page_size = msg
                .params
                .get("page_size")
                .map(|page_size| page_size.as_u64())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "paginate_dicts", "page_size is required", "400-params-error"))?;
            let desc_sort_by_create = msg.params.get("desc_sort_by_create").map(|desc_sort_by_create| desc_sort_by_create.as_bool()).flatten();
            let desc_sort_by_update = msg.params.get("desc_sort_by_update").map(|desc_sort_by_update| desc_sort_by_update.as_bool()).flatten();
            let resp = tt_dict_process::paginate_dicts(page_number as u32, page_size as u32, desc_sort_by_create, desc_sort_by_update, &funs, &ctx).await;
            TardisFuns::json.obj_to_json(&resp)
        }
        WsMessageKind::AddShare => {
            let body = TardisFuns::json.json_to_obj::<ShareAddReq>(msg.body)?;
            funs.begin().await?;
            let resp = tt_share_process::add_share(body, &funs, &ctx).await;
            funs.commit().await?;
            TardisFuns::json.obj_to_json(&resp)
        }
        WsMessageKind::DeleteShare => {
            let body = TardisFuns::json.json_to_obj::<ShareDeleteReq>(msg.body)?;
            funs.begin().await?;
            let resp = tt_share_process::delete_share(body, &funs, &ctx).await;
            funs.commit().await?;
            TardisFuns::json.obj_to_json(&resp)
        }
        WsMessageKind::AddOrModifyData => {
            let table_id = msg
                .params
                .get("table_id")
                .map(|table_id| table_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "add_or_modify_data", "table_id is required", "400-params-error"))?;
            let body = TardisFuns::json.json_to_obj::<Vec<HashMap<String, Value>>>(msg.body)?;
            funs.begin().await?;
            let resp = tt_data_process::add_or_modify_data(table_id, body, &funs, &ctx).await;
            funs.commit().await?;
            TardisFuns::json.obj_to_json(&resp)
        }
        WsMessageKind::DeleteData => {
            let table_id = msg
                .params
                .get("table_id")
                .map(|table_id| table_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "delete_data", "table_id is required", "400-params-error"))?;
            let body = TardisFuns::json.json_to_obj::<Vec<Value>>(msg.body)?;
            funs.begin().await?;
            let resp = tt_data_process::delete_data(table_id, body, &funs, &ctx).await;
            funs.commit().await?;
            TardisFuns::json.obj_to_json(&resp)
        }
        WsMessageKind::LoadDataWithGroup => {
            let table_id = msg
                .params
                .get("table_id")
                .map(|table_id| table_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "load_data_with_group", "table_id is required", "400-params-error"))?;
            let group = msg
                .params
                .get("group")
                .map(|group| TardisFuns::json.json_to_obj::<TableDataGroupReq>(group.clone()))
                .ok_or_else(|| funs.err().bad_request("ws", "load_data_with_group", "table_id is required", "400-params-error"))??;
            let filters = if let Some(filters) = msg.params.get("filters") {
                Some(TardisFuns::json.json_to_obj::<Vec<TableDataFilterReq>>(filters.clone())?)
            } else {
                None
            };
            let sorts = if let Some(sorts) = msg.params.get("sorts") {
                Some(TardisFuns::json.json_to_obj::<Vec<TableDataSortReq>>(sorts.clone())?)
            } else {
                None
            };
            let aggs = if let Some(aggs) = msg.params.get("aggs") {
                Some(TardisFuns::json.json_to_obj::<HashMap<String, TableDataAggregateKind>>(aggs.clone())?)
            } else {
                None
            };
            let slice = if let Some(slice) = msg.params.get("slice") {
                Some(TardisFuns::json.json_to_obj::<TableDataSliceReq>(slice.clone())?)
            } else {
                None
            };
            let resp = tt_data_process::load_data_with_group(table_id, group, filters, sorts, aggs, slice, &funs, &ctx).await;
            TardisFuns::json.obj_to_json(&resp)
        }
        WsMessageKind::LoadDataWithoutGroup => {
            let table_id = msg
                .params
                .get("table_id")
                .map(|table_id| table_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "load_data_without_group", "table_id is required", "400-params-error"))?;
            let filters = if let Some(filters) = msg.params.get("filters") {
                Some(TardisFuns::json.json_to_obj::<Vec<TableDataFilterReq>>(filters.clone())?)
            } else {
                None
            };
            let sorts = if let Some(sorts) = msg.params.get("sorts") {
                Some(TardisFuns::json.json_to_obj::<Vec<TableDataSortReq>>(sorts.clone())?)
            } else {
                None
            };
            let aggs = if let Some(aggs) = msg.params.get("aggs") {
                Some(TardisFuns::json.json_to_obj::<HashMap<String, TableDataAggregateKind>>(aggs.clone())?)
            } else {
                None
            };
            let slice = if let Some(slice) = msg.params.get("slice") {
                Some(TardisFuns::json.json_to_obj::<TableDataSliceReq>(slice.clone())?)
            } else {
                None
            };
            let record_pks = if let Some(record_pks) = msg.params.get("record_pks") {
                Some(TardisFuns::json.json_to_obj::<Vec<Value>>(record_pks.clone())?)
            } else {
                None
            };
            let resp = tt_data_process::load_data_without_group(table_id, filters, sorts, aggs, slice, record_pks, &funs, &ctx).await;
            TardisFuns::json.obj_to_json(&resp)
        }
    }
}

#[derive(Deserialize, Serialize)]
pub struct WsMessage {
    pub kind: WsMessageKind,
    pub params: HashMap<String, Value>,
    pub body: Value,
}

#[derive(Serialize, Deserialize, PartialEq, Eq, Debug)]
pub enum WsMessageKind {
    AddTable,
    ModifyTable,
    DeleteTable,
    GetTable,
    PaginateTables,
    AddLayout,
    ModifyLayout,
    DeleteLayout,
    GetLayout,
    FindLayouts,
    AddDict,
    ModifyDict,
    DeleteDict,
    GetDict,
    FindDicts,
    PaginateDicts,
    AddShare,
    DeleteShare,
    AddOrModifyData,
    DeleteData,
    LoadDataWithGroup,
    LoadDataWithoutGroup,
}
