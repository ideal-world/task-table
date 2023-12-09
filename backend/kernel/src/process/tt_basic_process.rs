use lazy_static::lazy_static;
use tardis::{
    basic::{dto::TardisContext, result::TardisResult},
    db::sea_orm::sea_query::{Alias, Expr, Query, SelectStatement},
    TardisFunsInst,
};

use crate::dto::tt_basic_dtos::RbumBasicFilterReq;

lazy_static! {
    pub static ref ID_FIELD: Alias = Alias::new("id");
    pub static ref NAME_FIELD: Alias = Alias::new("name");
    pub static ref OWNER_FIELD: Alias = Alias::new("owner");
    pub static ref CREATE_TIME_FIELD: Alias = Alias::new("create_time");
    pub static ref UPDATE_TIME_FIELD: Alias = Alias::new("update_time");
}

pub async fn check_owner(id: &str, table_name: &str, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<()> {
    if funs
        .db()
        .count(
            &Query::select()
                .column(ID_FIELD.clone())
                .from(Alias::new(table_name))
                .and_where(Expr::col(ID_FIELD.clone()).eq(id))
                .and_where(Expr::col(OWNER_FIELD.clone()).eq(&ctx.owner)),
        )
        .await?
        == 0
    {
        return Err(funs.err().unauthorized(
            table_name,
            "check",
            &format!("owner {}.{} is illegal by {}", table_name, id, ctx.owner),
            "401-owner-illegal",
        ));
    }
    Ok(())
}

pub fn with_filter(mut query: SelectStatement, table_name: &str, filter: &RbumBasicFilterReq, ctx: &TardisContext) -> SelectStatement {
    if filter.rel_ctx_owner {
        query.and_where(Expr::col((Alias::new(table_name), OWNER_FIELD.clone())).eq(ctx.owner.as_str()));
    }
    if let Some(ids) = &filter.ids {
        query.and_where(Expr::col((Alias::new(table_name), ID_FIELD.clone())).is_in(ids.clone()));
    }
    if let Some(name) = &filter.name {
        query.and_where(Expr::col((Alias::new(table_name), NAME_FIELD.clone())).like(format!("%{name}%").as_str()));
    }
    if let Some(names) = &filter.names {
        query.and_where(Expr::col((Alias::new(table_name), NAME_FIELD.clone())).is_in(names.clone()));
    }
    query
}
