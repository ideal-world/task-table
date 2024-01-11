use tardis::basic::dto::TardisContext;
use tardis::chrono;
use tardis::chrono::Utc;
use tardis::db::reldb_client::TardisActiveModel;
use tardis::db::sea_orm::prelude::*;
use tardis::db::sea_orm::sea_query::{ColumnDef, Index};
use tardis::db::sea_orm::sea_query::{IndexCreateStatement, Table, TableCreateStatement};
use tardis::db::sea_orm::{self, DbBackend};

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "tt_share")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub table_id: String,
    #[sea_orm(primary_key, auto_increment = false)]
    pub owner: String,

    pub full_control: bool,

    pub create_time: chrono::DateTime<Utc>,
    pub update_time: chrono::DateTime<Utc>,
}

impl TardisActiveModel for ActiveModel {
    fn fill_ctx(&mut self, _: &TardisContext, _: bool) {}

    fn create_table_statement(_: DbBackend) -> TableCreateStatement {
        let mut builder = Table::create();
        builder
            .table(Entity.table_ref())
            .if_not_exists()
            .col(ColumnDef::new(Column::TableId).not_null().string())
            .col(ColumnDef::new(Column::Owner).not_null().string())
            .col(ColumnDef::new(Column::FullControl).not_null().boolean())
            .col(ColumnDef::new(Column::CreateTime).extra("DEFAULT CURRENT_TIMESTAMP".to_string()).timestamp_with_time_zone())
            .col(ColumnDef::new(Column::UpdateTime).extra("DEFAULT CURRENT_TIMESTAMP".to_string()).timestamp_with_time_zone())
            .primary_key(Index::create().if_not_exists().col(Column::TableId).col(Column::Owner));
        builder.to_owned()
    }

    fn create_index_statement() -> Vec<IndexCreateStatement> {
        vec![]
    }
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
