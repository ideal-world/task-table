import * as eb from './components/eventbus'
import type { FeatureUseDictItemsResp } from './features/useDict/useDictProps'
import type { DataQuerySliceReq } from './props/basicProps'
import type { LayoutModifyProps, LayoutProps } from './props/layoutProps'
import type { TableStyleProps } from './props/tableProps'

export async function loadData(moreForGroupedValue?: any, returnOnlyAggs?: boolean, layoutId?: string) {
  await eb.loadData(moreForGroupedValue, returnOnlyAggs, layoutId)
}

export async function newData(newRecords: { [key: string]: any }[]): Promise<boolean> {
  return await eb.newData(newRecords)
}

export async function copyData(targetRecordPks: any[]): Promise<boolean> {
  return await eb.copyData(targetRecordPks)
}

export async function modifyData(changedRecords: { [key: string]: any }[]): Promise<boolean> {
  return await eb.modifyData(changedRecords)
}

export async function deleteData(deletedRecordPks: any[]): Promise<boolean> {
  return await eb.deleteData(deletedRecordPks)
}

export async function selectData(selectedRecordPks: any[]): Promise<boolean> {
  return await eb.selectData(selectedRecordPks)
}

export async function loadCellDictItems(columnName: string, filterValue?: any, slice?: DataQuerySliceReq): Promise<FeatureUseDictItemsResp> {
  return await eb.loadCellDictItems(columnName, filterValue, slice)
}

export async function loadCellDictItemsWithMultiConds(conds: { [columnName: string]: any[] }, slice?: DataQuerySliceReq): Promise<{ [columnName: string]: FeatureUseDictItemsResp }> {
  return await eb.loadCellDictItemsWithMultiConds(conds, slice)
}

export async function modifyStyles(changedStyles: TableStyleProps): Promise<boolean> {
  return await eb.modifyStyles(changedStyles)
}

export async function newLayout(newLayoutProps: LayoutProps): Promise<boolean> {
  return await eb.newLayout(newLayoutProps)
}

export async function modifyLayout(changedLayoutProps: LayoutModifyProps): Promise<boolean> {
  return await eb.modifyLayout(changedLayoutProps)
}

export async function deleteLayout(deletedLayoutId: string): Promise<boolean> {
  return await eb.deleteLayout(deletedLayoutId)
}
