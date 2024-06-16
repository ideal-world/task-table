import type { Ref } from 'vue'
import { toRaw } from 'vue'
import locales from '../locales'

import { SubDataShowKind } from '../props/enumProps'
import type { TableEventProps } from '../props/eventProps'
import { getParentWithClass } from '../utils/basic'
import { deepToRaw } from '../utils/vueHelper'
import { AlertKind, showAlert } from './common/Alert'
import { sortByTree } from './function/RowTree'
import type { LayoutConf, TableConf } from './initializer'

const { t } = locales.global

let events: TableEventProps
let tableConf: TableConf
let layoutsConf: LayoutConf[]
let currentLayoutId: Ref<string>

export async function init(_tableBConf: TableConf, _layoutsConf: LayoutConf[], _currentLayoutId: Ref<string>, _events: TableEventProps) {
  tableConf = _tableBConf
  layoutsConf = _layoutsConf
  currentLayoutId = _currentLayoutId
  events = _events
}

export async function watch() {
  layoutsConf.forEach((layout) => {
    loadData(undefined, undefined, layout.id)
  })
}

export async function loadData(moreForGroupedValue?: any, returnOnlyAggs?: boolean, layoutId?: string) {
  const layout = layoutId ? layoutsConf.find(layout => layout.id === layoutId)! : layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  const showColumns = layout.columns.filter(column => !column.hide).map(column => column.name).slice()
  if (tableConf.parentPkColumnName && layout.columns.findIndex(column => column.name === tableConf.parentPkColumnName) === -1) {
    showColumns.push(tableConf.parentPkColumnName)
  }

  const resp = await events.loadData(
    toRaw(showColumns),
    tableConf.features.quickSearch?.quickSearchContent,
    layout.features.filterData && toRaw(layout.features.filterData.filters),
    layout.features.sortData && toRaw(layout.features.sortData.sorts),
    layout.features.groupData && toRaw(layout.features.groupData.group),
    layout.features.aggData && toRaw(layout.features.aggData.aggs),
    layout.subDataShowKind === SubDataShowKind.ONLY_PARENT_DATA,
    moreForGroupedValue,
    moreForGroupedValue && layout.groupSlices && layout.groupSlices[moreForGroupedValue as string]
      ? {
          offsetNumber: layout.groupSlices[moreForGroupedValue as string].offsetNumber,
          fetchNumber: layout.groupSlices[moreForGroupedValue as string].fetchNumber,
        }
      : {
          offsetNumber: layout.slice.offsetNumber,
          fetchNumber: layout.slice.fetchNumber,
        },
    returnOnlyAggs,
  )

  if (!moreForGroupedValue && !layout.features.groupData?.group) {
    // Load data without grouping
    if (!Array.isArray(resp)) {
      if (!returnOnlyAggs) {
        resp.records = layout.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA ? sortByTree(resp.records, tableConf.pkColumnName, tableConf.parentPkColumnName) : resp.records
        layout.data = resp
      }
      else {
        (layout.data as DataResp).aggs = resp.aggs
      }
    }
    else {
      showAlert(t('_.event.loadDataInvalidScene'), 2, AlertKind.ERROR, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
      throw new Error('[events.loadData]  Invalid scene')
    }
  }
  else if (!moreForGroupedValue && layout.features.groupData?.group) {
    // Load all grouped data
    if (Array.isArray(resp)) {
      if (!returnOnlyAggs) {
        resp.forEach((groupData) => {
          groupData.records = layout.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA ? sortByTree(groupData.records, tableConf.pkColumnName, tableConf.parentPkColumnName) : groupData.records
        })
        layout.data = resp
      }
      else {
        resp.forEach((groupData) => {
          (layout.data as FeatureGroupDataResp[]).find(d => d.groupValue === groupData.groupValue)!.aggs = groupData.aggs
        })
      }
    }
    else {
      showAlert(t('_.event.loadDataInvalidScene'), 2, AlertKind.ERROR, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
      throw new Error('[events.loadData]  Invalid scene')
    }
  }
  else if (moreForGroupedValue) {
    // Load a grouped data
    if (!Array.isArray(resp) && Array.isArray(layout.data)) {
      if (!returnOnlyAggs) {
        const groupData = layout.data.find(d => d.groupValue === moreForGroupedValue)
        if (groupData) {
          groupData.records = layout.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA ? sortByTree(resp.records, tableConf.pkColumnName, tableConf.parentPkColumnName) : resp.records
          groupData.aggs = resp.aggs
          groupData.totalNumber = resp.totalNumber
        }
      }
      else {
        const groupData = (layout.data as FeatureGroupDataResp[]).find(d => d.groupValue === moreForGroupedValue)
        if (groupData) {
          groupData.aggs = resp.aggs
        }
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
  newRecords = toRaw(newRecords)
  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.newData) {
    showAlert(t('_.event.notConfigured', { name: 'newData' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.newData] Event not Configured')
  }

  await events.newData(newRecords)
  await loadData()
  return true
}

export async function copyData(targetRecordPks: any[]): Promise<boolean> {
  targetRecordPks = toRaw(targetRecordPks)
  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.copyData) {
    showAlert(t('_.event.notConfigured', { name: 'copyData' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.copyData] Event not Configured')
  }

  await events.copyData(targetRecordPks)
  await loadData()
  return true
}

export async function modifyData(changedRecords: { [key: string]: any }[]): Promise<boolean> {
  changedRecords = toRaw(changedRecords)

  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.modifyData) {
    showAlert(t('_.event.notConfigured', { name: 'modifyData' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.modifyData] Event not Configured')
  }

  await events.modifyData(changedRecords)
  await loadData()
  return true
}

export async function deleteData(deletedRecordPks: any[]): Promise<boolean> {
  deletedRecordPks = toRaw(deletedRecordPks)

  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

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
  selectedRecordPks = toRaw(selectedRecordPks)

  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!layout.features.selectData) {
    showAlert(t('_.feature.notEnabled', { name: t('_.feature.selectDataTitle') }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[feature.selectData] Feature not enabled')
  }

  if (!events.selectData) {
    showAlert(t('_.event.notConfigured', { name: 'selectData' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.selectData] Event not Configured')
  }

  if (!await events.selectData(selectedRecordPks)) {
    return false
  }
  layout.features.selectData.selectedDataPks = selectedRecordPks
  return true
}

export async function clickCell(clickedRecordPk: any, clickedColumnName: string): Promise<boolean> {
  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.clickCell) {
    showAlert(t('_.event.notConfigured', { name: 'clickCell' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.clickCell] Event not Configured')
  }
  return await events.clickCell(clickedRecordPk, clickedColumnName, layout.id!, layout.layoutKind)
}

export async function loadCellDictItems(columnName: string, filterValue?: any, slice?: DataQuerySliceReq): Promise<FeatureUseDictItemsResp> {
  slice = toRaw(slice)

  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.loadCellDictItems) {
    showAlert(t('_.event.notConfigured', { name: 'loadCellDictItems' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.loadCellDictItems] Event not Configured')
  }

  return await events.loadCellDictItems(columnName, filterValue, slice)
}

export async function loadCellDictItemsWithMultiConds(conds: { [columnName: string]: any[] }, slice?: DataQuerySliceReq): Promise<{ [columnName: string]: FeatureUseDictItemsResp }> {
  conds = toRaw(conds)
  slice = toRaw(slice)

  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.loadCellDictItemsWithMultiConds) {
    showAlert(t('_.event.notConfigured', { name: 'loadCellDictItemsWithMultiConds' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.loadCellDictItemsWithMultiConds] Event not Configured')
  }

  return await events.loadCellDictItemsWithMultiConds(conds, slice)
}

export async function modifyStyles(changedStyles: TableStyleProps): Promise<boolean> {
  changedStyles = toRaw(changedStyles)

  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.modifyStyles) {
    showAlert(t('_.event.notConfigured', { name: 'modifyStyles' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.modifyStyles] Event not Configured')
  }

  if (!await events.modifyStyles(changedStyles)) {
    return false
  }

  tableConf.styles = changedStyles
  return true
}

export async function setQuickSearchContent(quickSearchContent: string): Promise<boolean> {
  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!tableConf.features.quickSearch) {
    showAlert(t('_.feature.notEnabled', { name: t('_.feature.quickSearchTitle') }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[feature.quickSearch] Feature not enabled')
  }

  tableConf.features.quickSearch.quickSearchContent = quickSearchContent
  layoutsConf.forEach((layout) => {
    loadData(undefined, undefined, layout.id)
  })
  return true
}

export async function newLayout(newLayoutProps: LayoutProps): Promise<boolean> {
  newLayoutProps = deepToRaw(newLayoutProps)

  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.newLayout) {
    showAlert(t('_.event.notConfigured', { name: 'newLayout' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.newLayout] Event not Configured')
  }

  const layoutId = await events.newLayout(newLayoutProps)
  layoutsConf.push({
    id: layoutId,
    ...newLayoutProps,
  })

  await loadData(undefined, undefined, layoutId)
  return true
}

export async function modifyLayout(changedLayoutProps: LayoutModifyProps, byGroupValue?: any): Promise<boolean> {
  changedLayoutProps = deepToRaw(changedLayoutProps)

  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.modifyLayout) {
    showAlert(t('_.event.notConfigured', { name: 'modifyLayout' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.modifyLayout] Event not Configured')
  }

  if (!await events.modifyLayout(currentLayoutId.value, changedLayoutProps))
    return false

  // Process basic
  changedLayoutProps.title && (layout.title = changedLayoutProps.title)
  changedLayoutProps.icon && (layout.icon = changedLayoutProps.icon)
  changedLayoutProps.slice && (layout.slice = changedLayoutProps.slice)
  changedLayoutProps.groupSlices && (layout.groupSlices = changedLayoutProps.groupSlices)
  changedLayoutProps.subDataShowKind && (layout.subDataShowKind = changedLayoutProps.subDataShowKind)
  changedLayoutProps.newColumn && (layout.columns.push(changedLayoutProps.newColumn))
  if (changedLayoutProps.changedColumn) {
    const oldLayoutColumnIdx = layout.columns.findIndex(column => column.name === changedLayoutProps.changedColumn?.name)
    oldLayoutColumnIdx !== -1 && layout.columns.splice(oldLayoutColumnIdx, 1, changedLayoutProps.changedColumn)
  }
  if (changedLayoutProps.deletedColumnName) {
    const oldLayoutColumnIdx = layout.columns.findIndex(column => column.name === changedLayoutProps.deletedColumnName)
    oldLayoutColumnIdx !== -1 && layout.columns.splice(oldLayoutColumnIdx, 1)
  }
  // Process features
  changedLayoutProps.features.groupData?.modify && layout.features.groupData && (layout.features.groupData.group = changedLayoutProps.features.groupData.modify)
  changedLayoutProps.features.groupData?.remove && layout.features.groupData && (layout.features.groupData.group = undefined)
  changedLayoutProps.features.filterData?.filters && layout.features.filterData && (layout.features.filterData.filters = [...changedLayoutProps.features.filterData.filters])
  changedLayoutProps.features.sortData?.sorts && layout.features.sortData && (layout.features.sortData.sorts = [...changedLayoutProps.features.sortData.sorts])
  changedLayoutProps.features.aggData?.aggs && layout.features.aggData && (layout.features.aggData.aggs = changedLayoutProps.features.aggData.aggs)
  changedLayoutProps.features.selectData?.selectedDataPks && layout.features.selectData && (layout.features.selectData.selectedDataPks = [...changedLayoutProps.features.selectData.selectedDataPks])
  changedLayoutProps.features.editData?.columnNames && layout.features.editData && (layout.features.editData.columnNames = [...changedLayoutProps.features.editData.columnNames])
  changedLayoutProps.features.actionColumn?.width && layout.features.actionColumn && (layout.features.actionColumn.width = changedLayoutProps.features.actionColumn.width)
  changedLayoutProps.features.ganttLayout?.showKind && layout.features.ganttLayout && (layout.features.ganttLayout.showKind = changedLayoutProps.features.ganttLayout.showKind)
  changedLayoutProps.features.ganttLayout?.timelineWidth && layout.features.ganttLayout && (layout.features.ganttLayout.timelineWidth = changedLayoutProps.features.ganttLayout.timelineWidth)

  if (changedLayoutProps.features.filterData || changedLayoutProps.features.sortData
    || changedLayoutProps.features.groupData || changedLayoutProps.features.aggData
    || changedLayoutProps.slice || changedLayoutProps.groupSlices || changedLayoutProps.subDataShowKind
    || changedLayoutProps.newColumn || changedLayoutProps.deletedColumnName
  ) {
    if (Object.entries(changedLayoutProps).length === 1 && changedLayoutProps.features.aggData?.aggs) {
      await loadData(byGroupValue, true)
    }
    else {
      await loadData(byGroupValue)
    }
  }
  return true
}

export async function deleteLayout(deletedLayoutId: string): Promise<boolean> {
  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.deleteLayout) {
    showAlert(t('_.event.notConfigured', { name: 'deleteLayout' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.deleteLayout] Event not Configured')
  }

  if (!await events.deleteLayout(deletedLayoutId))
    return false

  const oldColumnIdx = layoutsConf.findIndex(layout => layout.id === deletedLayoutId)!
  layoutsConf.splice(oldColumnIdx, 1)
  return true
}

export async function loadHolidays(startTime: Date, endTime: Date): Promise<Date[]> {
  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.loadHolidays) {
    showAlert(t('_.event.notConfigured', { name: 'loadHolidays' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.loadHolidays] Event not Configured')
  }

  return await events.loadHolidays(startTime, endTime)
}
