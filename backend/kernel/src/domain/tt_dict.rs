use tardis::chrono::Utc;
use tardis::db::sea_orm;
use tardis::db::sea_orm::prelude::*;
use tardis::db::sea_orm::*;
use tardis::{chrono, TardisCreateEntity, TardisEmptyBehavior, TardisEmptyRelation};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, TardisCreateEntity, TardisEmptyBehavior, TardisEmptyRelation)]
#[sea_orm(table_name = "tt_dict")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub dict_code: String,
    #[sea_orm(primary_key, auto_increment = false)]
    pub value: Json,
    pub title: String,
    pub color: Option<String>,
    pub avatar: Option<String>,

    #[sea_orm(extra = "DEFAULT CURRENT_TIMESTAMP")]
    pub create_time: chrono::DateTime<Utc>,
    #[sea_orm(extra = "DEFAULT CURRENT_TIMESTAMP")]
    pub update_time: chrono::DateTime<Utc>,

    #[fill_ctx(owner)]
    pub owner: String,
}
