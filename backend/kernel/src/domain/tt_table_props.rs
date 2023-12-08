use tardis::chrono::Utc;
use tardis::db::sea_orm;
use tardis::db::sea_orm::prelude::Json;
use tardis::db::sea_orm::*;
use tardis::{chrono, TardisCreateEntity, TardisEmptyBehavior, TardisEmptyRelation};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, TardisCreateEntity, TardisEmptyBehavior, TardisEmptyRelation)]
#[sea_orm(table_name = "tt_table_props")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub table_id: String,
    pub pk_column_name: String,
    pub parent_pk_column_name: String,
    pub columns: Json,
    pub layouts: Json,
    pub styles: Json,

    #[index]
    #[sea_orm(extra = "DEFAULT CURRENT_TIMESTAMP")]
    pub create_time: chrono::DateTime<Utc>,

    #[index]
    #[sea_orm(extra = "DEFAULT CURRENT_TIMESTAMP")]
    pub update_time: chrono::DateTime<Utc>,

    #[fill_ctx(own_paths)]
    pub own_paths: String,
    #[fill_ctx(owner)]
    pub owner: String,
}
