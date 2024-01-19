import type { InjectionKey, Ref } from 'vue'
import { toRaw } from 'vue'
import type { TableBasicConf, TableColumnConf, TableLayoutColumnConf, TableLayoutConf, TableStyleConf } from './conf'
import { getDefaultValueByDataKind } from './conf'
import { filterTreeDataPks, sortByTree } from './function/RowTree'
import type { TableCellDictItem, TableCellDictItemResp, TableDataResp, TableDataSliceReq, TableEventProps, TableLayoutModifyReq } from './props'
import { DATA_DICT_POSTFIX } from './props'

let events: TableEventProps
let tableBasicConf: TableBasicConf
let tableLayoutsConf: TableLayoutConf[]
let currentLayoutId: Ref<string>

export async function init(_tableBasicConf: TableBasicConf, _tableLayoutsConf: TableLayoutConf[], _currentLayoutId: Ref<string>, _events: TableEventProps) {
  tableBasicConf = _tableBasicConf
  tableLayoutsConf = _tableLayoutsConf
  currentLayoutId = _currentLayoutId
  events = _events
}

export async function watch() {
  tableLayoutsConf.forEach((layout) => {
    loadData(layout.id)
  })
}

export const FUN_LOAD_DATA_TYPE = Symbol('FUN_LOAD_DATA_TYPE') as InjectionKey<(layoutId?: string, moreForGroupedValue?: any) => Promise<void>>
export async function loadData(layoutId?: string, moreForGroupedValue?: any) {
  const layout = layoutId ? tableLayoutsConf.find(layout => layout.id === layoutId)! : tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!
  let filters
  if (layout.filters)
    filters = toRaw(layout.filters)

  const slice = {
    offsetNumber: 0,
    fetchNumber: layout.fetchDataNumber,
  }
  // TODO
  // if (moreForGroupedValue) {
  //   const groupFilter = {
  //     items: [
  //       {
  //         columnName: layout.group?.columnNames.,
  //         operator: OperatorKind.EQ,
  //         value: moreForGroupedValue,
  //       },
  //     ],
  //     and: true,
  //   }
  //   if (filters)
  //     filters.push(groupFilter)
  //   else
  //     filters = [groupFilter]
  //   if (layout.data && Array.isArray(layout.data)) {
  //     const curGroupData = layout.data.find(d => d.groupValue === moreForGroupedValue)
  //     if (curGroupData !== undefined)
  //       slice.offsetNumber = curGroupData.records.length
  //   }
  // }
  // else {
  //   if (layout.data && !Array.isArray(layout.data))
  //     slice.offsetNumber = layout.data.records.length
  // }
  let sorts
  if (layout.sorts)
    sorts = toRaw(layout.sorts)

  let group
  if (layout.group)
    group = toRaw(layout.group)

  let aggs
  if (layout.aggs)
    aggs = toRaw(layout.aggs)

  const resp = await events.loadData(filters, sorts, group, aggs, slice)
  if (Array.isArray(resp)) {
    resp.forEach((groupData) => {
      groupData.records = sortByTree(groupData.records, tableBasicConf.pkColumnName, tableBasicConf.parentPkColumnName)
    })
    // (Re)group query
    if (layout.data && Array.isArray(layout.data))
      layout.data.splice(0, layout.data.length, ...resp)
    else
      layout.data = resp
  }
  else if (moreForGroupedValue) {
    // Single group query (E.g. to get more records of the current group)
    if (layout.data && Array.isArray(layout.data)) {
      const groupData = layout.data.find(d => d.groupValue === moreForGroupedValue)
      if (groupData) {
        groupData.records.push(...resp.records)
        groupData.records = sortByTree(groupData.records, tableBasicConf.pkColumnName, tableBasicConf.parentPkColumnName)
        groupData.aggs = resp.aggs
        groupData.totalNumber = resp.totalNumber
      }
    }
    else {
      resp.records = sortByTree(resp.records, tableBasicConf.pkColumnName, tableBasicConf.parentPkColumnName)
      layout.data = resp
    }
  }
  else {
    // Query without grouping
    resp.records = sortByTree(resp.records, tableBasicConf.pkColumnName, tableBasicConf.parentPkColumnName)
    layout.data = resp
  }
}

