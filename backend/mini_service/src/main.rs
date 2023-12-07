use std::env;

use tardis::basic::result::TardisResult;
use tardis::tokio;
use tardis::TardisFuns;

///
/// Visit: http://127.0.0.1:8089/echo
/// Visit: http://127.0.0.1:8089/broadcast
///
#[tokio::main]
async fn main() -> TardisResult<()> {
    env::set_var("RUST_LOG", "info,tardis=trace");
    env::set_var("PROFILE", "default");
    // Initial configuration
    TardisFuns::init(Some("config")).await?;

    Ok(())
}
