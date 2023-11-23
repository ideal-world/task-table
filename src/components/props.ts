import locales from '../locales'

const { t } = locales.global

export enum DataKind {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  FILE = 'FILE',
  IMAGE = 'IMAGE',
  AMOUNT = 'AMOUNT',
  SELECT = 'SELECT',
  MULTISELECT = 'MULTISELECT',
  CHECKBOX = 'CHECKBOX',
  DATE = 'DATE',
  DATETIME = 'DATETIME',
  TIME = 'TIME',
  EMAIL = 'EMAIL',
  URL = 'URL',
  PHONE = 'PHONE',
  PASSWORD = 'PASSWORD',
}

export function translateDataKind(dataKind: DataKind): string {
  switch (dataKind) {
    case DataKind.TEXT: return t('_.datakind.text')
    case DataKind.TEXTAREA: return t('_.datakind.textarea')
    case DataKind.NUMBER: return t('_.datakind.number')
    case DataKind.BOOLEAN: return t('_.datakind.boolean')
    case DataKind.FILE: return t('_.datakind.file')
    case DataKind.IMAGE: return t('_.datakind.image')
    case DataKind.AMOUNT: return t('_.datakind.amount')
    case DataKind.SELECT: return t('_.datakind.select')
    case DataKind.MULTISELECT: return t('_.datakind.multiselect')
    case DataKind.CHECKBOX: return t('_.datakind.checkbox')
    case DataKind.DATE: return t('_.datakind.date')
    case DataKind.DATETIME: return t('_.datakind.datetime')
    case DataKind.TIME: return t('_.datakind.time')
    case DataKind.EMAIL: return t('_.datakind.email')
    case DataKind.URL: return t('_.datakind.url')
    case DataKind.PHONE: return t('_.datakind.phone')
    case DataKind.PASSWORD: return t('_.datakind.password')
  }
}

export enum OperatorKind {
  EQ = '=',
  NE = '!=',
  LT = '<',
  LE = '<=',
  GT = '>',
  GE = '>=',
  IN = 'IN',
  NIN = 'NOT IN',
  CONTAINS = 'CONTAINS',
  NCONTAINS = 'NCONTAINS',
  STARTWITH = 'STARTWITH',
  NSTARTWITH = 'NSTARTWITH',
  ENDWITH = 'ENDWITH',
  NENDWITH = 'NENDWITH',
  ISEMPTY = 'ISEMPTY',
  NOTEMPTY = 'NOTEMPTY',
  // TODO Add between
}

export function translateOperatorKind(operatorKind?: OperatorKind): string {
  switch (operatorKind) {
    case undefined: return ''
    case OperatorKind.EQ: return t('_.operatorkind.eq')
    case OperatorKind.NE: return t('_.operatorkind.ne')
    case OperatorKind.LT: return t('_.operatorkind.lt')
    case OperatorKind.LE: return t('_.operatorkind.le')
    case OperatorKind.GT: return t('_.operatorkind.gt')
    case OperatorKind.GE: return t('_.operatorkind.ge')
    case OperatorKind.IN: return t('_.operatorkind.in')
    case OperatorKind.NIN: return t('_.operatorkind.nin')
    case OperatorKind.CONTAINS: return t('_.operatorkind.contains')
    case OperatorKind.NCONTAINS: return t('_.operatorkind.ncontains')
    case OperatorKind.STARTWITH: return t('_.operatorkind.startwith')
    case OperatorKind.NSTARTWITH: return t('_.operatorkind.nstartwith')
    case OperatorKind.ENDWITH: return t('_.operatorkind.endwith')
    case OperatorKind.NENDWITH: return t('_.operatorkind.nendwith')
    case OperatorKind.ISEMPTY: return t('_.operatorkind.isempty')
    case OperatorKind.NOTEMPTY: return t('_.operatorkind.notempty')
  }
}

export enum AggregateKind {
  SUM = 'SUM',
  COUNT = 'COUNT',
  MIN = 'MIN',
  MAX = 'MAX',
  AVG = 'AVG',
  MEDIAN = 'MEDIAN',
  STDDEV = 'STDDEV',
  DISTINCT = 'DISTINCT',
  // TODO
}

