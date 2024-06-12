import * as iconSvg from '../assets/icon'
import type { AggregateKind, TableColumnProps, TableCommonColumnProps, TableDataFilterProps, TableDataGroupProps, TableDataGroupResp, TableDataResp, TableDataSliceProps, TableDataSortProps, TableLayoutColumnProps, TableLayoutKernelProps, TableProps, TableStyleProps } from '../props'
import { DataKind, LayoutKind, OperatorKind, SizeKind, SubDataShowKind } from '../props'

export interface TableBasicConf {
  id: string
  pkColumnName: string
  parentPkColumnName?: string
  columns: TableColumnConf[]
  styles: TableStyleConf
  quickSearchContent?: string
  defaultSlice: TableDataSliceProps
  defaultShowSelectColumn: boolean
  defaultActionColumnRender?: (record: { [key: string]: any }, layoutKind: LayoutKind) => any
  defaultActionColumnWidth: number
}

export interface TableCommonColumnConf {
  name: string
  wrap: boolean
  fixed: boolean
  width: number
  hide: boolean
  planStart: boolean
  planEnd: boolean
  realStart: boolean
  realEnd: boolean
  styles: { [key: string]: string }
  render?: (record: { [key: string]: any }, layoutKind: LayoutKind) => any
}

export interface TableColumnConf extends TableCommonColumnConf {
  title: string
  icon: string
  dataKind: DataKind
  dataEditable: boolean
  useDict: boolean
  dictEditable: boolean
  multiValue: boolean
  kindDateTimeFormat?: string
  groupable: boolean
  sortable: boolean
}

export function convertCommonColumnPropsToCommonColumnConf(commonColumnProps: TableCommonColumnProps): TableCommonColumnConf {
  return {
    name: commonColumnProps.name,
    wrap: commonColumnProps.wrap ?? false,
    fixed: commonColumnProps.fixed ?? false,
    width: commonColumnProps.width ?? 200,
    hide: commonColumnProps.hide ?? false,
    planStart: commonColumnProps.planStart ?? false,
    planEnd: commonColumnProps.planEnd ?? false,
    realStart: commonColumnProps.realStart ?? false,
    realEnd: commonColumnProps.realEnd ?? false,
    styles: commonColumnProps.styles ?? {},
    render: commonColumnProps.render,
  }
}

export function convertCommonColumnConfToCommonColumnProps(commonColumnConf: TableCommonColumnConf): TableCommonColumnProps {
  return {
    name: commonColumnConf.name,
    wrap: commonColumnConf.wrap,
    fixed: commonColumnConf.fixed,
    width: commonColumnConf.width,
    hide: commonColumnConf.hide,
    planStart: commonColumnConf.planStart,
    planEnd: commonColumnConf.planEnd,
    realStart: commonColumnConf.realStart,
    realEnd: commonColumnConf.realEnd,
    styles: commonColumnConf.styles,
    render: commonColumnConf.render,
  }
}

export function convertTableColumnPropsToTableColumnConf(props: TableColumnProps): TableColumnConf {
  return {
    title: props.title,
    dataKind: props.dataKind ?? DataKind.TEXT,
    icon: props.icon ?? getDefaultIconByDataKind(props.dataKind ?? DataKind.TEXT),
    dataEditable: props.dataEditable ?? false,
    useDict: props.useDict ?? false,
    dictEditable: props.dictEditable ?? false,
    multiValue: props.multiValue ?? false,
    kindDateTimeFormat: props.kindDateTimeFormat,
    groupable: props.groupable ?? false,
    sortable: props.sortable ?? false,
    ...convertCommonColumnPropsToCommonColumnConf(props),
  }
}

