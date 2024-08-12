import type { Ref } from 'vue'
import locales from '../locales'

import type { DataGroupResp, DataQuerySliceReq, DataResp, DictItemsResp, EditableDataResp, LayoutModifyProps, SimpleLayoutProps, TableStyleModifyProps } from '../props'
import { generateLayoutProps } from '../props'

import { AlertKind, SubDataShowKind } from '../props/enumProps'
import type { TableEventProps } from '../props/eventProps'
import { getParentWithClass } from '../utils/basic'
import { deepToRaw } from '../utils/vueHelper'
import type { ContextMenuItemProps } from '../props/functionProps'
import { AlertLevel, showAlert } from './common/Alert'
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

  const rawLayout = deepToRaw(layout)

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
    handleAlert(AlertKind.EVENT_INVOKE_ERROR, t('_.event.invokeError', { msg: e.message }))
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
      handleAlert(AlertKind.LOAD_DATA_INVALID_SCENE, t('_.event.loadDataInvalidScene'))
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
      handleAlert(AlertKind.LOAD_DATA_INVALID_SCENE, t('_.event.loadDataInvalidScene'))
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
      handleAlert(AlertKind.LOAD_DATA_INVALID_SCENE, t('_.event.loadDataInvalidScene'))
      throw new Error('[events.loadData] Invalid scene')
    }
  }
  else {
    handleAlert(AlertKind.LOAD_DATA_INVALID_SCENE, t('_.event.loadDataInvalidScene'))
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
  newRecords = deepToRaw(newRecords)

  if (!events.newData) {
    handleAlert(AlertKind.EVENT_NOT_CONFIGURED, t('_.event.notConfigured', { name: 'newData' }))
    throw new Error('[events.newData] Event not Configured')
  }

  try {
    await events.newData(newRecords)
  }
  catch (e: any) {
    handleAlert(AlertKind.EVENT_INVOKE_ERROR, t('_.event.invokeError', { msg: e.message }))
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
  targetRecordPks = deepToRaw(targetRecordPks)

  if (!events.copyData) {
    handleAlert(AlertKind.EVENT_NOT_CONFIGURED, t('_.event.notConfigured', { name: 'copyData' }))
    throw new Error('[events.copyData] Event not Configured')
  }

  try {
    await events.copyData(targetRecordPks)
  }
  catch (e: any) {
    handleAlert(AlertKind.EVENT_INVOKE_ERROR, t('_.event.invokeError', { msg: e.message }))
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
  changedRecords = deepToRaw(changedRecords)

  if (!events.modifyData) {
    handleAlert(AlertKind.EVENT_NOT_CONFIGURED, t('_.event.notConfigured', { name: 'modifyData' }))
    throw new Error('[events.modifyData] Event not Configured')
  }

  try {
    await events.modifyData(changedRecords)
  }
  catch (e: any) {
    handleAlert(AlertKind.EVENT_INVOKE_ERROR, t('_.event.invokeError', { msg: e.message }))
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
  deletedRecordPks = deepToRaw(deletedRecordPks)

  if (!events.deleteData) {
    handleAlert(AlertKind.EVENT_NOT_CONFIGURED, t('_.event.notConfigured', { name: 'deleteData' }))
    throw new Error('[events.deleteData] Event not Configured')
  }

  try {
    await events.deleteData(deletedRecordPks)
  }
  catch (e: any) {
    handleAlert(AlertKind.EVENT_INVOKE_ERROR, t('_.event.invokeError', { msg: e.message }))
    throw new Error(`[events.deleteData] Invoke Error:${e.message}`)
  }

  layoutsConf.forEach(async (layout) => {
    await loadData(undefined, undefined, layout.id)
  })
}

/**
 * 加载可编辑数据
 *
 * Load editable data
 *
 * @param checkRecordPks 要检查的数据主键 / Data primary keys to be checked
 */
export async function loadEditableData(checkRecordPks: any[]): Promise<EditableDataResp> {
  checkRecordPks = deepToRaw(checkRecordPks)

  if (!events.loadEditableData) {
    handleAlert(AlertKind.EVENT_NOT_CONFIGURED, t('_.event.notConfigured', { name: 'loadEditableData' }))
    throw new Error('[events.loadEditableData] Event not Configured')
  }

  try {
    return await events.loadEditableData(checkRecordPks)
  }
  catch (e: any) {
    handleAlert(AlertKind.EVENT_INVOKE_ERROR, t('_.event.invokeError', { msg: e.message }))
    throw new Error(`[events.loadEditableData] Invoke Error:${e.message}`)
  }
}

/**
 * 选择数据
 *
 * Select data
 *
 * @param selectedRecordPks 选择的数据主键 / Selected data primary keys
 */
export async function selectData(selectedRecordPks: any[]) {
  selectedRecordPks = deepToRaw(selectedRecordPks)

  const layout = layoutsConf.find(layout => layout.id === currentLayoutId.value)!

  if (!events.selectData) {
    handleAlert(AlertKind.EVENT_NOT_CONFIGURED, t('_.event.notConfigured', { name: 'selectData' }))
    throw new Error('[events.selectData] Event not Configured')
  }

  try {
    await events.selectData(selectedRecordPks)
  }
  catch (e: any) {
    handleAlert(AlertKind.EVENT_INVOKE_ERROR, t('_.event.invokeError', { msg: e.message }))
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
    handleAlert(AlertKind.EVENT_NOT_CONFIGURED, t('_.event.notConfigured', { name: 'clickCell' }))
    throw new Error('[events.clickCell] Event not Configured')
  }
  try {
    await events.clickCell(clickedRecordPk, clickedColumnName, layout.id, layout.layoutKind)
  }
  catch (e: any) {
    handleAlert(AlertKind.EVENT_INVOKE_ERROR, t('_.event.invokeError', { msg: e.message }))
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
  slice = deepToRaw(slice)

  if (!events.loadDictItems) {
    handleAlert(AlertKind.EVENT_NOT_CONFIGURED, t('_.event.notConfigured', { name: 'loadCellDictItems' }))
    throw new Error('[events.loadCellDictItems] Event not Configured')
  }
  try {
    return await events.loadDictItems(dictName, filterValue, slice)
  }
  catch (e: any) {
    handleAlert(AlertKind.EVENT_INVOKE_ERROR, t('_.event.invokeError', { msg: e.message }))
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
  conds = deepToRaw(conds)
  slice = deepToRaw(slice)

  if (!events.loadDictItemsWithMultiConds) {
    handleAlert(AlertKind.EVENT_NOT_CONFIGURED, t('_.event.notConfigured', { name: 'loadCellDictItemsWithMultiConds' }))
    throw new Error('[events.loadCellDictItemsWithMultiConds] Event not Configured')
  }
  try {
    return await events.loadDictItemsWithMultiConds(conds, slice)
  }
  catch (e: any) {
    handleAlert(AlertKind.EVENT_INVOKE_ERROR, t('_.event.invokeError', { msg: e.message }))
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
  changedStyleProps = deepToRaw(changedStyleProps)

  if (!events.modifyStyles) {
    handleAlert(AlertKind.EVENT_NOT_CONFIGURED, t('_.event.notConfigured', { name: 'modifyStyles' }))
    throw new Error('[events.modifyStyles] Event not Configured')
  }

  try {
    await events.modifyStyles(changedStyleProps)
  }
  catch (e: any) {
    handleAlert(AlertKind.EVENT_INVOKE_ERROR, t('_.event.invokeError', { msg: e.message }))
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

  if (!events.newLayout) {
    handleAlert(AlertKind.EVENT_NOT_CONFIGURED, t('_.event.notConfigured', { name: 'newLayout' }))
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
    handleAlert(AlertKind.EVENT_INVOKE_ERROR, t('_.event.invokeError', { msg: e.message }))
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
    handleAlert(AlertKind.EVENT_NOT_CONFIGURED, t('_.event.notConfigured', { name: 'modifyLayout' }))
    throw new Error('[events.modifyLayout] Event not Configured')
  }

  try {
    await events.modifyLayout(currentLayoutId.value, changedLayoutProps)
  }
  catch (e: any) {
    handleAlert(AlertKind.EVENT_INVOKE_ERROR, t('_.event.invokeError', { msg: e.message }))
    throw new Error(`[events.modifyLayout] Invoke Error:${e.message}`)
  }

  // Process basic
  changedLayoutProps.title !== undefined && (layout.title = changedLayoutProps.title)
  changedLayoutProps.icon !== undefined && (layout.icon = changedLayoutProps.icon)

  changedLayoutProps.slice !== undefined && (layout.slice = changedLayoutProps.slice)
  changedLayoutProps.showSelectColumn !== undefined && (layout.showSelectColumn = changedLayoutProps.showSelectColumn)
  changedLayoutProps.actionColumn !== undefined && (layout.actionColumn = changedLayoutProps.actionColumn)

  changedLayoutProps.subDataShowKind !== undefined && (layout.subDataShowKind = changedLayoutProps.subDataShowKind)

  changedLayoutProps.gantt !== undefined && (layout.gantt = changedLayoutProps.gantt)
  changedLayoutProps.filter !== undefined && (layout.filter = changedLayoutProps.filter)
  changedLayoutProps.group !== undefined && (layout.group = changedLayoutProps.group)
  changedLayoutProps.sort !== undefined && (layout.sort = changedLayoutProps.sort)
  changedLayoutProps.agg !== undefined && (layout.agg = changedLayoutProps.agg)
  changedLayoutProps.edit !== undefined && (layout.edit = changedLayoutProps.edit)
  changedLayoutProps.columns !== undefined && (layout.columns = changedLayoutProps.columns)

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
  if (!events.deleteLayout) {
    handleAlert(AlertKind.EVENT_NOT_CONFIGURED, t('_.event.notConfigured', { name: 'deleteLayout' }))
    throw new Error('[events.deleteLayout] Event not Configured')
  }

  try {
    await events.deleteLayout(deletedLayoutId)
  }
  catch (e: any) {
    handleAlert(AlertKind.EVENT_INVOKE_ERROR, t('_.event.invokeError', { msg: e.message }))
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
  if (!events.loadHolidays) {
    handleAlert(AlertKind.EVENT_NOT_CONFIGURED, t('_.event.notConfigured', { name: 'loadHolidays' }))
    throw new Error('[events.loadHolidays] Event not Configured')
  }

  try {
    return await events.loadHolidays(startTime, endTime)
  }
  catch (e: any) {
    handleAlert(AlertKind.EVENT_INVOKE_ERROR, t('_.event.invokeError', { msg: e.message }))
    throw new Error(`[events.loadHolidays] Invoke Error:${e.message}`)
  }
}

/**
 * 自定义警告处理
 *
 * Custom alert handling
 *
 * @param errorKind 警告类型 / Alert kind
 * @param message 警告消息 / Alert message
 * @param alertLevel  消息类型 / Message type
 * @param showTimeSec 显示的时间（秒） / Display time (seconds)
 * @param attachEle 附加到的元素 / Element to attach
 */
export function handleAlert(errorKind: AlertKind, message: string, alertLevel: AlertLevel = AlertLevel.WARNING, showTimeSec: number = 4, attachEle?: HTMLElement) {
  if (events.handleAlert) {
    events.handleAlert(errorKind, message)
  }
  else {
    showAlert(message, showTimeSec, alertLevel, attachEle ?? getParentWithClass(document.getElementById(`iw-tt-layout-${currentLayoutId.value}`), 'iw-tt')!)
  }
}

/**
 * 选择上下文内容
 *
 * Select context menu item
 *
 * @param item 上下文菜单项 / Context menu item
 * @param exArg 额外参数 / Extra argument
 */
export function selectContextMenu(item: ContextMenuItemProps, exArg?: any) {
  if (events.selectContextMenu) {
    events.selectContextMenu(item, exArg)
  }
}
