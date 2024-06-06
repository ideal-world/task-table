import type { Ref } from 'vue'
import { toRaw } from 'vue'
import locales from '../locales'
import { SubDataShowKind, type TableCellDictItemsResp, type TableDataSliceProps, type TableEventProps, type TableLayoutKernelProps, type TableLayoutModifyProps } from '../props'
import { getParentWithClass } from '../utils/basic'
import { AlertKind, showAlert } from './common/Alert'
import { type TableBasicConf, type TableLayoutConf, type TableStyleConf, convertTableLayoutColumnPropsToTableLayoutColumnConf, convertTableLayoutKernelPropsToTableLayoutKernelConf } from './conf'
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
    loadData(undefined, layout.id)
  })
}

export async function loadData(moreForGroupedValue?: any, layoutId?: string) {
  const layout = layoutId ? tableLayoutsConf.find(layout => layout.id === layoutId)! : tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  const showColumns = layout.columns.filter(column => !column.hide).map(column => column.name).slice()
  if (tableBasicConf.parentPkColumnName && layout.columns.findIndex(column => column.name === tableBasicConf.parentPkColumnName) === -1) {
    showColumns.push(tableBasicConf.parentPkColumnName)
  }

  const resp = await events.loadData(
    showColumns,
    layout.filters ?? toRaw(layout.filters),
    layout.sorts ?? toRaw(layout.sorts),
    layout.group ?? toRaw(layout.group),
    layout.aggs ?? toRaw(layout.aggs),
    layout.subDataShowKind === SubDataShowKind.ONLY_PARENT_DATA,
    moreForGroupedValue ?? moreForGroupedValue,
    moreForGroupedValue && layout.groupSlices && layout.groupSlices[moreForGroupedValue as string] ? layout.groupSlices[moreForGroupedValue as string] : layout.defaultSlice,
  )

  if (!moreForGroupedValue && !layout.group) {
    // Load data without grouping
    if (!Array.isArray(resp)) {
      resp.records = layout.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA ? sortByTree(resp.records, tableBasicConf.pkColumnName, tableBasicConf.parentPkColumnName) : resp.records
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
        groupData.records = layout.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA ? sortByTree(groupData.records, tableBasicConf.pkColumnName, tableBasicConf.parentPkColumnName) : groupData.records
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
        groupData.records = layout.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA ? sortByTree(resp.records, tableBasicConf.pkColumnName, tableBasicConf.parentPkColumnName) : resp.records
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
}

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

export async function selectData(selectedRecordPks: any[]): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.selectData) {
    showAlert(t('_.event.notConfigured', { name: 'selectData' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.selectData] Event not Configured')
  }
  if (!await events.selectData(selectedRecordPks)) {
    return false
  }
  layout.selectedDataPks = selectedRecordPks
  return true
}

export async function clickCell(clickedRecordPk: any, clickedColumnName: string): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.clickCell) {
    showAlert(t('_.event.notConfigured', { name: 'clickCell' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.clickCell] Event not Configured')
  }
  return await events.clickCell(clickedRecordPk, clickedColumnName)
}

export async function loadCellDictItems(columnName: string, filterValue?: any, slice?: TableDataSliceProps): Promise<TableCellDictItemsResp> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.loadCellDictItems) {
    showAlert(t('_.event.notConfigured', { name: 'loadCellDictItems' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.loadCellDictItems] Event not Configured')
  }

  return await events.loadCellDictItems(columnName, filterValue, slice)
}

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

export async function newLayout(newLayoutProps: TableLayoutKernelProps): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.newLayout) {
    showAlert(t('_.event.notConfigured', { name: 'newLayout' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.newLayout] Event not Configured')
  }

  const layoutId = await events.newLayout({
    title: newLayoutProps.title,
    layoutKind: newLayoutProps.layoutKind,
    icon: newLayoutProps.icon,
    columns: Object.entries(newLayoutProps.columns).map(([name, column]) => {
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
    filters: newLayoutProps.filters,
    sorts: newLayoutProps.sorts,
    group: newLayoutProps.group,
    aggs: newLayoutProps.aggs,
    defaultSlice: newLayoutProps.defaultSlice,
    groupSlices: newLayoutProps.groupSlices,
    subDataShowKind: newLayoutProps.subDataShowKind,
    showSelectColumn: newLayoutProps.showSelectColumn,
    actionColumnRender: newLayoutProps.actionColumnRender,
    actionColumnWidth: newLayoutProps.actionColumnWidth,
  })
  tableLayoutsConf.push({
    id: layoutId,
    ...convertTableLayoutKernelPropsToTableLayoutKernelConf(newLayoutProps, tableBasicConf.columns),
  })

  await loadData(undefined, layoutId)
  return true
}

export async function modifyLayout(changedLayoutProps: TableLayoutModifyProps, byGroupValue?: any): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.modifyLayout) {
    showAlert(t('_.event.notConfigured', { name: 'modifyLayout' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.modifyLayout] Event not Configured')
  }

  if (!await events.modifyLayout(layout.id, changedLayoutProps))
    return false

  changedLayoutProps.title && (layout.title = changedLayoutProps.title)
  changedLayoutProps.icon && (layout.icon = changedLayoutProps.icon)
  changedLayoutProps.filters && (layout.filters = changedLayoutProps.filters)
  changedLayoutProps.sorts && (layout.sorts = changedLayoutProps.sorts)
  changedLayoutProps.group && (layout.group = changedLayoutProps.group)
  if (changedLayoutProps.removeGroup) {
    layout.group = undefined
  }
  changedLayoutProps.aggs && (layout.aggs = changedLayoutProps.aggs)
  changedLayoutProps.defaultSlice && (layout.defaultSlice = changedLayoutProps.defaultSlice)
  changedLayoutProps.groupSlices && (layout.groupSlices = changedLayoutProps.groupSlices)
  changedLayoutProps.subDataShowKind && (layout.subDataShowKind = changedLayoutProps.subDataShowKind)

  if (changedLayoutProps.newColumn) {
    layout.columns.push(convertTableLayoutColumnPropsToTableLayoutColumnConf(changedLayoutProps.newColumn, tableBasicConf.columns.find(column => column.name === changedLayoutProps.newColumn?.name)!))
  }

  if (changedLayoutProps.changedColumn) {
    const oldLayoutColumnIdx = layout.columns.findIndex(column => column.name === changedLayoutProps.changedColumn?.name)
    oldLayoutColumnIdx !== -1 && layout.columns.splice(oldLayoutColumnIdx, 1, convertTableLayoutColumnPropsToTableLayoutColumnConf(changedLayoutProps.changedColumn, tableBasicConf.columns.find(column => column.name === changedLayoutProps.changedColumn?.name)!))
  }

  if (changedLayoutProps.deletedColumnName) {
    const oldLayoutColumnIdx = layout.columns.findIndex(column => column.name === changedLayoutProps.deletedColumnName)
    oldLayoutColumnIdx !== -1 && layout.columns.splice(oldLayoutColumnIdx, 1)
  }

  if (changedLayoutProps.columnSortedNames) {
    const leftColumnIdx = layout.columns.findIndex(column => column.name === changedLayoutProps.columnSortedNames![0])
    const rightColumnIdx = layout.columns.findIndex(column => column.name === changedLayoutProps.columnSortedNames![1])
    const tmpColumn = layout.columns[leftColumnIdx]
    leftColumnIdx !== -1 && layout.columns.splice(leftColumnIdx, 1, layout.columns[rightColumnIdx])
    rightColumnIdx !== -1 && layout.columns.splice(rightColumnIdx, 1, tmpColumn)
  }

  await loadData(byGroupValue)
  return true
}

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
