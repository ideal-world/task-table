import type { DataGroupResp, DataResp, DictItemsResp } from './basicProps'
import type { LayoutKind } from './enumProps'
import type { AggDataProps, DataQuerySliceReq, FilterDataProps, GroupDataProps, SortDataProps } from './functionProps'
import type { LayoutModifyProps, LayoutProps, TableStyleProps } from '.'

export interface TableEventProps {
  loadData: (
    columns?: string[],
    quickSearchContent?: string,
    filters?: FilterDataProps,
    sorts?: SortDataProps,
    group?: GroupDataProps,
    aggs?: AggDataProps,
    hideSubData?: boolean,
  // Load only the data of the corresponding group
    byGroupValue?: any,
    slices?: DataQuerySliceReq,
    returnOnlyAggs?: boolean) => Promise<DataResp | DataGroupResp[]>
  newData?: (newRecords: { [key: string]: any }[]) => Promise<{ [key: string]: any }[]>
  copyData?: (targetRecordPks: any[]) => Promise<{ [key: string]: any }[]>
  modifyData?: (changedRecords: { [key: string]: any }[]) => Promise<{ [key: string]: any }[]>
  // Need to delete child node
  deleteData?: (deletedRecordPks: any[]) => Promise<boolean>
  selectData?: (selectedRecordPks: any[]) => Promise<boolean>
  clickCell?: (clickedRecordPk: any, clickedColumnName: string, byLayoutId: string, byLayoutKind: LayoutKind) => Promise<boolean>

  loadCellDictItems?: (columnName: string, filterValue?: any, slice?: DataQuerySliceReq) => Promise<DictItemsResp>
  loadCellDictItemsWithMultiConds?: (conds: { [columnName: string]: any[] }, slice?: DataQuerySliceReq) => Promise<{ [columnName: string]: DictItemsResp }>

  modifyStyles?: (changedStyleProps: TableStyleProps) => Promise<boolean>

  newLayout?: (newLayoutProps: LayoutProps) => Promise<string>
  modifyLayout?: (changedLayoutId: string, changedLayoutProps: LayoutModifyProps) => Promise<boolean>
  deleteLayout?: (deletedLayoutId: string) => Promise<boolean>

  loadHolidays?: (startTime: Date, endTime: Date) => Promise<Date[]>
}
