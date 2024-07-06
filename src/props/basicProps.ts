/**
 * @fileoverview 基础属性 / Basic props
 */

/**
 * 数据返回对象
 *
 * Data response object
 */
export interface DataResp {
  /**
   * 数据列表
   *
   * Data list
   */
  records: { [columName: string]: any }[]
  /**
   * 聚合数据
   *
   * Aggregated data
   *
   * 格式： {列名: 聚合值}
   *
   * Format: {columnName: aggregated value}
   */
  aggs: { [columName: string]: any }
  /**
   * 总数
   *
   * Total number
   */
  totalNumber: number
}

/**
 * 带分组的数据返回对象
 *
 * Data response object with grouping
 */
export interface DataGroupResp extends DataResp {
  /**
   * 分组值
   *
   * Group value
   */
  groupValue: string
  /**
   * 分组显示标题
   *
   * Group display title
   */
  groupShowTitle?: string
}

/**
 * 聚合数据返回对象
 *
 * Aggregated data response object
 *
 * 格式： {列名: 聚合值}
 *
 * Format: {columnName: aggregated value}
 */
export interface AggDataResp {
  aggs: { [columnName: string]: any }
}

/**
 * 带分组的聚合数据返回对象
 *
 * Aggregated data response object with grouping
 */
export interface AggDataGroupResp extends AggDataResp {
  /**
   * 分组值
   *
   * Group value
   */
  groupValue: string
}

/**
 * 字典项
 *
 * Dictionary item
 *
 * @example
 * const dictItem = {
 *   title: '星航',
 *   value: 'xh',
 *   avatar: 'https://xxxx/xxx.png'
 * }
 */
export interface DictItemProps {
  /**
   * 字典项标题
   *
   * Dictionary item title
   */
  title: string
  /**
   * 字典项值
   *
   * Dictionary item value
   */
  value: any
  /**
   * 字典项颜色
   *
   * Dictionary item color
   */
  color?: string
  /**
   * 字典项图标
   *
   * Dictionary item icon
   */
  avatar?: string
}

/**
 * 字典项返回对象
 *
 * Dictionary item response object
 */
export interface DictItemsResp {
  /**
   * 字典项列表
   */
  records: DictItemProps[]
  /**
   * 总数
   */
  totalNumber: number
}