export interface TableLayoutKernelConf {
  title: string
  layoutKind: LayoutKind
  icon: string
  columns: TableLayoutColumnConf[]
  filters?: TableDataFilterProps[]
  sorts?: TableDataSortProps[]
  group?: TableDataGroupProps
  aggs?: { [key: string]: AggregateKind }
  groupSlices?: { [key: string]: TableDataSliceProps }
  defaultSlice: TableDataSliceProps
  subDataShowKind: SubDataShowKind
  showSelectColumn: boolean
  actionColumnRender?: (record: { [key: string]: any }, layoutKind: LayoutKind) => any
  actionColumnWidth: number
  data?: TableDataResp | TableDataGroupResp[]
  selectedDataPks: any[]
}

export function convertTableLayoutKernelPropsToTableLayoutKernelConf(props: TableLayoutKernelProps, basicConf: TableBasicConf): TableLayoutKernelConf {
  return {
    title: props.title,
    layoutKind: props.layoutKind,
    icon: props.icon ?? getDefaultIconByLayoutKind(props.layoutKind),
    columns: props.columns.map((column) => {
      return convertTableLayoutColumnPropsToTableLayoutColumnConf(column, basicConf.columns.find(tableColumn => tableColumn.name === column.name)!)
    }),
    filters: props.filters,
    sorts: props.sorts,
    group: props.group,
    aggs: props.aggs,
    defaultSlice: props.defaultSlice ?? basicConf.defaultSlice,
    subDataShowKind: props.subDataShowKind ?? SubDataShowKind.FOLD_SUB_DATA,
    showSelectColumn: props.showSelectColumn ?? basicConf.defaultShowSelectColumn,
    actionColumnRender: props.actionColumnRender ?? basicConf.defaultActionColumnRender,
    actionColumnWidth: props.actionColumnWidth ?? basicConf.defaultActionColumnWidth,
    selectedDataPks: [],
  }
}

export interface TableLayoutConf extends TableLayoutKernelConf {
  id: string
}

export interface TableLayoutColumnConf extends TableCommonColumnConf {
}

export function convertTableLayoutColumnPropsToTableLayoutColumnConf(layoutColumnProps: TableLayoutColumnProps, tableColumnConf: TableColumnConf): TableLayoutColumnConf {
  return {
    name: layoutColumnProps.name,
    wrap: layoutColumnProps.wrap ?? tableColumnConf.wrap,
    fixed: layoutColumnProps.fixed ?? tableColumnConf.fixed,
    width: layoutColumnProps.width ?? tableColumnConf.width,
    hide: layoutColumnProps.hide ?? tableColumnConf.hide,
    planStart: layoutColumnProps.planStart ?? tableColumnConf.planStart,
    planEnd: layoutColumnProps.planEnd ?? tableColumnConf.planEnd,
    realStart: layoutColumnProps.realStart ?? tableColumnConf.realStart,
    realEnd: layoutColumnProps.realEnd ?? tableColumnConf.realEnd,
    styles: layoutColumnProps.styles ?? tableColumnConf.styles,
    render: layoutColumnProps.render ?? tableColumnConf.render,
  }
}

export function getDefaultLayoutColumnProps(tableColumnConf: TableColumnConf): TableLayoutColumnProps {
  return {
    ...convertCommonColumnConfToCommonColumnProps(tableColumnConf),
  }
}

export function convertLayoutColumnConfToLayoutColumnProps(layoutColumnConf: TableLayoutColumnConf): TableLayoutColumnProps {
  return {
    ...convertCommonColumnConfToCommonColumnProps(layoutColumnConf),
  }
}

export interface CachedColumnConf extends TableColumnConf, TableLayoutColumnConf {
}

export interface TableStyleConf {
  size: SizeKind
  theme: string
  tableClass: string
  headerClass: string
  footerClass: string
  rowClass: string
  cellClass: string
  aggClass: string
}

export function convertTableStylePropsToTableStyleConf(props?: TableStyleProps): TableStyleConf {
  return {
    tableClass: props?.tableClass ?? '',
    headerClass: props?.headerClass ?? '',
    footerClass: props?.footerClass ?? '',
    rowClass: props?.rowClass ?? '',
    cellClass: props?.cellClass ?? '',
    aggClass: props?.aggClass ?? '',
    size: props?.size ?? SizeKind.MEDIUM,
    theme: '',
  }
}

