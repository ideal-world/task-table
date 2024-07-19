/**
 * @fileoverview 功能属性 / Function props
 */

import type { ChangeAllOptional, ChangeOptionalExcept } from '../utils/tsHelper'
import type { AggregateKind, LayoutKind, OperatorKind } from './enumProps'
import { GanttShowKind } from './enumProps'

/**
 * 数据查询分片请求
 *
 * Data query slice request
 */
export interface DataQuerySliceReq {
  /**
   * 偏移量
   *
   * Offset
   */
  offsetNumber: number
  /**
   * 获取数量
   *
   * Number to fetch
   */
  fetchNumber: number
}

/**
 * 数据分片属性
 *
 * Data slice props
 */
export interface DataSliceProps extends DataQuerySliceReq {
  /**
   * 一次获取数量的候选列表
   *
   * Once get the number of candidates list
   */
  fetchNumbers: number[]
}
/**
 * 简单数据分片属性
 */
export type SimpleDataSliceProps = ChangeAllOptional<DataSliceProps>
/**
 * 生成数据分片属性
 *
 * Generate data slice props
 *
 * @param tableSimple 表格级简单数据分片属性 / Table level simple data slice props
 * @param layoutSimple 布局级简单数据分片属性 / Layout level simple data slice props
 * @returns 数据分片属性 / Data slice props
 */
export function generateDataSliceProps(tableSimple?: SimpleDataSliceProps, layoutSimple?: SimpleDataSliceProps): DataSliceProps {
  return {
    offsetNumber: layoutSimple?.offsetNumber ?? tableSimple?.offsetNumber ?? 0,
    fetchNumber: layoutSimple?.fetchNumber ?? tableSimple?.fetchNumber ?? 10,
    fetchNumbers: layoutSimple?.fetchNumbers ?? tableSimple?.fetchNumbers ?? [5, 10, 20, 30, 50, 100],
  }
}

/**
 * 快速搜索属性
 *
 * Quick search props
 */
export interface QuickSearchProps {
  /**
   * 搜索提示词
   *
   * Search placeholder
   */
  placeholder: string
  /**
   * 搜索内容
   *
   * Search content
   */
  searchContent?: string
}

/**
 * 操作列属性
 *
 * Action column props
 */
export interface ActionColumnProps {
  /**
   * 列的渲染函数
   *
   * Column render function
   *
   * NOTE: 出于性能考虑，该函数返回的为原生DOM，相关的处理事件请使用代理事件。
   *
   * NOTE: For performance reasons, the function returns the native DOM, and related processing events should use delegated events.
   *
   * @param record 当前行的数据 / Data of current row
   * @param layoutKind 当前布局类型 / Current layout kind
   * @returns 渲染DOM / Rendered DOM
   *
   * @example
   * function customRender(record: { [columnName: string]: any }, layoutKind: IwProps.LayoutKind) {                  // 定义自定义渲染函数 / Define custom render function
   *   return `<button class="btn-row-delete" style="margin-right:2px" data-id='${record.no}'>删除</button>`
   * }
   *
   * IwUtils.basic.delegateEvent('.iw-tt', 'click', '.btn-row-delete', (e) => {                                      // 使用代理事件处理点击事件 / Use delegated events to handle click events
   *   IwEvents.deleteData([(e.target as HTMLElement).dataset.id])
   * })
   */
  render: (record: { [columnName: string]: any }, layoutKind: LayoutKind) => any
  /**
   * 操作列宽度
   *
   * Action column width
   */
  width: number
}

/**
 * 聚合数据属性
 *
 * Aggregate data props
 */
export interface AggDataProps {
  /**
   * 启用的列名
   *
   * Enabled column names
   */
  enabledColumnNames: string[]
  /**
   * 聚合项
   *
   * Aggregate items
   */
  items: AggDataItemProps[]
}
/**
 * 简单聚合数据属性
 */
export type SimpleAggDataProps = ChangeOptionalExcept<AggDataProps, 'enabledColumnNames'>
/**
 * 生成聚合数据属性
 *
 * Generate aggregate data props
 *
 * @param tableSimple 表格级简单聚合数据属性 / Table level simple aggregate data props
 * @param layoutSimple 布局级简单聚合数据属性 / Layout level simple aggregate data props
 * @returns 聚合数据属性 / Aggregate data props
 */
export function generateAggDataProps(tableSimple?: SimpleAggDataProps, layoutSimple?: SimpleAggDataProps): AggDataProps {
  return {
    enabledColumnNames: (layoutSimple?.enabledColumnNames ?? tableSimple?.enabledColumnNames)!,
    items: layoutSimple?.items ?? tableSimple?.items ?? [],
  }
}

/**
 * 聚合数据项属性
 *
 * Aggregate data item props
 */
export interface AggDataItemProps {
  /**
   * 列名
   *
   * Column name
   */
  columnName: string
  /**
   * 聚合类型
   *
   * Aggregate kind
   */
  aggKind: AggregateKind
}

