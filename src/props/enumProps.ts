import * as iconSvg from '../assets/icon'
import locales from '../locales'

const { t } = locales.global

export const DATA_DICT_POSTFIX = '__dict'

// --------------------------------------------------------- SizeKind ---------------------------------------------------------

export enum SizeKind {
  MINI = '-xs',
  SMALL = '-sm',
  MEDIUM = '',
  LARGE = '-lg',
}

// --------------------------------------------------------- LayoutKind ---------------------------------------------------------

export enum LayoutKind {
  LIST = 'LIST',
  GANTT = 'GANTT',
  CALENDAR = 'CALENDAR',
  KANBAN = 'KANBAN',
  CHART = 'CHART',
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

// --------------------------------------------------------- SubDataShowKind ---------------------------------------------------------

export enum SubDataShowKind {
  TILE_ALL_DATA = 'TILE_ALL_DATA',
  ONLY_PARENT_DATA = 'ONLY_PARENT_DATA',
  FOLD_SUB_DATA = 'FOLD_SUB_DATA',
}

export function translateSubDataShowKind(subDataShowKind: SubDataShowKind): string {
  switch (subDataShowKind) {
    case SubDataShowKind.TILE_ALL_DATA:
      return t('function.subData.tileAllData')
    case SubDataShowKind.ONLY_PARENT_DATA: return t('function.subData.onlyParentData')
    case SubDataShowKind.FOLD_SUB_DATA: return t('function.subData.foldSubData')
  }
}

// --------------------------------------------------------- GanttShowKind ---------------------------------------------------------

export enum GanttShowKind {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export function translateGanttShowKind(ganttShowKind: GanttShowKind): string {
  switch (ganttShowKind) {
    case GanttShowKind.DAY:
      return t('gantt.kind.DAY')
    case GanttShowKind.WEEK:
      return t('gantt.kind.WEEK')
    case GanttShowKind.MONTH:
      return t('gantt.kind.MONTH')
    case GanttShowKind.YEAR:
      return t('gantt.kind.YEAR')
  }
}

// --------------------------------------------------------- DataKind ---------------------------------------------------------

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

// --------------------------------------------------------- OperatorKind ---------------------------------------------------------

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

// --------------------------------------------------------- AggKind ---------------------------------------------------------

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
