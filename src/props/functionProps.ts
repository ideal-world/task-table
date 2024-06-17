import type { ChangeAllOptional, ChangeOptionalExcept } from '../utils/tsHelper'
import type { AggregateKind, LayoutKind, OperatorKind } from './enumProps'
import { GanttShowKind } from './enumProps'

export interface DataQuerySliceReq {
  offsetNumber: number
  fetchNumber: number
}

export interface DataSliceProps extends DataQuerySliceReq {
  fetchNumbers: number[]
}
export type SimpleDataSliceProps = ChangeAllOptional<DataSliceProps>
export function generateDataSliceProps(simple?: SimpleDataSliceProps): DataSliceProps {
  return {
    offsetNumber: simple?.offsetNumber ?? 0,
    fetchNumber: simple?.fetchNumber ?? 10,
    fetchNumbers: simple?.fetchNumbers ?? [5, 10, 20, 30, 50, 100],
  }
}

export interface QuickSearchProps {
  placeholder: string
  searchContent?: string
}

export interface ActionColumnProps {
  render: (record: { [key: string]: any }, layoutKind: LayoutKind) => any
  width: number
}

export interface AggDataProps {
  items: AggDataItemProps[]
}
export type SimpleAggDataProps = ChangeAllOptional<AggDataProps>
export function generateAggDataProps(simple: SimpleAggDataProps): AggDataProps {
  return {
    items: simple.items ?? [],
  }
}

export interface AggDataItemProps {
  columnName: string
  aggKind: AggregateKind
}

export interface FilterDataProps {
  // OR relationship between groups
  groups: FilterDataGroupProps[]
}
export type SimpleFilterDataProps = ChangeAllOptional<FilterDataProps>
export function generateFilterDataProps(simple: SimpleFilterDataProps): FilterDataProps {
  return {
    groups: simple.groups ?? [],
  }
}

export interface FilterDataGroupProps {
  // AND relationship between items
  items: FilterDataItemProps[]
}

export interface FilterDataItemProps {
  columnName: string
  operator: OperatorKind
  value?: any
}

export interface GroupDataProps {
  item?: GroupDataItemProps
  slices?: { [key: string]: DataSliceProps }
}
export type SimpleGroupDataProps = ChangeAllOptional<GroupDataProps>
export function generateGroupDataProps(simple: SimpleGroupDataProps): GroupDataProps {
  return {
    item: simple.item,
    slices: simple.slices,
  }
}

export interface GroupDataItemProps {
  columnName: string
  orderDesc: boolean
  hideEmptyRecord: boolean
}

export interface SortDataProps {
  conds: SortDataItemProps[]
}
export type SimpleSortDataProps = ChangeAllOptional<SortDataProps>
export function generateSortDataProps(simple: SimpleSortDataProps): SortDataProps {
  return {
    conds: simple.conds ?? [],
  }
}

export interface SortDataItemProps {
  columnName: string
  orderDesc: boolean
}

export interface GanttLayoutProps {
  timelineWidth: number
  showKind: GanttShowKind
  planStartTimeColumnName: string
  planEndTimeColumnName: string
  actualStartTimeColumnName?: string
  actualEndTimeColumnName?: string
}
export type SimpleGanttLayoutProps = ChangeOptionalExcept<GanttLayoutProps, 'planStartTimeColumnName' | 'planEndTimeColumnName'>
export function generateGanttLayoutProps(simple: SimpleGanttLayoutProps): GanttLayoutProps {
  return {
    timelineWidth: simple.timelineWidth ?? 300,
    showKind: simple.showKind ?? GanttShowKind.DAY,
    planStartTimeColumnName: simple.planStartTimeColumnName,
    planEndTimeColumnName: simple.planEndTimeColumnName,
    actualStartTimeColumnName: simple.actualStartTimeColumnName,
    actualEndTimeColumnName: simple.actualEndTimeColumnName,
  }
}

export interface EditDataProps {
  columnNames: string[]
}
export type SimpleEditDataProps = ChangeAllOptional<EditDataProps>
export function generateEditDataProps(simple: SimpleEditDataProps): EditDataProps {
  return {
    columnNames: simple.columnNames ?? [],
  }
}
