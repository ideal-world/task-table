use tardis::chrono::Utc;
use tardis::db::sea_orm;
use tardis::db::sea_orm::prelude::*;
use tardis::{chrono, TardisCreateEntity, TardisEmptyBehavior, TardisEmptyRelation};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, TardisCreateEntity, TardisEmptyBehavior, TardisEmptyRelation)]
#[sea_orm(table_name = "tt_share")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub table_id: String,
    #[sea_orm(primary_key, auto_increment = false)]
    pub owner: String,

    pub full_control: bool,

    #[index]
    #[sea_orm(extra = "DEFAULT CURRENT_TIMESTAMP")]
    pub create_time: chrono::DateTime<Utc>,

    #[index]
    #[sea_orm(extra = "DEFAULT CURRENT_TIMESTAMP")]
    pub update_time: chrono::DateTime<Utc>,
}