/**
 * 过滤数据属性
 *
 * Filter data props
 *
 * NOTE: 各过滤组间为OR关系，滤组内的各项为AND关系。
 *
 * NOTE: OR relationship between groups, AND relationship between items in the group.
 */
export interface FilterDataProps {
  /**
   * 启用的列名
   *
   * Enabled column names
   */
  enabledColumnNames: string[]
  /**
   * 过滤组
   *
   * Filter groups
   */
  groups: FilterDataGroupProps[]
}
/**
 * 简单过滤数据属性
 */
export type SimpleFilterDataProps = ChangeOptionalExcept<FilterDataProps, 'enabledColumnNames'>
/**
 * 生成过滤数据属性
 *
 * Generate filter data props
 *
 * @param tableSimple 表格级简单过滤数据属性 / Table level simple filter data props
 * @param layoutSimple 布局级简单过滤数据属性 / Layout level simple filter data props
 * @returns 过滤数据属性 / Filter data props
 */
export function generateFilterDataProps(tableSimple?: SimpleFilterDataProps, layoutSimple?: SimpleFilterDataProps): FilterDataProps {
  return {
    enabledColumnNames: (layoutSimple?.enabledColumnNames ?? tableSimple?.enabledColumnNames)!,
    groups: layoutSimple?.groups ?? tableSimple?.groups ?? [],
  }
}

/**
 * 过滤数据组属性
 *
 * Filter data group props
 */
export interface FilterDataGroupProps {
  /**
   * 过滤项
   *
   * Filter items
   */
  items: FilterDataItemProps[]
}

/**
 * 过滤数据项属性
 *
 * Filter data item props
 */
export interface FilterDataItemProps {
  /**
   * 列名
   *
   * Column name
   */
  columnName: string
  /**
   * 操作符
   *
   * Operator
   */
  operator: OperatorKind
  /**
   * 值
   *
   * Value
   */
  value?: any
}

/**
 * 分组数据属性
 *
 * Group data props
 */
export interface GroupDataProps {
  /**
   * 启用的列名
   *
   * Enabled column names
   */
  enabledColumnNames: string[]
  /**
   * 分组项
   *
   * Group item
   */
  item?: GroupDataItemProps
  /**
   * 分片
   *
   * Slice
   *
   * 每个分组值对应一个分片。
   *
   * Each group value corresponds to a slice.
   */
  slices?: { [groupValueStr: string]: DataSliceProps }
}
/**
 * 简单分组数据属性
 */
export type SimpleGroupDataProps = ChangeOptionalExcept<GroupDataProps, 'enabledColumnNames'>
/**
 * 生成分组数据属性
 *
 * Generate group data props
 *
 * @param tableSimple 表格级简单分组数据属性 / Table level simple group data props
 * @param layoutSimple 布局级简单分组数据属性 / Layout level simple group data props
 * @returns 分组数据属性 / Group data props
 */
export function generateGroupDataProps(tableSimple?: SimpleGroupDataProps, layoutSimple?: SimpleGroupDataProps): GroupDataProps {
  return {
    enabledColumnNames: (layoutSimple?.enabledColumnNames ?? tableSimple?.enabledColumnNames)!,
    item: layoutSimple?.item ?? tableSimple?.item,
    slices: layoutSimple?.slices ?? tableSimple?.slices,
  }
}

/**
 * 分组数据项属性
 *
 * Group data item props
 */
export interface GroupDataItemProps {
  /**
   * 列名
   *
   * Column name
   */
  columnName: string
  /**
   * 倒序排序
   *
   * Reverse order
   */
  orderDesc: boolean
  /**
   * 隐藏空记录
   *
   * Hide empty record
   */
  hideEmptyRecord: boolean
}

/**
 * 排序数据属性
 *
 * Sort data props
 */
export interface SortDataProps {
  /**
   * 启用的列名
   *
   * Enabled column names
   */
  enabledColumnNames: string[]
  /**
   * 排序项
   *
   * Sort item
   */
  items: SortDataItemProps[]
}
/**
 * 简单排序数据属性
 */
export type SimpleSortDataProps = ChangeOptionalExcept<SortDataProps, 'enabledColumnNames'>
/**
 * 生成排序数据属性
 *
 * Generate sort data props
 *
 * @param tableSimple 表格级简单排序数据属性 / Table level simple sort data props
 * @param layoutSimple 布局级简单排序数据属性 / Layout level simple sort data props
 * @returns 排序数据属性 / Sort data props
 */
export function generateSortDataProps(tableSimple?: SimpleSortDataProps, layoutSimple?: SimpleSortDataProps): SortDataProps {
  return {
    enabledColumnNames: (layoutSimple?.enabledColumnNames ?? tableSimple?.enabledColumnNames)!,
    items: layoutSimple?.items ?? tableSimple?.items ?? [],
  }
}

/**
 * 排序数据项属性
 *
 * Sort data item props
 */
export interface SortDataItemProps {
  /**
   * 列名
   *
   * Column name
   */
  columnName: string
  /**
   * 倒序排序
   *
   * Reverse order
   */
  orderDesc: boolean
}

