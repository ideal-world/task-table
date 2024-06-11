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
  MINI = '-xs',
  SMALL = '-sm',
  MEDIUM = '',
  LARGE = '-lg',
}

export enum LayoutKind {
  LIST = 'LIST',
  GANTT = 'GANTT',
  CALENDAR = 'CALENDAR',
  KANBAN = 'KANBAN',
  CHART = 'CHART',
}

export enum SubDataShowKind {
  TILE_ALL_DATA = 'TILE_ALL_DATA',
  ONLY_PARENT_DATA = 'ONLY_PARENT_DATA',
  FOLD_SUB_DATA = 'FOLD_SUB_DATA',
}

export function translateSubDataShowKind(subDataShowKind: SubDataShowKind): string {
  switch (subDataShowKind) {
    case SubDataShowKind.TILE_ALL_DATA:
      return t('layout.subData.tileAllData')
    case SubDataShowKind.ONLY_PARENT_DATA: return t('layout.subData.onlyParentData')
    case SubDataShowKind.FOLD_SUB_DATA: return t('layout.subData.foldSubData')
  }
}

export interface AggItem {
  kind: AggregateKind
  title: string
}

export function showAggMappingByDataKind(dataKind: DataKind): AggItem[] {
  const items = [
    { kind: AggregateKind.COUNT, title: translateAggregateKind(AggregateKind.COUNT) },
    { kind: AggregateKind.DISTINCT, title: translateAggregateKind(AggregateKind.DISTINCT) },
  ]
  switch (dataKind) {
    case DataKind.SERIAL:
    case DataKind.NUMBER:
    case DataKind.AMOUNT:
      items.push(...[
        { kind: AggregateKind.SUM, title: translateAggregateKind(AggregateKind.SUM) },
        { kind: AggregateKind.AVG, title: translateAggregateKind(AggregateKind.AVG) },
        { kind: AggregateKind.MEDIAN, title: translateAggregateKind(AggregateKind.MEDIAN) },
        { kind: AggregateKind.STDDEV, title: translateAggregateKind(AggregateKind.STDDEV) },
        { kind: AggregateKind.MAX, title: translateAggregateKind(AggregateKind.MAX) },
        { kind: AggregateKind.MIN, title: translateAggregateKind(AggregateKind.MIN) },
        { kind: AggregateKind.DISTINCT, title: translateAggregateKind(AggregateKind.DISTINCT) },
      ])
      break
    case DataKind.TEXT:
    case DataKind.TEXTAREA:
      items.push(...[
        { kind: AggregateKind.MAX, title: translateAggregateKind(AggregateKind.MAX) },
        { kind: AggregateKind.MIN, title: translateAggregateKind(AggregateKind.MIN) },
        { kind: AggregateKind.DISTINCT, title: translateAggregateKind(AggregateKind.DISTINCT) },
      ])
      break
    case DataKind.DATE:
    case DataKind.DATETIME:
    case DataKind.TIME:
      items.push(...[
        { kind: AggregateKind.MAX, title: translateAggregateKind(AggregateKind.MAX) },
        { kind: AggregateKind.MIN, title: translateAggregateKind(AggregateKind.MIN) },
        { kind: AggregateKind.DISTINCT, title: translateAggregateKind(AggregateKind.DISTINCT) },
      ])
      break
    default:
      break
  }
  return items
}

export interface TableProps {
  id?: string
  pkColumnName: string
  parentPkColumnName?: string
  columns: TableColumnProps[]
  layouts: TableLayoutProps[]
  events: TableEventProps
  styles?: TableStyleProps
  defaultSlice?: TableDataSliceProps
  defaultShowSelectColumn?: boolean
  defaultActionColumnRender?: (record: { [key: string]: any }) => any
  defaultActionColumnWidth?: number
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
  sortable?: boolean
  // 默认是否显示在新布局中
  // Default whether to display in the new layout
  defaultShow?: boolean
  render?: (record: { [key: string]: any }, columnName: string) => any
}

