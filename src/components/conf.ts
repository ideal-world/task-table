import * as iconSvg from '../assets/icon'
import locales from '../locales'
import type { AggregateKind, TableDataFilterProps, TableDataGroupProps, TableDataGroupResp, TableDataResp, TableDataSliceProps, TableDataSortProps, TableProps } from './props'
import { DataKind, LayoutKind, OperatorKind, SizeKind } from './props'

const { t } = locales.global

export interface TableBasicConf {
  id: string
  pkColumnName: string
  parentPkColumnName?: string
  freeSortColumnName?: string
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
  groupable: boolean
  kindDateTimeFormat?: string
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
  expandDataPks: any[]
  slice: TableDataSliceProps
  data?: TableDataResp | TableDataGroupResp[]
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
  name: string
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
    case LayoutKind.BOARD:
      return iconSvg.BOARD
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
  const basicConf = {
    id: props.id ?? `iw-table${Math.floor(Math.random() * 1000000)}`,
    pkColumnName: props.pkColumnName,
    parentPkColumnName: props.parentPkColumnName,
    freeSortColumnName: props.freeSortColumnName,
    columns: props.columns.map((column) => {
      return {
        name: column.name,
        title: column.title ?? column.name,
        dataKind: column.dataKind ?? DataKind.TEXT,
        icon: column.icon ?? getDefaultIconByDataKind(column.dataKind ?? DataKind.TEXT),
        dataEditable: column.dataEditable ?? true,
        useDict: column.useDict ?? false,
        dictEditable: column.dictEditable ?? false,
        multiValue: column.multiValue ?? false,
        groupable: column.groupable ?? false,
        kindDateTimeFormat: column.kindDateTimeFormat,
      }
    }),
    styles: {
      tableClass: props.styles?.tableClass ?? '',
      headerClass: props.styles?.headerClass ?? '',
      rowClass: props.styles?.rowClass ?? '',
      cellClass: props.styles?.cellClass ?? '',
      aggClass: props.styles?.aggClass ?? '',
      size: props.styles?.size ?? SizeKind.MEDIUM,
      theme: '',
    },
  }
  const layoutsConf: TableLayoutConf[] = []
  if (props.layouts) {
    props.layouts.forEach((layout) => {
      layoutsConf.push({
        id: layout.id,
        title: layout.title,
        layoutKind: layout.layoutKind,
        icon: layout.icon ?? getDefaultIconByLayoutKind(layout.layoutKind),
        columns: layout.columns.map((column) => {
          return {
            name: column.name,
            wrap: column.wrap ?? true,
            fixed: column.fixed ?? false,
            width: column.width ?? 200,
            hide: column.hide ?? false,
            dateStart: column.dateStart ?? false,
            dateEnd: column.dateEnd ?? false,
          }
        }),
        filters: layout.filters,
        sorts: layout.sorts,
        group: layout.group,
        aggs: layout.aggs,
        slice: layout.slice ?? {
          offsetNumber: 0,
          fetchNumber: 50,
        },
        expandDataPks: layout.expandDataPks ?? [],
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
