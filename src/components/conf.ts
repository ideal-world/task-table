import * as iconSvg from '../assets/icon'
import locales from '../locales'
import type { AggregateKind, TableColumnProps, TableDataFilterProps, TableDataGroupProps, TableDataGroupResp, TableDataResp, TableDataSliceProps, TableDataSortProps, TableLayoutColumnProps, TableLayoutKernelProps, TableProps, TableStyleProps } from '../props'
import { DataKind, LayoutKind, OperatorKind, SizeKind } from '../props'

const { t } = locales.global

export interface TableBasicConf {
  id: string
  pkColumnName: string
  parentPkColumnName?: string
  columns: TableColumnConf[]
  styles: TableStyleConf
}

export interface TableColumnConf {
  name: string
  title: string
  icon: string
  dataKind: DataKind
  dataEditable: boolean
  useDict: boolean
  dictEditable: boolean
  multiValue: boolean
  kindDateTimeFormat?: string
  groupable: boolean
  render?: (record: { [key: string]: any }, columnName: string) => any
}

export function convertTableColumnPropsToTableColumnConf(props: TableColumnProps): TableColumnConf {
  return {
    name: props.name,
    title: props.title,
    dataKind: props.dataKind ?? DataKind.TEXT,
    icon: props.icon ?? getDefaultIconByDataKind(props.dataKind ?? DataKind.TEXT),
    dataEditable: props.dataEditable ?? true,
    useDict: props.useDict ?? false,
    dictEditable: props.dictEditable ?? false,
    multiValue: props.multiValue ?? false,
    kindDateTimeFormat: props.kindDateTimeFormat,
    groupable: props.groupable ?? false,
    render: props.render,
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
  slice: TableDataSliceProps
  showSelectColumn: boolean
  // TODO 调用事件
  actionColumnRender?: (record: { [key: string]: any }) => any

  expandDataPks: any[]

  data?: TableDataResp | TableDataGroupResp[]
}

export function convertTableLayoutKernelPropsToTableLayoutKernelConf(props: TableLayoutKernelProps, tableColumns: TableColumnConf[]): TableLayoutKernelConf {
  return {
    title: props.title,
    layoutKind: props.layoutKind,
    icon: props.icon ?? getDefaultIconByLayoutKind(props.layoutKind),
    columns: props.columns.map((column) => {
      return convertTableLayoutColumnPropsToTableLayoutColumnConf(column, tableColumns.find(tableColumn => tableColumn.name === column.name)!)
    }),
    filters: props.filters,
    sorts: props.sorts,
    group: props.group,
    aggs: props.aggs,
    slice: props.slice ?? {
      offsetNumber: 0,
      fetchNumber: 50,
    },
    showSelectColumn: props.showSelectColumn ?? true,
    actionColumnRender: props.actionColumnRender,
    expandDataPks: [],
  }
}

export interface TableLayoutConf extends TableLayoutKernelConf {
  id: string
}

export interface TableLayoutColumnConf {
  name: string
  wrap: boolean
  fixed: boolean
  width: number
  hide: boolean
  dateStart: boolean
  dateEnd: boolean
  render?: (record: { [key: string]: any }, columnName: string) => any
}

export function convertTableLayoutColumnPropsToTableLayoutColumnConf(props: TableLayoutColumnProps, tableColumn: TableColumnConf): TableLayoutColumnConf {
  return {
    name: props.name,
    wrap: props.wrap ?? true,
    fixed: props.fixed ?? false,
    width: props.width ?? 200,
    hide: props.hide ?? false,
    dateStart: props.dateStart ?? false,
    dateEnd: props.dateEnd ?? false,
    render: props.render
      ? props.render
      : tableColumn.render,
  }
}

export function getDefaultLayoutColumnConf(columnName: string): TableLayoutColumnConf {
  return {
    name: columnName,
    wrap: true,
    fixed: false,
    width: 200,
    hide: false,
    dateStart: false,
    dateEnd: false,
  }
}

export interface CachedColumnConf extends TableColumnConf, TableLayoutColumnConf {
}

export interface TableStyleConf {
  size: SizeKind
  theme: string
  tableClass: string
  headerClass: string
  rowClass: string
  cellClass: string
  aggClass: string
}

export function convertTableStylePropsToTableStyleConf(props?: TableStyleProps): TableStyleConf {
  return {
    tableClass: props?.tableClass ?? '',
    headerClass: props?.headerClass ?? '',
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
  const basicConf = {
    id: props.id ?? `iw-table${Math.floor(Math.random() * 1000000)}`,
    pkColumnName: props.pkColumnName,
    parentPkColumnName: props.parentPkColumnName,
    columns,
    styles: convertTableStylePropsToTableStyleConf(props.styles),
  }
  const layoutsConf: TableLayoutConf[] = []
  if (props.layouts) {
    props.layouts.forEach((layout) => {
      layoutsConf.push({
        id: layout.id,
        ...convertTableLayoutKernelPropsToTableLayoutKernelConf(layout, columns),
      })
    })
  }
  else {
    layoutsConf.push({
      id: 'default',
      title: t('layout.title.default'),
      layoutKind: LayoutKind.LIST,
      icon: iconSvg.TEXT,
      columns: props.columns.map((column) => {
        return getDefaultLayoutColumnConf(column.name)
      }),
      slice: {
        offsetNumber: 0,
        fetchNumber: 50,
      },
      showSelectColumn: true,
      expandDataPks: [],
    })
  }
  layoutsConf.forEach((layout) => {
    // Make sure the primary key is in the first column
    const pkIdx = layout.columns.findIndex(column => column.name === basicConf.pkColumnName)
    if (pkIdx !== -1) {
      const pkColumn = layout.columns[pkIdx]!
      pkColumn.dateEnd = false
      pkColumn.dateStart = false
      pkColumn.hide = false
      pkColumn.wrap = false
      layout.columns.splice(pkIdx, 1)
      layout.columns.splice(0, 0, pkColumn)
    }
    else {
      layout.columns.splice(0, 0, {
        name: basicConf.columns.find(column => column.name === basicConf.pkColumnName)!.name,
        wrap: false,
        fixed: false,
        width: 200,
        hide: false,
        dateStart: false,
        dateEnd: false,
      })
    }
  })
  return [basicConf, layoutsConf]
}
