use std::collections::HashMap;
use std::str::FromStr;

use serde::{Deserialize, Serialize};
use strum::EnumString;
use tardis::basic::dto::TardisContext;
use tardis::basic::result::TardisResult;
use tardis::log::trace;
use tardis::serde_json::{json, Value};
use tardis::tokio::sync::broadcast::Sender;
use tardis::web::poem::web::websocket::BoxWebSocketUpgraded;
use tardis::web::poem::web::{websocket::WebSocket, Data};
use tardis::web::poem_openapi::{self};
use tardis::web::ws_processor::{ws_broadcast, TardisWebsocketMgrMessage, TardisWebsocketResp};
use tardis::{TardisFuns, TardisFunsInst};

use task_table_kernel::dto::tt_basic_dtos::RbumBasicFilterReq;
use task_table_kernel::dto::tt_data_dtos::{TableDataAggregateKind, TableDataFilterProps, TableDataGroupProps, TableDataSliceProps, TableDataSortProps};
use task_table_kernel::dto::tt_dict_dtos::TableDictNewOrModifyReq;
use task_table_kernel::dto::tt_layout_dtos::{TableLayoutModifyProps, TableLayoutNewReq};
use task_table_kernel::dto::tt_share_dtos::{ShareDeleteReq, ShareNewReq};
use task_table_kernel::dto::tt_table_dtos::{TableModifyReq, TableNewReq};
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
                trace!("[tt.ws] ----------- request ----------- : \r\n{:#?}", req_msg);

                let funs = TardisFuns::inst_with_db_conn("", None);

                if req_msg.event.is_none() {
                    return Some(TardisWebsocketResp {
                        msg: TardisFuns::json.obj_to_json(&funs.err().bad_request("ws", "event", "event is required", "")).expect("ignore"),
                        to_avatars: req_msg.to_avatars.unwrap_or(vec![]),
                        ignore_avatars: vec![],
                    });
                }

                let event_msg = req_msg.event.as_ref().expect("ignore");
                let event = WsMessageKind::from_str(&event_msg);
                if let Some(err) = event.as_ref().err() {
                    return Some(TardisWebsocketResp {
                        msg: TardisFuns::json.obj_to_json(&funs.err().bad_request("ws", "event", &format!("event [{}] is illegal: {}", &event_msg, err), "")).expect("ignore"),
                        to_avatars: req_msg.to_avatars.unwrap_or(vec![]),
                        ignore_avatars: vec![],
                    });
                }
                let event = event.expect("ignore");

                let msg = TardisFuns::json.json_to_obj::<WsMessage>(req_msg.msg);
                if let Some(err) = msg.as_ref().err() {
                    return Some(TardisWebsocketResp {
                        msg: TardisFuns::json.obj_to_json(&funs.err().bad_request("ws", "msg", &format!("event [{}] is illegal: {}", &event_msg, err), "")).expect("ignore"),
                        to_avatars: req_msg.to_avatars.unwrap_or(vec![]),
                        ignore_avatars: vec![],
                    });
                }
                let msg = msg.expect("ignore");

                // TODO
                let ctx = TardisContext {
                    own_paths: "".to_string(),
                    owner: "xh".to_string(),
                    ak: "".to_string(),
                    roles: vec![],
                    groups: vec![],
                    ..Default::default()
                };
                let resp = match distribute(msg, event, funs, &ctx).await {
                    Ok(resp) => TardisWebsocketResp {
                        msg: TardisFuns::json.obj_to_json(&TardisResp::ok(resp)).expect("ignore"),
                        to_avatars: req_msg.to_avatars.unwrap_or(vec![]),
                        ignore_avatars: vec![],
                    },
                    Err(err) => TardisWebsocketResp {
                        msg: TardisFuns::json.obj_to_json(&err).expect("ignore"),
                        to_avatars: req_msg.to_avatars.unwrap_or(vec![]),
                        ignore_avatars: vec![],
                    },
                };
                trace!("[tt.ws] ----------- response ----------- \r\n{:#?}", resp);
                Some(resp)
            },
            |_, _| async move {},
        )
        .await
    }
}