export const FUN_ADD_DATA_TYPE = Symbol('FUN_ADD_DATA_TYPE') as InjectionKey<(newRecords: { [key: string]: any }[], afterPk: any, reFilter?: boolean, reSort?: boolean, reLoad?: boolean) => Promise<boolean>>
export async function addData(newRecords: { [key: string]: any }[], afterPk: any, reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.saveData)
    return false

  // TODO 
  // if (tableBasicConf.parentPkColumnName) {
  //   if (Array.isArray(layout.data)) {
  //     for (const groupData of layout.data) {
  //       const afterRecord = groupData.records.find(record => record[tableBasicConf.pkColumnName] === afterPk)
  //       if (afterRecord) {
  //         newRecords.forEach((record) => {
  //           record[tableBasicConf.parentPkColumnName!] = afterRecord[tableBasicConf.parentPkColumnName!]
  //         })
  //         break
  //       }
  //     }
  //   }
  //   else if (layout.data && !Array.isArray(layout.data)) {
  //     const afterRecord = layout.data.records.find(record => record[tableBasicConf.pkColumnName] === afterPk)
  //     if (afterRecord) {
  //       newRecords.forEach((record) => {
  //         record[tableBasicConf.parentPkColumnName!] = afterRecord[tableBasicConf.parentPkColumnName!]
  //       })
  //     }
  //   }
  // }

  const savedRecords = await events.saveData(newRecords)
  if (reLoad) {
    await loadData()
    return true
  }

  if (Array.isArray(layout.data)) {
    layout.data.forEach((groupData) => {
      const idx = groupData.records.findIndex(r => r[tableBasicConf.pkColumnName] === afterPk)
      if (idx !== -1) {
        groupData.records.splice(idx + 1, 0, ...savedRecords)
        groupData.records = sortByTree(groupData.records, tableBasicConf.pkColumnName, tableBasicConf.parentPkColumnName)
      }
    })
  }
  else if (layout.data && !Array.isArray(layout.data)) {
    const idx = layout.data.records.findIndex(r => r[tableBasicConf.pkColumnName] === afterPk)
    layout.data.records.splice(idx + 1, 0, ...savedRecords)
    layout.data.records = sortByTree(layout.data.records, tableBasicConf.pkColumnName, tableBasicConf.parentPkColumnName)
  }
  else {
    // Empty,unreachable
  }
  return true
  // TODO agg清空，重新计算
}

export const FUN_UPDATE_DATA_TYPE = Symbol('FUN_UPDATE_DATA_TYPE') as InjectionKey<(changedRecords: { [key: string]: any }[], reFilter?: boolean, reSort?: boolean, reLoad?: boolean) => Promise<boolean>>
export async function updateData(changedRecords: { [key: string]: any }[], reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!
  if (!events.saveData)
    return false

  const savedRecords = await events.saveData(changedRecords)
  if (reLoad) {
    await loadData()
    return true
  }

  if (Array.isArray(layout.data)) {
    layout.data.forEach((groupData) => {
      groupData.records.forEach((record, idx) => {
        const changedRecord = savedRecords.find(r => r[tableBasicConf.pkColumnName] === record[tableBasicConf.pkColumnName])
        if (changedRecord)
          groupData.records.splice(idx, 1, changedRecord)
      })
    })
  }
  else if (layout.data && !Array.isArray(layout.data)) {
    layout.data.records.forEach((record, idx) => {
      const changedRecord = savedRecords.find(r => r[tableBasicConf.pkColumnName] === record[tableBasicConf.pkColumnName])
      if (changedRecord)
        (layout.data! as TableDataResp).records.splice(idx, 1, changedRecord)
    })
  }
  else {
    // Empty,unreachable
  }
  return true
  // TODO agg清空，重新计算
}

export const FUN_DELETE_DATA_TYPE = Symbol('FUN_DELETE_DATA_TYPE') as InjectionKey<(deletedPks: any[], reFilter?: boolean, reSort?: boolean, reLoad?: boolean) => Promise<boolean>>
export async function deleteData(deletedPks: any[], reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!
  if (events.deleteData && (await events.deleteData(deletedPks))) {
    if (reLoad) {
      await loadData()
      return true
    }
  }
  else {
    return false
  }
  if (Array.isArray(layout.data)) {
    layout.data.forEach((d) => {
      deletedPks = filterTreeDataPks(deletedPks, d.records, tableBasicConf.pkColumnName, tableBasicConf.parentPkColumnName)
      d.records = d.records.filter(item => !deletedPks.includes(item[tableBasicConf.pkColumnName]))
    })
  }
  else if (layout.data && !Array.isArray(layout.data)) {
    deletedPks = filterTreeDataPks(deletedPks, layout.data.records, tableBasicConf.pkColumnName, tableBasicConf.parentPkColumnName)
    layout.data.records = layout.data.records.filter(item => !deletedPks.includes(item[tableBasicConf.pkColumnName]))
  }
  else {
    // Empty,unreachable
  }
  return true
  // TODO agg清空，重新计算
}

