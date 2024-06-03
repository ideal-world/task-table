import locales from './locales'

const { t } = locales.global

export const DATA_DICT_POSTFIX = '__dict'

export enum DataKind {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  SERIAL = 'SERIAL',
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
    case DataKind.SERIAL: return t('_.datakind.serial')
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
  NOT_IN = 'NOT IN',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NCONTAINS',
  STARTWITH = 'STARTWITH',
  NOT_STARTWITH = 'NSTARTWITH',
  ENDWITH = 'ENDWITH',
  NOT_ENDWITH = 'NENDWITH',
  IS_EMPTY = 'ISEMPTY',
  NOT_EMPTY = 'NOTEMPTY',
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
    case OperatorKind.NOT_IN: return t('_.operatorkind.nin')
    case OperatorKind.CONTAINS: return t('_.operatorkind.contains')
    case OperatorKind.NOT_CONTAINS: return t('_.operatorkind.ncontains')
    case OperatorKind.STARTWITH: return t('_.operatorkind.startwith')
    case OperatorKind.NOT_STARTWITH: return t('_.operatorkind.nstartwith')
    case OperatorKind.ENDWITH: return t('_.operatorkind.endwith')
    case OperatorKind.NOT_ENDWITH: return t('_.operatorkind.nendwith')
    case OperatorKind.IS_EMPTY: return t('_.operatorkind.isempty')
    case OperatorKind.NOT_EMPTY: return t('_.operatorkind.notempty')
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

export function translateAggregateKind(aggKind: AggregateKind): string {
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
  KANBAN = 'KANBAN',
  CHART = 'CHART',
}

export interface TableProps {
  id?: string
  pkColumnName: string
  parentPkColumnName?: string
  columns: TableColumnProps[]
  layouts?: TableLayoutProps[]
  events: TableEventProps
  styles?: TableStyleProps
}

export interface TableColumnProps {
  name: string
  title: string
  icon?: string
  dataKind?: DataKind
  dataEditable?: boolean
  useDict?: boolean
  dictEditable?: boolean
  multiValue?: boolean
  kindDateTimeFormat?: string
  groupable?: boolean
  render?: (record: { [key: string]: any }, columnName: string) => any
}

export interface TableLayoutKernelProps {
  title: string
  layoutKind: LayoutKind
  icon?: string
  columns: TableLayoutColumnProps[]
  // OR relationship between groups
  filters?: TableDataFilterProps[]
  sorts?: TableDataSortProps[]
  group?: TableDataGroupProps
  aggs?: { [key: string]: AggregateKind }
  slice?: TableDataSliceProps
  showSelectColumn?: boolean
  // TODO 调用事件
  actionColumnRender?: (record: { [key: string]: any }) => any
}

export interface TableLayoutProps extends TableLayoutKernelProps {
  id: string
}

export interface TableLayoutColumnProps {
  name: string
  wrap?: boolean
  fixed?: boolean
  width?: number
  hide?: boolean
  dateStart?: boolean
  dateEnd?: boolean
  // Overwrite the value of TableColumnProps
  render?: (record: { [key: string]: any }, columnName: string) => any
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
  loadData: (
    columns?: string[],
    filters?: TableDataFilterProps[],
    sorts?: TableDataSortProps[],
    group?: TableDataGroupProps,
    aggs?: { [key: string]: AggregateKind },
    // Load only the data of the corresponding group
    byGroupValue?: any,
    // Do not use this slice if it exists in group.slices
    defaultGroupSlice?: TableDataSliceProps) => Promise<TableDataResp | TableDataGroupResp[]>
  newData?: (newRecords: { [key: string]: any }[]) => Promise<{ [key: string]: any }[]>
  copyData?: (targetRecordPks: any[]) => Promise<{ [key: string]: any }[]>
  modifyData?: (changedRecords: { [key: string]: any }[]) => Promise<{ [key: string]: any }[]>
  // Need to delete child node
  deleteData?: (deletedRecordPks: any[]) => Promise<boolean>
  selectData?: (selectedRecordPks: any[]) => Promise<boolean>
  clickCell?: (recordPk: any, columnName: string) => Promise<boolean>

  loadCellDictItems?: (columnName: string, filterValue?: any, slice?: TableDataSliceProps) => Promise<TableCellDictItemsResp>

  modifyStyles?: (changedStyleProps: TableStyleProps) => Promise<boolean>

  newLayout?: (newLayoutProps: TableLayoutKernelProps) => Promise<string>
  modifyLayout?: (changedLayoutId: string, changedLayoutProps: TableLayoutModifyProps) => Promise<boolean>
  deleteLayout?: (deletedLayoutId: string) => Promise<boolean>
}

export interface TableLayoutModifyProps {
  title?: string
  icon?: string
  filters?: TableDataFilterProps[]
  sorts?: TableDataSortProps[]
  group?: TableDataGroupProps
  aggs?: { [key: string]: AggregateKind }
  slice?: TableDataSliceProps
  columnSortedNames?: [string, string]
  newColumn?: TableLayoutColumnProps
  changedColumn?: TableLayoutColumnProps
  deletedColumnName?: string
}

export interface TableDataSortProps {
  columnName: string
  orderDesc: boolean
}

export interface TableDataFilterProps {
  // AND relationship between items
  items: TableDataFilterItemProps[]
}

export interface TableDataFilterItemProps {
  columnName: string
  operator: OperatorKind
  value?: any
}

export interface TableDataGroupProps {
  columnNames: string[]
  groupOrderDesc: boolean
  // useDict: boolean
  hideEmptyRecord: boolean
  // key=group value
  slices: { [key: string]: TableDataSliceProps }
}

export interface TableDataSliceProps {
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
}

export interface TableCellDictItemProps {
  title: string
  value: any
  color?: string
  avatar?: string
}

export interface TableCellDictItemsResp {
  records: TableCellDictItemProps[]
  totalNumber: number
}
