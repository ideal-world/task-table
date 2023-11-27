import type { InjectionKey, Ref } from 'vue'
import { toRaw } from 'vue'
import type { TableBasicConf, TableColumnConf, TableLayoutColumnConf, TableLayoutConf, TableStyleConf } from './conf'
import { getDefaultValueByDataKind } from './conf'
import type { TableCellDictItem, TableCellDictItemResp, TableDataSliceReq, TableEventProps, TableLayoutModifyReq } from './props'
import { OperatorKind } from './props'

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

  if (moreForGroupedValue) {
    const groupFilter = {
      items: [
        {
          columnName: layout.group?.columnName as string,
          operator: OperatorKind.EQ,
          value: moreForGroupedValue,
        },
      ],
      and: true,
    }
    if (filters)
      filters.push(groupFilter)
    else
      filters = [groupFilter]
  }
  let sorts
  if (layout.sorts)
    sorts = toRaw(layout.sorts)

  let group
  if (layout.group)
    group = toRaw(layout.group)

  let aggs
  if (layout.aggs)
    aggs = toRaw(layout.aggs)

  let slice
  if (layout.slice)
    slice = toRaw(layout.slice)

  const resp = await events.loadData(filters, sorts, group, aggs, slice)
  if (Array.isArray(resp)) {
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
        groupData.aggs = resp.aggs
        groupData.totalNumber = resp.totalNumber
      }
    }
    else {
      layout.data = resp
    }
  }
  else {
    // Query without grouping
    layout.data = resp
  }
}

export const FUN_ADD_DATA_TYPE = Symbol('FUN_ADD_DATA_TYPE') as InjectionKey<(newRecords: { [key: string]: any }[], afterPkId?: number, groupValue?: any, reFilter?: boolean, reSort?: boolean, reLoad?: boolean) => Promise<boolean>>
export async function addData(newRecords: { [key: string]: any }[], afterPkId?: number, groupValue?: any, reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!
  if (events.saveData && (await events.saveData(newRecords))) {
    if (reLoad) {
      await loadData()
      return true
    }
  }
  else {
    return false
  }
  let data
  if (groupValue && Array.isArray(layout.data)) {
    data = layout.data.find(d => d.groupValue === groupValue)
  }
  else if (layout.data && !Array.isArray(layout.data)) {
    data = layout.data
  }
  else {
    // Empty,unreachable
  }
  if (data) {
    if (afterPkId)
      data.records.splice(afterPkId, 0, ...newRecords)
    else
      data.records.splice(0, 0, ...newRecords)
  }
  return true
  // TODO agg清空，重新计算
}

export const FUN_UPDATE_DATA_TYPE = Symbol('FUN_UPDATE_DATA_TYPE') as InjectionKey<(changedRecords: { [key: string]: any }[], reFilter?: boolean, reSort?: boolean, reLoad?: boolean) => Promise<boolean>>
export async function updateData(changedRecords: { [key: string]: any }[], reFilter?: boolean, reSort?: boolean, reLoad?: boolean): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!
  if (events.saveData && (await events.saveData(changedRecords))) {
    if (reLoad) {
      await loadData()
      return true
    }
  }
  else {
    return false
  }
  if (Array.isArray(layout.data)) {
    layout.data.forEach((groupData) => {
      groupData.records.forEach((needChangeRecord) => {
        const changedRecord = changedRecords.find(r => r[tableBasicConf.pkColumnName] === needChangeRecord[tableBasicConf.pkColumnName])
        if (changedRecord) {
          for (const key in changedRecord)
            needChangeRecord[key] = changedRecord[key]
        }
      })
    })
  }
  else if (layout.data && !Array.isArray(layout.data)) {
    layout.data.records.forEach((needChangeRecord) => {
      const changedRecord = changedRecords.find(r => r[tableBasicConf.pkColumnName] === needChangeRecord[tableBasicConf.pkColumnName])
      if (changedRecord) {
        for (const key in changedRecord)
          needChangeRecord[key] = changedRecord[key]
      }
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
      d.records = d.records.filter(item => !deletedPks.includes(item[tableBasicConf.pkColumnName]))
    })
  }
  else if (layout.data && !Array.isArray(layout.data)) {
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
    layout.data.forEach((d) => {
      d.records.forEach((record) => {
        if (fromColumnName)
          record[newColumnConf.name] = record[fromColumnName]
        else
          record[newColumnConf.name] = getDefaultValueByDataKind(newColumnConf.dataKind!)
      })
    })
  }
  else {
    layout.data?.records.forEach((record) => {
      if (fromColumnName)
        record[newColumnConf.name] = record[fromColumnName]
      else
        record[newColumnConf.name] = getDefaultValueByDataKind(newColumnConf.dataKind!)
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
  changedLayoutReq.aggs && (layout.aggs = changedLayoutReq.aggs)
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
