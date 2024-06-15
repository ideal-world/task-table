import type { FeatureAggDataItemProps } from '../features/aggData/aggDataProps'
import type { FeatureFilterDataGroupProps } from '../features/filterData/filterDataProps'
import type { FeatureGroupDataItemProps, FeatureGroupDataResp } from '../features/groupData/groupDataProps'
import type { FeatureSortDataItemProps } from '../features/sortData/sortDataProps'
import type { FeatureUseDictItemsResp } from '../features/useDict/useDictProps'
import type { DataQuerySliceReq, DataResp } from './basicProps'
import type { LayoutKind } from './enumsProps'
import type { LayoutModifyProps, LayoutProps } from './layoutProps'
import type { TableStyleProps } from './tableProps'

export interface TableEventProps {
  loadData: (
    columns?: string[],
    quickSearchContent?: string,
    filters?: FeatureFilterDataGroupProps[],
    sorts?: FeatureSortDataItemProps[],
    group?: FeatureGroupDataItemProps,
    aggs?: FeatureAggDataItemProps[],
    hideSubData?: boolean,
  // Load only the data of the corresponding group
    byGroupValue?: any,
    slices?: DataQuerySliceReq,
    returnOnlyAggs?: boolean) => Promise<DataResp | FeatureGroupDataResp[]>
  newData?: (newRecords: { [key: string]: any }[]) => Promise<{ [key: string]: any }[]>
  copyData?: (targetRecordPks: any[]) => Promise<{ [key: string]: any }[]>
  modifyData?: (changedRecords: { [key: string]: any }[]) => Promise<{ [key: string]: any }[]>
  // Need to delete child node
  deleteData?: (deletedRecordPks: any[]) => Promise<boolean>
  selectData?: (selectedRecordPks: any[]) => Promise<boolean>
  clickCell?: (clickedRecordPk: any, clickedColumnName: string, byLayoutId: string, byLayoutKind: LayoutKind) => Promise<boolean>

  loadCellDictItems?: (columnName: string, filterValue?: any, slice?: DataQuerySliceReq) => Promise<FeatureUseDictItemsResp>
  loadCellDictItemsWithMultiConds?: (conds: { [columnName: string]: any[] }, slice?: DataQuerySliceReq) => Promise<{ [columnName: string]: FeatureUseDictItemsResp }>

  modifyStyles?: (changedStyleProps: TableStyleProps) => Promise<boolean>

  newLayout?: (newLayoutProps: LayoutProps) => Promise<string>
  modifyLayout?: (changedLayoutId: string, changedLayoutProps: LayoutModifyProps) => Promise<boolean>
  deleteLayout?: (deletedLayoutId: string) => Promise<boolean>

  loadHolidays?: (startTime: Date, endTime: Date) => Promise<Date[]>
}
