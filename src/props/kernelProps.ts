import { IwUtils } from '../utils'
import type { ChangeAllOptional, ChangeOptionalExcept, ChangeOptionalExceptWithTypes } from '../utils/tsHelper'
import type { LayoutKind } from './enumProps'
import { DataKind, SizeKind, SubDataShowKind, getDefaultIconByDataKind, getDefaultIconByLayoutKind } from './enumProps'

import type { TableEventProps } from './eventProps'
import type { ActionColumnProps, AggDataProps, DataSliceProps, EditDataProps, FilterDataProps, GanttLayoutProps, GroupDataProps, QuickSearchProps, SortDataProps } from './functionProps'

// --------------------------------------------------------- Common ---------------------------------------------------------

export function defaultSlice(): DataSliceProps {
  return {
    offsetNumber: 0,
    fetchNumber: 10,
    fetchNumbers: [5, 10, 20, 30, 50, 100],
  }
}

export interface CommonFunctionProps {
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
type SimpleCommonFunctionProps = Partial<CommonFunctionProps>
function generateCommonFunctionProps(simple: SimpleCommonFunctionProps): CommonFunctionProps {
  return {
    slice: defaultSlice(),
    showSelectColumn: false,
    subDataShowKind: SubDataShowKind.FOLD_SUB_DATA,
    ...simple,
  }
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

  filterable: boolean
  groupable: boolean
  sortable: boolean
  aggable: boolean
  editable: boolean
}
export type SimpleCommonColumnProps = ChangeOptionalExcept<CommonColumnProps, 'name'>
function generateCommonColumnProps(simple: SimpleCommonColumnProps): CommonColumnProps {
  return {
    wrap: false,
    fixed: false,
    width: 100,
    hide: false,
    styles: {},
    filterable: false,
    groupable: false,
    sortable: false,
    aggable: false,
    editable: false,
    ...simple,
  }
}

// --------------------------------------------------------- Table ---------------------------------------------------------

export interface TableProps extends CommonFunctionProps {
  id: string
  pkColumnName: string
  parentPkColumnName?: string
  columns: TableColumnProps[]
  layouts: LayoutProps[]
  events: TableEventProps
  styles: TableStyleProps

  quickSearch?: QuickSearchProps
}
export interface SimpleTableProps extends SimpleCommonFunctionProps {
  id?: string
  pkColumnName: string
  parentPkColumnName?: string
  columns: SimpleTableColumnProps[]
  layouts: SimpleLayoutProps[]
  events: TableEventProps
  styles: SimpleTableStyleProps
  quickSearch?: QuickSearchProps
}
export function generateTableProps(simple: SimpleTableProps): TableProps {
  const columns = simple.columns.map(col => generateTableColumnProps(col))
  const commonFunctions = generateCommonFunctionProps(simple)
  return {
    id: simple.id ?? `iw-table-${IwUtils.getRandomString(12)}`,
    pkColumnName: simple.pkColumnName,
    parentPkColumnName: simple.parentPkColumnName,
    quickSearch: simple.quickSearch,
    events: simple.events,
    ...commonFunctions,
    columns,
    layouts: simple.layouts.map(layout => generateLayoutProps(layout, {
      pkColumnName: simple.pkColumnName,
      columns,
      ...commonFunctions,
    })),
    styles: generateTableStyleProps(simple.styles ?? {}),
  }
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
export type SimpleTableStyleProps = ChangeAllOptional<TableStyleProps>
function generateTableStyleProps(simple: SimpleTableStyleProps): TableStyleProps {
  return {
    size: SizeKind.MEDIUM,
    theme: '',
    tableClass: '',
    headerClass: '',
    footerClass: '',
    rowClass: '',
    cellClass: '',
    aggClass: '',
    ...simple,
  }
}
export type TableStyleModifyProps = SimpleTableStyleProps

export interface TableColumnProps extends CommonColumnProps {
  title: string
  icon: string
  dataKind: DataKind
  useDict: boolean
  dictEditable: boolean
  multiValue: boolean
  kindDateTimeFormat?: string
}
export type SimpleTableColumnProps = ChangeOptionalExcept<TableColumnProps, 'name'>
function generateTableColumnProps(simple: SimpleTableColumnProps): TableColumnProps {
  return {
    title: simple.name,
    icon: getDefaultIconByDataKind(simple.dataKind ?? DataKind.TEXT),
    dataKind: DataKind.TEXT,
    useDict: false,
    dictEditable: false,
    multiValue: false,
    ...generateCommonColumnProps(simple),
    ...simple,
  }
}

// --------------------------------------------------------- Layout ---------------------------------------------------------

export interface LayoutProps extends CommonFunctionProps {
  id: string
  title: string
  layoutKind: LayoutKind
  icon: string
  columns: LayoutColumnProps[]
}
export type SimpleLayoutProps = ChangeOptionalExceptWithTypes<LayoutProps, 'title' | 'layoutKind' | 'columns', {
  columns: SimpleLayoutColumnProps[]
}>
export function generateLayoutProps(layoutSimple: SimpleLayoutProps, tableSimple: { pkColumnName: string, columns: TableColumnProps[] } & CommonFunctionProps): LayoutProps {
  const columns = layoutSimple.columns.map(col => generateLayoutColumnProps(col, tableSimple.columns.find(tcol => tcol.name === col.name)!))
  // Make sure the primary key is in the first column
  const pkIdx = columns.findIndex(col => col.name === tableSimple.pkColumnName)
  if (pkIdx !== -1) {
    const pkColumn = columns[pkIdx]!
    pkColumn.hide = false
    pkColumn.wrap = false
    columns.splice(pkIdx, 1)
    columns.splice(0, 0, pkColumn)
  }
  return {
    id: layoutSimple.id ?? `iw-layout-${IwUtils.getRandomString(12)}`,
    title: layoutSimple.title,
    layoutKind: layoutSimple.layoutKind,
    icon: layoutSimple.icon ?? getDefaultIconByLayoutKind(layoutSimple.layoutKind),
    columns,
    ...generateCommonFunctionProps({
      ...tableSimple,
      ...layoutSimple,
    }),
  }
}

export interface LayoutColumnProps extends CommonColumnProps {
}
export type SimpleLayoutColumnProps = ChangeOptionalExcept<LayoutColumnProps, 'name'>
function generateLayoutColumnProps(layoutSimple: SimpleLayoutColumnProps, tableSimple: CommonColumnProps): LayoutColumnProps {
  return {
    ...generateCommonColumnProps({
      ...tableSimple,
      ...layoutSimple,
    }),
  }
}

export interface LayoutModifyProps extends SimpleCommonFunctionProps {
  title?: string
  icon?: string

  changedColumn?: LayoutColumnProps
}
