import type { DataKind, LayoutKind, SizeKind, SubDataShowKind } from './enumProps'
import type { TableEventProps } from './eventProps'
import type { ActionColumnProps, AggDataProps, DataSliceProps, EditDataProps, FilterDataProps, GanttLayoutProps, GroupDataProps, QuickSearchProps, SortDataProps } from './functionProps'

export interface CommonFeatureProps {
  slice: DataSliceProps
  showSelectColumn: boolean
  subDataShowKind: SubDataShowKind

  actionColumn?: ActionColumnProps
  gantt?: GanttLayoutProps

  filter?: FilterDataProps
  group?: GroupDataProps
  sort?: SortDataProps
  agg?: AggDataProps
  edit?: EditDataProps
}

export interface TableProps extends CommonFeatureProps {
  id: string
  pkColumnName: string
  parentPkColumnName?: string
  columns: TableColumnProps[]
  styles: TableStyleProps
  quickSearch?: QuickSearchProps
  layouts: LayoutProps[]
  events: TableEventProps
}

export interface TableStyleProps {
  size: SizeKind
  theme: string
  tableClass: string
  headerClass: string
  footerClass: string
  rowClass: string
  cellClass: string
  aggClass: string
}

export interface CommonColumnProps {
  name: string
  wrap: boolean
  fixed: boolean
  width: number
  hide: boolean
  styles: { [key: string]: string }
  categoryTitle?: string
  render?: (record: { [key: string]: any }, layoutKind: LayoutKind) => any
}

export interface TableColumnProps extends CommonColumnProps {
  title: string
  icon: string
  dataKind: DataKind
  useDict: boolean
  dictEditable: boolean
  multiValue: boolean
  kindDateTimeFormat?: string

  filterable: boolean
  groupable: boolean
  sortable: boolean
  aggable: boolean
  editable: boolean
}

export interface LayoutProps extends CommonFeatureProps {
  id: string
  title: string
  layoutKind: LayoutKind
  icon: string
  columns: LayoutColumnProps[]
}

export interface LayoutColumnProps extends CommonColumnProps {
}

export interface LayoutModifyProps extends CommonFeatureProps {
  title?: string
  icon?: string
  quickSearchContent?: string

  newColumn?: LayoutColumnProps
  changedColumn?: LayoutColumnProps
  deletedColumnName?: string
}
