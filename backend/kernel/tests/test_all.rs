use std::env;

use tardis::basic::result::TardisResult;
use tardis::test::test_container::TardisTestContainer;
use tardis::{testcontainers, tokio, TardisFuns};
use task_table_kernel::initializer;

mod test_table;
mod test_layout;
mod test_data;

#[tokio::test]
async fn test_all() -> TardisResult<()> {
    env::set_var("RUST_LOG", "debug,test_all=trace,sqlx=off");
    let docker = testcontainers::clients::Cli::default();
    let reldb_container = TardisTestContainer::postgres_custom(None, &docker);
    let port = reldb_container.get_host_port_ipv4(5432);
    let url = format!("postgres://postgres:123456@localhost:{port}/test");
    env::set_var("TARDIS_FW.DB.URL", url);

    TardisFuns::init(Some("tests/config")).await?;

    initializer::init().await?;

    let table_id = test_table::test().await?;
    let _layout_id = test_layout::test(&table_id).await?;
    test_data::test(&table_id).await?;
    
    Ok(())
}
