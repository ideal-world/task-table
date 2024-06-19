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

/**
 * 加载数据
 *
 * Load data
 *
 * @param byGroupValue 分组值，当分组及分组值存在时仅加载对应分组值的数据 / Group value, when group and group value exist, only load the data of the corresponding group value
 * @param returnOnlyAgg 仅返回聚合数据 / Only return aggregated data
 * @param layoutId 布局ID / Layout ID
 */
export async function loadData(byGroupValue?: any, returnOnlyAgg?: boolean, layoutId?: string) {
  const layout = layoutId ? layoutsConf.find(layout => layout.id === layoutId)! : layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  const rawLayout = toRaw(layout)

  const showColumns = rawLayout.columns.filter(column => !column.hide).map(column => column.name).slice()
  if (tableConf.parentPkColumnName && rawLayout.columns.findIndex(column => column.name === tableConf.parentPkColumnName) === -1) {
    showColumns.push(tableConf.parentPkColumnName)
  }

  let resp = null
  try {
    resp = await events.loadData(
      tableConf.quickSearch?.searchContent,
      rawLayout.filter,
      rawLayout.sort,
      rawLayout.group,
      rawLayout.agg,
      rawLayout.subDataShowKind === SubDataShowKind.ONLY_PARENT_DATA,
      byGroupValue,
      byGroupValue !== undefined && rawLayout.group && rawLayout.group.slices && rawLayout.group.slices[byGroupValue as string]
        ? {
            offsetNumber: rawLayout.group.slices[byGroupValue as string].offsetNumber,
            fetchNumber: rawLayout.group.slices[byGroupValue as string].fetchNumber,
          }
        : {
            offsetNumber: rawLayout.slice.offsetNumber,
            fetchNumber: rawLayout.slice.fetchNumber,
          },
      showColumns,
      returnOnlyAgg,
    )
  }
  catch (e: any) {
    showAlert(t('_.event.invokeError', { msg: e.message }), 6, AlertKind.ERROR, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error(`[events.loadData] Invoke Error:${e.message}`)
  }

  if (byGroupValue === undefined && !(layout.group?.item)) {
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
      throw new Error('[events.loadData] Invalid scene')
    }
  }
  else if (byGroupValue === undefined && layout.group && layout.group.item) {
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
      throw new Error('[events.loadData] Invalid scene')
    }
  }
  else if (byGroupValue) {
    // Load a grouped data
    if (!Array.isArray(resp) && Array.isArray(layout.data)) {
      if (!returnOnlyAgg) {
        const groupData = layout.data.find(d => d.groupValue === byGroupValue)
        if (groupData) {
          groupData.records = layout.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA ? sortByTree(resp.records, tableConf.pkColumnName, tableConf.parentPkColumnName) : resp.records
          groupData.aggs = resp.aggs
          groupData.totalNumber = resp.totalNumber
        }
      }
      else {
        const groupData = (layout.data as DataGroupResp[]).find(d => d.groupValue === byGroupValue)
        if (groupData) {
          groupData.aggs = resp.aggs
        }
      }
    }
    else {
      showAlert(t('_.event.loadDataInvalidScene'), 2, AlertKind.ERROR, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
      throw new Error('[events.loadData] Invalid scene')
    }
  }
  else {
    showAlert(t('_.event.loadDataInvalidScene'), 2, AlertKind.ERROR, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.loadData] Invalid scene')
  }
}

/**
 * 新建数据
 *
 * Create new data
 *
 * @param newRecords 要新建的数据 / Records to be created
 */
