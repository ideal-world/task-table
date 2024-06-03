import { convertTableColumnPropsToTableColumnConf, convertTableLayoutColumnPropsToTableLayoutColumnConf, convertTableStylePropsToTableStyleConf } from './components/conf'
import * as eb from './components/eventbus'
import type { TableCellDictItemsResp, TableColumnProps, TableDataSliceProps, TableLayoutColumnProps, TableLayoutKernelProps, TableLayoutModifyProps, TableStyleProps } from './props'

export async function loadData(moreForGroupedValue?: any, offsetNumber?: number, fetchNumber?: number, layoutId?: string) {
  await eb.loadData(moreForGroupedValue, offsetNumber, fetchNumber, layoutId)
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

export async function loadCellDictItems(columnName: string, filterValue?: any, slice?: TableDataSliceProps): Promise<TableCellDictItemsResp> {
  return await eb.loadCellDictItems(columnName, filterValue, slice)
}

export async function modifyStyles(changedStyles: TableStyleProps): Promise<boolean> {
  return await eb.modifyStyles(convertTableStylePropsToTableStyleConf(changedStyles))
}

export async function newColumn(newLayoutColumnProps: TableLayoutColumnProps, tableColumn: TableColumnProps): Promise<boolean> {
  return await eb.newColumn(convertTableLayoutColumnPropsToTableLayoutColumnConf(newLayoutColumnProps, convertTableColumnPropsToTableColumnConf(tableColumn)))
}

export async function modifyColumn(changedLayoutColumnProps: TableLayoutColumnProps, tableColumn: TableColumnProps): Promise<boolean> {
  return await eb.modifyColumn(convertTableLayoutColumnPropsToTableLayoutColumnConf(changedLayoutColumnProps, convertTableColumnPropsToTableColumnConf(tableColumn)))
}

export async function deleteColumn(deletedColumnName: string): Promise<boolean> {
  return await eb.deleteColumn(deletedColumnName)
}

export async function newLayout(newLayoutProps: TableLayoutKernelProps): Promise<boolean> {
  return await eb.newLayout(newLayoutProps)
}

export async function modifyLayout(changedLayoutProps: TableLayoutModifyProps): Promise<boolean> {
  return await eb.modifyLayout(changedLayoutProps)
}

export async function deleteLayout(deletedLayoutId: string): Promise<boolean> {
  return await eb.deleteLayout(deletedLayoutId)
}
