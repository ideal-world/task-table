use tardis::basic::dto::TardisContext;
use tardis::chrono;
use tardis::chrono::Utc;
use tardis::db::reldb_client::TardisActiveModel;
use tardis::db::sea_orm::sea_query::{ColumnDef, Index};
use tardis::db::sea_orm::sea_query::{IndexCreateStatement, Table, TableCreateStatement};
use tardis::db::sea_orm::{self, DbBackend};
use tardis::db::sea_orm::{prelude::*, Set};
#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "tt_dict")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub dict_code: String,
    #[sea_orm(primary_key, auto_increment = false)]
    pub value: Json,
    pub title: String,
    pub color: String,
    pub avatar: String,

    pub create_time: chrono::DateTime<Utc>,
    pub update_time: chrono::DateTime<Utc>,

    pub owner: String,
}

impl TardisActiveModel for ActiveModel {
    fn fill_ctx(&mut self, ctx: &TardisContext, is_insert: bool) {
        if is_insert {
            self.owner = Set(ctx.owner.clone());
        }
    }

    fn create_table_statement(_: DbBackend) -> TableCreateStatement {
        let mut builder = Table::create();
        builder
            .table(Entity.table_ref())
            .if_not_exists()
            .col(ColumnDef::new(Column::DictCode).not_null().string())
            .col(ColumnDef::new(Column::Value).not_null().json_binary())
            .col(ColumnDef::new(Column::Title).string())
            .col(ColumnDef::new(Column::Color).string())
            .col(ColumnDef::new(Column::Avatar).string())
            .col(ColumnDef::new(Column::Owner).string())
            .col(ColumnDef::new(Column::CreateTime).extra("DEFAULT CURRENT_TIMESTAMP".to_string()).timestamp_with_time_zone())
            .col(ColumnDef::new(Column::UpdateTime).extra("DEFAULT CURRENT_TIMESTAMP".to_string()).timestamp_with_time_zone())
            .primary_key(Index::create().col(Column::DictCode).col(Column::Value));
        builder.to_owned()
    }

    fn create_index_statement() -> Vec<IndexCreateStatement> {
        vec![]
    }
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
