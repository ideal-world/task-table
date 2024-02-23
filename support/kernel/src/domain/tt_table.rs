use tardis::basic::dto::TardisContext;
use tardis::chrono;
use tardis::chrono::Utc;
use tardis::db::reldb_client::TardisActiveModel;
use tardis::db::sea_orm::sea_query::{ColumnDef, Index};
use tardis::db::sea_orm::sea_query::{IndexCreateStatement, Table, TableCreateStatement};
use tardis::db::sea_orm::{self, DbBackend};
use tardis::db::sea_orm::{prelude::*, Set};
use crate::dto::tt_layout_dtos::TableLayoutProps;
use crate::dto::tt_table_dtos::TableColumnProps;
use crate::dto::tt_table_dtos::TableStyleProps;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "tt_table")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: String,
    pub pk_column_name: String,
    pub parent_pk_column_name: Option<String>,
    pub free_sort_column_name: Option<String>,
    #[sea_orm(column_type = "JsonBinary")]
    pub columns: Vec<TableColumnProps>,
    #[sea_orm(column_type = "JsonBinary")]
    pub layouts: Option<Vec<TableLayoutProps>>,
    #[sea_orm(column_type = "JsonBinary")]
    pub styles: Option<TableStyleProps>,

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
            .col(ColumnDef::new(Column::Id).not_null().string())
            .col(ColumnDef::new(Column::PkColumnName).not_null().string())
            .col(ColumnDef::new(Column::ParentPkColumnName).string())
            .col(ColumnDef::new(Column::FreeSortColumnName).string())
            .col(ColumnDef::new(Column::Columns).not_null().json_binary())
            .col(ColumnDef::new(Column::Layouts).json_binary())
            .col(ColumnDef::new(Column::Styles).json_binary())
            .col(ColumnDef::new(Column::Owner).string())
            .col(ColumnDef::new(Column::CreateTime).extra("DEFAULT CURRENT_TIMESTAMP".to_string()).timestamp_with_time_zone())
            .col(ColumnDef::new(Column::UpdateTime).extra("DEFAULT CURRENT_TIMESTAMP".to_string()).timestamp_with_time_zone())
            .primary_key(Index::create().if_not_exists().col(Column::Id));
        builder.to_owned()
    }

    fn create_index_statement() -> Vec<IndexCreateStatement> {
        vec![
            Index::create().if_not_exists().name(&format!("idx-{}-{}", Entity.table_name(), Column::CreateTime.to_string())).table(Entity).col(Column::CreateTime).to_owned(),
            Index::create().if_not_exists().name(&format!("idx-{}-{}", Entity.table_name(), Column::UpdateTime.to_string())).table(Entity).col(Column::UpdateTime).to_owned(),
        ]
    }
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