export const FUN_LOAD_CELL_DICT_ITEMS_TYPE = Symbol('FUN_LOAD_CELL_DICT_ITEMS_TYPE') as InjectionKey<(columnName: string, filterValue?: any, slice?: TableDataSliceReq) => Promise<TableCellDictItemResp>>
export async function loadCellDictItems(columnName: string, filterValue?: any, slice?: TableDataSliceReq): Promise<TableCellDictItemResp> {
  if (events.loadCellDictItems) { return await events.loadCellDictItems(columnName, filterValue, slice) }
  else {
    return {
      records: [],
      totalNumber: 0,
    }
  }
}

export const FUN_SAVE_CELL_DICT_ITEM_TYPE = Symbol('FUN_SAVE_CELL_DICT_ITEM_TYPE') as InjectionKey<(columnName: string, changedItem: TableCellDictItem) => Promise<boolean>>
export async function saveCellDictItem(columnName: string, changedItem: TableCellDictItem): Promise<boolean> {
  if (events.saveCellDictItem)
    return await events.saveCellDictItem(columnName, changedItem)
  else
    return false
}

export const FUN_DELETE_CELL_DICT_ITEM_TYPE = Symbol('FUN_DELETE_CELL_DICT_ITEM_TYPE') as InjectionKey<(columnName: string, value: any) => Promise<boolean>>
export async function deleteCellDictItem(columnName: string, value: any): Promise<boolean> {
  if (events.deleteCellDictItem)
    return await events.deleteCellDictItem(columnName, value)
  else
    return false
}

export const FUN_SORT_CELL_DICT_ITEM_TYPE = Symbol('FUN_SORT_CELL_DICT_ITEM_TYPE') as InjectionKey<(columnName: string, leftItemValue: any, rightItemValue: any) => Promise<boolean>>
export async function sortCellDictItem(columnName: string, leftItemValue: any, rightItemValue: any): Promise<boolean> {
  if (events.sortCellDictItem)
    return await events.sortCellDictItem(columnName, leftItemValue, rightItemValue)
  else
    return false
}

export const FUN_MODIFY_STYLES_TYPE = Symbol('FUN_MODIFY_STYLES_TYPE') as InjectionKey<(changedStyles: TableStyleConf, reFilter?: boolean, reSort?: boolean, reLoad?: boolean) => Promise<boolean>>
export async function modifyStyles(changedStyles: TableStyleConf, reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  if (events.modifyStyles && (await events.modifyStyles({
    size: changedStyles.size,
    tableClass: changedStyles.tableClass,
    headerClass: changedStyles.headerClass,
    rowClass: changedStyles.rowClass,
    cellClass: changedStyles.cellClass,
    aggClass: changedStyles.aggClass,
  }))) {
    if (reLoad) {
      await loadData()
      return true
    }
  }
  else {
    return false
  }
  tableBasicConf.styles = changedStyles
  return true
  // TODO agg清空，重新计算
}

