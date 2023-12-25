use tardis::db::sea_orm::*;
use tardis::{
    basic::{dto::TardisContext, result::TardisResult},
    db::sea_orm::sea_query::{Expr, Query, SelectStatement},
    TardisFunsInst,
};

use crate::{
    domain::{tt_share, tt_table},
    dto::tt_share_dtos::{ShareAddReq, ShareDeleteReq},
};

use super::{tt_basic_process, tt_table_process};

pub async fn add_share(add_req: ShareAddReq, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<()> {
    tt_basic_process::check_owner(&add_req.table_id, &tt_table_process::get_table_name(), funs, ctx).await?;
    delete_share(
        ShareDeleteReq {
            table_id: add_req.table_id.clone(),
            owner: add_req.owner.clone(),
        },
        funs,
        ctx,
    )
    .await?;
    let share_domain = tt_share::ActiveModel {
        table_id: Set(add_req.table_id),
        owner: Set(add_req.owner),
        full_control: Set(add_req.full_control),
        ..Default::default()
    };
    funs.db().insert_one(share_domain, ctx).await?;
    Ok(())
}

pub async fn delete_share(delete_req: ShareDeleteReq, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<()> {
    tt_basic_process::check_owner(&delete_req.table_id, &tt_table_process::get_table_name(), funs, ctx).await?;
    funs.db()
        .execute(
            Query::delete()
                .from_table(tt_share::Entity)
                .and_where(Expr::col(tt_share::Column::TableId).eq(delete_req.table_id))
                .and_where(Expr::col(tt_share::Column::Owner).eq(delete_req.owner)),
        )
        .await?;
    Ok(())
}

pub async fn check_share_full_control(table_id: &str, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<()> {
    if funs.db().count(&package_share_query(table_id, Some(true), ctx)).await? == 0 {
        return Err(funs.err().unauthorized("share", "check", &format!("table.{} share is illegal by {}", table_id, ctx.owner), "401-share-illegal"));
    }
    Ok(())
}

pub async fn check_share(table_id: &str, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<()> {
    if funs.db().count(&package_share_query(table_id, None, ctx)).await? == 0 {
        return Err(funs.err().unauthorized("share", "check", &format!("table.{} share is illegal by {}", table_id, ctx.owner), "401-share-illegal"));
    }
    Ok(())
}

fn package_share_query(table_id: &str, full_control: Option<bool>, ctx: &TardisContext) -> SelectStatement {
    let mut query = Query::select();
    query
        .column((tt_share::Entity, tt_share::Column::TableId))
        .from(tt_share::Entity)
        .and_where(Expr::col((tt_share::Entity, tt_share::Column::TableId)).eq(table_id.to_string()))
        .and_where(Expr::col((tt_share::Entity, tt_share::Column::Owner)).eq(ctx.owner.to_string()));
    if full_control.is_some() && full_control.unwrap() {
        query.and_where(Expr::col((tt_share::Entity, tt_share::Column::FullControl)).eq(true));
    }
    query
}

pub fn with_share_filter(mut query: SelectStatement, ctx: &TardisContext) -> SelectStatement {
    query
        .inner_join(
            tt_share::Entity,
            Expr::col((tt_share::Entity, tt_share::Column::TableId)).equals((tt_table::Entity, tt_table::Column::Id)),
        )
        .and_where(Expr::col((tt_share::Entity, tt_share::Column::Owner)).eq(ctx.owner.to_string()));
    query
}
