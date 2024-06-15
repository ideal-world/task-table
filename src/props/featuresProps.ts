import type { FeatureActionColumnInitProps, FeatureActionColumnModifyProps } from '../features/actionColumn/actionColumnProps'
import type { FeatureAggDataInitProps, FeatureAggDataModifyProps } from '../features/aggData/aggDataProps'
import type { FeatureEditDataInitProps, FeatureEditDataModifyProps } from '../features/editData/editDataProps'
import type { FeatureFilterDataInitProps, FeatureFilterDataModifyProps } from '../features/filterData/filterDataProps'
import type { FeatureGanttLayoutInitProps, FeatureGanttLayoutModifyProps } from '../features/ganttLayout/ganttLayoutProps'
import type { FeatureGroupDataInitProps, FeatureGroupDataModifyProps } from '../features/groupData/groupDataProps'
import type { FeatureMultiLayoutsInitProps } from '../features/multiLayouts/multiLayoutsProps'
import type { FeatureQuickSearchInitProps } from '../features/quickSearch/quickSearchProps'
import type { FeatureSelectDataEnableProps as FeatureSelectDataInitProps, FeatureSelectDataModifyProps } from '../features/selectData/selectDataProps'
import type { FeatureSettingTableInitProps } from '../features/settingTable/settingTableProps'
import type { FeatureSortDataInitProps, FeatureSortDataModifyProps } from '../features/sortData/sortDataProps'
import type { FeatureUseDictInitProps } from '../features/useDict/useDictProps'

export interface LayoutFeatureProps {
  ganttLayout?: FeatureGanttLayoutInitProps
  actionColumn?: FeatureActionColumnInitProps
  selectData?: FeatureSelectDataInitProps
  aggData?: FeatureAggDataInitProps
  filterData?: FeatureFilterDataInitProps
  sortData?: FeatureSortDataInitProps
  groupData?: FeatureGroupDataInitProps
  editData?: FeatureEditDataInitProps
}

export function tableFeaturePropsToLayoutFeatureProps(tableFeatures: TableFeatureProps): LayoutFeatureProps {
  return {
    ganttLayout: tableFeatures.ganttLayout,
    actionColumn: tableFeatures.actionColumn,
    selectData: tableFeatures.selectData,
    aggData: tableFeatures.aggData,
    filterData: tableFeatures.filterData,
    sortData: tableFeatures.sortData,
    groupData: tableFeatures.groupData,
    editData: tableFeatures.editData,
  }
}

export interface TableFeatureProps extends LayoutFeatureProps {
  multiLayouts?: FeatureMultiLayoutsInitProps
  quickSearch?: FeatureQuickSearchInitProps
  settingTable?: FeatureSettingTableInitProps
  useDict?: FeatureUseDictInitProps
}

export interface LayoutFeatureModifyProps {
  ganttLayout?: FeatureGanttLayoutModifyProps
  actionColumn?: FeatureActionColumnModifyProps
  selectData?: FeatureSelectDataModifyProps
  aggData?: FeatureAggDataModifyProps
  filterData?: FeatureFilterDataModifyProps
  sortData?: FeatureSortDataModifyProps
  groupData?: FeatureGroupDataModifyProps
  editData?: FeatureEditDataModifyProps
}

export interface ColumnFeatureProps {
  aggData?: boolean
  filterData?: boolean
  sortData?: boolean
  groupData?: boolean
  editData?: boolean
  useDict?: boolean
  dictEditable?: boolean
}

export * from '../features/actionColumn/actionColumnProps'
export * from '../features/aggData/aggDataProps'
export * from '../features/editData/editDataProps'
export * from '../features/filterData/filterDataProps'
export * from '../features/ganttLayout/ganttLayoutProps'
export * from '../features/groupData/groupDataProps'
export * from '../features/multiLayouts/multiLayoutsProps'
export * from '../features/quickSearch/quickSearchProps'
export * from '../features/selectData/selectDataProps'
export * from '../features/settingTable/settingTableProps'
export * from '../features/sortData/sortDataProps'
export * from '../features/useDict/useDictProps'