async fn distribute(msg: WsMessage, event: WsMessageKind, mut funs: TardisFunsInst, ctx: &TardisContext) -> TardisResult<Value> {
    match event {
        WsMessageKind::NewTable => {
            let body = TardisFuns::json.json_to_obj::<TableNewReq>(msg.body)?;
            funs.begin().await?;
            let resp = tt_table_process::new_table(body, &funs, &ctx).await?;
            funs.commit().await?;
            Ok(json!(resp))
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
            tt_table_process::modify_table(table_id, body, &funs, ctx).await?;
            funs.commit().await?;
            Ok(json!(true))
        }
        WsMessageKind::DeleteTable => {
            let table_id = msg
                .params
                .get("table_id")
                .map(|table_id| table_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "delete_table", "table_id is required", "400-params-error"))?;
            funs.begin().await?;
            tt_table_process::delete_table(table_id, &funs, ctx).await?;
            funs.commit().await?;
            Ok(json!(true))
        }
        WsMessageKind::GetTable => {
            let table_id = msg
                .params
                .get("table_id")
                .map(|table_id| table_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "get_table", "table_id is required", "400-params-error"))?;
            let resp = tt_table_process::get_table(table_id, &funs, ctx).await?;
            Ok(TardisFuns::json.obj_to_json(&resp).expect("ignore"))
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
                ctx,
            )
            .await?;
            Ok(TardisFuns::json.obj_to_json(&resp).expect("ignore"))
        }
        WsMessageKind::NewLayout => {
            let table_id = msg
                .params
                .get("table_id")
                .map(|table_id| table_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "new_layout", "table_id is required", "400-params-error"))?;
            let body = TardisFuns::json.json_to_obj::<TableLayoutNewReq>(msg.body)?;
            funs.begin().await?;
            let resp = tt_layout_process::new_layout(table_id, body, &funs, ctx).await?;
            funs.commit().await?;
            Ok(json!(resp))
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
            let body = TardisFuns::json.json_to_obj::<TableLayoutModifyProps>(msg.body)?;
            funs.begin().await?;
            tt_layout_process::modify_layout(table_id, layout_id, body, &funs, ctx).await?;
            funs.commit().await?;
            Ok(json!(true))
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
            tt_layout_process::delete_layout(table_id, layout_id, &funs, ctx).await?;
            funs.commit().await?;
            Ok(json!(true))
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
            let resp = tt_layout_process::get_layout(table_id, layout_id, &funs, ctx).await?;
            Ok(TardisFuns::json.obj_to_json(&resp).expect("ignore"))
        }
        WsMessageKind::FindLayouts => {
            let table_id = msg
                .params
                .get("table_id")
                .map(|table_id| table_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "find_layouts", "table_id is required", "400-params-error"))?;
            let resp = tt_layout_process::find_layouts(table_id, &funs, ctx).await?;
            Ok(TardisFuns::json.obj_to_json(&resp).expect("ignore"))
        }
        WsMessageKind::SortLayouts => {
            let table_id = msg
                .params
                .get("table_id")
                .map(|table_id| table_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "sort_layouts", "table_id is required", "400-params-error"))?;
            let left_layout_id = msg
                .params
                .get("left_layout_id")
                .map(|left_layout_id| left_layout_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "sort_layouts", "left_layout_id is required", "400-params-error"))?;
            let right_layout_id = msg
                .params
                .get("right_layout_id")
                .map(|right_layout_id| right_layout_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "sort_layouts", "right_layout_id is required", "400-params-error"))?;
            funs.begin().await?;
            tt_layout_process::sort_layouts(table_id, left_layout_id, right_layout_id, &funs, ctx).await?;
            funs.commit().await?;
            Ok(json!(true))
        }
        WsMessageKind::NewOrModifyDictItem => {
            let dict_code = msg
                .params
                .get("dict_code")
                .map(|dict_code| dict_code.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "new_or_modify_dict_item", "dict_code is required", "400-params-error"))?;
            let body = TardisFuns::json.json_to_obj::<TableDictNewOrModifyReq>(msg.body)?;
            funs.begin().await?;
            let resp = tt_dict_process::new_or_modify_dict_item(dict_code, body, &funs, ctx).await?;
            funs.commit().await?;
            Ok(json!(resp))
        }
        WsMessageKind::DeleteDictItem => {
            let dict_code = msg
                .params
                .get("dict_code")
                .map(|dict_code| dict_code.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "delete_dict_item", "dict_code is required", "400-params-error"))?;
            let value = msg.params.get("value").ok_or_else(|| funs.err().bad_request("ws", "delete_dict", "value is required", "400-params-error"))?;
            funs.begin().await?;
            tt_dict_process::delete_dict_item(dict_code, value, &funs, ctx).await?;
            funs.commit().await?;
            Ok(json!(true))
        }
        WsMessageKind::GetDictItem => {
            let dict_code = msg
                .params
                .get("dict_code")
                .map(|dict_code| dict_code.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "get_dict_item", "dict_code is required", "400-params-error"))?;
            let value = msg.params.get("value").ok_or_else(|| funs.err().bad_request("ws", "get_dict", "value is required", "400-params-error"))?;
            let resp = tt_dict_process::get_dict_item(dict_code, value, &funs, ctx).await?;
            Ok(TardisFuns::json.obj_to_json(&resp).expect("ignore"))
        }
        WsMessageKind::PaginateDictItems => {
            let dict_code = msg.params.get("dict_code").map(|dict_code| dict_code.as_str()).flatten();
            let value = msg.params.get("value");
            let page_number = msg.params.get("page_number").map(|page_number| page_number.as_u64()).flatten();
            let page_size = msg.params.get("page_size").map(|page_size| page_size.as_u64()).flatten();
            let desc_sort_by_create = msg.params.get("desc_sort_by_create").map(|desc_sort_by_create| desc_sort_by_create.as_bool()).flatten();
            let desc_sort_by_update = msg.params.get("desc_sort_by_update").map(|desc_sort_by_update| desc_sort_by_update.as_bool()).flatten();
            let resp = tt_dict_process::paginate_dict_items(dict_code, value, page_number, page_size, desc_sort_by_create, desc_sort_by_update, &funs, ctx).await?;
            Ok(TardisFuns::json.obj_to_json(&resp).expect("ignore"))
        }
        WsMessageKind::SortDictItems => {
            let dict_code = msg
                .params
                .get("dict_code")
                .map(|dict_code| dict_code.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "sort_dict_item", "dict_code is required", "400-params-error"))?;
            let left_item_value = msg
                .params
                .get("left_item_value")
                .map(|left_item_value| left_item_value.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "sort_dict_item", "left_item_value is required", "400-params-error"))?;
            let right_item_value = msg
                .params
                .get("right_item_value")
                .map(|right_item_value| right_item_value.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "sort_dict_item", "right_item_value is required", "400-params-error"))?;
            funs.begin().await?;
            tt_dict_process::sort_dict_items(dict_code, left_item_value, right_item_value, &funs, ctx).await?;
            funs.commit().await?;
            Ok(json!(true))
        }
        WsMessageKind::NewShare => {
            let body = TardisFuns::json.json_to_obj::<ShareNewReq>(msg.body)?;
            funs.begin().await?;
            tt_share_process::new_share(body, &funs, ctx).await?;
            funs.commit().await?;
            Ok(json!(true))
        }
        WsMessageKind::DeleteShare => {
            let body = TardisFuns::json.json_to_obj::<ShareDeleteReq>(msg.body)?;
            funs.begin().await?;
            tt_share_process::delete_share(body, &funs, ctx).await?;
            funs.commit().await?;
            Ok(json!(true))
        }
        WsMessageKind::NewData => {
            let table_id = msg
                .params
                .get("table_id")
                .map(|table_id| table_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "new_data", "table_id is required", "400-params-error"))?;
            let target_sort_value = msg.params.get("target_sort_value");
            let body = TardisFuns::json.json_to_obj::<Vec<HashMap<String, Value>>>(msg.body)?;
            funs.begin().await?;
            let resp = tt_data_process::new_data(table_id, body, target_sort_value, &funs, ctx).await?;
            funs.commit().await?;
            Ok(TardisFuns::json.obj_to_json(&resp).expect("ignore"))
        }
        WsMessageKind::CopyData => {
            let table_id = msg
                .params
                .get("table_id")
                .map(|table_id| table_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "copy_data", "table_id is required", "400-params-error"))?;
            let body = TardisFuns::json.json_to_obj::<Vec<Value>>(msg.body)?;
            funs.begin().await?;
            let resp = tt_data_process::copy_data(table_id, body, &funs, ctx).await?;
            funs.commit().await?;
            Ok(TardisFuns::json.obj_to_json(&resp).expect("ignore"))
        }
        WsMessageKind::ModifyData => {
            let table_id = msg
                .params
                .get("table_id")
                .map(|table_id| table_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "modify_data", "table_id is required", "400-params-error"))?;
            let body = TardisFuns::json.json_to_obj::<Vec<HashMap<String, Value>>>(msg.body)?;
            funs.begin().await?;
            let resp = tt_data_process::modify_data(table_id, body, &funs, ctx).await?;
            funs.commit().await?;
            Ok(TardisFuns::json.obj_to_json(&resp).expect("ignore"))
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
            tt_data_process::delete_data(table_id, body, &funs, ctx).await?;
            funs.commit().await?;
            Ok(json!(true))
        }
        WsMessageKind::SortData => {
            let table_id = msg
                .params
                .get("table_id")
                .map(|table_id| table_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "sort_data", "table_id is required", "400-params-error"))?;
            let target_sort_value = msg
                .params
                .get("target_sort_value")
                .map(|target_sort_value| target_sort_value.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "sort_data", "target_sort_value is required", "400-params-error"))?;
            let body = TardisFuns::json.json_to_obj::<Vec<Value>>(msg.body)?;
            funs.begin().await?;
            tt_data_process::sort_data(table_id, target_sort_value, body, &funs, ctx).await?;
            funs.commit().await?;
            Ok(json!(true))
        }
        WsMessageKind::LoadData => {
            let table_id = msg
                .params
                .get("table_id")
                .map(|table_id| table_id.as_str())
                .flatten()
                .ok_or_else(|| funs.err().bad_request("ws", "load_data", "table_id is required", "400-params-error"))?;
            let group = if let Some(group) = msg.params.get("group") {
                Some(TardisFuns::json.json_to_obj::<TableDataGroupProps>(group.clone())?)
            } else {
                None
            };
            let filters = if let Some(filters) = msg.params.get("filters") {
                Some(TardisFuns::json.json_to_obj::<Vec<TableDataFilterProps>>(filters.clone())?)
            } else {
                None
            };
            let sorts = if let Some(sorts) = msg.params.get("sorts") {
                Some(TardisFuns::json.json_to_obj::<Vec<TableDataSortProps>>(sorts.clone())?)
            } else {
                None
            };
            let aggs = if let Some(aggs) = msg.params.get("aggs") {
                Some(TardisFuns::json.json_to_obj::<HashMap<String, TableDataAggregateKind>>(aggs.clone())?)
            } else {
                None
            };
            let slice = if let Some(slice) = msg.params.get("slice") {
                Some(TardisFuns::json.json_to_obj::<TableDataSliceProps>(slice.clone())?)
            } else {
                None
            };
            let record_pks = if let Some(record_pks) = msg.params.get("record_pks") {
                Some(TardisFuns::json.json_to_obj::<Vec<Value>>(record_pks.clone())?)
            } else {
                None
            };
            if let Some(group) = group {
                let resp = tt_data_process::load_data_with_group(table_id, group, filters, sorts, aggs, slice, &funs, ctx).await?;
                Ok(TardisFuns::json.obj_to_json(&resp).expect("ignore"))
            } else {
                let resp = tt_data_process::load_data_without_group(table_id, filters, sorts, aggs, slice, record_pks, &funs, ctx).await?;
                Ok(TardisFuns::json.obj_to_json(&resp).expect("ignore"))
            }
        }
    }
}

#[derive(Deserialize, Serialize)]
pub struct WsMessage {
    pub params: HashMap<String, Value>,
    pub body: Value,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct TardisResp {
    pub code: String,
    pub data: Value,
}

impl TardisResp {
    pub fn ok(data: Value) -> TardisResp {
        TardisResp { code: "200".to_string(), data }
    }
}

#[derive(Serialize, Deserialize, PartialEq, Eq, Debug, EnumString)]
pub enum WsMessageKind {
    NewTable,
    ModifyTable,
    DeleteTable,
    GetTable,
    PaginateTables,
    NewLayout,
    ModifyLayout,
    DeleteLayout,
    GetLayout,
    FindLayouts,
    SortLayouts,
    NewOrModifyDictItem,
    DeleteDictItem,
    SortDictItems,
    GetDictItem,
    PaginateDictItems,
    NewShare,
    DeleteShare,
    NewData,
    CopyData,
    ModifyData,
    DeleteData,
    SortData,
    LoadData,
}