export function getDefaultValueByDataKind(dataKind: DataKind): any {
  switch (dataKind) {
    case DataKind.NUMBER:
    case DataKind.AMOUNT:
    case DataKind.SERIAL:
      return 0
    case DataKind.BOOLEAN:
      return false
    case DataKind.SELECT:
    case DataKind.MULTISELECT:
    case DataKind.CHECKBOX:
    case DataKind.DATE:
    case DataKind.DATETIME:
    case DataKind.TIME:
      return null
    default:
      return ''
  }
}

export function getDefaultIconByDataKind(dataKind: DataKind): string {
  switch (dataKind) {
    case DataKind.TEXT:
      return iconSvg.TEXT
    case DataKind.TEXTAREA:
      return iconSvg.TEXTAREA
    case DataKind.NUMBER:
    case DataKind.SERIAL:
      return iconSvg.NUMBER
    case DataKind.BOOLEAN:
      return iconSvg.BOOLEAN
    case DataKind.FILE:
      return iconSvg.FILE
    case DataKind.IMAGE:
      return iconSvg.IMAGE
    case DataKind.AMOUNT:
      return iconSvg.AMOUNT
    case DataKind.SELECT:
      return iconSvg.SELECT
    case DataKind.MULTISELECT:
      return iconSvg.MULTISELECT
    case DataKind.CHECKBOX:
      return iconSvg.CHECKBOX
    case DataKind.DATE:
      return iconSvg.DATE
    case DataKind.DATETIME:
      return iconSvg.DATETIME
    case DataKind.TIME:
      return iconSvg.TIME
    case DataKind.EMAIL:
      return iconSvg.EMAIL
    case DataKind.URL:
      return iconSvg.URL
    case DataKind.PHONE:
      return iconSvg.PHONE
    case DataKind.PASSWORD:
      return iconSvg.PASSWORD
    default:
      return iconSvg.TEXT
  }
}

export function getDefaultIconByLayoutKind(layoutKind: LayoutKind): string {
  switch (layoutKind) {
    case LayoutKind.CHART:
      return iconSvg.CHART
    case LayoutKind.CALENDAR:
      return iconSvg.CALENDAR
    case LayoutKind.KANBAN:
      return iconSvg.KANBAN
    case LayoutKind.GANTT:
      return iconSvg.GANTT
    default:
      return iconSvg.TEXT
  }
}

export function getOperatorKindsByColumn(columnConf: TableColumnConf): OperatorKind[] {
  return getOperatorKindsByDataKind(columnConf.dataKind, columnConf.multiValue)
}

export function getOperatorKindsByDataKind(dataKind?: DataKind, multiValue?: boolean): OperatorKind[] {
  if (multiValue) {
    return [OperatorKind.EQ, OperatorKind.NE, OperatorKind.IN, OperatorKind.NOT_IN, OperatorKind.IS_EMPTY, OperatorKind.NOT_EMPTY]
  }
  else {
    switch (dataKind) {
      case undefined:
        return []
      case DataKind.SERIAL:
      case DataKind.NUMBER:
      case DataKind.AMOUNT:
        return [OperatorKind.EQ, OperatorKind.NE, OperatorKind.LT, OperatorKind.LE, OperatorKind.GT, OperatorKind.GE, OperatorKind.IN, OperatorKind.NOT_IN, OperatorKind.IS_EMPTY, OperatorKind.NOT_EMPTY]
      case DataKind.BOOLEAN:
        return [OperatorKind.EQ, OperatorKind.NE, OperatorKind.IS_EMPTY, OperatorKind.NOT_EMPTY]
      case DataKind.FILE:
      case DataKind.IMAGE:
        return [OperatorKind.IS_EMPTY, OperatorKind.NOT_EMPTY]
      case DataKind.DATE:
      case DataKind.DATETIME:
      case DataKind.TIME:
        return [OperatorKind.EQ, OperatorKind.NE, OperatorKind.LT, OperatorKind.LE, OperatorKind.GT, OperatorKind.GE, OperatorKind.IN, OperatorKind.NOT_IN, OperatorKind.IS_EMPTY, OperatorKind.NOT_EMPTY]
      default:
        return [OperatorKind.EQ, OperatorKind.NE, OperatorKind.LT, OperatorKind.LE, OperatorKind.GT, OperatorKind.GE, OperatorKind.IN, OperatorKind.NOT_IN, OperatorKind.CONTAINS, OperatorKind.NOT_CONTAINS, OperatorKind.STARTWITH, OperatorKind.NOT_STARTWITH, OperatorKind.ENDWITH, OperatorKind.NOT_ENDWITH, OperatorKind.IS_EMPTY, OperatorKind.NOT_EMPTY]
    }
  }
}

