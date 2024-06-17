import { IwUtils } from '../utils'
import type { ChangeAllOptional, ChangeOptionalExcept, ChangeOptionalExceptWithTypes } from '../utils/tsHelper'
import type { LayoutKind } from './enumProps'
import { DataKind, SizeKind, SubDataShowKind, getDefaultIconByDataKind, getDefaultIconByLayoutKind } from './enumProps'

import type { TableEventProps } from './eventProps'
import type { ActionColumnProps, AggDataProps, DataSliceProps, EditDataProps, FilterDataProps, GanttLayoutProps, GroupDataProps, QuickSearchProps, SimpleAggDataProps, SimpleDataSliceProps, SimpleEditDataProps, SimpleFilterDataProps, SimpleGanttLayoutProps, SimpleGroupDataProps, SimpleSortDataProps, SortDataProps } from './functionProps'
import { generateAggDataProps, generateDataSliceProps, generateEditDataProps, generateFilterDataProps, generateGanttLayoutProps, generateGroupDataProps, generateSortDataProps } from './functionProps'

// --------------------------------------------------------- Common ---------------------------------------------------------

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
interface SimpleCommonFunctionProps {
  slice?: SimpleDataSliceProps
  showSelectColumn?: boolean
  subDataShowKind?: SubDataShowKind

  actionColumn?: ActionColumnProps
  gantt?: SimpleGanttLayoutProps

  filter?: SimpleFilterDataProps
  group?: SimpleGroupDataProps
  sort?: SimpleSortDataProps
  agg?: SimpleAggDataProps
  edit?: SimpleEditDataProps
}
function generateCommonFunctionProps(tableSimple: SimpleCommonFunctionProps, layoutSimple?: SimpleCommonFunctionProps): CommonFunctionProps {
  return {
    showSelectColumn: layoutSimple?.showSelectColumn ?? tableSimple.showSelectColumn ?? false,
    subDataShowKind: layoutSimple?.subDataShowKind ?? tableSimple.subDataShowKind ?? SubDataShowKind.FOLD_SUB_DATA,
    actionColumn: layoutSimple?.actionColumn ?? tableSimple.actionColumn,
    slice: generateDataSliceProps(layoutSimple?.slice ?? tableSimple.slice),
    gantt: (layoutSimple?.gantt ?? tableSimple.gantt) && generateGanttLayoutProps((layoutSimple?.gantt ?? tableSimple.gantt)!),
    filter: (layoutSimple?.filter ?? tableSimple.filter) && generateFilterDataProps((layoutSimple?.filter ?? tableSimple.filter)!),
    group: (layoutSimple?.group ?? tableSimple.group) && generateGroupDataProps((layoutSimple?.group ?? tableSimple.group)!),
    sort: (layoutSimple?.sort ?? tableSimple.sort) && generateSortDataProps((layoutSimple?.sort ?? tableSimple.sort)!),
    agg: (layoutSimple?.agg ?? tableSimple.agg) && generateAggDataProps((layoutSimple?.agg ?? tableSimple.agg)!),
    edit: (layoutSimple?.edit ?? tableSimple.edit) && generateEditDataProps((layoutSimple?.edit ?? tableSimple.edit)!),
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
function generateCommonColumnProps(tableSimple: SimpleCommonColumnProps, layoutSimple?: SimpleCommonColumnProps): CommonColumnProps {
  return {
    name: layoutSimple?.name ?? tableSimple.name,
    wrap: layoutSimple?.wrap ?? tableSimple.wrap ?? false,
    fixed: layoutSimple?.fixed ?? tableSimple.fixed ?? false,
    width: layoutSimple?.width ?? tableSimple.width ?? 100,
    hide: layoutSimple?.hide ?? tableSimple.hide ?? false,
    styles: layoutSimple?.styles ?? tableSimple.styles ?? {},
    categoryTitle: layoutSimple?.categoryTitle ?? tableSimple.categoryTitle,
    render: layoutSimple?.render ?? tableSimple.render,
    
    filterable: layoutSimple?.filterable ?? tableSimple.filterable ?? false,
    groupable: layoutSimple?.groupable ?? tableSimple.groupable ?? false,
    sortable: layoutSimple?.sortable ?? tableSimple.sortable ?? false,
    aggable: layoutSimple?.aggable ?? tableSimple.aggable ?? false,
    editable: layoutSimple?.editable ?? tableSimple.editable ?? false,
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
  styles?: SimpleTableStyleProps
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
    size: simple.size ?? SizeKind.MEDIUM,
    theme: simple.theme ?? '',
    tableClass: simple.tableClass ?? '',
    headerClass: simple.headerClass ?? '',
    footerClass: simple.footerClass ?? '',
    rowClass: simple.rowClass ?? '',
    cellClass: simple.cellClass ?? '',
    aggClass: simple.aggClass ?? '',
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
    title: simple.title ?? simple.name,
    icon: getDefaultIconByDataKind(simple.dataKind ?? DataKind.TEXT),
    dataKind: simple.dataKind ?? DataKind.TEXT,
    useDict: simple.useDict ?? false,
    dictEditable: simple.dictEditable ?? false,
    multiValue: simple.multiValue ?? false,
    ...generateCommonColumnProps(simple),
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
    ...generateCommonFunctionProps(tableSimple, layoutSimple),
  }
}

export interface LayoutColumnProps extends CommonColumnProps {
}
export type SimpleLayoutColumnProps = ChangeOptionalExcept<LayoutColumnProps, 'name'>
function generateLayoutColumnProps(layoutSimple: SimpleLayoutColumnProps, tableSimple: CommonColumnProps): LayoutColumnProps {
  return {
    ...generateCommonColumnProps(tableSimple, layoutSimple),
  }
}

export interface LayoutModifyProps extends Partial<CommonFunctionProps> {
  title?: string
  icon?: string

  changedColumn?: LayoutColumnProps
}
