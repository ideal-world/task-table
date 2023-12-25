use tardis::db::sea_orm::sea_query::{Expr, Query};
use tardis::db::sea_orm::*;
use tardis::serde_json::Value;
use tardis::{
    basic::{dto::TardisContext, result::TardisResult},
    db::sea_orm::Set,
    TardisFunsInst,
};

use crate::domain::tt_dict;
use crate::dto::tt_dict_dtos::{TableDictAddOrModifyReq, TableDictInfo};

pub async fn add_dict(dict_code: &str, add_req: TableDictAddOrModifyReq, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<()> {
    if funs
        .db()
        .count(
            &Query::select()
                .columns(vec![tt_dict::Column::Value])
                .from(tt_dict::Entity)
                .and_where(Expr::col(tt_dict::Column::DictCode).eq(dict_code))
                .and_where(Expr::col(tt_dict::Column::Value).eq(add_req.value.clone())),
        )
        .await?
        > 0
    {
        return Err(funs.err().conflict(
            "dict",
            "add",
            &format!("dict.{}.{} already exist by {}", dict_code, add_req.value, ctx.owner),
            "409-already-exist",
        ));
    }

    let dict_domain = tt_dict::ActiveModel {
        title: Set(add_req.title),
        value: Set(add_req.value),
        color: Set(add_req.color),
        avatar: Set(add_req.avatar),
        dict_code: Set(dict_code.to_string()),
        ..Default::default()
    };
    funs.db().insert_one(dict_domain, ctx).await?;
    Ok(())
}

pub async fn modify_dict(dict_code: &str, modify_req: TableDictAddOrModifyReq, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<()> {
    let dict_domain = tt_dict::ActiveModel {
        title: Set(modify_req.title),
        value: Set(modify_req.value),
        color: Set(modify_req.color),
        avatar: Set(modify_req.avatar),
        dict_code: Set(dict_code.to_string()),
        ..Default::default()
    };
    funs.db().insert_one(dict_domain, ctx).await?;
    Ok(())
}

pub async fn delete_dict(dict_code: &str, value: &Value, funs: &TardisFunsInst, _ctx: &TardisContext) -> TardisResult<()> {
    funs.db()
        .execute(
            Query::delete()
                .from_table(tt_dict::Entity)
                .and_where(Expr::col(tt_dict::Column::DictCode).eq(dict_code))
                .and_where(Expr::col(tt_dict::Column::Value).eq(value.clone())),
        )
        .await?;
    Ok(())
}

pub async fn get_dict(dict_code: &str, value: &Value, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<TableDictInfo> {
    let mut query_statement = Query::select();
    query_statement
        .columns(vec![tt_dict::Column::Value, tt_dict::Column::Title, tt_dict::Column::Color, tt_dict::Column::Avatar])
        .from(tt_dict::Entity)
        .and_where(Expr::col(tt_dict::Column::DictCode).eq(dict_code))
        .and_where(Expr::col(tt_dict::Column::Value).eq(value.clone()));
    let query = funs.db().get_dto::<TableDictInfo>(&query_statement).await?;
    match query {
        Some(resp) => Ok(resp),
        None => Err(funs.err().not_found("dict", "get", &format!("dict.{}.{} not found by {}", dict_code, value, ctx.owner), "404-not-exist")),
    }
}

pub async fn find_dicts(dict_code: &str, funs: &TardisFunsInst, _ctx: &TardisContext) -> TardisResult<Vec<TableDictInfo>> {
    let mut query_statement = Query::select();
    query_statement.columns([tt_dict::Column::Value, tt_dict::Column::Title, tt_dict::Column::Color, tt_dict::Column::Avatar]).from(tt_dict::Entity);
    query_statement.and_where(Expr::col(tt_dict::Column::DictCode).eq(dict_code));
    funs.db().find_dtos::<TableDictInfo>(&query_statement).await
}

pub async fn paginate_dicts(
    page_number: u32,
    page_size: u32,
    desc_sort_by_create: Option<bool>,
    desc_sort_by_update: Option<bool>,
    funs: &TardisFunsInst,
    _ctx: &TardisContext,
) -> TardisResult<(Vec<TableDictInfo>, u64)> {
    let mut query_statement: sea_query::SelectStatement = Query::select();
    query_statement.columns([tt_dict::Column::Value, tt_dict::Column::Title, tt_dict::Column::Color, tt_dict::Column::Avatar]).from(tt_dict::Entity);
    if let Some(sort) = desc_sort_by_create {
        query_statement.order_by(tt_dict::Column::CreateTime, if sort { Order::Desc } else { Order::Asc });
    }
    if let Some(sort) = desc_sort_by_update {
        query_statement.order_by(tt_dict::Column::UpdateTime, if sort { Order::Desc } else { Order::Asc });
    }
    funs.db().paginate_dtos(&query_statement, page_number as u64, page_size as u64).await
}
