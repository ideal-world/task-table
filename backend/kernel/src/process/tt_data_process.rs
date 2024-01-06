use std::{collections::HashMap, str::FromStr};

use tardis::chrono::{NaiveDate, NaiveTime};
use tardis::db::sea_orm::prelude::DateTimeWithTimeZone;
use tardis::db::sea_orm::QueryResult;
use tardis::log::warn;
use tardis::{
    basic::{dto::TardisContext, result::TardisResult},
    db::sea_orm::{
        prelude::Decimal,
        sea_query::{self, ArrayType},
    },
    futures_util::future::join_all,
    serde_json::{self, json, Value},
    TardisFuns, TardisFunsInst,
};

use crate::{
    dto::tt_data_dtos::{TableDataFilterItemReq, TableDataOperatorKind},
    process::tt_table_process,
};
use crate::{
    dto::{
        tt_data_dtos::{TableDataAggregateKind, TableDataFilterReq, TableDataGroupReq, TableDataGroupResp, TableDataResp, TableDataSliceReq, TableDataSortReq},
        tt_table_dtos::{TableColumnDataKind, TableColumnProps},
    },
    process::tt_table_process::INST_PREFIX,
};

pub async fn add_or_modify_data(
    table_id: &str,
    changed_records: Vec<HashMap<String, Value>>,
    funs: &TardisFunsInst,
    ctx: &TardisContext,
) -> TardisResult<Vec<HashMap<String, Value>>> {
    let table_columns = tt_table_process::get_table_columns(table_id, funs, ctx).await?;
    let columns = table_columns.columns();
    if changed_records.len() == 0 {
        return Ok(Vec::new());
    }
    let changed_column_names = &changed_records[0].keys().map(|k| k.clone()).collect::<Vec<String>>();

    if changed_column_names.iter().any(|column_name| !columns.iter().any(|col| &col.name == column_name)) {
        return Err(funs.err().conflict("table", "add_or_modify_data", &format!("Table.{} column name illegal", table_id), "409-keys-illegal"));
    }
    if changed_records.len() > 1 {
        for record in &changed_records {
            if record.len() != changed_column_names.len() || record.keys().any(|k| !changed_column_names.contains(k)) {
                return Err(funs.err().conflict("table", "add_or_modify_data", &format!("Table.{} column name not same", table_id), "409-keys-not-same"));
            }
        }
    }

    if changed_column_names.contains(&table_columns.pk_column_name) {
        // modify
        let pks: Vec<Value> = changed_records.iter().map(|record| record.get(&table_columns.pk_column_name).expect("ignore").clone()).collect::<Vec<Value>>();

        let params = changed_records
            .into_iter()
            .map(|mut record| {
                changed_column_names
                    .iter()
                    .filter(|column_name| column_name != &&table_columns.pk_column_name)
                    .map(|column_name| get_and_convert_to_db_value(column_name, &mut record, &columns, funs))
                    .collect::<TardisResult<Vec<sea_query::Value>>>()
            })
            .collect::<TardisResult<Vec<Vec<sea_query::Value>>>>()?;

        let update_sql = format!(
            r#"UPDATE {}_{} SET {} WHERE {} = $1"#,
            INST_PREFIX,
            table_id,
            changed_column_names
                .iter()
                .filter(|column_name| column_name != &&table_columns.pk_column_name)
                .enumerate()
                .map(|(idx, column_name)| format!("{} = ${}", column_name, idx + 2))
                .collect::<Vec<String>>()
                .join(", "),
            table_columns.pk_column_name
        );
        funs.db().execute_many(&update_sql, params).await?;
        let modify_records = load_data_without_group(table_id, None, None, None, None, Some(pks), funs, ctx).await?;
        Ok(modify_records.records)
    } else {
        let max_seq = funs
            .db()
            .query_one(
                &format!(
                    "SELECT setval('{}_{}_{}_seq', nextval('{}_{}_{}_seq') + {} -1, true)",
                    INST_PREFIX,
                    table_id,
                    table_columns.pk_column_name,
                    INST_PREFIX,
                    table_id,
                    table_columns.pk_column_name,
                    changed_records.len()
                ),
                Vec::new(),
            )
            .await?
            .expect("ignore")
            .try_get::<i64>("", "setval")
            .expect("ignore");
        let min_seq = max_seq - changed_records.len() as i64 + 1;
        let pks: Vec<Value> = (min_seq..=max_seq).map(|pk| json!(pk)).collect();

        let params = changed_records
            .into_iter()
            .enumerate()
            .map(|(idx, mut record)| {
                let mut params: Vec<TardisResult<sea_query::Value>> = Vec::new();
                params.push(Ok(sea_query::Value::BigInt(Some(min_seq + idx as i64))));
                changed_column_names.iter().for_each(|k| {
                    params.push(get_and_convert_to_db_value(k, &mut record, &columns, funs));
                });
                params.into_iter().collect::<TardisResult<Vec<sea_query::Value>>>()
            })
            .collect::<TardisResult<Vec<Vec<sea_query::Value>>>>()?;
        let insert_sql = format!(
            r#"INSERT INTO {}_{} ({}, {}) VALUES ($1, {})"#,
            INST_PREFIX,
            table_id,
            table_columns.pk_column_name,
            changed_column_names.join(", "),
            changed_column_names.iter().enumerate().map(|(idx, _)| format!("${}", idx + 2)).collect::<Vec<String>>().join(", "),
        );
        funs.db().execute_many(&insert_sql, params).await?;
        let modify_records = load_data_without_group(table_id, None, None, None, None, Some(pks), funs, ctx).await?;
        Ok(modify_records.records)
    }
}