/**
 * 甘特布局属性
 *
 * Gantt layout props
 */
export interface GanttLayoutProps {
  /**
   * 时间线宽度
   *
   * Timeline width
   */
  timelineWidth: number
  /**
   * 显示类型
   *
   * Show kind
   */
  showKind: GanttShowKind
  /**
   * 计划开始时间列名
   *
   * Plan start time column name
   */
  planStartTimeColumnName: string
  /**
   * 计划结束时间列名
   *
   * Plan end time column name
   */
  planEndTimeColumnName: string
  /**
   * 实际开始时间列名
   *
   * Actual start time column name
   */
  actualStartTimeColumnName?: string
  /**
   * 实际结束时间列名
   *
   * Actual end time column name
   */
  actualEndTimeColumnName?: string
}
/**
 * 简单甘特布局属性
 */
export type SimpleGanttLayoutProps = ChangeOptionalExcept<GanttLayoutProps, 'planStartTimeColumnName' | 'planEndTimeColumnName'>
/**
 * 生成甘特布局属性
 *
 * Generate Gantt layout props
 *
 * @param tableSimple 表格级简单甘特布局属性 / Table level simple Gantt layout props
 * @param layoutSimple 布局级简单甘特布局属性 / Table level simple Gantt layout props
 * @returns 甘特布局属性 / Gantt layout props
 */
export function generateGanttLayoutProps(tableSimple?: SimpleGanttLayoutProps, layoutSimple?: SimpleGanttLayoutProps): GanttLayoutProps {
  return {
    timelineWidth: layoutSimple?.timelineWidth ?? tableSimple?.timelineWidth ?? 300,
    showKind: layoutSimple?.showKind ?? tableSimple?.showKind ?? GanttShowKind.DAY,
    planStartTimeColumnName: (layoutSimple?.planStartTimeColumnName ?? tableSimple?.planStartTimeColumnName)!,
    planEndTimeColumnName: (layoutSimple?.planEndTimeColumnName ?? tableSimple?.planEndTimeColumnName)!,
    actualStartTimeColumnName: layoutSimple?.actualStartTimeColumnName ?? tableSimple?.actualStartTimeColumnName,
    actualEndTimeColumnName: layoutSimple?.actualEndTimeColumnName ?? tableSimple?.actualEndTimeColumnName,
  }
}

/**
 * 编辑数据属性
 *
 * Edit data props
 */
export interface EditDataProps {
  /**
   * 启用的列名
   *
   * Enabled column names
   */
  enabledColumnNames: string[]
  /**
   * 标记可编辑
   *
   * Mark editable
   *
   * 启用后会提示可编辑的单元格。
   *
   * After enabling, the editable cell will be prompted.
   */
  markEditable: boolean
}
/**
 * 简单编辑数据属性
 */
export type SimpleEditDataProps = ChangeOptionalExcept<EditDataProps, 'enabledColumnNames'>
/**
 * 生成编辑数据属性
 *
 * Generate edit data props
 *
 * @param tableSimple 表格级简单编辑数据属性 / Table level simple edit data props
 * @param layoutSimple 布局级简单编辑数据属性 / Layout level simple edit data props
 * @returns 编辑数据属性 / Edit data props
 */
export function generateEditDataProps(tableSimple?: SimpleEditDataProps, layoutSimple?: SimpleEditDataProps): EditDataProps {
  return {
    enabledColumnNames: (layoutSimple?.enabledColumnNames ?? tableSimple?.enabledColumnNames)!,
    markEditable: layoutSimple?.markEditable ?? tableSimple?.markEditable ?? false,
  }
}

/**
 * 编辑数据返回对象
 *
 * Edit data response object
 */
export interface EditableDataResp {
  /**
   * 白名单模式，该模式下只有在此列表中的行列才会被编辑
   *
   * White list mode, in this mode, only rows and columns in this list will be edited
   */
  whiteListMode: boolean
  /**
   * 行列
   *
   * Rows and columns to be edited
   *
   * 格式：{行主键: 列名[]}
   *
   * Format: {row primary key: column name[]}
   */
  cells: { [pk: string | number]: string[] }
}

/**
 * 上下文菜单项属性
 *
 * Context menu item props
 */
export interface ContextMenuItemProps {
  /**
   * ID
   *
   * id
   */
  id: string
  /**
   * 名称
   *
   * label
   */
  label: string
}

/**
 * 上下文菜单属性
 *
 * Context menu props
 */
export interface ContextMenuProps {
  /**
   * 菜单项
   *
   * Context menu items
   */
  items: { [columnName: string]: ContextMenuItemProps[] }
}

/**
 * 简单上下文菜单属性
 */
export type SimpleContextMenuProps = ContextMenuProps

export function generateContextMenuProps(tableSimple?: SimpleContextMenuProps, layoutSimple?: SimpleContextMenuProps): ContextMenuProps | undefined {
  return layoutSimple ?? tableSimple
}
