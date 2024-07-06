/**
 * @module IwEvents
 * @description 所有外部可主动调用的事件 / All events that can be called externally
 */

import * as eb from './components/eventbus'
import type { LayoutModifyProps, SimpleLayoutProps, TableStyleModifyProps } from './props'

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
  await eb.loadData(byGroupValue, returnOnlyAgg, layoutId)
}

/**
 * 新建数据
 *
 * Create new data
 *
 * @param newRecords 要新建的数据 / Records to be created
 */
export async function newData(newRecords: { [columnName: string]: any }[]) {
  await eb.newData(newRecords)
}

/**
 * 复制数据
 *
 * Copy data
 *
 * @param targetRecordPks 要复制的数据主键 / Data primary keys to be copied
 */
export async function copyData(targetRecordPks: any[]) {
  await eb.copyData(targetRecordPks)
}

/**
 * 修改数据
 *
 * Modify data
 *
 * @param changedRecords 要修改的数据 / Data to be modified
 */
export async function modifyData(changedRecords: { [columnName: string]: any }[]) {
  await eb.modifyData(changedRecords)
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
  await eb.deleteData(deletedRecordPks)
}

/**
 * 选择数据
 *
 * Select data
 *
 * @param selectedRecordPks 选择的数据主键 / Selected data primary keys
 */
export async function selectData(selectedRecordPks: any[]) {
  await eb.selectData(selectedRecordPks)
}

/**
 * 修改样式
 *
 * Modify style
 *
 * @param changedStyleProps 修改的样式属性 / Modified style properties
 */
export async function modifyStyles(changedStyleProps: TableStyleModifyProps) {
  await eb.modifyStyles(changedStyleProps)
}

/**
 * 新建布局
 *
 * Create new layout
 *
 * @param newLayoutProps 新建布局属性 / New layout properties
 */
export async function newLayout(newLayoutProps: SimpleLayoutProps) {
  await eb.newLayout(newLayoutProps)
}

/**
 * 修改当前布局
 *
 * Modify current layout
 *
 * @param changedLayoutProps 修改的布局属性 / Changed layout properties
 */
export async function modifyLayout(changedLayoutProps: LayoutModifyProps) {
  await eb.modifyLayout(changedLayoutProps)
}

/**
 * 删除布局
 *
 * Delete layout
 *
 * @param deletedLayoutId 删除的布局ID / Deleted layout ID
 */
export async function deleteLayout(deletedLayoutId: string) {
  await eb.deleteLayout(deletedLayoutId)
}