export function translateGroupAgg(aggKind: AggregateKind): string {
  switch (aggKind) {
    case AggregateKind.SUM:
      return t('_.agg.sum')
    case AggregateKind.COUNT: return t('_.agg.count')
    case AggregateKind.MIN: return t('_.agg.min')
    case AggregateKind.MAX: return t('_.agg.max')
    case AggregateKind.AVG: return t('_.agg.avg')
    case AggregateKind.MEDIAN: return t('_.agg.median')
    case AggregateKind.STDDEV: return t('_.agg.stddev')
    case AggregateKind.DISTINCT: return t('_.agg.distinct')
  }
}

export enum SizeKind {
  MINI = 'mini',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export enum LayoutKind {
  LIST = 'LIST',
  GANTT = 'GANTT',
  CALENDAR = 'CALENDAR',
  BOARD = 'BOARD',
  CHART = 'CHART',
}

export interface TableProps {
  tableId?: string
  pkColumnName: string
  columns: TableColumnProps[]
  layouts?: TableLayoutProps[]
  events: TableEventProps
  styles?: TableStyleProps
}

export interface TableColumnProps {
  name: string
  icon?: string
  title?: string
  dataKind?: DataKind
  dataEditable?: boolean
  useDict?: boolean
  dictEditable?: boolean
}

export interface TableLayoutProps {
  id: string
  title: string
  layoutKind: LayoutKind
  icon?: string
  columns: TableLayoutColumnProps[]
  // And relationship between groups
  filters?: TableDataFilterReq[]
  sorts?: TableDataSortReq[]
  group?: TableDataGroupReq
  aggs?: { [key: string]: AggregateKind }
}

export interface TableLayoutColumnProps {
  name: string
  wrap?: boolean
  fixed?: boolean
  width?: number
  hide?: boolean
  dateStart?: boolean
  dateEnd?: boolean
}

export interface TableStyleProps {
  size?: SizeKind
  theme?: string
  tableClass?: string
  headerClass?: string
  rowClass?: string
  cellClass?: string
  aggClass?: string
}

export interface TableEventProps {
  loadData: (filters?: TableDataFilterReq[],
    sorts?: TableDataSortReq[],
    group?: TableDataGroupReq,
    aggs?: { [key: string]: AggregateKind },
    slice?: TableDataSliceReq) => Promise<TableDataResp | TableDataGroupResp[]>
  saveData?: (changedRecords: { [key: string]: any }[]) => Promise<boolean>
  deleteData?: (deletedPks: any[]) => Promise<boolean>

  newColumn?: (newColumnProps: TableColumnProps, fromColumnName?: string) => Promise<boolean>
  modifyColumn?: (changedColumnProps: TableColumnProps) => Promise<boolean>
  deleteColumn?: (deletedColumnName: string) => Promise<boolean>

  // TODO pagination
  loadCellDictValues?: (columnName: string, filterValue?: any) => Promise<{ title: string, value: any }[]>

  modifyStyles?: (changedStyleProps: TableStyleProps) => Promise<boolean>

  newLayout?: (newLayoutProps: TableLayoutProps, fromLayoutId?: string) => Promise<boolean>
  modifyLayout?: (changedLayoutProps: TableLayoutModifyReq) => Promise<boolean>
  deleteLayout?: (deletedLayoutId: string) => Promise<boolean>
  sortLayouts?: (leftLayoutId: string, rightLayoutId: string) => Promise<boolean>
}

export interface TableLayoutModifyReq {
  id?: string
  title?: string
  icon?: string
  filters?: TableDataFilterReq[]
  sorts?: TableDataSortReq[]
  group?: TableDataGroupReq
  aggs?: { [key: string]: AggregateKind }
  columnSortedNames?: [string, string]
  newColumn?: TableLayoutColumnProps
  changedColumn?: TableLayoutColumnProps
  deletedColumnName?: string
}

export interface TableDataSortReq {
  columnName: string
  orderDesc: boolean
}

export interface TableDataFilterReq {
  items: TableDataFilterItemReq[]
  and: boolean
}

export interface TableDataFilterItemReq {
  columnName: string
  operator: OperatorKind
  value?: any
}

export interface TableDataGroupReq {
  columnName: string
  groupOrderDesc: boolean
  useDictValue: boolean
  hideEmptyRecord: boolean
}

export interface TableDataSliceReq {
  offsetNumber: number
  fetchNumber: number
}

export interface TableDataResp {
  records: { [key: string]: any }[]
  aggs: { [key: string]: any }
  totalNumber: number
}

export interface TableDataGroupResp extends TableDataResp {
  groupValue: string
  offsetNumber: number
  fetchNumber: number
}
