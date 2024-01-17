mod processor;

use std::env;

use crate::processor::WsProcessor;
use tardis::basic::result::TardisResult;
use tardis::tokio;
use tardis::web::web_server::WebServerModule;
use tardis::TardisFuns;
use tardis::web::ws_processor::TardisWebsocketMgrMessage;

#[tokio::main]
async fn main() -> TardisResult<()> {
    env::set_var("PROFILE", "default");
    TardisFuns::init(Some("config")).await?;

    task_table_kernel::initializer::init().await?;

    TardisFuns::web_server().add_route(WebServerModule::from(WsProcessor).with_ws::<TardisWebsocketMgrMessage>(100)).await.start().await?;
    TardisFuns::web_server().await;
    Ok(())
}
