import type { AggregateKind, GanttShowKind, LayoutKind, OperatorKind } from './enumProps'

export interface DataQuerySliceReq {
  offsetNumber: number
  fetchNumber: number
}

export interface DataSliceProps extends DataQuerySliceReq {
  fetchNumbers: number[]
}

export interface QuickSearchProps {
  placeholder: string
  quickSearchContent: string
}

export interface ActionColumnProps {
  render: (record: { [key: string]: any }, layoutKind: LayoutKind) => any
  width: number
}

export interface AggDataProps {
  aggs: { [key: string]: AggregateKind }
}

export interface FilterDataProps {
  // OR relationship between groups
  filters: FilterDataGroupProps[]
}

export interface FilterDataGroupProps {
  // AND relationship between items
  items: FilterItemProps[]
}

export interface FilterItemProps {
  columnName: string
  operator: OperatorKind
  value?: any
}

export interface GroupDataProps {
  group: GroupDataItemProps
  slices: { [key: string]: DataSliceProps }
}

export interface GroupDataItemProps {
  columnName: string
  groupOrderDesc: boolean
  // useDict: boolean
  hideEmptyRecord: boolean
}

export interface SortDataProps {
  sorts: SortDataItemProps[]
}

export interface SortDataItemProps {
  columnName: string
  orderDesc: boolean
}

export interface GanttLayoutProps {
  showKind: GanttShowKind
  timelineWidth: number
  planStartTimeColumnName: string
  planEndTimeColumnName: string
  actualStartTimeColumnName: string
  actualEndTimeColumnName: string
}

export interface EditDataProps {
  columnNames: string[]
}
