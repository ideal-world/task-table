use tardis::{basic::result::TardisResult, db::reldb_client::TardisActiveModel};
use tardis::TardisFuns;

use crate::domain::{tt_table, tt_share, tt_dict};

pub async fn init() -> TardisResult<()> {
    let db_kind = TardisFuns::reldb_by_module_or_default("").backend();
    let mut tx = TardisFuns::reldb_by_module_or_default("").conn();
    let compatible_type = TardisFuns::reldb_by_module_or_default("").compatible_type();
    tx.begin().await?;
    tx.init(tt_table::ActiveModel::init(db_kind, Some("update_time"), compatible_type)).await?;
    tx.init(tt_share::ActiveModel::init(db_kind, Some("update_time"), compatible_type)).await?;
    tx.init(tt_dict::ActiveModel::init(db_kind, Some("update_time"), compatible_type)).await?;
    tx.commit().await?;
    Ok(())
}
