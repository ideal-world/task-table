import type { Ref } from 'vue'
import { toRaw } from 'vue'
import locales from '../locales'
import type { TableCellDictItemsResp, TableDataSliceProps, TableEventProps, TableLayoutKernelProps, TableLayoutModifyProps } from '../props'
import { getParentWithClass } from '../utils/basic'
import { AlertKind, showAlert } from './common/Alert'
import { type TableBasicConf, type TableLayoutColumnConf, type TableLayoutConf, type TableStyleConf, convertTableLayoutKernelPropsToTableLayoutKernelConf } from './conf'
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

export async function modifyColumn(changedLayoutColumnConf: TableLayoutColumnConf): Promise<boolean> {
  const layout = tableLayoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.modifyLayout) {
    showAlert(t('_.event.notConfigured', { name: 'modifyLayout' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.modifyLayout] Event not Configured')
  }

  if (!await events.modifyLayout(layout.id, {
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

  const oldColumnIdx = layout.columns.findIndex(column => column.name === changedLayoutColumnConf.name)
  layout.columns.splice(oldColumnIdx, 1, changedLayoutColumnConf)

  await loadData()
  return true
}

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
    slice: newLayoutProps.slice,
  })
  tableLayoutsConf.push({
    id: layoutId,
    ...convertTableLayoutKernelPropsToTableLayoutKernelConf(newLayoutProps),
  })

  await loadData(undefined, undefined, undefined, layoutId)
  return true
}

export async function modifyLayout(changedLayoutProps: TableLayoutModifyProps): Promise<boolean> {
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
  changedLayoutProps.aggs && (layout.aggs = changedLayoutProps.aggs)
  changedLayoutProps.slice && (layout.slice = changedLayoutProps.slice)
  if (changedLayoutProps.deletedColumnName) {
    const oldLayoutColumnIdx = layout.columns.findIndex(column => column.name === changedLayoutProps.deletedColumnName)
    layout.columns.splice(oldLayoutColumnIdx, 1)
  }
  changedLayoutProps.newColumn && (layout.columns.push({
    name: changedLayoutProps.newColumn.name,
    wrap: changedLayoutProps.newColumn.wrap ?? true,
    fixed: changedLayoutProps.newColumn.fixed ?? false,
    width: changedLayoutProps.newColumn.width ?? 200,
    hide: changedLayoutProps.newColumn.hide ?? false,
    dateStart: changedLayoutProps.newColumn.dateStart ?? false,
    dateEnd: changedLayoutProps.newColumn.dateEnd ?? false,
  }))
  if (changedLayoutProps.changedColumn) {
    const oldLayoutColumnIdx = layout.columns.findIndex(column => column.name === changedLayoutProps.changedColumn?.name)
    layout.columns.splice(oldLayoutColumnIdx, 1, {
      name: changedLayoutProps.changedColumn.name,
      wrap: changedLayoutProps.changedColumn.wrap ?? true,
      fixed: changedLayoutProps.changedColumn.fixed ?? false,
      width: changedLayoutProps.changedColumn.width ?? 200,
      hide: changedLayoutProps.changedColumn.hide ?? false,
      dateStart: changedLayoutProps.changedColumn.dateStart ?? false,
      dateEnd: changedLayoutProps.changedColumn.dateEnd ?? false,
    })
  }
  if (changedLayoutProps.columnSortedNames) {
    const leftColumnIdx = layout.columns.findIndex(column => column.name === changedLayoutProps.columnSortedNames![0])
    const rightColumnIdx = layout.columns.findIndex(column => column.name === changedLayoutProps.columnSortedNames![1])
    const tmpColumn = layout.columns[leftColumnIdx]
    layout.columns.splice(leftColumnIdx, 1, layout.columns[rightColumnIdx])
    layout.columns.splice(rightColumnIdx, 1, tmpColumn)
  }

  await loadData()
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
