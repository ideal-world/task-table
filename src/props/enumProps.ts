/**
 * @fileoverview 枚举属性 / Enum props
 */

import * as iconSvg from '../assets/icon'
import locales from '../locales'

const { t } = locales.global

/**
 * 数据字典的列名后缀
 *
 * Column name suffix of data dictionary
 *
 * 当某列为字典时 {@link TableColumnProps#useDict} 要求所回的数据加上带此后缀的列，存放字典项数据 {@link DictItemProps}。
 *
 * When a column is a dictionary, {@link TableColumnProps#useDict} requires that the returned data be added to the column with this suffix, storing dictionary item data {@link DictItemProps}.
 *
 * @example
 * const rowData = {
 *   creator: 'xh',                               // Original field
 *   crattor__dict: {                             // Additional field
 *     title: '星航',
 *     value: 'xh',
 *     avatar: 'https://xxxx/xxx.png'
 *   },
 *   ...
 * }
 */
export const DATA_DICT_POSTFIX = '__dict'

// --------------------------------------------------------- SizeKind ---------------------------------------------------------

/**
 * 尺寸类型
 *
 * Size kind
 */
export enum SizeKind {
  /**
   * 超小
   *
   * Extra small
   */
  MINI = '-xs',
  /**
   * 小
   *
   * Small
   */
  SMALL = '-sm',
  /**
   * 中
   *
   * Medium
   */
  MEDIUM = '',
  /**
   * 大
   *
   * Large
   */
  LARGE = '-lg',
}

// --------------------------------------------------------- LayoutKind ---------------------------------------------------------

/**
 * 布局类型
 *
 * Layout kind
 */
export enum LayoutKind {
  /**
   * 列表
   *
   * List
   */
  LIST = 'LIST',
  /**
   * 表格
   *
   * Table
   */
  GANTT = 'GANTT',
  /**
   * 日历
   *
   * Calendar
   */
  CALENDAR = 'CALENDAR',
  /**
   * 看板
   *
   * Kanban
   */
  KANBAN = 'KANBAN',
  /**
   * 图表
   *
   * Chart
   */
  CHART = 'CHART',
}

/**
 * 根据布局类型获取默认的布局图标
 *
 * Get the default layout icon based on the layout kind
 *
 * @param layoutKind 布局类型 / Layout kind
 */
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

/**
 * 子数据显示类型
 *
 * Sub data show kind
 */
export enum SubDataShowKind {
  /**
   * 平铺所有数据
   *
   * Tile all data
   */
  TILE_ALL_DATA = 'TILE_ALL_DATA',
  /**
   * 仅显示父数据
   *
   * Only parent data
   */
  ONLY_PARENT_DATA = 'ONLY_PARENT_DATA',
  /**
   * 折叠子数据
   *
   * Fold sub data
   */
  FOLD_SUB_DATA = 'FOLD_SUB_DATA',
}

/**
 * 本地化显示对应的子数据显示类型
 *
 * Localize the corresponding sub data show kind
 *
 * @param subDataShowKind 子数据显示类型 / Sub data show kind
 * @returns 显示名称 / Display name
 */
export function translateSubDataShowKind(subDataShowKind: SubDataShowKind): string {
  switch (subDataShowKind) {
    case SubDataShowKind.TILE_ALL_DATA:
      return t('function.subData.tileAllData')
    case SubDataShowKind.ONLY_PARENT_DATA: return t('function.subData.onlyParentData')
    case SubDataShowKind.FOLD_SUB_DATA: return t('function.subData.foldSubData')
  }
}

// --------------------------------------------------------- GanttShowKind ---------------------------------------------------------

/**
 * 甘特图显示类型
 *
 * Gantt chart show kind
 */
export enum GanttShowKind {
  /**
   * 天
   *
   * Day
   */
  DAY = 'DAY',
  /**
   * 周
   *
   * Week
   */
  WEEK = 'WEEK',
  /**
   * 月
   *
   * Month
   */
  MONTH = 'MONTH',
  /**
   * 年
   *
   * Year
   */
  YEAR = 'YEAR',
}

/**
 * 本地化显示对应的甘特图显示类型
 *
 * Localize the corresponding gantt show kind
 *
 * @param ganttShowKind 甘特图显示类型 / Gantt chart show kind
 * @returns 显示名称 / Display name
 */
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

/**
 * 数据类型
 *
 * Data kind
 */
