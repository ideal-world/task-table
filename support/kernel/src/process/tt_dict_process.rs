use tardis::db::sea_orm::sea_query::{Expr, Query};
use tardis::db::sea_orm::*;
use tardis::serde_json::Value;
use tardis::{
    basic::{dto::TardisContext, result::TardisResult},
    db::sea_orm::Set,
    TardisFunsInst,
};

use crate::domain::tt_dict;
use crate::dto::tt_dict_dtos::{TableDictInfo, TableDictItemsResp, TableDictNewOrModifyReq};

pub async fn new_or_modify_dict_item(dict_code: &str, new_or_modify_req: TableDictNewOrModifyReq, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<()> {
    if funs
        .db()
        .count(
            Query::select()
                .columns(vec![tt_dict::Column::Value])
                .from(tt_dict::Entity)
                .and_where(Expr::col(tt_dict::Column::DictCode).eq(dict_code))
                .and_where(Expr::col(tt_dict::Column::Value).eq(new_or_modify_req.value.clone())),
        )
        .await?
        == 0
    {
        let dict_domain = tt_dict::ActiveModel {
            title: Set(new_or_modify_req.title),
            value: Set(new_or_modify_req.value),
            color: Set(new_or_modify_req.color.unwrap_or("".to_string())),
            avatar: Set(new_or_modify_req.avatar.unwrap_or("".to_string())),
            dict_code: Set(dict_code.to_string()),
            ..Default::default()
        };
        funs.db().insert_one(dict_domain, ctx).await?;
    } else {
        let mut dict_domain = tt_dict::ActiveModel {
            dict_code: Set(dict_code.to_string()),
            value: Set(new_or_modify_req.value),
            title: Set(new_or_modify_req.title),
            ..Default::default()
        };
        if let Some(color) = new_or_modify_req.color {
            dict_domain.color = Set(color);
        }
        if let Some(avatar) = new_or_modify_req.avatar {
            dict_domain.avatar = Set(avatar);
        }
        funs.db().update_one(dict_domain, ctx).await?;
    }
    Ok(())
}

pub async fn delete_dict_item(dict_code: &str, value: &Value, funs: &TardisFunsInst, _ctx: &TardisContext) -> TardisResult<()> {
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

pub async fn get_dict_item(dict_code: &str, value: &Value, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<TableDictInfo> {
    let mut query_statement = Query::select();
    query_statement
        .columns(vec![
            tt_dict::Column::DictCode,
            tt_dict::Column::Value,
            tt_dict::Column::Title,
            tt_dict::Column::Color,
            tt_dict::Column::Avatar,
        ])
        .from(tt_dict::Entity)
        .and_where(Expr::col(tt_dict::Column::DictCode).eq(dict_code))
        .and_where(Expr::col(tt_dict::Column::Value).eq(value.clone()));
    let query = funs.db().get_dto::<TableDictInfo>(&query_statement).await?;
    match query {
        Some(resp) => Ok(resp),
        None => Err(funs.err().not_found("dict", "get", &format!("dict.{}.{} not found by {}", dict_code, value, ctx.owner), "404-not-exist")),
    }
}

pub async fn find_dict_items(dict_code: String, values: Vec<Value>, funs: &TardisFunsInst, _ctx: &TardisContext) -> TardisResult<Vec<TableDictInfo>> {
    let mut query_statement = Query::select();
    query_statement
        .columns(vec![
            tt_dict::Column::DictCode,
            tt_dict::Column::Value,
            tt_dict::Column::Title,
            tt_dict::Column::Color,
            tt_dict::Column::Avatar,
        ])
        .from(tt_dict::Entity)
        .and_where(Expr::col(tt_dict::Column::DictCode).eq(dict_code))
        .and_where(Expr::col(tt_dict::Column::Value).is_in(values));
    funs.db().find_dtos::<TableDictInfo>(&query_statement).await
}

pub async fn find_all_dict_items(dict_code: &str, funs: &TardisFunsInst, _ctx: &TardisContext) -> TardisResult<Vec<TableDictInfo>> {
    let mut query_statement = Query::select();
    query_statement
        .columns([
            tt_dict::Column::DictCode,
            tt_dict::Column::Value,
            tt_dict::Column::Title,
            tt_dict::Column::Color,
            tt_dict::Column::Avatar,
        ])
        .from(tt_dict::Entity);
    query_statement.and_where(Expr::col(tt_dict::Column::DictCode).eq(dict_code));
    funs.db().find_dtos::<TableDictInfo>(&query_statement).await
}

pub async fn paginate_dict_items(
    dict_code: Option<&str>,
    value: Option<&Value>,
    page_number: Option<u64>,
    page_size: Option<u64>,
    desc_sort_by_create: Option<bool>,
    desc_sort_by_update: Option<bool>,
    funs: &TardisFunsInst,
    _ctx: &TardisContext,
) -> TardisResult<TableDictItemsResp> {
    let mut query_statement: sea_query::SelectStatement = Query::select();
    query_statement
        .columns([
            tt_dict::Column::DictCode,
            tt_dict::Column::Value,
            tt_dict::Column::Title,
            tt_dict::Column::Color,
            tt_dict::Column::Avatar,
        ])
        .from(tt_dict::Entity);
    if let Some(dict_code) = dict_code {
        query_statement.and_where(Expr::col(tt_dict::Column::DictCode).eq(dict_code));
    }
    if let Some(value) = value {
        query_statement.and_where(Expr::col(tt_dict::Column::Value).like(format!("%{}%", value)));
    }
    if let Some(sort) = desc_sort_by_create {
        query_statement.order_by(tt_dict::Column::CreateTime, if sort { Order::Desc } else { Order::Asc });
    }
    if let Some(sort) = desc_sort_by_update {
        query_statement.order_by(tt_dict::Column::UpdateTime, if sort { Order::Desc } else { Order::Asc });
    }
    if page_number.is_some() && page_size.is_some() {
        let resp = funs.db().paginate_dtos(&query_statement, page_number.expect("ignore"), page_size.expect("ignore")).await?;
        Ok(TableDictItemsResp {
            total_number: resp.1 as i32,
            records: resp.0,
        })
    } else {
        let resp = funs.db().find_dtos(&query_statement).await?;
        Ok(TableDictItemsResp {
            total_number: resp.len() as i32,
            records: resp,
        })
    }
}

pub async fn sort_dict_items(dict_code: &str, left_item_value: &str, right_item_value: &str, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<()> {
    // TODO
    Ok(())
}
