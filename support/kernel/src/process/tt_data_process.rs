use std::{collections::HashMap, str::FromStr};

use tardis::chrono::{DateTime, NaiveDate, NaiveTime, Utc};
use tardis::db::sea_orm::QueryResult;
use tardis::log::{trace, warn};
use tardis::{
    basic::{dto::TardisContext, result::TardisResult},
    db::sea_orm::{
        prelude::Decimal,
        sea_query::{self, ArrayType},
    },
    futures_util::future::join_all,
    serde_json::{json, Value},
    TardisFuns, TardisFunsInst,
};

use crate::dto::tt_dict_dtos::TableDictInfo;
use crate::dto::tt_table_dtos::TableColumnsResp;
use crate::{
    dto::tt_data_dtos::{TableDataFilterItemProps, TableDataOperatorKind},
    process::tt_table_process,
};
use crate::{
    dto::{
        tt_data_dtos::{TableDataAggregateKind, TableDataFilterProps, TableDataGroupProps, TableDataGroupResp, TableDataResp, TableDataSliceProps, TableDataSortProps},
        tt_table_dtos::{TableColumnDataKind, TableColumnProps},
    },
    process::tt_table_process::INST_PREFIX,
};

use super::tt_dict_process;

const DATA_DICT_POSTFIX: &str = "__dict";

pub async fn new_data(
    table_id: &str,
    mut new_records: Vec<HashMap<String, Value>>,
    target_sort_value: Option<&Value>,
    funs: &TardisFunsInst,
    ctx: &TardisContext,
) -> TardisResult<Vec<HashMap<String, Value>>> {
    let table_columns = tt_table_process::get_table_columns(table_id, funs, ctx).await?;
    let columns = table_columns.columns();
    if new_records.len() == 0 {
        return Ok(Vec::new());
    }
    let new_column_names = new_records[0].keys().map(|k| k.to_string()).collect::<Vec<String>>();

    if new_column_names.iter().any(|column_name| !columns.iter().any(|col| &col.name == column_name)) {
        return Err(funs.err().conflict("data", "new_data", &format!("Table.{} column name illegal", table_id), "409-keys-illegal"));
    }
    if new_records.len() > 1 {
        for record in &new_records {
            if record.len() != new_column_names.len() || record.keys().any(|k| !new_column_names.contains(k)) {
                return Err(funs.err().conflict("data", "new_data", &format!("Table.{} column name not same", table_id), "409-keys-not-same"));
            }
        }
    }

    // TODO freeSort process
    do_new_data(table_id, new_records, table_columns, funs, ctx).await
}

pub async fn copy_data(table_id: &str, target_record_pks: Vec<Value>, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<Vec<HashMap<String, Value>>> {
    let table_columns = tt_table_process::get_table_columns(table_id, funs, ctx).await?;
    if target_record_pks.len() == 0 {
        return Ok(Vec::new());
    }

    let target_records = load_data_without_group(table_id, None, None, None, None, Some(target_record_pks), funs, ctx)
        .await?
        .records
        .into_iter()
        .map(|mut record| {
            // delete pk
            record.remove(&table_columns.pk_column_name);
            record
        })
        .collect::<Vec<_>>();

    do_new_data(table_id, target_records, table_columns, funs, ctx).await
}

async fn do_new_data(
    table_id: &str,
    new_records: Vec<HashMap<String, Value>>,
    table_columns: TableColumnsResp,
    funs: &TardisFunsInst,
    ctx: &TardisContext,
) -> TardisResult<Vec<HashMap<String, Value>>> {
    let new_column_names = new_records[0].keys().map(|k| k.to_string()).collect::<Vec<String>>();

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
                new_records.len()
            ),
            Vec::new(),
        )
        .await?
        .expect("ignore")
        .try_get::<i64>("", "setval")
        .expect("ignore");
    let min_seq = max_seq - new_records.len() as i64 + 1;
    let pks: Vec<Value> = (min_seq..=max_seq).map(|pk| json!(pk)).collect();

    let params = new_records
        .into_iter()
        .enumerate()
        .map(|(idx, mut record)| {
            let mut params: Vec<TardisResult<sea_query::Value>> = Vec::new();
            params.push(Ok(sea_query::Value::BigInt(Some(min_seq + idx as i64))));
            new_column_names.iter().for_each(|k| {
                params.push(get_and_convert_to_db_value(k, &mut record, &table_columns.columns(), funs));
            });
            params.into_iter().collect::<TardisResult<Vec<sea_query::Value>>>()
        })
        .collect::<TardisResult<Vec<Vec<sea_query::Value>>>>()?;
    let insert_sql = format!(
        r#"INSERT INTO {}_{} ({} {}) VALUES ($1 {})"#,
        INST_PREFIX,
        table_id,
        table_columns.pk_column_name,
        new_column_names.iter().map(|name| format!(",{}", name)).collect::<String>(),
        new_column_names.iter().enumerate().map(|(idx, _)| format!(", ${}", idx + 2)).collect::<String>(),
    );
    funs.db().execute_many(&insert_sql, params).await?;
    Ok(load_data_without_group(table_id, None, None, None, None, Some(pks), funs, ctx).await?.records)
}