export const FUN_NEW_COLUMN_TYPE = Symbol('FUN_NEW_COLUMN_TYPE') as InjectionKey<(newColumnConf: TableColumnConf, newLayoutColumnConf: TableLayoutColumnConf, fromColumnName?: string, reFilter?: boolean, reSort?: boolean, reLoad?: boolean) => Promise<boolean>>
export async function newColumn(newColumnConf: TableColumnConf, newLayoutColumnConf: TableLayoutColumnConf, fromColumnName?: string, reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!
  if (events.newColumn && events.modifyLayout
    && await events.newColumn({
      name: newColumnConf.name,
      title: newColumnConf.title,
      icon: newColumnConf.icon,
      dataKind: newColumnConf.dataKind,
      dataEditable: newColumnConf.dataEditable,
      useDict: newColumnConf.useDict,
      dictEditable: newColumnConf.dictEditable,
      multiValue: newColumnConf.multiValue,
      kindDateTimeFormat: newColumnConf.kindDateTimeFormat,
    }, fromColumnName)
    && await events.modifyLayout({
      id: currentLayoutId.value,
      newColumn: {
        name: newLayoutColumnConf.name,
        wrap: newLayoutColumnConf.wrap,
        fixed: newLayoutColumnConf.fixed,
        width: newLayoutColumnConf.width,
        hide: newLayoutColumnConf.hide,
        dateStart: newLayoutColumnConf.dateStart,
        dateEnd: newLayoutColumnConf.dateEnd,
      },
    })) {
    if (reLoad) {
      await loadData()
      return true
    }
  }
  else {
    return false
  }
  tableBasicConf.columns.push(newColumnConf)
  if (fromColumnName) {
    const fromColumnIdx = layout.columns.findIndex(column => column.name === fromColumnName)!
    layout.columns.splice(fromColumnIdx + 1, 0, newLayoutColumnConf)
  }
  else {
    layout.columns.push(newLayoutColumnConf)
  }
  if (Array.isArray(layout.data)) {
    layout.data.forEach((group) => {
      group.records.forEach((record) => {
        if (fromColumnName) {
          record[newColumnConf.name] = record[fromColumnName]
          if (newColumnConf.useDict)
            record[newColumnConf.name + DATA_DICT_POSTFIX] = record[fromColumnName + DATA_DICT_POSTFIX]
        }
        else {
          record[newColumnConf.name] = getDefaultValueByDataKind(newColumnConf.dataKind!)
        }
      })
    })
  }
  else {
    layout.data?.records.forEach((record) => {
      if (fromColumnName) {
        record[newColumnConf.name] = record[fromColumnName]
        if (newColumnConf.useDict)
          record[newColumnConf.name + DATA_DICT_POSTFIX] = record[fromColumnName + DATA_DICT_POSTFIX]
      }
      else {
        record[newColumnConf.name] = getDefaultValueByDataKind(newColumnConf.dataKind!)
      }
    })
  }
  return true
  // TODO agg清空，重新计算
}

export const FUN_MODIFY_COLUMN_TYPE = Symbol('FUN_MODIFY_COLUMN_TYPE') as InjectionKey<(changedColumnConf?: TableColumnConf, changedLayoutColumnConf?: TableLayoutColumnConf, reFilter?: boolean, reSort?: boolean, reLoad?: boolean) => Promise<boolean>>
export async function modifyColumn(changedColumnConf?: TableColumnConf, changedLayoutColumnConf?: TableLayoutColumnConf, reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!
  if (changedColumnConf && (!events.modifyColumn || !await events.modifyColumn({
    name: changedColumnConf.name,
    title: changedColumnConf.title,
    icon: changedColumnConf.icon,
    dataKind: changedColumnConf.dataKind,
    dataEditable: changedColumnConf.dataEditable,
    kindDateTimeFormat: changedColumnConf.kindDateTimeFormat,
  })))
    return false

  if (changedLayoutColumnConf && (!events.modifyLayout || !await events.modifyLayout({
    id: currentLayoutId.value,
    changedColumn: {
      name: changedLayoutColumnConf.name,
      wrap: changedLayoutColumnConf.wrap,
      fixed: changedLayoutColumnConf.fixed,
      width: changedLayoutColumnConf.width,
      hide: changedLayoutColumnConf.hide,
      dateStart: changedLayoutColumnConf.dateStart,
      dateEnd: changedLayoutColumnConf.dateEnd,
    },
  })))
    return false

  if (reLoad) {
    await loadData()
    return true
  }
  if (changedColumnConf) {
    const oldColumnIdx = tableBasicConf.columns.findIndex(column => column.name === changedColumnConf.name)
    tableBasicConf.columns.splice(oldColumnIdx, 1, changedColumnConf)
  }
  if (changedLayoutColumnConf) {
    const oldColumnIdx = layout.columns.findIndex(column => column.name === changedLayoutColumnConf.name)
    layout.columns.splice(oldColumnIdx, 1, changedLayoutColumnConf)
  }
  return true
  // TODO agg清空，重新计算
}