export function dictEnableByDataKind(dataKind: DataKind): boolean {
  switch (dataKind) {
    case DataKind.BOOLEAN:
    case DataKind.FILE:
    case DataKind.IMAGE:
    case DataKind.DATE:
    case DataKind.DATETIME:
    case DataKind.TIME:
    case DataKind.PASSWORD:
      return false
    default:
      return true
  }
}

export function getInputTypeByDataKind(dataKind?: DataKind): string {
  switch (dataKind) {
    case DataKind.SERIAL:
    case DataKind.NUMBER:
    case DataKind.AMOUNT:
      return 'number'
    case DataKind.BOOLEAN:
      return 'checkbox'
    case DataKind.FILE:
      return 'file'
    case DataKind.IMAGE:
      return 'image'
    case DataKind.DATE:
      return 'date'
    case DataKind.DATETIME:
      return 'datetime-local'
    case DataKind.TIME:
      return 'time'
    case DataKind.EMAIL:
      return 'email'
    case DataKind.URL:
      return 'url'
    case DataKind.PASSWORD:
      return 'password'
    default:
      return 'text'
  }
}

export function initConf(props: TableProps): [TableBasicConf, TableLayoutConf[]] {
  const columns = props.columns.map((column) => {
    return convertTableColumnPropsToTableColumnConf(column)
  })
  const basicConf: TableBasicConf = {
    id: props.id ?? `iw-table${Math.floor(Math.random() * 1000000)}`,
    pkColumnName: props.pkColumnName,
    parentPkColumnName: props.parentPkColumnName,
    columns,
    styles: convertTableStylePropsToTableStyleConf(props.styles),
    defaultSlice: props.defaultSlice ?? {
      offsetNumber: 0,
      fetchNumber: 10,
      fetchNumbers: [5, 10, 20, 30, 50, 100],
    },
    quickSearchContent: props.quickSearch && '',
    defaultShowSelectColumn: props.defaultShowSelectColumn ?? false,
    defaultActionColumnRender: props.defaultActionColumnRender,
    defaultActionColumnWidth: props.defaultActionColumnWidth ?? 100,
  }
  const layoutsConf: TableLayoutConf[] = []
  props.layouts.forEach((layout) => {
    layoutsConf.push({
      id: layout.id,
      ...convertTableLayoutKernelPropsToTableLayoutKernelConf(layout, basicConf),
    })
  })
  layoutsConf.forEach((layout) => {
    // Make sure the primary key is in the first column
    const pkIdx = layout.columns.findIndex(column => column.name === basicConf.pkColumnName)
    if (pkIdx !== -1) {
      const pkColumn = layout.columns[pkIdx]!
      pkColumn.hide = false
      pkColumn.wrap = false
      layout.columns.splice(pkIdx, 1)
      layout.columns.splice(0, 0, pkColumn)
    }
  })
  return [basicConf, layoutsConf]
}