export async function newData(newRecords: { [columnName: string]: any }[]) {
  newRecords = toRaw(newRecords)
  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.newData) {
    showAlert(t('_.event.notConfigured', { name: 'newData' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.newData] Event not Configured')
  }

  try {
    await events.newData(newRecords)
  }
  catch (e: any) {
    showAlert(t('_.event.invokeError', { msg: e.message }), 6, AlertKind.ERROR, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error(`[events.newData] Invoke Error:${e.message}`)
  }

  layoutsConf.forEach(async (layout) => {
    await loadData(undefined, undefined, layout.id)
  })
}

/**
 * 复制数据
 *
 * Copy data
 *
 * @param targetRecordPks 要复制的数据主键 / Data primary keys to be copied
 */
export async function copyData(targetRecordPks: any[]) {
  targetRecordPks = toRaw(targetRecordPks)
  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.copyData) {
    showAlert(t('_.event.notConfigured', { name: 'copyData' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.copyData] Event not Configured')
  }

  try {
    await events.copyData(targetRecordPks)
  }
  catch (e: any) {
    showAlert(t('_.event.invokeError', { msg: e.message }), 6, AlertKind.ERROR, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error(`[events.copyData] Invoke Error:${e.message}`)
  }

  layoutsConf.forEach(async (layout) => {
    await loadData(undefined, undefined, layout.id)
  })
}

/**
 * 修改数据
 *
 * Modify data
 *
 * @param changedRecords 要修改的数据 / Data to be modified
 */
export async function modifyData(changedRecords: { [columnName: string]: any }[]) {
  changedRecords = toRaw(changedRecords)

  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.modifyData) {
    showAlert(t('_.event.notConfigured', { name: 'modifyData' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.modifyData] Event not Configured')
  }

  try {
    await events.modifyData(changedRecords)
  }
  catch (e: any) {
    showAlert(t('_.event.invokeError', { msg: e.message }), 6, AlertKind.ERROR, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error(`[events.modifyData] Invoke Error:${e.message}`)
  }

  layoutsConf.forEach(async (layout) => {
    await loadData(undefined, undefined, layout.id)
  })
}

/**
 * 删除数据
 *
 * Delete data
 *
 * NOTE: 删除数据时，需要同时删除子数据 / When deleting data, you need to delete sub-data at the same time
 *
 * @param deletedRecordPks 要删除的数据主键 / Data primary keys to be deleted
 */
export async function deleteData(deletedRecordPks: any[]) {
  deletedRecordPks = toRaw(deletedRecordPks)

  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.deleteData) {
    showAlert(t('_.event.notConfigured', { name: 'deleteData' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.deleteData] Event not Configured')
  }

  try {
    await events.deleteData(deletedRecordPks)
  }
  catch (e: any) {
    showAlert(t('_.event.invokeError', { msg: e.message }), 6, AlertKind.ERROR, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error(`[events.deleteData] Invoke Error:${e.message}`)
  }

  layoutsConf.forEach(async (layout) => {
    await loadData(undefined, undefined, layout.id)
  })
}

/**
 * 选择数据
 *
 * Select data
 *
 * @param selectedRecordPks 选择的数据主键 / Selected data primary keys
 */
export async function selectData(selectedRecordPks: any[]) {
  selectedRecordPks = toRaw(selectedRecordPks)

  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.selectData) {
    showAlert(t('_.event.notConfigured', { name: 'selectData' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.selectData] Event not Configured')
  }

  try {
    await events.selectData(selectedRecordPks)
  }
  catch (e: any) {
    showAlert(t('_.event.invokeError', { msg: e.message }), 6, AlertKind.ERROR, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error(`[events.selectData] Invoke Error:${e.message}`)
  }

  layout.selectedDataPks = selectedRecordPks
}

/**
 * 点击单元格
 *
 * Click cell
 *
 * @param clickedRecordPk 点击的数据主键 / Clicked data primary key
 * @param clickedColumnName 点击的列名 / Clicked column name
 */
export async function clickCell(clickedRecordPk: any, clickedColumnName: string) {
  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.clickCell) {
    showAlert(t('_.event.notConfigured', { name: 'clickCell' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.clickCell] Event not Configured')
  }
  try {
    await events.clickCell(clickedRecordPk, clickedColumnName, layout.id, layout.layoutKind)
  }
  catch (e: any) {
    showAlert(t('_.event.invokeError', { msg: e.message }), 6, AlertKind.ERROR, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error(`[events.clickCell] Invoke Error:${e.message}`)
  }
}

/**
 * 加载字典项列表
 *
 * Load dictionary item list
 *
 * @param dictName 字典名 / Dictionary name
 * @param filterValue 过滤值 / Filter value
 * @param slice 分片 / Slice
 * @returns 字典项列表 / Dictionary item list
 */
export async function loadCellDictItems(dictName: string, filterValue?: any, slice?: DataQuerySliceReq): Promise<DictItemsResp> {
  slice = toRaw(slice)

  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.loadDictItems) {
    showAlert(t('_.event.notConfigured', { name: 'loadCellDictItems' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.loadCellDictItems] Event not Configured')
  }
  try {
    return await events.loadDictItems(dictName, filterValue, slice)
  }
  catch (e: any) {
    showAlert(t('_.event.invokeError', { msg: e.message }), 6, AlertKind.ERROR, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error(`[events.loadCellDictItems] Invoke Error:${e.message}`)
  }
}

/**
 * 加载多条件字典项列表
 *
 * Load multi-condition dictionary item list
 *
 * @param conds 条件 / Conditions
 * @param slice 分片 / Slice
 * @returns 字典项列表 / Dictionary item list
 */
export async function loadCellDictItemsWithMultiConds(conds: { [columnName: string]: any[] }, slice?: DataQuerySliceReq): Promise<{ [columnName: string]: DictItemsResp }> {
  conds = toRaw(conds)
  slice = toRaw(slice)

  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.loadDictItemsWithMultiConds) {
    showAlert(t('_.event.notConfigured', { name: 'loadCellDictItemsWithMultiConds' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.loadCellDictItemsWithMultiConds] Event not Configured')
  }
  try {
    return await events.loadDictItemsWithMultiConds(conds, slice)
  }
  catch (e: any) {
    showAlert(t('_.event.invokeError', { msg: e.message }), 6, AlertKind.ERROR, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error(`[events.loadCellDictItemsWithMultiConds] Invoke Error:${e.message}`)
  }
}

/**
 * 修改样式
 *
 * Modify style
 *
 * @param changedStyleProps 修改的样式属性 / Modified style properties
 */
export async function modifyStyles(changedStyleProps: TableStyleModifyProps) {
  changedStyleProps = toRaw(changedStyleProps)

  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.modifyStyles) {
    showAlert(t('_.event.notConfigured', { name: 'modifyStyles' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.modifyStyles] Event not Configured')
  }

  try {
    await events.modifyStyles(changedStyleProps)
  }
  catch (e: any) {
    showAlert(t('_.event.invokeError', { msg: e.message }), 6, AlertKind.ERROR, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error(`[events.modifyStyles] Invoke Error:${e.message}`)
  }

  changedStyleProps.size !== undefined && (tableConf.styles.size = changedStyleProps.size)
  changedStyleProps.theme !== undefined && (tableConf.styles.theme = changedStyleProps.theme)
  changedStyleProps.tableClass !== undefined && (tableConf.styles.tableClass = changedStyleProps.tableClass)
  changedStyleProps.headerClass !== undefined && (tableConf.styles.headerClass = changedStyleProps.headerClass)
  changedStyleProps.footerClass !== undefined && (tableConf.styles.footerClass = changedStyleProps.footerClass)
  changedStyleProps.rowClass !== undefined && (tableConf.styles.rowClass = changedStyleProps.rowClass)
  changedStyleProps.cellClass !== undefined && (tableConf.styles.cellClass = changedStyleProps.cellClass)
  changedStyleProps.aggClass !== undefined && (tableConf.styles.aggClass = changedStyleProps.aggClass)
}

/**
 * 设置快速搜索内容
 *
 * Set quick search content
 *
 * @param quickSearchContent 快速搜索内容 / Quick search content
 */
export async function setQuickSearchContent(quickSearchContent: string) {
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
}

/**
 * 新建布局
 *
 * Create new layout
 *
 * @param newLayoutProps 新建布局属性 / New layout properties
 */
export async function newLayout(newLayoutProps: SimpleLayoutProps) {
  const layoutProps = generateLayoutProps(deepToRaw(newLayoutProps), {
    ...deepToRaw(tableConf),
  })

  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.newLayout) {
    showAlert(t('_.event.notConfigured', { name: 'newLayout' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.newLayout] Event not Configured')
  }

  let layoutId
  try {
    layoutId = await events.newLayout(layoutProps)
    layoutsConf.push({
      ...layoutProps,
      selectedDataPks: [],
      id: layoutId,
    })
  }
  catch (e: any) {
    showAlert(t('_.event.invokeError', { msg: e.message }), 6, AlertKind.ERROR, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error(`[events.newLayout] Invoke Error:${e.message}`)
  }

  await loadData(undefined, undefined, layoutId)
}

/**
 * 修改当前布局
 *
 * Modify current layout
 *
 * @param changedLayoutProps 修改的布局属性 / Changed layout properties
 * @param byGroupValue 分组值，当分组及分组值存在时修改布局后仅加载对应分组值的数据 / Group value, when group and group value exist, only load the data of the corresponding group value after modifying the layout
 */
export async function modifyLayout(changedLayoutProps: LayoutModifyProps, byGroupValue?: any) {
  changedLayoutProps = deepToRaw(changedLayoutProps)

  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.modifyLayout) {
    showAlert(t('_.event.notConfigured', { name: 'modifyLayout' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.modifyLayout] Event not Configured')
  }

  try {
    await events.modifyLayout(currentLayoutId.value, changedLayoutProps)
  }
  catch (e: any) {
    showAlert(t('_.event.invokeError', { msg: e.message }), 6, AlertKind.ERROR, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error(`[events.modifyLayout] Invoke Error:${e.message}`)
  }

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
}

/**
 * 删除布局
 *
 * Delete layout
 *
 * @param deletedLayoutId 删除的布局ID / Deleted layout ID
 */
export async function deleteLayout(deletedLayoutId: string) {
  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.deleteLayout) {
    showAlert(t('_.event.notConfigured', { name: 'deleteLayout' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.deleteLayout] Event not Configured')
  }

  try {
    await events.deleteLayout(deletedLayoutId)
  }
  catch (e: any) {
    showAlert(t('_.event.invokeError', { msg: e.message }), 6, AlertKind.ERROR, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error(`[events.deleteLayout] Invoke Error:${e.message}`)
  }

  const oldColumnIdx = layoutsConf.findIndex(layout => layout.id === deletedLayoutId)!
  layoutsConf.splice(oldColumnIdx, 1)
}

/**
 * 加载假日列表
 *
 * Load holidays
 *
 * @param startTime 开始时间 / Start time
 * @param endTime 结束时间 / End time
 * @returns 假日列表 / Holidays
 */
export async function loadHolidays(startTime: Date, endTime: Date): Promise<Date[]> {
  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.loadHolidays) {
    showAlert(t('_.event.notConfigured', { name: 'loadHolidays' }), 2, AlertKind.WARNING, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error('[events.loadHolidays] Event not Configured')
  }

  try {
    return await events.loadHolidays(startTime, endTime)
  }
  catch (e: any) {
    showAlert(t('_.event.invokeError', { msg: e.message }), 6, AlertKind.ERROR, getParentWithClass(document.getElementById(`iw-tt-layout-${layout.id}`), 'iw-tt')!)
    throw new Error(`[events.loadHolidays] Invoke Error:${e.message}`)
  }
}