export const FUN_DELETE_COLUMN_TYPE = Symbol('FUN_DELETE_COLUMN_TYPE') as InjectionKey<(deletedColumnName: string, reFilter?: boolean, reSort?: boolean, reLoad?: boolean) => Promise<boolean>>
export async function deleteColumn(deletedColumnName: string, reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!
  if (events.deleteColumn && events.modifyLayout && await events.deleteColumn(deletedColumnName) && await events.modifyLayout({
    id: currentLayoutId.value,
    deletedColumnName,
  })) {
    if (reLoad) {
      await loadData()
      return true
    }
  }
  else {
    return false
  }
  const oldColumnIdx = tableBasicConf.columns.findIndex(column => column.name === deletedColumnName)
  tableBasicConf.columns.splice(oldColumnIdx, 1)
  const oldLayoutColumnIdx = layout.columns.findIndex(column => column.name === deletedColumnName)
  layout.columns.splice(oldLayoutColumnIdx, 1)
  if (Array.isArray(layout.data)) {
    layout.data.forEach((d) => {
      d.records.forEach((record) => {
        delete (record[deletedColumnName])
      })
    })
  }
  else {
    layout.data?.records.forEach((record) => {
      delete (record[deletedColumnName])
    })
  }
  return true
  // TODO agg清空，重新计算
}

export const FUN_NEW_LAYOUT_TYPE = Symbol('FUN_NEW_LAYOUT_TYPE') as InjectionKey<(newLayoutConf: TableLayoutConf, reFilter?: boolean, reSort?: boolean, reLoad?: boolean) => Promise<boolean>>
export async function newLayout(newLayoutConf: TableLayoutConf, reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  if (events.newLayout && (await events.newLayout({
    id: newLayoutConf.id,
    title: newLayoutConf.title,
    layoutKind: newLayoutConf.layoutKind,
    icon: newLayoutConf.icon,
    columns: Object.entries(newLayoutConf.columns).map(([name, column]) => {
      return {
        name,
        wrap: column.wrap,
        fixed: column.fixed,
        width: column.width,
        hide: column.hide,
        dateStart: column.dateStart,
        dateEnd: column.dateEnd,
      }
    }),
    filters: newLayoutConf.filters,
    sorts: newLayoutConf.sorts,
    group: newLayoutConf.group,
    aggs: newLayoutConf.aggs,
    expandDataPks: newLayoutConf.expandDataPks,
    fetchDataNumber: newLayoutConf.fetchDataNumber,
  }))) {
    if (reLoad) {
      await loadData()
      return true
    }
  }
  else {
    return false
  }
  tableLayoutsConf.push(newLayoutConf)
  return true
  // TODO agg清空，重新计算
}

