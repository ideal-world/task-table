import type { InjectionKey, Ref } from 'vue'
import { toRaw } from 'vue'
import locales from '../locales'
import type { TableCellDictItemsResp, TableDataSliceProps, TableEventProps, TableLayoutModifyProps } from '../props'
import { getParentWithClass } from '../utils/basic'
import { AlertKind, showAlert } from './common/Alert'
import type { TableBasicConf, TableLayoutColumnConf, TableLayoutConf, TableLayoutKernelConf, TableStyleConf } from './conf'
import { sortByTree } from './function/RowTree'

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

export const FUN_NEW_DATA_TYPE = Symbol('FUN_NEW_DATA_TYPE') as InjectionKey<(newRecords: { [key: string]: any }[]) => Promise<boolean>>
export async function newData(newRecords: { [key: string]: any }[]): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.newData) {
    showAlert(t('_.event.notConfigured', { name: 'newData' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.newData] Event not Configured')
  }

  await events.newData(newRecords)
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

export const FUN_LOAD_CELL_DICT_ITEMS_TYPE = Symbol('FUN_LOAD_CELL_DICT_ITEMS_TYPE') as InjectionKey<(columnName: string, filterValue?: any, slice?: TableDataSliceProps) => Promise<TableCellDictItemsResp>>
export async function loadCellDictItems(columnName: string, filterValue?: any, slice?: TableDataSliceProps): Promise<TableCellDictItemsResp> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.loadCellDictItems) {
    showAlert(t('_.event.notConfigured', { name: 'loadCellDictItems' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.loadCellDictItems] Event not Configured')
  }

  return await events.loadCellDictItems(columnName, filterValue, slice)
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

export const FUN_NEW_COLUMN_TYPE = Symbol('FUN_NEW_COLUMN_TYPE') as InjectionKey<(newLayoutColumnConf: TableLayoutColumnConf) => Promise<boolean>>
export async function newColumn(newLayoutColumnConf: TableLayoutColumnConf): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.modifyLayout) {
    showAlert(t('_.event.notConfigured', { name: 'modifyLayout' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.modifyLayout] Event not Configured')
  }

  if (!await events.modifyLayout(layout.id, {
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
  layout.columns.push(newLayoutColumnConf)
  await loadData()
  return true
}

export const FUN_MODIFY_COLUMN_TYPE = Symbol('FUN_MODIFY_COLUMN_TYPE') as InjectionKey<(changedLayoutColumnConf?: TableLayoutColumnConf) => Promise<boolean>>
export async function modifyColumn(changedLayoutColumnConf?: TableLayoutColumnConf): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.modifyLayout) {
    showAlert(t('_.event.notConfigured', { name: 'modifyLayout' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.modifyLayout] Event not Configured')
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

  if (!events.modifyLayout) {
    showAlert(t('_.event.notConfigured', { name: 'modifyLayout' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.modifyLayout] Event not Configured')
  }

  if (!await events.modifyLayout(layout.id, {
    deletedColumnName,
  })) {
    return false
  }

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
