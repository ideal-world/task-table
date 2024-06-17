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
  searchContent?: string
}

export interface ActionColumnProps {
  render: (record: { [key: string]: any }, layoutKind: LayoutKind) => any
  width: number
}

export interface AggDataProps {
  items: AggDataItemProps[]
}

export interface AggDataItemProps {
  columnName: string
  aggKind: AggregateKind
}

export interface FilterDataProps {
  // OR relationship between groups
  groups: FilterDataGroupProps[]
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

export interface GroupDataItemProps {
  columnName: string
  orderDesc: boolean
  hideEmptyRecord: boolean
}

export interface SortDataProps {
  conds: SortDataItemProps[]
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

export interface EditDataProps {
  columnNames: string[]
}