pub async fn modify_data(table_id: &str, changed_records: Vec<HashMap<String, Value>>, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<Vec<HashMap<String, Value>>> {
    let table_columns = tt_table_process::get_table_columns(table_id, funs, ctx).await?;
    let columns = table_columns.columns();
    if changed_records.len() == 0 {
        return Ok(Vec::new());
    }
    let mut changed_column_names = changed_records[0].keys().map(|k| k.to_string()).collect::<Vec<String>>();

    if !changed_column_names.contains(&table_columns.pk_column_name) {
        return Err(funs.err().conflict("data", "modify_data", &format!("Table.{} column private key illegal", table_id), "409-keys-illegal"));
    }

    if changed_column_names.iter().any(|column_name| !columns.iter().any(|col| &col.name == column_name)) {
        return Err(funs.err().conflict("data", "modify_data", &format!("Table.{} column name illegal", table_id), "409-keys-illegal"));
    }
    if changed_records.len() > 1 {
        for record in &changed_records {
            if record.len() != changed_column_names.len() || record.keys().any(|k| !changed_column_names.contains(k)) {
                return Err(funs.err().conflict("data", "modify_data", &format!("Table.{} column name not same", table_id), "409-keys-not-same"));
            }
        }
    }

    changed_column_names.remove(changed_column_names.iter().position(|column_name| column_name == &table_columns.pk_column_name).expect("ignore"));
    changed_column_names.insert(0, table_columns.pk_column_name.clone());

    let pks: Vec<Value> = changed_records.iter().map(|record| record.get(&table_columns.pk_column_name).expect("ignore").clone()).collect::<Vec<Value>>();

    let params = changed_records
        .into_iter()
        .map(|mut record| {
            changed_column_names.iter().map(|column_name| get_and_convert_to_db_value(column_name, &mut record, &columns, funs)).collect::<TardisResult<Vec<sea_query::Value>>>()
        })
        .collect::<TardisResult<Vec<Vec<sea_query::Value>>>>()?;

    let update_sql = format!(
        r#"UPDATE {}_{} SET {} WHERE {} = $1"#,
        INST_PREFIX,
        table_id,
        changed_column_names.iter().skip(1).enumerate().map(|(idx, column_name)| format!("{} = ${}", column_name, idx + 2)).collect::<Vec<String>>().join(", "),
        table_columns.pk_column_name
    );
    funs.db().execute_many(&update_sql, params).await?;
    Ok(load_data_without_group(table_id, None, None, None, None, Some(pks), funs, ctx).await?.records)
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
    group: TableDataGroupProps,
    filters: Option<Vec<TableDataFilterProps>>,
    sorts: Option<Vec<TableDataSortProps>>,
    mut aggs: Option<HashMap<String, TableDataAggregateKind>>,
    slice: Option<TableDataSliceProps>,
    funs: &TardisFunsInst,
    ctx: &TardisContext,
) -> TardisResult<Vec<TableDataGroupResp>> {
    let table_columns = tt_table_process::get_table_columns(table_id, funs, ctx).await?;
    let columns = table_columns.columns();

    if group.column_names.iter().any(|group_column_name| !columns.iter().any(|col| &col.name == group_column_name)) {
        return Err(funs.err().conflict(
            "data",
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
    let aggs: &mut HashMap<String, TableDataAggregateKind> = aggs.as_mut().expect("ignore");
    let aggs_sql = package_aggs_sql(Some(aggs), &table_columns.pk_column_name, &columns, table_id, funs)?;

    let group_sql = format!(
        r#"SELECT {}, {} FROM {}_{} WHERE {} {}"#,
        group_select_sql, aggs_sql, INST_PREFIX, table_id, where_sql, group_by_sql
    );

    trace!("group_sql: {}", group_sql);

    let mut group_records = funs
        .db()
        .query_all(&group_sql, params.clone().into_iter().collect::<TardisResult<Vec<sea_query::Value>>>()?)
        .await?
        .into_iter()
        .map(|row| {
            let mut record: HashMap<String, Value> = HashMap::new();
            group.column_names.iter().for_each(|group_column_name| {
                record.insert(group_column_name.clone(), convert_to_json_value(&group_column_name, &row, &columns, funs).expect("ignore"));
            });
            aggs.iter().for_each(|(column_name, agg_kind)| {
                record.insert(
                    column_name.clone(),
                    convert_agg_to_json_value(
                        column_name,
                        &columns.iter().find(|column| &column.name == column_name).expect("ignore").data_kind,
                        agg_kind,
                        &row,
                        funs,
                    )
                    .expect("ignore"),
                );
            });
            record
        })
        .collect::<Vec<HashMap<String, Value>>>();

    if group.hide_empty_record {
        group_records = group_records.into_iter().filter(|record| record.get(&table_columns.pk_column_name).expect("ignore").as_i64().expect("ignore") != 0).collect();
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
                        group_params.push(convert_to_db_value(
                            group_column_name,
                            group_record.get(group_column_name).expect("ignore").clone(),
                            &columns,
                            funs,
                        ));
                        format!("{} = ${}", group_column_name, params.len() + 1)
                    })
                    .collect::<Vec<String>>()
                    .join(" AND ");
                let select_sql = format!(
                    r#"SELECT * FROM {}_{} WHERE ({}) AND {} {} {}"#,
                    INST_PREFIX, table_id, where_sql, group_where_sql, sort_sql, limit_sql
                );
                (
                    group_record.get(&table_columns.pk_column_name).expect("ignore").as_i64().expect("ignore") as i32,
                    group.column_names.iter().map(|group_column_name| group_record.get(group_column_name).expect("ignore").to_string()).collect::<Vec<String>>().join("-"),
                    aggs.iter().map(|(column_name, _)| (column_name.to_string(), group_record.get(column_name).expect("ignore").clone())).collect::<HashMap<String, Value>>(),
                    &columns,
                    select_sql,
                    group_params.into_iter().collect::<TardisResult<Vec<sea_query::Value>>>().expect("ignore"),
                )
            })
            .map(|(total_number, group_value, aggs, columns, select_sql, group_params)| async move {
                let result = funs.db().query_all(&select_sql, group_params).await.expect("ignore");
                let records = result
                    .into_iter()
                    .map(|row| {
                        columns
                            .iter()
                            .map(|column| (column.name.to_string(), convert_to_json_value(&column.name, &row, &columns, funs).expect("ignore")))
                            .collect::<HashMap<String, Value>>()
                    })
                    .collect::<Vec<HashMap<String, Value>>>();
                TableDataGroupResp {
                    // TODO expect
                    records: attach_dict(records, columns, funs, ctx).await.expect("ignore"),
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
    mut filters: Option<Vec<TableDataFilterProps>>,
    sorts: Option<Vec<TableDataSortProps>>,
    aggs: Option<HashMap<String, TableDataAggregateKind>>,
    slice: Option<TableDataSliceProps>,
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
        filters.as_mut().expect("ignore").push(TableDataFilterProps {
            items: vec![TableDataFilterItemProps {
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

    trace!("select_sql: {}", select_sql);

    let total_number = funs
        .db()
        .count_by_sql(
            &format!(r#"SELECT 1 FROM {}_{} WHERE {} {}"#, INST_PREFIX, table_id, where_sql, sort_sql),
            params.clone().into_iter().collect::<TardisResult<Vec<sea_query::Value>>>()?,
        )
        .await?;
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
            .expect("ignore");

        aggs.iter()
            .map(|(column_name, agg_kind)| {
                (
                    column_name.clone(),
                    convert_agg_to_json_value(
                        column_name,
                        &columns.iter().find(|column| &column.name == column_name).expect("ignore").data_kind,
                        agg_kind,
                        &agg_result,
                        funs,
                    )
                    .expect("ignore"),
                )
            })
            .collect::<HashMap<String, Value>>()
    } else {
        HashMap::new()
    };

    Ok(TableDataResp {
        records: attach_dict(records, &columns, funs, ctx).await?,
        aggs,
        total_number: total_number as i32,
    })
}

async fn attach_dict(
    records: Vec<HashMap<String, Value>>,
    columns: &Vec<TableColumnProps>,
    funs: &TardisFunsInst,
    ctx: &TardisContext,
) -> TardisResult<Vec<HashMap<String, Value>>> {
    if records.is_empty() {
        return Ok(records);
    }
    let first_record = records.first().expect("ignore");
    let dict_names = columns.iter().filter(|column| column.use_dict).map(|column| (column.name.clone(), column.multi_value)).collect::<HashMap<String, bool>>();
    if dict_names.is_empty() {
        return Ok(records);
    }

    let dict_values = dict_names
        .clone()
        .into_iter()
        .filter(|(column_name, _)| first_record.contains_key(column_name))
        .map(|(column_name, multi_value)| {
            let values = records
                .iter()
                .map(|record| {
                    let values = record.get(&column_name).expect("ignore");
                    if values.is_null() {
                        vec![]
                    } else if multi_value {
                        values.as_array().unwrap_or(&vec![]).clone()
                    } else {
                        vec![values.clone()]
                    }
                })
                .flatten()
                .collect::<Vec<_>>();
            (column_name, values)
        })
        .collect::<HashMap<_, _>>();
    let dict_values = join_all(dict_values.into_iter().map(|(column_name, values)| tt_dict_process::find_dict_items(column_name, values, funs, ctx)).collect::<Vec<_>>())
        .await
        .into_iter()
        .collect::<TardisResult<Vec<_>>>()?
        .into_iter()
        .flatten()
        .map(|dict| (format!("{}.{}", dict.dict_code, dict.value), dict))
        .collect::<HashMap<String, TableDictInfo>>();

    let records = records
        .into_iter()
        .map(|mut record| {
            for (column_name, multi_value) in &dict_names {
                let values = record.get(column_name).expect("ignore");
                let dict_values = if values.is_null() {
                    vec![None]
                } else if *multi_value {
                    values.as_array().unwrap_or(&vec![]).iter().map(|value| dict_values.get(&format!("{}.{}", column_name, value))).collect::<Vec<_>>()
                } else {
                    vec![dict_values.get(&format!("{}.{}", column_name, values))]
                }
                .into_iter()
                .filter(|v| v.is_some())
                .map(|v| v.expect("ignore"))
                .collect::<Vec<_>>();
                record.insert(format!("{}{}", column_name, DATA_DICT_POSTFIX), TardisFuns::json.obj_to_json(&dict_values).expect("ignore"));
            }
            record
        })
        .collect::<Vec<_>>();
    Ok(records)
}

fn get_and_convert_to_db_value(column_name: &str, record: &mut HashMap<String, Value>, columns: &Vec<TableColumnProps>, funs: &TardisFunsInst) -> TardisResult<sea_query::Value> {
    match record.get_mut(column_name) {
        Some(val) => convert_to_db_value(column_name, val.take(), columns, funs),
        None => Err(funs.err().conflict(
            "data",
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
        .ok_or_else(|| funs.err().conflict("data", "convert_to_db_value", &format!("Column {} is illegal", column_name), "400-column-is-illegal"))?;
    if !column.multi_value {
        return do_convert_to_db_value(column_name, val, &column.data_kind, funs);
    }
    let vals = if val.is_null() {
        None
    } else if val.as_array().is_none() {
        return Err(funs.err().conflict(
            "data",
            "convert_to_db_value",
            &format!("Column {} value {} data kind is not array", column_name, val),
            "400-column-data-kind-is-illegal",
        ));
    } else {
        let vals = val
            .as_array()
            .expect("ignore")
            .into_iter()
            .map(|val| do_convert_to_db_value(column_name, val.clone(), &column.data_kind, funs))
            .collect::<TardisResult<Vec<sea_query::Value>>>()?;
        Some(Box::new(vals))
    };

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
    Ok(sea_query::Value::Array(kind, vals))
}

fn do_convert_to_db_value(column_name: &str, val: Value, data_kind: &TableColumnDataKind, funs: &TardisFunsInst) -> TardisResult<sea_query::Value> {
    match data_kind {
        TableColumnDataKind::Serial => {
            if val.is_null() {
                Ok(sea_query::Value::Int(None))
            } else {
                val.as_i64().map(|val| sea_query::Value::from(val)).ok_or_else(|| {
                    funs.err().conflict(
                        "data",
                        "convert_to_db_value",
                        &format!("Column {} value {} data kind is not serial", column_name, val),
                        "400-column-data-kind-is-illegal",
                    )
                })
            }
        }
        TableColumnDataKind::Number => {
            if val.is_null() {
                Ok(sea_query::Value::Double(None))
            } else {
                val.as_f64().map(|val| sea_query::Value::from(val)).ok_or_else(|| {
                    funs.err().conflict(
                        "data",
                        "convert_to_db_value",
                        &format!("Column {} value {} data kind is not number", column_name, val),
                        "400-column-data-kind-is-illegal",
                    )
                })
            }
        }
        // TODO test
        TableColumnDataKind::Amount => {
            if val.is_null() {
                Ok(sea_query::Value::Decimal(None))
            } else {
                let val = val
                    .as_str()
                    .map(|val| {
                        Decimal::from_str(val).map_err(|_| {
                            funs.err().conflict(
                                "data",
                                "convert_to_db_value",
                                &format!("Column {} value {} data kind is not amount", column_name, val),
                                "400-column-data-kind-is-illegal",
                            )
                        })
                    })
                    .ok_or_else(|| {
                        funs.err().conflict(
                            "data",
                            "convert_to_db_value",
                            &format!("Column {} value {} data kind is not amount", column_name, val),
                            "400-column-data-kind-is-illegal",
                        )
                    })??;
                Ok(sea_query::Value::from(val))
            }
        }
        // TODO test
        TableColumnDataKind::Boolean => {
            if val.is_null() {
                Ok(sea_query::Value::Bool(None))
            } else {
                val.as_bool().map(|val| sea_query::Value::from(val)).ok_or_else(|| {
                    funs.err().conflict(
                        "data",
                        "convert_to_db_value",
                        &format!("Column {} value {} data kind is not boolean", column_name, val),
                        "400-column-data-kind-is-illegal",
                    )
                })
            }
        }
        // TODO test
        TableColumnDataKind::Datetime => {
            if val.is_null() {
                Ok(sea_query::Value::ChronoDateTimeUtc(None))
            } else {
                let val = val
                    .as_str()
                    .map(|val| {
                        DateTime::<Utc>::from_str(val).map_err(|_| {
                            funs.err().conflict(
                                "data",
                                "convert_to_db_value",
                                &format!("Column {} value {} data kind is not datetime", column_name, val),
                                "400-column-data-kind-is-illegal",
                            )
                        })
                    })
                    .ok_or_else(|| {
                        funs.err().conflict(
                            "data",
                            "convert_to_db_value",
                            &format!("Column {} value {} data kind is not datetime", column_name, val),
                            "400-column-data-kind-is-illegal",
                        )
                    })??;
                Ok(sea_query::Value::from(val))
            }
        }
        // TODO test
        TableColumnDataKind::Time => {
            if val.is_null() {
                Ok(sea_query::Value::ChronoTime(None))
            } else {
                let val = val
                    .as_str()
                    .map(|val| {
                        NaiveTime::from_str(val).map_err(|_| {
                            funs.err().conflict(
                                "data",
                                "convert_to_db_value",
                                &format!("Column {} value {} data kind is not time", column_name, val),
                                "400-column-data-kind-is-illegal",
                            )
                        })
                    })
                    .ok_or_else(|| {
                        funs.err().conflict(
                            "data",
                            "convert_to_db_value",
                            &format!("Column {} value {} data kind is not time", column_name, val),
                            "400-column-data-kind-is-illegal",
                        )
                    })??;
                Ok(sea_query::Value::from(val))
            }
        }
        // TODO test
        TableColumnDataKind::Date => {
            if val.is_null() {
                Ok(sea_query::Value::ChronoDate(None))
            } else {
                let val = val
                    .as_str()
                    .map(|val| {
                        NaiveDate::from_str(val).map_err(|_| {
                            funs.err().conflict(
                                "data",
                                "convert_to_db_value",
                                &format!("Column {} value {} data kind is not date", column_name, val),
                                "400-column-data-kind-is-illegal",
                            )
                        })
                    })
                    .ok_or_else(|| {
                        funs.err().conflict(
                            "data",
                            "convert_to_db_value",
                            &format!("Column {} value {} data kind is not date", column_name, val),
                            "400-column-data-kind-is-illegal",
                        )
                    })??;
                Ok(sea_query::Value::from(val))
            }
        }
        // TODO test
        _ => {
            if val.is_null() {
                Ok(sea_query::Value::String(None))
            } else {
                val.as_str().map(|val| sea_query::Value::from(val)).ok_or_else(|| {
                    funs.err().conflict(
                        "data",
                        "convert_to_db_value",
                        &format!("Column {} value {} data kind is not string", column_name, val),
                        "400-column-data-kind-is-illegal",
                    )
                })
            }
        }
    }
}

fn convert_to_json_value(column_name: &str, row: &QueryResult, columns: &Vec<TableColumnProps>, funs: &TardisFunsInst) -> TardisResult<Value> {
    let column = columns
        .iter()
        .find(|c| c.name == column_name)
        .ok_or_else(|| funs.err().conflict("data", "convert_to_json_value", &format!("Column {} is illegal", column_name), "400-column-is-illegal"))?;
    do_convert_to_json_value(column_name, row, column.multi_value, &column.data_kind, funs)
}

fn do_convert_to_json_value(column_name: &str, row: &QueryResult, multi_value: bool, data_kind: &TableColumnDataKind, funs: &TardisFunsInst) -> TardisResult<Value> {
    let val = match data_kind {
        TableColumnDataKind::Serial => {
            if multi_value {
                json!(row.try_get::<Option<Vec<i32>>>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "data",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not serial", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            } else {
                json!(row.try_get::<Option<i32>>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "data",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not serial", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            }
        }
        TableColumnDataKind::Number => {
            if multi_value {
                json!(row.try_get::<Option<Vec<f64>>>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "data",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not number", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            } else {
                json!(row.try_get::<Option<f64>>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "data",
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
                    .try_get::<Option<Vec<Decimal>>>("", column_name)
                    .or_else(|_| {
                        Err(funs.err().conflict(
                            "data",
                            "convert_to_json_value",
                            &format!("Column {} data kind is not amount", column_name),
                            "400-column-data-kind-is-illegal",
                        ))
                    })?
                    .map(|v: Vec<Decimal>| v.into_iter().map(|v| v.to_string()).collect::<Vec<_>>()))
            } else {
                json!(row
                    .try_get::<Option<Decimal>>("", column_name)
                    .or_else(|_| {
                        Err(funs.err().conflict(
                            "data",
                            "convert_to_json_value",
                            &format!("Column {} data kind is not amount", column_name),
                            "400-column-data-kind-is-illegal",
                        ))
                    })?
                    .map(|v| v.to_string()))
            }
        }
        // TODO test
        TableColumnDataKind::Boolean => {
            if multi_value {
                json!(row.try_get::<Option<Vec<bool>>>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "data",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not boolean", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            } else {
                json!(row.try_get::<Option<bool>>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "data",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not boolean", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            }
        }
        TableColumnDataKind::Datetime => {
            if multi_value {
                json!(row.try_get::<Option<Vec<DateTime<Utc>>>>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "data",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not datetime", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            } else {
                json!(row.try_get::<Option<DateTime<Utc>>>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "data",
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
                json!(row.try_get::<Option<Vec<NaiveTime>>>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "data",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not time", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            } else {
                json!(row.try_get::<Option<NaiveTime>>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "data",
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
                json!(row.try_get::<Option<Vec<NaiveDate>>>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "data",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not date", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            } else {
                json!(row.try_get::<Option<NaiveDate>>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "data",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not date", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            }
        }
        _ => {
            if multi_value {
                json!(row.try_get::<Option<Vec<String>>>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "data",
                        "convert_to_json_value",
                        &format!("Column {} data kind is not string", column_name),
                        "400-column-data-kind-is-illegal",
                    ))
                })?)
            } else {
                json!(row.try_get::<Option<String>>("", column_name).or_else(|_| {
                    Err(funs.err().conflict(
                        "data",
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

fn convert_agg_to_json_value(
    column_name: &str,
    data_kind: &TableColumnDataKind,
    agg_kind: &TableDataAggregateKind,
    row: &QueryResult,
    _funs: &TardisFunsInst,
) -> TardisResult<Value> {
    let column_name_with_agg = format!("{}_{}", TardisFuns::json.obj_to_json(&agg_kind).expect("ignore").as_str().expect("ignore"), column_name).to_lowercase();
    let agg_value = match agg_kind {
        TableDataAggregateKind::Sum => Value::from(row.try_get::<Option<i64>>("", &column_name_with_agg)?),
        TableDataAggregateKind::Count => Value::from(row.try_get::<i64>("", &column_name_with_agg)?),
        TableDataAggregateKind::Min | TableDataAggregateKind::Max => match data_kind {
            TableColumnDataKind::Serial | TableColumnDataKind::Number => Value::from(row.try_get::<Option<f64>>("", &column_name_with_agg)?),
            _ => Value::from(row.try_get::<Option<String>>("", &column_name_with_agg)?),
        },
        TableDataAggregateKind::Avg | TableDataAggregateKind::Stddev => Value::from(row.try_get::<Option<f64>>("", &column_name_with_agg)?),
        // TODO fix
        // 在 PostgreSQL 中，要对一个字段进行去重，并对另一个字段进行计数，需要使用 GROUP BY 语句，而不是 DISTINCT
        TableDataAggregateKind::Distinct => Value::from(row.try_get::<Option<f64>>("", &column_name_with_agg)?),
    };
    Ok(agg_value)
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
                "data",
                "load_data_without_group",
                &format!("Table.{} aggs column name illegal", table_id),
                "409-column-name-illegal",
            ));
        }
        aggs.insert(pk_column_name.to_string(), TableDataAggregateKind::Count);
        aggs.iter()
            .map(|(column_name, agg_kind)| match agg_kind {
                TableDataAggregateKind::Count => format!("COUNT({}) AS COUNT_{}", column_name, column_name),
                TableDataAggregateKind::Sum => format!("SUM({}) AS SUM_{}", column_name, column_name),
                TableDataAggregateKind::Avg => format!("AVG({}) AS AVG_{}", column_name, column_name),
                TableDataAggregateKind::Max => format!("MAX({}) AS MAX_{}", column_name, column_name),
                TableDataAggregateKind::Min => format!("MIN({}) AS MIN_{}", column_name, column_name),
                TableDataAggregateKind::Stddev => format!("STDDEV({}) AS STDDEV_{}", column_name, column_name),
                TableDataAggregateKind::Distinct => format!("DISTINCT({}) AS DISTINCT_{}", column_name, column_name),
            })
            .collect::<Vec<String>>()
            .join(", ")
    } else {
        "".to_string()
    };
    Ok(aggs_sql)
}

fn package_limit_sql(slice: Option<TableDataSliceProps>) -> TardisResult<String> {
    let limit_sql = if let Some(slice) = slice {
        format!("LIMIT {} OFFSET {}", slice.fetch_number, slice.offset_number)
    } else {
        "".to_string()
    };
    Ok(limit_sql)
}

fn package_sort_sql(sorts: Option<Vec<TableDataSortProps>>, columns: &Vec<TableColumnProps>, table_id: &str, funs: &TardisFunsInst) -> TardisResult<String> {
    let sort_sql = if let Some(sorts) = sorts {
        if sorts.iter().any(|sort| !columns.iter().any(|col| col.name == sort.column_name)) {
            return Err(funs.err().conflict(
                "data",
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
    filters: Option<Vec<TableDataFilterProps>>,
    params: &mut Vec<TardisResult<sea_query::Value>>,
    columns: &Vec<TableColumnProps>,
    funs: &TardisFunsInst,
) -> TardisResult<String> {
    let where_sql = if let Some(filters) = filters {
        let and_inner = filters[0].and;
        let filter_sql_items = filters
            .into_iter()
            .filter(|filter| !filter.items.is_empty())
            .map(|filter| {
                let items = filter
                    .items
                    .into_iter()
                    .map(|item| {
                        let column = columns.iter().find(|column| column.name == item.column_name);
                        (column, item)
                    })
                    .filter(|(column, _)| column.is_some())
                    .map(|(column, item)| {
                        let column = column.expect("ignore");
                        let placeholders = if let Some(value) = item.value {
                            if value.is_array() {
                                value
                                    .as_array()
                                    .expect("ignore")
                                    .into_iter()
                                    .map(|v| {
                                        params.push(do_convert_to_db_value(&item.column_name, v.clone(), &column.data_kind, funs));
                                        format!("${}", params.len())
                                    })
                                    .collect()
                            } else if item.operator == TableDataOperatorKind::Contains
                                || item.operator == TableDataOperatorKind::NotContains
                                || item.operator == TableDataOperatorKind::StartWith
                                || item.operator == TableDataOperatorKind::NotStartWith
                                || item.operator == TableDataOperatorKind::EndWith
                                || item.operator == TableDataOperatorKind::NotEndWith
                            {
                                let val = value
                                    .as_str()
                                    .ok_or_else(|| {
                                        funs.err().conflict(
                                            "data",
                                            "convert_to_db_value",
                                            &format!("Column {} value {} data kind is not string", &item.column_name, value),
                                            "400-column-data-kind-is-illegal",
                                        )
                                    })
                                    .map(|value| {
                                        let val = match item.operator {
                                            TableDataOperatorKind::StartWith => format!("{}%", value),
                                            TableDataOperatorKind::NotStartWith => format!("{}%", value),
                                            TableDataOperatorKind::EndWith => format!("%{}", value),
                                            TableDataOperatorKind::NotEndWith => format!("%{}", value),
                                            _ => format!("%{}%", value),
                                        };
                                        sea_query::Value::from(val)
                                    });
                                params.push(val);
                                vec![format!("${}", params.len())]
                            } else if item.operator == TableDataOperatorKind::IsEmpty || item.operator == TableDataOperatorKind::NotEmpty {
                                // No parameters required
                                vec![]
                            } else {
                                params.push(do_convert_to_db_value(&item.column_name, value, &column.data_kind, funs));
                                vec![format!("${}", params.len())]
                            }
                        } else {
                            vec![]
                        };
                        item.operator.to_sql(&item.column_name, column.multi_value, placeholders)
                    })
                    .filter(|item| item.is_some())
                    .collect::<Option<Vec<String>>>()
                    .expect("ignore");
                if !items.is_empty() {
                    format!("({})", items.join(if filter.and { " AND " } else { " OR " }))
                } else {
                    "".to_string()
                }
            })
            .collect::<Vec<String>>();
        if !filter_sql_items.is_empty() {
            filter_sql_items.join(if and_inner { " OR " } else { " AND " })
        } else {
            "".to_string()
        }
    } else {
        "".to_string()
    };
    if where_sql.trim().is_empty() {
        Ok("1 = 1".to_string())
    } else {
        Ok(where_sql)
    }
}

pub async fn sort_data(table_id: &str, target_sort_value: &str, form_record_pk: Vec<Value>, funs: &TardisFunsInst, ctx: &TardisContext) -> TardisResult<()> {
    // TODO
    Ok(())
}