export enum DataKind {
  /**
   * 单行文本
   *
   * Single-line text
   */
  TEXT = 'TEXT',
  /**
   * 多行文本
   *
   * Multi-line text
   */
  TEXTAREA = 'TEXTAREA',
  /**
   * 自增序列
   *
   * Auto-increment sequence
   */
  SERIAL = 'SERIAL',
  /**
   * 数字
   *
   * Number
   */
  NUMBER = 'NUMBER',
  /**
   * 布尔
   *
   * Boolean
   */
  BOOLEAN = 'BOOLEAN',
  /**
   * 文件
   *
   * File
   */
  FILE = 'FILE',
  /**
   * 图片
   *
   * Image
   */
  IMAGE = 'IMAGE',
  /**
   * 金额
   *
   * Amount
   */
  AMOUNT = 'AMOUNT',
  /**
   * 日期
   *
   * Date
   */
  DATE = 'DATE',
  /**
   * 日期时间
   *
   * Date time
   */
  DATETIME = 'DATETIME',
  /**
   * 时间
   *
   * Time
   */
  TIME = 'TIME',
  /**
   * 邮箱
   *
   * Email
   */
  EMAIL = 'EMAIL',
  /**
   * 网址
   *
   * URL
   */
  URL = 'URL',
  /**
   * 电话
   *
   * Phone
   */
  PHONE = 'PHONE',
  /**
   * 密码
   *
   * Password
   */
  PASSWORD = 'PASSWORD',
}

/**
 * 本地化显示对应的数据类型
 *
 * Localize the corresponding data kind
 *
 * @param dataKind 数据类型 / Data kind
 * @returns 显示名称 / Display name
 */
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
    case DataKind.DATE: return t('_.datakind.date')
    case DataKind.DATETIME: return t('_.datakind.datetime')
    case DataKind.TIME: return t('_.datakind.time')
    case DataKind.EMAIL: return t('_.datakind.email')
    case DataKind.URL: return t('_.datakind.url')
    case DataKind.PHONE: return t('_.datakind.phone')
    case DataKind.PASSWORD: return t('_.datakind.password')
  }
}

/**
 * 根据数据类型获取输入框类型
 *
 * Get the input box kind based on the data kind
 *
 * @param dataKind 数据类型 / Data kind
 * @returns 输入框类型 / Input box kind
 */
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

/**
 * 根据数据类型获取默认值
 *
 * Get the default value based on the data kind
 *
 * @param dataKind 数据类型 / Data kind
 * @returns 默认值 / Default value
 */
export function getDefaultValueByDataKind(dataKind: DataKind): any {
  switch (dataKind) {
    case DataKind.NUMBER:
    case DataKind.AMOUNT:
    case DataKind.SERIAL:
      return 0
    case DataKind.BOOLEAN:
      return false
    case DataKind.DATE:
    case DataKind.DATETIME:
    case DataKind.TIME:
      return null
    default:
      return ''
  }
}

/**
 * 根据数据类型获取默认图标
 *
 * Get the default icon based on the data kind
 *
 * @param dataKind 数据类型 / Data kind
 * @returns 默认图标 / Default icon
 */
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

/**
 * 操作符类型
 *
 * Operator kind
 */
export enum OperatorKind {
  /**
   * 等于
   *
   * Equal
   */
  EQ = '=',
  /**
   * 不等于
   *
   * Not equal
   */
  NE = '!=',
  /**
   * 小于
   *
   * Less than
   */
  LT = '<',
  /**
   * 小于等于
   *
   * Less than or equal
   */
  LE = '<=',
  /**
   * 大于
   *
   * Greater than
   */
  GT = '>',
  /**
   * 大于等于
   *
   * Greater than or equal to
   */
  GE = '>=',
  /**
   * 存在（数据项匹配）
   *
   * Exist(Array item match)
   */
  IN = 'IN',
  /**
   * 不存在（数据项匹配）
   *
   * Not exist(Array item match)
   */
  NOT_IN = 'NOT IN',
  /**
   * 包含（模糊匹配）
   *
   * Include(Fuzzy match)
   */
  CONTAINS = 'CONTAINS',
  /**
   * 不包含（模糊匹配）
   *
   * Not include(Fuzzy match)
   */
  NOT_CONTAINS = 'NCONTAINS',
  /**
   * 以...开始
   *
   * Start with
   */
  STARTWITH = 'STARTWITH',
  /**
   * 不以...开始
   *
   * Not start with
   */
  NOT_STARTWITH = 'NSTARTWITH',
  /**
   * 以...结束
   *
   * End with
   */
  ENDWITH = 'ENDWITH',
  /**
   * 不以...结束
   *
   * Not end with
   */
  NOT_ENDWITH = 'NENDWITH',
  /**
   * 为空
   *
   * Is empty
   */
  IS_EMPTY = 'ISEMPTY',
  /**
   * 不为空
   *
   * Not empty
   */
  NOT_EMPTY = 'NOTEMPTY',
}