pub async fn delete_data(table_id: &str, deleted_pks: Vec<Value>, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<()> {
    let table_columns = tt_table_process::get_table_columns(table_id, funs, ctx).await?;
    let columns = table_columns.columns();

    let params = deleted_pks
        .into_iter()
        .map(|pk_value| vec![convert_to_db_value(&table_columns.pk_column_name, pk_value, &columns, funs)].into_iter().collect::<TardisResult<Vec<sea_query::Value>>>())
        .collect::<TardisResult<Vec<Vec<sea_query::Value>>>>()?;
    let delete_sql = format!(r#"DELETE FROM {}_{} WHERE {} = $1"#, INST_PREFIX, table_id, table_columns.pk_column_name,);
    funs.db().execute_many(&delete_sql, params).await
}

pub async fn load_data_with_group(
    table_id: &str,
    group: TableDataGroupReq,
    filters: Option<Vec<TableDataFilterReq>>,
    sorts: Option<Vec<TableDataSortReq>>,
    mut aggs: Option<HashMap<String, TableDataAggregateKind>>,
    slice: Option<TableDataSliceReq>,
    funs: &TardisFunsInst,
    ctx: &TardisContext,
) -> TardisResult<Vec<TableDataGroupResp>> {
    let table_columns = tt_table_process::get_table_columns(table_id, funs, ctx).await?;
    let columns = table_columns.columns();

    if group.column_names.iter().any(|group_column_name| !columns.iter().any(|col| &col.name == group_column_name)) {
        return Err(funs.err().conflict(
            "table",
            "load_data_group",
            &format!("Table.{} group column name illegal", table_id),
            "409-column-name-illegal",
        ));
    }

    let mut params: Vec<TardisResult<sea_query::Value>> = Vec::new();
    let where_sql = package_where_sql(filters, &mut params, &columns, funs)?;
    let sort_sql = package_sort_sql(sorts, &columns, table_id, funs)?;
    let limit_sql = package_limit_sql(slice)?;

    let group_select_sql = group.column_names.join(", ");
    let group_by_sql = format!("GROUP BY {}", group.column_names.join(", "));

    if aggs.is_none() {
        aggs = Some(HashMap::new());
    }
    let aggs = aggs.as_mut().unwrap();
    let aggs_sql = package_aggs_sql(Some(aggs), &table_columns.pk_column_name, &columns, table_id, funs)?;

    let group_sql = format!(
        r#"SELECT {}, {} FROM {}_{} WHERE {} {} {} {}"#,
        group_select_sql, aggs_sql, INST_PREFIX, table_id, where_sql, sort_sql, group_by_sql, limit_sql
    );
    let group_result = funs.db().query_all(&group_sql, params.clone().into_iter().collect::<TardisResult<Vec<sea_query::Value>>>()?).await?;
    let mut group_records = group_result
        .into_iter()
        .map(|row| {
            let mut record = HashMap::new();
            for column in &columns {
                record.insert(
                    column.name.clone(),
                    row.try_get::<Value>(
                        "",
                        &format!("{}_{}", TardisFuns::json.obj_to_string(&aggs.get(&column.name).unwrap()).unwrap(), column.name),
                    )
                    .unwrap(),
                );
            }
            record
        })
        .collect::<Vec<HashMap<String, Value>>>();

    if group.hide_empty_record {
        group_records = group_records.into_iter().filter(|record| record.get(&table_columns.pk_column_name).unwrap().as_i64().unwrap() != 0 as i64).collect();
    }

    if group.group_order_desc {
        group_records.reverse();
    }

    let result = join_all(
        group_records
            .into_iter()
            .map(|group_record| {
                let mut group_params = params.clone();
                let group_where_sql = group
                    .column_names
                    .iter()
                    .map(|group_column_name| {
                        group_params.push(Ok(sea_query::Value::Double(Some(group_record.get(group_column_name).unwrap().as_f64().unwrap()))));
                        format!("{} = ${}", group_column_name, params.len() + 1)
                    })
                    .collect::<Vec<String>>()
                    .join(" AND ");
                let select_sql = format!(
                    r#"SELECT * FROM {}_{} WHERE ({}) AND  {} {} {}"#,
                    INST_PREFIX, table_id, where_sql, group_where_sql, sort_sql, limit_sql
                );
                (
                    group_record.get(&table_columns.pk_column_name).unwrap().as_i64().unwrap() as i32,
                    group.column_names.iter().map(|group_column_name| group_record.get(group_column_name).unwrap().to_string()).collect::<Vec<String>>().join("-"),
                    aggs.iter().map(|(column_name, _)| (column_name.to_string(), group_record.get(column_name).unwrap().clone())).collect::<HashMap<String, Value>>(),
                    columns.iter().map(|column| column.name.clone()).collect::<Vec<_>>(),
                    select_sql,
                    group_params.into_iter().collect::<TardisResult<Vec<sea_query::Value>>>().unwrap(),
                )
            })
            .map(|(total_number, group_value, aggs, column_names, select_sql, group_params)| async move {
                let result = funs.db().query_all(&select_sql, group_params).await.unwrap();
                let records = result
                    .into_iter()
                    .map(|row| {
                        let mut record = HashMap::new();
                        for column_name in &column_names {
                            record.insert(column_name.to_string(), row.try_get::<Value>("", column_name).unwrap());
                        }
                        record
                    })
                    .collect::<Vec<HashMap<String, Value>>>();
                TableDataGroupResp {
                    records,
                    total_number,
                    group_value,
                    aggs,
                }
            })
            .collect::<Vec<_>>(),
    )
    .await;

    Ok(result)
}

pub async fn load_data_without_group(
    table_id: &str,
    mut filters: Option<Vec<TableDataFilterReq>>,
    sorts: Option<Vec<TableDataSortReq>>,
    aggs: Option<HashMap<String, TableDataAggregateKind>>,
    slice: Option<TableDataSliceReq>,
    record_pks: Option<Vec<Value>>,
    funs: &TardisFunsInst,
    ctx: &TardisContext,
) -> TardisResult<TableDataResp> {
    let table_columns = tt_table_process::get_table_columns(table_id, funs, ctx).await?;
    let columns = table_columns.columns();

    if let Some(record_pks) = record_pks {
        if filters.is_none() {
            filters = Some(Vec::new())
        }
        filters.as_mut().expect("ignore").push(TableDataFilterReq {
            items: vec![TableDataFilterItemReq {
                column_name: table_columns.pk_column_name.clone(),
                operator: TableDataOperatorKind::In,
                value: Some(json!(record_pks)),
            }],
            and: false,
        })
    }

    let mut params: Vec<TardisResult<sea_query::Value>> = Vec::new();
    let where_sql = package_where_sql(filters, &mut params, &columns, funs)?;
    let sort_sql = package_sort_sql(sorts, &columns, table_id, funs)?;
    let limit_sql = package_limit_sql(slice)?;

    // query
    let select_sql = format!(r#"SELECT * FROM {}_{} WHERE {} {} {}"#, INST_PREFIX, table_id, where_sql, sort_sql, limit_sql);
    let total_number = funs.db().count_by_sql(&select_sql, params.clone().into_iter().collect::<TardisResult<Vec<sea_query::Value>>>()?).await?;
    let result = funs.db().query_all(&select_sql, params.clone().into_iter().collect::<TardisResult<Vec<sea_query::Value>>>()?).await?;
    let records = result
        .into_iter()
        .map(|row| {
            columns
                .iter()
                .map(|column| match convert_to_json_value(&column.name, &row, &columns, funs) {
                    Ok(val) => (column.name.clone(), val),
                    Err(err) => {
                        warn!("convert_to_json_value error: {}", err);
                        (column.name.clone(), json!(null))
                    }
                })
                .collect::<HashMap<String, Value>>()
        })
        .collect::<Vec<HashMap<String, Value>>>();

    // aggs
    let aggs = if let Some(mut aggs) = aggs {
        let aggs_sql = package_aggs_sql(Some(&mut aggs), &table_columns.pk_column_name, &columns, table_id, funs)?;
        let agg_result = funs
            .db()
            .query_one(
                &format!(r#"SELECT {} FROM {}_{} WHERE {}"#, aggs_sql, INST_PREFIX, table_id, where_sql),
                params.into_iter().collect::<TardisResult<Vec<sea_query::Value>>>()?,
            )
            .await?
            .unwrap();

        let mut aggs_result = HashMap::new();
        for (column_name, agg_kind) in &aggs {
            aggs_result.insert(
                column_name.clone(),
                agg_result.try_get::<Value>("", &format!("{}_{}", TardisFuns::json.obj_to_string(&agg_kind)?, column_name)).unwrap(),
            );
        }
        aggs_result
    } else {
        HashMap::new()
    };

    Ok(TableDataResp {
        records,
        aggs,
        total_number: total_number as i32,
    })
}

fn get_and_convert_to_db_value(column_name: &str, record: &mut HashMap<String, Value>, columns: &Vec<TableColumnProps>, funs: &TardisFunsInst) -> TardisResult<sea_query::Value> {
    match record.get_mut(column_name) {
        Some(val) => convert_to_db_value(column_name, val.take(), columns, funs),
        None => Err(funs.err().conflict(
            "table",
            "get_and_convert_to_db_value",
            &format!("Column {} not found in record", column_name),
            "404-column-not-found",
        )),
    }
}

fn convert_to_db_value(column_name: &str, val: Value, columns: &Vec<TableColumnProps>, funs: &TardisFunsInst) -> TardisResult<sea_query::Value> {
    let column = columns
        .iter()
        .find(|c| c.name == column_name)
        .ok_or_else(|| funs.err().conflict("table", "convert_to_db_value", &format!("Column {} is illegal", column_name), "400-column-is-illegal"))?;
    if !column.multi_value {
        return do_convert_to_db_value(column_name, val, &column.data_kind, funs);
    }
    if val.as_array().is_none() {
        return Err(funs.err().conflict(
            "table",
            "convert_to_db_value",
            &format!("Column {} value {} data kind is not array", column_name, val),
            "400-column-data-kind-is-illegal",
        ));
    }
    let vals = val
        .as_array()
        .expect("ignore")
        .into_iter()
        .map(|val| do_convert_to_db_value(column_name, val.clone(), &column.data_kind, funs))
        .collect::<TardisResult<Vec<sea_query::Value>>>()?;

    let kind = match column.data_kind {
        TableColumnDataKind::Serial => ArrayType::BigInt,
        TableColumnDataKind::Number => ArrayType::Double,
        TableColumnDataKind::Amount => ArrayType::Decimal,
        TableColumnDataKind::Boolean => ArrayType::Bool,
        TableColumnDataKind::Datetime => ArrayType::ChronoDateTimeUtc,
        TableColumnDataKind::Time => ArrayType::ChronoTime,
        TableColumnDataKind::Date => ArrayType::ChronoDate,
        _ => ArrayType::String,
    };
    Ok(sea_query::Value::Array(kind, Some(Box::new(vals))))
}

fn do_convert_to_db_value(column_name: &str, val: Value, data_kind: &TableColumnDataKind, funs: &TardisFunsInst) -> TardisResult<sea_query::Value> {
    match data_kind {
        TableColumnDataKind::Serial => val.as_i64().map(|val| sea_query::Value::BigInt(Some(val))).ok_or_else(|| {
            funs.err().conflict(
                "table",
                "convert_to_db_value",
                &format!("Column {} value {} data kind is not serial", column_name, val),
                "400-column-data-kind-is-illegal",
            )
        }),
        TableColumnDataKind::Number => val.as_f64().map(|val| sea_query::Value::Double(Some(val))).ok_or_else(|| {
            funs.err().conflict(
                "table",
                "convert_to_db_value",
                &format!("Column {} value {} data kind is not number", column_name, val),
                "400-column-data-kind-is-illegal",
            )
        }),
        // TODO test
        TableColumnDataKind::Amount => {
            let val = val
                .as_str()
                .map(|val| {
                    Decimal::from_str(val).map_err(|_| {
                        funs.err().conflict(
                            "table",
                            "convert_to_db_value",
                            &format!("Column {} value {} data kind is not amount", column_name, val),
                            "400-column-data-kind-is-illegal",
                        )
                    })
                })
                .ok_or_else(|| {
                    funs.err().conflict(
                        "table",
                        "convert_to_db_value",
                        &format!("Column {} value {} data kind is not amount", column_name, val),
                        "400-column-data-kind-is-illegal",
                    )
                })??;
            Ok(sea_query::Value::Decimal(Some(Box::new(val))))
        }
        // TODO test
        TableColumnDataKind::Boolean => val.as_bool().map(|val| sea_query::Value::Bool(Some(val))).ok_or_else(|| {
            funs.err().conflict(
                "table",
                "convert_to_db_value",
                &format!("Column {} value {} data kind is not boolean", column_name, val),
                "400-column-data-kind-is-illegal",
            )
        }),
        // TODO test
        TableColumnDataKind::Datetime => {
            let val = val
                .as_str()
                .map(|val| {
                    serde_json::from_str(val).map_err(|_| {
                        funs.err().conflict(
                            "table",
                            "convert_to_db_value",
                            &format!("Column {} value {} data kind is not datetime", column_name, val),
                            "400-column-data-kind-is-illegal",
                        )
                    })
                })
                .ok_or_else(|| {
                    funs.err().conflict(
                        "table",
                        "convert_to_db_value",
                        &format!("Column {} value {} data kind is not datetime", column_name, val),
                        "400-column-data-kind-is-illegal",
                    )
                })??;
            Ok(sea_query::Value::ChronoDateTimeWithTimeZone(Some(Box::new(val))))
        }
        // TODO test
        TableColumnDataKind::Time => {
            let val = val
                .as_str()
                .map(|val| {
                    serde_json::from_str(val).map_err(|_| {
                        funs.err().conflict(
                            "table",
                            "convert_to_db_value",
                            &format!("Column {} value {} data kind is not time", column_name, val),
                            "400-column-data-kind-is-illegal",
                        )
                    })
                })
                .ok_or_else(|| {
                    funs.err().conflict(
                        "table",
                        "convert_to_db_value",
                        &format!("Column {} value {} data kind is not time", column_name, val),
                        "400-column-data-kind-is-illegal",
                    )
                })??;
            Ok(sea_query::Value::ChronoTime(Some(Box::new(val))))
        }
        // TODO test
        TableColumnDataKind::Date => {
            let val = val
                .as_str()
                .map(|val| {
                    serde_json::from_str(val).map_err(|_| {
                        funs.err().conflict(
                            "table",
                            "convert_to_db_value",
                            &format!("Column {} value {} data kind is not date", column_name, val),
                            "400-column-data-kind-is-illegal",
                        )
                    })
                })
                .ok_or_else(|| {
                    funs.err().conflict(
                        "table",
                        "convert_to_db_value",
                        &format!("Column {} value {} data kind is not date", column_name, val),
                        "400-column-data-kind-is-illegal",
                    )
                })??;
            Ok(sea_query::Value::ChronoDate(Some(Box::new(val))))
        }
        // TODO test
        _ => val.as_str().map(|val| sea_query::Value::String(Some(Box::new(val.to_string())))).ok_or_else(|| {
            funs.err().conflict(
                "table",
                "convert_to_db_value",
                &format!("Column {} value {} data kind is not string", column_name, val),
                "400-column-data-kind-is-illegal",
            )
        }),
    }
}

fn convert_to_json_value(column_name: &str, row: &QueryResult, columns: &Vec<TableColumnProps>, funs: &TardisFunsInst) -> TardisResult<Value> {
    let column = columns
        .iter()
        .find(|c| c.name == column_name)
        .ok_or_else(|| funs.err().conflict("table", "convert_to_json_value", &format!("Column {} is illegal", column_name), "400-column-is-illegal"))?;
    do_convert_to_json_value(column_name, row, column.multi_value, &column.data_kind, funs)
}

fn do_convert_to_json_value(column_name: &str, row: &QueryResult, multi_value: bool, data_kind: &TableColumnDataKind, funs: &TardisFunsInst) -> TardisResult<Value> {
    let val = match data_kind {
        TableColumnDataKind::Serial => {
            if multi_value {
                json!(row.try_get::<Vec<i64>>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "table",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not serial", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            } else {
                json!(row.try_get::<i64>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "table",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not serial", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            }
        }
        TableColumnDataKind::Number => {
            if multi_value {
                json!(row.try_get::<Vec<f64>>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "table",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not number", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            } else {
                json!(row.try_get::<f64>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "table",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not number", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            }
        }
        // TODO test
        TableColumnDataKind::Amount => {
            if multi_value {
                json!(row
                    .try_get::<Vec<Decimal>>("", column_name)
                    .or_else(|_| {
                        Err(funs.err().conflict(
                            "table",
                            "convert_to_json_value",
                            &format!("Column {} data kind is not amount", column_name),
                            "400-column-data-kind-is-illegal",
                        ))
                    })?
                    .into_iter()
                    .map(|v| v.to_string())
                    .collect::<Vec<_>>())
            } else {
                json!(row
                    .try_get::<Decimal>("", column_name)
                    .or_else(|_| {
                        Err(funs.err().conflict(
                            "table",
                            "convert_to_json_value",
                            &format!("Column {} data kind is not amount", column_name),
                            "400-column-data-kind-is-illegal",
                        ))
                    })?
                    .to_string())
            }
        }
        // TODO test
        TableColumnDataKind::Boolean => {
            if multi_value {
                json!(row.try_get::<Vec<bool>>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "table",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not boolean", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            } else {
                json!(row.try_get::<bool>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "table",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not boolean", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            }
        }
        // TODO test
        TableColumnDataKind::Datetime => {
            if multi_value {
                json!(row.try_get::<Vec<DateTimeWithTimeZone>>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "table",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not datetime", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            } else {
                json!(row.try_get::<DateTimeWithTimeZone>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "table",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not datetime", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            }
        }
        // TODO test
        TableColumnDataKind::Time => {
            if multi_value {
                json!(row.try_get::<Vec<NaiveTime>>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "table",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not time", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            } else {
                json!(row.try_get::<NaiveTime>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "table",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not time", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            }
        }
        // TODO test
        TableColumnDataKind::Date => {
            if multi_value {
                json!(row.try_get::<Vec<NaiveDate>>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "table",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not date", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            } else {
                json!(row.try_get::<NaiveDate>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "table",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not date", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            }
        }
        // TODO test
        _ => {
            if multi_value {
                json!(row.try_get::<Vec<String>>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "table",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not string", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            } else {
                json!(row.try_get::<String>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "table",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not string", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            }
        }
    };
    Ok(val)
}

fn package_aggs_sql(
    aggs: Option<&mut HashMap<String, TableDataAggregateKind>>,
    pk_column_name: &str,
    columns: &Vec<TableColumnProps>,
    table_id: &str,
    funs: &TardisFunsInst,
) -> TardisResult<String> {
    let aggs_sql = if let Some(aggs) = aggs {
        if aggs.iter().any(|agg| !columns.iter().any(|col| &col.name == agg.0)) {
            return Err(funs.err().conflict(
                "table",
                "load_data_without_group",
                &format!("Table.{} aggs column name illegal", table_id),
                "409-column-name-illegal",
            ));
        }
        aggs.insert(pk_column_name.to_string(), TableDataAggregateKind::Count);
        aggs.iter()
            .map(|(column_name, agg_kind)| match agg_kind {
                TableDataAggregateKind::Count => format!("COUNT({}) as COUNT_{}", column_name, column_name),
                TableDataAggregateKind::Sum => format!("SUM({}) as SUM_{}", column_name, column_name),
                TableDataAggregateKind::Avg => format!("AVG({}) as AVG_{}", column_name, column_name),
                TableDataAggregateKind::Max => format!("MAX({}) as MAX_{}", column_name, column_name),
                TableDataAggregateKind::Min => format!("MIN({}) as MIN_{}", column_name, column_name),
                TableDataAggregateKind::Stddev => format!("STDDEV({}) as STDDEV_{}", column_name, column_name),
                TableDataAggregateKind::Distinct => format!("DISTINCT({}) as DISTINCT_{}", column_name, column_name),
            })
            .collect::<Vec<String>>()
            .join(", ")
    } else {
        "".to_string()
    };
    Ok(aggs_sql)
}

fn package_limit_sql(slice: Option<TableDataSliceReq>) -> TardisResult<String> {
    let limit_sql = if let Some(slice) = slice {
        format!("LIMIT {} OFFSET {}", slice.fetch_number, slice.offset_number)
    } else {
        "".to_string()
    };
    Ok(limit_sql)
}

fn package_sort_sql(sorts: Option<Vec<TableDataSortReq>>, columns: &Vec<TableColumnProps>, table_id: &str, funs: &TardisFunsInst) -> TardisResult<String> {
    let sort_sql = if let Some(sorts) = sorts {
        if sorts.iter().any(|sort| !columns.iter().any(|col| col.name == sort.column_name)) {
            return Err(funs.err().conflict(
                "table",
                "load_data_without_group",
                &format!("Table.{} sorts column name illegal", table_id),
                "409-column-name-illegal",
            ));
        }
        format!(
            "ORDER BY {}",
            sorts.into_iter().map(|sort| format!("{} {}", sort.column_name, if sort.order_desc { "DESC" } else { "ASC" })).collect::<Vec<String>>().join(", ")
        )
    } else {
        "".to_string()
    };
    Ok(sort_sql)
}

fn package_where_sql(
    filters: Option<Vec<TableDataFilterReq>>,
    params: &mut Vec<TardisResult<sea_query::Value>>,
    columns: &Vec<TableColumnProps>,
    funs: &TardisFunsInst,
) -> TardisResult<String> {
    let where_sql = if let Some(filters) = filters {
        let and_inner = filters[0].and;
        filters
            .into_iter()
            .map(|filter| {
                let items = filter
                    .items
                    .into_iter()
                    .map(|item| {
                        let placeholders = if let Some(value) = item.value {
                            if value.is_array() {
                                value
                                    .as_array()
                                    .expect("ignore")
                                    .into_iter()
                                    .map(|v| {
                                        params.push(convert_to_db_value(&item.column_name, v.clone(), columns, funs));
                                        format!("${}", params.len())
                                    })
                                    .collect()
                            } else {
                                params.push(convert_to_db_value(&item.column_name, value, columns, funs));
                                vec![format!("${}", params.len())]
                            }
                        } else {
                            vec![]
                        };
                        item.operator.to_sql(&item.column_name, placeholders)
                    })
                    .collect::<Vec<String>>();
                format!("({})", items.join(if filter.and { " AND " } else { " OR " }))
            })
            .collect::<Vec<String>>()
            .join(if and_inner { " OR " } else { " AND " })
    } else {
        "1 = 1".to_string()
    };
    Ok(where_sql)
}