export interface TableLayoutKernelProps {
  title: string
  layoutKind: LayoutKind
  icon?: string
  columns: TableLayoutColumnProps[]
  quickSearch?: TableDataQuickSearchProps
  // OR relationship between groups
  filters?: TableDataFilterProps[]
  sorts?: TableDataSortProps[]
  group?: TableDataGroupProps
  // Column name -> AggregateKind
  aggs?: { [key: string]: AggregateKind }
  defaultSlice?: TableDataSliceProps
  groupSlices?: { [key: string]: TableDataSliceProps }
  subDataShowKind?: SubDataShowKind
  showSelectColumn?: boolean
  actionColumnRender?: (record: { [key: string]: any }) => any
  actionColumnWidth?: number
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
  styles?: { [key: string]: string }
  // Overwrite the value of TableColumnProps
  render?: (record: { [key: string]: any }, columnName: string) => any
}

export interface TableStyleProps {
  size?: SizeKind
  theme?: string
  tableClass?: string
  headerClass?: string
  footerClass?: string
  rowClass?: string
  cellClass?: string
  aggClass?: string
}

export interface TableDataQuickSearchProps {
  placeholder: string
}

export interface TableEventProps {
  loadData: (
    columns?: string[],
    quickSearchContent?: string,
    filters?: TableDataFilterProps[],
    sorts?: TableDataSortProps[],
    group?: TableDataGroupProps,
    aggs?: { [key: string]: AggregateKind },
    hideSubData?: boolean,
    // Load only the data of the corresponding group
    byGroupValue?: any,
    slices?: TableDataQuerySliceProps,
    returnOnlyAggs?: boolean) => Promise<TableDataResp | TableDataGroupResp[]>
  newData?: (newRecords: { [key: string]: any }[]) => Promise<{ [key: string]: any }[]>
  copyData?: (targetRecordPks: any[]) => Promise<{ [key: string]: any }[]>
  modifyData?: (changedRecords: { [key: string]: any }[]) => Promise<{ [key: string]: any }[]>
  // Need to delete child node
  deleteData?: (deletedRecordPks: any[]) => Promise<boolean>
  selectData?: (selectedRecordPks: any[]) => Promise<boolean>
  clickCell?: (clickedRecordPk: any, clickedColumnName: string, byLayoutId: string, byLayoutKind: LayoutKind) => Promise<boolean>

  loadCellDictItems?: (columnName: string, filterValue?: any, slice?: TableDataQuerySliceProps) => Promise<TableCellDictItemsResp>
  loadCellDictItemsWithMultiConds?: (conds: { [columnName: string]: any[] }, slice?: TableDataQuerySliceProps) => Promise<{ [columnName: string]: TableCellDictItemsResp }>

  modifyStyles?: (changedStyleProps: TableStyleProps) => Promise<boolean>

  newLayout?: (newLayoutProps: TableLayoutKernelProps) => Promise<string>
  modifyLayout?: (changedLayoutId: string, changedLayoutProps: TableLayoutModifyProps) => Promise<boolean>
  deleteLayout?: (deletedLayoutId: string) => Promise<boolean>
}

export interface TableLayoutModifyProps {
  title?: string
  icon?: string
  quickSearchContent?: string
  filters?: TableDataFilterProps[]
  sorts?: TableDataSortProps[]
  group?: TableDataGroupProps
  removeGroup?: boolean
  aggs?: { [key: string]: AggregateKind }
  defaultSlice?: TableDataSliceProps
  groupSlices?: { [key: string]: TableDataSliceProps }
  subDataShowKind?: SubDataShowKind
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
  columnName: string
  groupOrderDesc: boolean
  // useDict: boolean
  hideEmptyRecord: boolean
}

export interface TableDataQuerySliceProps {
  offsetNumber: number
  fetchNumber: number
}

export interface TableDataSliceProps extends TableDataQuerySliceProps {
  fetchNumbers: number[]
}

export interface TableDataResp {
  records: { [key: string]: any }[]
  aggs: { [key: string]: any }
  totalNumber: number
}

export interface TableDataGroupResp extends TableDataResp {
  groupValue: string
  groupShowTitle?: string
}

export interface TableAggsDataResp {
  aggs: { [key: string]: any }
}

export interface TableAggsDataGroupResp extends TableAggsDataResp {
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