/**
 * 根据数据类型获取操作符类型
 *
 * Get the operator kind based on the data kind
 *
 * @param dataKind 数据类型 / Data kind
 * @returns 操作符类型 / Operator kind
 */
export function getOperatorKindsByDataKind(dataKind?: DataKind): OperatorKind[] {
  switch (dataKind) {
    case undefined:
      return []
    case DataKind.SERIAL:
    case DataKind.NUMBER:
    case DataKind.AMOUNT:
      return [OperatorKind.EQ, OperatorKind.NE, OperatorKind.LT, OperatorKind.LE, OperatorKind.GT, OperatorKind.GE, OperatorKind.IN, OperatorKind.NOT_IN, OperatorKind.IS_EMPTY, OperatorKind.NOT_EMPTY]
    case DataKind.BOOLEAN:
      return [OperatorKind.EQ, OperatorKind.IS_EMPTY, OperatorKind.NOT_EMPTY]
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

/**
 * 本地化显示对应的操作符类型
 *
 * Localize the corresponding operator kind
 *
 * @param operatorKind 操作符类型 / Operator kind
 * @returns 显示名称 / Display name
 */
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

/**
 * 聚合类型
 *
 * Aggregate kind
 */
export enum AggregateKind {
  /**
   * 求和
   *
   * Sum
   */
  SUM = 'SUM',
  /**
   * 计数
   *
   * Count
   */
  COUNT = 'COUNT',
  /**
   * 最小
   *
   * Min
   */
  MIN = 'MIN',
  /**
   * 最大
   *
   * Max
   */
  MAX = 'MAX',
  /**
   * 算数平均
   *
   * Avg
   */
  AVG = 'AVG',
  /**
   * 中位数
   *
   * Median
   */
  MEDIAN = 'MEDIAN',
  /**
   * 标准差
   *
   * Stddev
   */
  STDDEV = 'STDDEV',
  /**
   * 去重
   *
   * Distinct
   */
  DISTINCT = 'DISTINCT',
}

/**
 * 本地化显示对应的聚合类型
 *
 * Localize the corresponding aggregate kind
 *
 * @param aggKind 聚合类型 / Aggregate kind
 * @returns 显示名称 / Display name
 */
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

/**
 * 聚合项
 *
 * Aggregate item
 */
export interface AggItem {
  /**
   * 聚合类型
   *
   * Aggregate kind
   */
  kind: AggregateKind
  /**
   * 显示名称
   *
   * Display name
   */
  title: string
}

/**
 * 根据数据类型显示聚合项列表
 *
 * Show aggregation item list based on data kind
 *
 * @param dataKind 数据类型 / Data kind
 * @returns 聚合项列表 / Aggregate item list
 */
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

/**
 * 警告类型
 *
 * Alert kind
 */
export enum AlertKind {
  /**
   * 事件未配置
   *
   * Event not configured
   */
  EVENT_NOT_CONFIGURED = 'EVENT_NOT_CONFIGURED',
  /**
   * 事件调用错误
   *
   * Event invoke error
   */
  EVENT_INVOKE_ERROR = 'EVENT_INVOKE_ERROR',
  /**
   * 加载数据场景无效
   *
   * Load data invalid scene
   */
  LOAD_DATA_INVALID_SCENE = 'LOAD_DATA_INVALID_SCENE',
  /**
   * 数据错误
   *
   * Data error
   */
  DATA_ERROR = 'DATA_ERROR',
}

/**
 * 字典类型
 * 
 * dictionary kind
 */

export enum DictKind {
  /**
   * select下拉
   *
   * select dropdown
   */
  SELECT = 'SELECT',
  /**
   * 树形下拉
   *
   * tree select
   */
  TREE_SELECT = 'TREE_SELECT'
}