export const FUN_MODIFY_LAYOUT_TYPE = Symbol('FUN_MODIFY_LAYOUT_TYPE') as InjectionKey<(changedLayoutReq: TableLayoutModifyReq, reFilter?: boolean, reSort?: boolean, reLoad?: boolean) => Promise<boolean>>
export async function modifyLayout(changedLayoutReq: TableLayoutModifyReq, reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  const layout = changedLayoutReq.id ? tableLayoutsConf.find(layout => layout.id === changedLayoutReq.id)! : tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!
  if (events.modifyLayout && (await events.modifyLayout(changedLayoutReq))) {
    if (reLoad) {
      await loadData()
      return true
    }
  }
  else {
    return false
  }
  changedLayoutReq.title && (layout.title = changedLayoutReq.title)
  changedLayoutReq.icon && (layout.icon = changedLayoutReq.icon)
  changedLayoutReq.filters && (layout.filters = changedLayoutReq.filters)
  changedLayoutReq.sorts && (layout.sorts = changedLayoutReq.sorts)
  changedLayoutReq.group && (layout.group = changedLayoutReq.group)
  // TODO
  changedLayoutReq.aggs && (layout.aggs = changedLayoutReq.aggs)
  if (changedLayoutReq.newExpandDataPk) {
    const idx = layout.expandDataPks.indexOf(changedLayoutReq.newExpandDataPk)
    if (idx === -1)
      layout.expandDataPks.push(changedLayoutReq.newExpandDataPk)
  }
  if (changedLayoutReq.deleteExpandDataPk) {
    let deleteExpandDataPks = []
    if (Array.isArray(layout.data)) {
      layout.data.forEach((groupData) => {
        deleteExpandDataPks.push(...filterTreeDataPks([changedLayoutReq.deleteExpandDataPk], groupData.records, tableBasicConf.pkColumnName, tableBasicConf.parentPkColumnName))
      })
    }
    else {
      deleteExpandDataPks = filterTreeDataPks([changedLayoutReq.deleteExpandDataPk], (layout.data as TableDataResp).records, tableBasicConf.pkColumnName, tableBasicConf.parentPkColumnName)
    }
    deleteExpandDataPks.forEach((deleteExpandDataPk) => {
      const idx = layout.expandDataPks.indexOf(deleteExpandDataPk)
      if (idx !== -1)
        layout.expandDataPks.splice(idx, 1)
    })
  }
  changedLayoutReq.fetchDataNumber && (layout.fetchDataNumber = changedLayoutReq.fetchDataNumber)
  if (changedLayoutReq.deletedColumnName) {
    const oldLayoutColumnIdx = layout.columns.findIndex(column => column.name === changedLayoutReq.deletedColumnName)
    layout.columns.splice(oldLayoutColumnIdx, 1)
  }
  changedLayoutReq.newColumn && (layout.columns.push({
    name: changedLayoutReq.newColumn.name,
    wrap: changedLayoutReq.newColumn.wrap ?? true,
    fixed: changedLayoutReq.newColumn.fixed ?? false,
    width: changedLayoutReq.newColumn.width ?? 200,
    hide: changedLayoutReq.newColumn.hide ?? false,
    dateStart: changedLayoutReq.newColumn.dateStart ?? false,
    dateEnd: changedLayoutReq.newColumn.dateEnd ?? false,
  }))
  if (changedLayoutReq.changedColumn) {
    const oldLayoutColumnIdx = layout.columns.findIndex(column => column.name === changedLayoutReq.changedColumn?.name)
    layout.columns.splice(oldLayoutColumnIdx, 1, {
      name: changedLayoutReq.changedColumn.name,
      wrap: changedLayoutReq.changedColumn.wrap ?? true,
      fixed: changedLayoutReq.changedColumn.fixed ?? false,
      width: changedLayoutReq.changedColumn.width ?? 200,
      hide: changedLayoutReq.changedColumn.hide ?? false,
      dateStart: changedLayoutReq.changedColumn.dateStart ?? false,
      dateEnd: changedLayoutReq.changedColumn.dateEnd ?? false,
    })
  }
  if (changedLayoutReq.columnSortedNames) {
    const leftColumnIdx = layout.columns.findIndex(column => column.name === changedLayoutReq.columnSortedNames![0])
    const rightColumnIdx = layout.columns.findIndex(column => column.name === changedLayoutReq.columnSortedNames![1])
    const tmpColumn = layout.columns[leftColumnIdx]
    layout.columns.splice(leftColumnIdx, 1, layout.columns[rightColumnIdx])
    layout.columns.splice(rightColumnIdx, 1, tmpColumn)
  }
  return true
  // TODO agg清空，重新计算
}

export const FUN_DELETE_LAYOUT_TYPE = Symbol('FUN_DELETE_LAYOUT_TYPE') as InjectionKey<(deletedLayoutId: string, reFilter?: boolean, reSort?: boolean, reLoad?: boolean) => Promise<boolean>>
export async function deleteLayout(deletedLayoutId: string, reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  if (events.deleteLayout && await events.deleteLayout(deletedLayoutId)) {
    if (reLoad) {
      await loadData()
      return true
    }
  }
  else {
    return false
  }
  const oldColumnIdx = tableLayoutsConf.findIndex(layout => layout.id === deletedLayoutId)!
  tableLayoutsConf.splice(oldColumnIdx, 1)
  return true
  // TODO agg清空，重新计算
}

export const FUN_SORT_LAYOUTS_TYPE = Symbol('FUN_SORT_LAYOUTS_TYPE') as InjectionKey<(leftLayoutId: string, rightLayoutId: string, reFilter?: boolean, reSort?: boolean, reLoad?: boolean) => Promise<boolean>>
export async function sortLayouts(leftLayoutId: string, rightLayoutId: string, reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  if (events.sortLayouts && (await events.sortLayouts(leftLayoutId, rightLayoutId))) {
    if (reLoad) {
      await loadData()
      return true
    }
  }
  else {
    return false
  }
  const leftLayout = tableLayoutsConf.findIndex(layout => layout.id === leftLayoutId)
  const rightLayout = tableLayoutsConf.findIndex(layout => layout.id === rightLayoutId)
  const tmpLayout = tableLayoutsConf[leftLayout]
  tableLayoutsConf.splice(leftLayout, 1, tableLayoutsConf[rightLayout])
  tableLayoutsConf.splice(rightLayout, 1, tmpLayout)
  return true
  // TODO agg清空，重新计算
}
