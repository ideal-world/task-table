import type { Ref } from 'vue'
import { toRaw } from 'vue'
import locales from '../locales'

import { type DataGroupResp, type DataQuerySliceReq, type DataResp, type DictItemsResp, type LayoutModifyProps, type SimpleLayoutProps, type TableStyleModifyProps, generateLayoutProps } from '../props'

import { SubDataShowKind } from '../props/enumProps'
import type { TableEventProps } from '../props/eventProps'
import { getParentWithClass } from '../utils/basic'
import { deepToRaw } from '../utils/vueHelper'
import { AlertKind, showAlert } from './common/Alert'
import type { LayoutConf, TableConf } from './conf'
import { sortByTree } from './function/RowTree'

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

export async function loadData(moreForGroupedValue?: any, returnOnlyAgg?: boolean, layoutId?: string) {
  const layout = layoutId ? layoutsConf.find(layout => layout.id === layoutId)! : layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  const rawLayout = toRaw(layout)

  const showColumns = rawLayout.columns.filter(column => !column.hide).map(column => column.name).slice()
  if (tableConf.parentPkColumnName && rawLayout.columns.findIndex(column => column.name === tableConf.parentPkColumnName) === -1) {
    showColumns.push(tableConf.parentPkColumnName)
  }

  const resp = await events.loadData(
    tableConf.quickSearch?.searchContent,
    rawLayout.filter,
    rawLayout.sort,
    rawLayout.group,
    rawLayout.agg,
    rawLayout.subDataShowKind === SubDataShowKind.ONLY_PARENT_DATA,
    moreForGroupedValue,
    moreForGroupedValue !== undefined && rawLayout.group && rawLayout.group.slices && rawLayout.group.slices[moreForGroupedValue as string]
      ? {
          offsetNumber: rawLayout.group.slices[moreForGroupedValue as string].offsetNumber,
          fetchNumber: rawLayout.group.slices[moreForGroupedValue as string].fetchNumber,
        }
      : {
          offsetNumber: rawLayout.slice.offsetNumber,
          fetchNumber: rawLayout.slice.fetchNumber,
        },
    showColumns,
    returnOnlyAgg,
  )

  if (moreForGroupedValue === undefined && !(layout.group?.item)) {
    // Load data without grouping
    if (!Array.isArray(resp)) {
      if (!returnOnlyAgg) {
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
  else if (moreForGroupedValue === undefined && layout.group && layout.group.item) {
    // Load all grouped data
    if (Array.isArray(resp)) {
      if (!returnOnlyAgg) {
        resp.forEach((groupData) => {
          groupData.records = layout.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA ? sortByTree(groupData.records, tableConf.pkColumnName, tableConf.parentPkColumnName) : groupData.records
        })
        layout.data = resp
      }
      else {
        resp.forEach((groupData) => {
          (layout.data as DataGroupResp[]).find(d => d.groupValue === groupData.groupValue)!.aggs = groupData.aggs
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
      if (!returnOnlyAgg) {
        const groupData = layout.data.find(d => d.groupValue === moreForGroupedValue)
        if (groupData) {
          groupData.records = layout.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA ? sortByTree(resp.records, tableConf.pkColumnName, tableConf.parentPkColumnName) : resp.records
          groupData.aggs = resp.aggs
          groupData.totalNumber = resp.totalNumber
        }
      }
      else {
        const groupData = (layout.data as DataGroupResp[]).find(d => d.groupValue === moreForGroupedValue)
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
  layoutsConf.forEach(async (layout) => {
    await loadData(undefined, undefined, layout.id)
  })
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
  layoutsConf.forEach(async (layout) => {
    await loadData(undefined, undefined, layout.id)
  })
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
  layoutsConf.forEach(async (layout) => {
    await loadData(undefined, undefined, layout.id)
  })
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

  layoutsConf.forEach(async (layout) => {
    await loadData(undefined, undefined, layout.id)
  })
  return true
}

export async function selectData(selectedRecordPks: any[]): Promise<boolean> {
  selectedRecordPks = toRaw(selectedRecordPks)

  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

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
  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.clickCell) {
    showAlert(t('_.event.notConfigured', { name: 'clickCell' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.clickCell] Event not Configured')
  }
  return await events.clickCell(clickedRecordPk, clickedColumnName, layout.id, layout.layoutKind)
}

export async function loadCellDictItems(columnName: string, filterValue?: any, slice?: DataQuerySliceReq): Promise<DictItemsResp> {
  slice = toRaw(slice)

  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.loadCellDictItems) {
    showAlert(t('_.event.notConfigured', { name: 'loadCellDictItems' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.loadCellDictItems] Event not Configured')
  }

  return await events.loadCellDictItems(columnName, filterValue, slice)
}

export async function loadCellDictItemsWithMultiConds(conds: { [columnName: string]: any[] }, slice?: DataQuerySliceReq): Promise<{ [columnName: string]: DictItemsResp }> {
  conds = toRaw(conds)
  slice = toRaw(slice)

  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.loadCellDictItemsWithMultiConds) {
    showAlert(t('_.event.notConfigured', { name: 'loadCellDictItemsWithMultiConds' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.loadCellDictItemsWithMultiConds] Event not Configured')
  }

  return await events.loadCellDictItemsWithMultiConds(conds, slice)
}

export async function modifyStyles(changedStyles: TableStyleModifyProps): Promise<boolean> {
  changedStyles = toRaw(changedStyles)

  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.modifyStyles) {
    showAlert(t('_.event.notConfigured', { name: 'modifyStyles' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.modifyStyles] Event not Configured')
  }

  if (!await events.modifyStyles(changedStyles)) {
    return false
  }

  changedStyles.size !== undefined && (tableConf.styles.size = changedStyles.size)
  changedStyles.theme !== undefined && (tableConf.styles.theme = changedStyles.theme)
  changedStyles.tableClass !== undefined && (tableConf.styles.tableClass = changedStyles.tableClass)
  changedStyles.headerClass !== undefined && (tableConf.styles.headerClass = changedStyles.headerClass)
  changedStyles.footerClass !== undefined && (tableConf.styles.footerClass = changedStyles.footerClass)
  changedStyles.rowClass !== undefined && (tableConf.styles.rowClass = changedStyles.rowClass)
  changedStyles.cellClass !== undefined && (tableConf.styles.cellClass = changedStyles.cellClass)
  changedStyles.aggClass !== undefined && (tableConf.styles.aggClass = changedStyles.aggClass)

  return true
}

export async function setQuickSearchContent(quickSearchContent: string): Promise<boolean> {
  if (tableConf.quickSearch) {
    tableConf.quickSearch.searchContent = quickSearchContent
  }
  else {
    tableConf.quickSearch = {
      placeholder: '',
      searchContent: quickSearchContent,
    }
  }

  layoutsConf.forEach((layout) => {
    loadData(undefined, undefined, layout.id)
  })
  return true
}

export async function newLayout(newLayoutProps: SimpleLayoutProps): Promise<boolean> {
  const layoutProps = generateLayoutProps(deepToRaw(newLayoutProps), {
    ...deepToRaw(tableConf),
  })

  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.newLayout) {
    showAlert(t('_.event.notConfigured', { name: 'newLayout' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.newLayout] Event not Configured')
  }

  const layoutId = await events.newLayout(layoutProps)
  layoutsConf.push({
    ...layoutProps,
    selectedDataPks: [],
    id: layoutId,
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
  changedLayoutProps.title !== undefined && (layout.title = changedLayoutProps.title)
  changedLayoutProps.icon !== undefined && (layout.icon = changedLayoutProps.icon)

  changedLayoutProps.slice !== undefined && (layout.slice = changedLayoutProps.slice)
  changedLayoutProps.showSelectColumn !== undefined && (layout.showSelectColumn = changedLayoutProps.showSelectColumn)
  changedLayoutProps.subDataShowKind !== undefined && (layout.subDataShowKind = changedLayoutProps.subDataShowKind)

  changedLayoutProps.actionColumn !== undefined && (layout.actionColumn = changedLayoutProps.actionColumn)
  changedLayoutProps.gantt !== undefined && (layout.gantt = changedLayoutProps.gantt)
  changedLayoutProps.filter !== undefined && (layout.filter = changedLayoutProps.filter)
  changedLayoutProps.group !== undefined && (layout.group = changedLayoutProps.group)
  changedLayoutProps.sort !== undefined && (layout.sort = changedLayoutProps.sort)
  changedLayoutProps.agg !== undefined && (layout.agg = changedLayoutProps.agg)
  changedLayoutProps.edit !== undefined && (layout.edit = changedLayoutProps.edit)

  if (changedLayoutProps.changedColumn) {
    const oldLayoutColumnIdx = layout.columns.findIndex(column => column.name === changedLayoutProps.changedColumn?.name)
    oldLayoutColumnIdx !== -1 && layout.columns.splice(oldLayoutColumnIdx, 1, changedLayoutProps.changedColumn)
  }

  if (changedLayoutProps.filter || changedLayoutProps.sort
    || changedLayoutProps.group || changedLayoutProps.agg
    || changedLayoutProps.slice || changedLayoutProps.subDataShowKind
  ) {
    if (Object.entries(changedLayoutProps).length === 1 && changedLayoutProps.agg) {
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
