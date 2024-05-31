import type { InjectionKey, Ref } from 'vue'
import { toRaw } from 'vue'
import locales from '../locales'
import { getParentWithClass } from '../utils/basic'
import { AlertKind, showAlert } from './common/Alert'
import type { TableBasicConf, TableColumnConf, TableLayoutColumnConf, TableLayoutConf, TableLayoutKernelConf, TableStyleConf } from './conf'
import { filterTreeDataPks, sortByTree } from './function/RowTree'
import type { TableCellDictItemProps, TableCellDictItemsResp, TableDataResp, TableDataSliceProps, TableEventProps, TableLayoutModifyProps } from './props'

const { t } = locales.global

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
    loadData(undefined, undefined, undefined, layout.id)
  })
}

export const FUN_LOAD_DATA_TYPE = Symbol('FUN_LOAD_DATA_TYPE') as InjectionKey<(moreForGroupedValue?: any, offsetNumber?: number, fetchNumber?: number, layoutId?: string) => Promise<void>>
export async function loadData(moreForGroupedValue?: any, offsetNumber?: number, fetchNumber?: number, layoutId?: string) {
  const layout = layoutId ? tableLayoutsConf.find(layout => layout.id === layoutId)! : tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (offsetNumber && fetchNumber) {
    if (moreForGroupedValue && layout.group) {
      if (layout.group.slices[moreForGroupedValue]) {
        layout.group.slices[moreForGroupedValue].offsetNumber = offsetNumber
        layout.group.slices[moreForGroupedValue].fetchNumber = fetchNumber
      }
    }
    else if (layout.group) {
      for (const groupValue in layout.group.slices) {
        layout.group.slices[groupValue].offsetNumber = offsetNumber
        layout.group.slices[groupValue].fetchNumber = fetchNumber
      }
    }
    layout.slice.offsetNumber = offsetNumber
    layout.slice.fetchNumber = fetchNumber
  }

  const resp = await events.loadData(
    layout.filters ?? toRaw(layout.filters),
    layout.sorts ?? toRaw(layout.sorts),
    layout.group ?? toRaw(layout.group),
    layout.aggs ?? toRaw(layout.aggs),
    moreForGroupedValue ?? moreForGroupedValue,
    toRaw(layout.slice),
  )

  if (!moreForGroupedValue && !layout.group) {
    // Load data without grouping
    if (!Array.isArray(resp)) {
      resp.records = sortByTree(resp.records, tableBasicConf.pkColumnName, tableBasicConf.parentPkColumnName)
      layout.data = resp
    }
    else {
      showAlert(t('_.event.loadDataInvalidScene'), 2, AlertKind.ERROR, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
      throw new Error('[events.loadData]  Invalid scene')
    }
  }
  else if (!moreForGroupedValue && layout.group) {
    // Load all grouped data
    if (Array.isArray(resp)) {
      resp.forEach((groupData) => {
        groupData.records = sortByTree(groupData.records, tableBasicConf.pkColumnName, tableBasicConf.parentPkColumnName)
      })
      layout.data = resp
    }
    else {
      showAlert(t('_.event.loadDataInvalidScene'), 2, AlertKind.ERROR, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
      throw new Error('[events.loadData]  Invalid scene')
    }
  }
  else if (moreForGroupedValue) {
    // Load a grouped data
    if (!Array.isArray(resp) && Array.isArray(layout.data)) {
      const groupData = layout.data.find(d => d.groupValue === moreForGroupedValue)
      if (groupData) {
        groupData.records = sortByTree(resp.records, tableBasicConf.pkColumnName, tableBasicConf.parentPkColumnName)
        groupData.aggs = resp.aggs
        groupData.totalNumber = resp.totalNumber
      }
    }
    else {
      showAlert(t('_.event.loadDataInvalidScene'), 2, AlertKind.ERROR, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
      throw new Error('[events.loadData]  Invalid scene')
    }
  }
  else {
    showAlert(t('_.event.loadDataInvalidScene'), 2, AlertKind.ERROR, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.loadData]  Invalid scene')
  }

  if (offsetNumber && fetchNumber) {
    // Update slice by current layout
    await modifyLayout({
      group: layout.group,
      slice: layout.slice,
    })
  }
}

export const FUN_NEW_DATA_TYPE = Symbol('FUN_NEW_DATA_TYPE') as InjectionKey<(newRecords: { [key: string]: any }[], afterRecordPk?: any) => Promise<boolean>>
export async function newData(newRecords: { [key: string]: any }[], afterRecordPk?: any): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.newData) {
    showAlert(t('_.event.notConfigured', { name: 'newData' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.newData] Event not Configured')
  }

  let targetSortValue

  if (tableBasicConf.freeSortColumnName && afterRecordPk) {
    if (Array.isArray(layout.data)) {
      for (const layoutData of layout.data) {
        const targetRecord = layoutData.records.find(record => record[tableBasicConf.pkColumnName] === afterRecordPk)
        targetRecord && (targetSortValue = targetRecord[tableBasicConf.freeSortColumnName])
        if (targetSortValue !== undefined)
          break
      }
    }
    else if (layout.data && !Array.isArray(layout.data)) {
      const targetRecord = layout.data.records.find(record => record[tableBasicConf.pkColumnName] === afterRecordPk)
      targetRecord && (targetSortValue = targetRecord[tableBasicConf.freeSortColumnName])
    }
  }

  await events.newData(newRecords, targetSortValue)
  await loadData()
  return true
}

export const FUN_COPY_DATA_TYPE = Symbol('FUN_COPY_DATA_TYPE') as InjectionKey<(targetRecordPks: any[]) => Promise<boolean>>
export async function copyData(targetRecordPks: any[]): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.copyData) {
    showAlert(t('_.event.notConfigured', { name: 'copyData' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.copyData] Event not Configured')
  }

  await events.copyData(targetRecordPks)
  await loadData()
  return true
}

export const FUN_MODIFY_DATA_TYPE = Symbol('FUN_MODIFY_DATA_TYPE') as InjectionKey<(changedRecords: { [key: string]: any }[]) => Promise<boolean>>
export async function modifyData(changedRecords: { [key: string]: any }[]): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.modifyData) {
    showAlert(t('_.event.notConfigured', { name: 'modifyData' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.modifyData] Event not Configured')
  }

  await events.modifyData(changedRecords)
  await loadData()
  return true
}

export const FUN_DELETE_DATA_TYPE = Symbol('FUN_DELETE_DATA_TYPE') as InjectionKey<(deletedRecordPks: any[]) => Promise<boolean>>
export async function deleteData(deletedRecordPks: any[]): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.deleteData) {
    showAlert(t('_.event.notConfigured', { name: 'deleteData' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.deleteData] Event not Configured')
  }

  if (!await events.deleteData(deletedRecordPks))
    return false

  await loadData()
  return true
}

export const FUN_SORT_DATA_TYPE = Symbol('FUN_SORT_DATA_TYPE') as InjectionKey<(formRecordPk: any[], targetSortValue: string) => Promise<boolean>>
export async function sortData(formRecordPk: any[], targetSortValue: string): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.sortData) {
    showAlert(t('_.event.notConfigured', { name: 'sortData' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.sortData] Event not Configured')
  }

  if (!await events.sortData(formRecordPk, targetSortValue))
    return false

  await loadData()
  return true
}

export const FUN_LOAD_CELL_DICT_ITEMS_TYPE = Symbol('FUN_LOAD_CELL_DICT_ITEMS_TYPE') as InjectionKey<(columnName: string, filterValue?: any, slice?: TableDataSliceProps) => Promise<TableCellDictItemsResp>>
export async function loadCellDictItems(columnName: string, filterValue?: any, slice?: TableDataSliceProps): Promise<TableCellDictItemsResp> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.loadCellDictItems) {
    showAlert(t('_.event.notConfigured', { name: 'loadCellDictItems' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.loadCellDictItems] Event not Configured')
  }

  return await events.loadCellDictItems(columnName, filterValue, slice)
}

export const FUN_NEW_OR_MODIFY_CELL_DICT_ITEM_TYPE = Symbol('FUN_NEW_OR_MODIFY_CELL_DICT_ITEM_TYPE') as InjectionKey<(columnName: string, changedItem: TableCellDictItemProps) => Promise<boolean>>
export async function newOrModifyCellDictItem(columnName: string, changedItem: TableCellDictItemProps): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.newOrModifyCellDictItem) {
    showAlert(t('_.event.notConfigured', { name: 'newOrModifyCellDictItem' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.newOrModifyCellDictItem] Event not Configured')
  }

  return await events.newOrModifyCellDictItem(columnName, changedItem)
}

export const FUN_DELETE_CELL_DICT_ITEM_TYPE = Symbol('FUN_DELETE_CELL_DICT_ITEM_TYPE') as InjectionKey<(columnName: string, value: any) => Promise<boolean>>
export async function deleteCellDictItem(columnName: string, value: any): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.deleteCellDictItem) {
    showAlert(t('_.event.notConfigured', { name: 'deleteCellDictItem' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.deleteCellDictItem] Event not Configured')
  }

  return await events.deleteCellDictItem(columnName, value)
}

export const FUN_SORT_CELL_DICT_ITEMS_TYPE = Symbol('FUN_SORT_CELL_DICT_ITEMS_TYPE') as InjectionKey<(columnName: string, leftItemValue: any, rightItemValue: any) => Promise<boolean>>
export async function sortCellDictItems(columnName: string, leftItemValue: any, rightItemValue: any): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.sortCellDictItems) {
    showAlert(t('_.event.notConfigured', { name: 'sortCellDictItems' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.sortCellDictItems] Event not Configured')
  }

  return await events.sortCellDictItems(columnName, leftItemValue, rightItemValue)
}

export const FUN_MODIFY_STYLES_TYPE = Symbol('FUN_MODIFY_STYLES_TYPE') as InjectionKey<(changedStyles: TableStyleConf) => Promise<boolean>>
export async function modifyStyles(changedStyles: TableStyleConf): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.modifyStyles) {
    showAlert(t('_.event.notConfigured', { name: 'modifyStyles' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.modifyStyles] Event not Configured')
  }

  if (!await events.modifyStyles({
    size: changedStyles.size,
    tableClass: changedStyles.tableClass,
    headerClass: changedStyles.headerClass,
    rowClass: changedStyles.rowClass,
    cellClass: changedStyles.cellClass,
    aggClass: changedStyles.aggClass,
  })) {
    return false
  }

  tableBasicConf.styles = changedStyles
  return true
}

export const FUN_NEW_COLUMN_TYPE = Symbol('FUN_NEW_COLUMN_TYPE') as InjectionKey<(newColumnConf: TableColumnConf, newLayoutColumnConf: TableLayoutColumnConf, fromColumnName?: string) => Promise<boolean>>
export async function newColumn(newColumnConf: TableColumnConf, newLayoutColumnConf: TableLayoutColumnConf, fromColumnName?: string): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.newColumn || !events.modifyLayout) {
    showAlert(t('_.event.notConfigured', { name: 'newColumn|modifyLayout' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.newColumn/modifyLayout] Event not Configured')
  }

  if (!await events.newColumn({
    name: newColumnConf.name,
    title: newColumnConf.title,
    icon: newColumnConf.icon,
    dataKind: newColumnConf.dataKind,
    dataEditable: newColumnConf.dataEditable,
    useDict: newColumnConf.useDict,
    dictEditable: newColumnConf.dictEditable,
    multiValue: newColumnConf.multiValue,
    groupable: newColumnConf.groupable,
    kindDateTimeFormat: newColumnConf.kindDateTimeFormat,
  }, fromColumnName) || !await events.modifyLayout(layout.id, {
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

  await loadData()
  return true
}

export const FUN_MODIFY_COLUMN_TYPE = Symbol('FUN_MODIFY_COLUMN_TYPE') as InjectionKey<(changedColumnConf?: TableColumnConf, changedLayoutColumnConf?: TableLayoutColumnConf) => Promise<boolean>>
export async function modifyColumn(changedColumnConf?: TableColumnConf, changedLayoutColumnConf?: TableLayoutColumnConf): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.modifyColumn || !events.modifyLayout) {
    showAlert(t('_.event.notConfigured', { name: 'modifyColumn|modifyLayout' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.modifyColumn/modifyLayout] Event not Configured')
  }

  if (changedColumnConf && !await events.modifyColumn({
    name: changedColumnConf.name,
    title: changedColumnConf.title,
    icon: changedColumnConf.icon,
    dataKind: changedColumnConf.dataKind,
    dataEditable: changedColumnConf.dataEditable,
    groupable: changedColumnConf.groupable,
    kindDateTimeFormat: changedColumnConf.kindDateTimeFormat,
  })) {
    return false
  }

  if (changedLayoutColumnConf && !await events.modifyLayout(layout.id, {
    changedColumn: {
      name: changedLayoutColumnConf.name,
      wrap: changedLayoutColumnConf.wrap,
      fixed: changedLayoutColumnConf.fixed,
      width: changedLayoutColumnConf.width,
      hide: changedLayoutColumnConf.hide,
      dateStart: changedLayoutColumnConf.dateStart,
      dateEnd: changedLayoutColumnConf.dateEnd,
    },
  })) {
    return false
  }

  if (changedColumnConf) {
    const oldColumnIdx = tableBasicConf.columns.findIndex(column => column.name === changedColumnConf.name)
    tableBasicConf.columns.splice(oldColumnIdx, 1, changedColumnConf)
  }
  if (changedLayoutColumnConf) {
    const oldColumnIdx = layout.columns.findIndex(column => column.name === changedLayoutColumnConf.name)
    layout.columns.splice(oldColumnIdx, 1, changedLayoutColumnConf)
  }

  await loadData()
  return true
}

export const FUN_DELETE_COLUMN_TYPE = Symbol('FUN_DELETE_COLUMN_TYPE') as InjectionKey<(deletedColumnName: string) => Promise<boolean>>
export async function deleteColumn(deletedColumnName: string): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.deleteColumn || !events.modifyLayout) {
    showAlert(t('_.event.notConfigured', { name: 'deleteColumn|modifyLayout' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.deleteColumn/modifyLayout] Event not Configured')
  }

  if (!await events.deleteColumn(deletedColumnName) || !await events.modifyLayout(layout.id, {
    deletedColumnName,
  })) {
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
}

export const FUN_NEW_LAYOUT_TYPE = Symbol('FUN_NEW_LAYOUT_TYPE') as InjectionKey<(newLayoutConf: TableLayoutKernelConf) => Promise<boolean>>
export async function newLayout(newLayoutConf: TableLayoutKernelConf): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.newLayout) {
    showAlert(t('_.event.notConfigured', { name: 'newLayout' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.newLayout] Event not Configured')
  }

  const layoutId = await events.newLayout({
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
    slice: newLayoutConf.slice,
  })
  tableLayoutsConf.push({
    id: layoutId,
    ...newLayoutConf,
  })

  await loadData(undefined, undefined, undefined, layoutId)
  return true
}

export const FUN_MODIFY_LAYOUT_TYPE = Symbol('FUN_MODIFY_LAYOUT_TYPE') as InjectionKey<(changedLayoutReq: TableLayoutModifyProps) => Promise<boolean>>
export async function modifyLayout(changedLayoutReq: TableLayoutModifyProps): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.modifyLayout) {
    showAlert(t('_.event.notConfigured', { name: 'modifyLayout' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.modifyLayout] Event not Configured')
  }

  if (!await events.modifyLayout(layout.id, changedLayoutReq))
    return false

  changedLayoutReq.title && (layout.title = changedLayoutReq.title)
  changedLayoutReq.icon && (layout.icon = changedLayoutReq.icon)
  changedLayoutReq.filters && (layout.filters = changedLayoutReq.filters)
  changedLayoutReq.sorts && (layout.sorts = changedLayoutReq.sorts)
  changedLayoutReq.group && (layout.group = changedLayoutReq.group)
  changedLayoutReq.aggs && (layout.aggs = changedLayoutReq.aggs)
  changedLayoutReq.slice && (layout.slice = changedLayoutReq.slice)
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

  await loadData()
  return true
}

export const FUN_DELETE_LAYOUT_TYPE = Symbol('FUN_DELETE_LAYOUT_TYPE') as InjectionKey<(deletedLayoutId: string) => Promise<boolean>>
export async function deleteLayout(deletedLayoutId: string): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.deleteLayout) {
    showAlert(t('_.event.notConfigured', { name: 'deleteLayout' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.deleteLayout] Event not Configured')
  }

  if (!await events.deleteLayout(deletedLayoutId))
    return false

  const oldColumnIdx = tableLayoutsConf.findIndex(layout => layout.id === deletedLayoutId)!
  tableLayoutsConf.splice(oldColumnIdx, 1)
  return true
}

export const FUN_SORT_LAYOUTS_TYPE = Symbol('FUN_SORT_LAYOUTS_TYPE') as InjectionKey<(leftLayoutId: string, rightLayoutId: string) => Promise<boolean>>
export async function sortLayouts(leftLayoutId: string, rightLayoutId: string): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.sortLayouts) {
    showAlert(t('_.event.notConfigured', { name: 'sortLayouts' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.sortLayouts] Event not Configured')
  }

  if (!await events.sortLayouts(leftLayoutId, rightLayoutId))
    return false

  const leftLayout = tableLayoutsConf.findIndex(layout => layout.id === leftLayoutId)
  const rightLayout = tableLayoutsConf.findIndex(layout => layout.id === rightLayoutId)
  const tmpLayout = tableLayoutsConf[leftLayout]
  tableLayoutsConf.splice(leftLayout, 1, tableLayoutsConf[rightLayout])
  tableLayoutsConf.splice(rightLayout, 1, tmpLayout)
  return true
}
