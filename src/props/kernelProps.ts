/**
 * @fileoverview 核心属性 / Kernel props
 */

import { getRandomString } from '../utils/basic'
import type { ChangeAllOptional, ChangeOptionalExcept } from '../utils/tsHelper'
import type { DictItemProps } from './basicProps'
import { DataKind, LayoutKind, SizeKind, SubDataShowKind, getDefaultIconByDataKind, getDefaultIconByLayoutKind } from './enumProps'

import type { TableEventProps } from './eventProps'
import type { ActionColumnProps, AggDataProps, ContextMenuProps, DataSliceProps, EditDataProps, FilterDataProps, GanttLayoutProps, GroupDataProps, QuickSearchProps, SimpleAggDataProps, SimpleContextMenuProps, SimpleDataSliceProps, SimpleEditDataProps, SimpleFilterDataProps, SimpleGanttLayoutProps, SimpleGroupDataProps, SimpleSortDataProps, SortDataProps } from './functionProps'
import { generateAggDataProps, generateContextMenuProps, generateDataSliceProps, generateEditDataProps, generateFilterDataProps, generateGanttLayoutProps, generateGroupDataProps, generateSortDataProps } from './functionProps'

// --------------------------------------------------------- Common ---------------------------------------------------------

/**
 * 表格级别与布局级别共用的公共功能属性
 *
 * Common function properties shared by table level and layout level
 */
export interface CommonFunctionProps {
  /**
   * 分片
   *
   * Slice
   */
  slice: DataSliceProps
  /**
   * 是否显示选择列
   *
   * Whether to show the select column
   */
  showSelectColumn: boolean
  /**
   * 子数据显示方式
   *
   * Sub-data display method
   */
  subDataShowKind: SubDataShowKind

  /**
   * 操作列
   *
   * Action column
   */
  actionColumn?: ActionColumnProps
  /**
   * 甘特图
   *
   * Gantt chart
   */
  gantt?: GanttLayoutProps

  /**
   * 过滤
   *
   * Filter
   */
  filter?: FilterDataProps
  /**
   * 分组
   *
   * Group
   */
  group?: GroupDataProps
  /**
   * 排序
   *
   * Sort
   */
  sort?: SortDataProps
  /**
   * 聚合
   *
   * Aggregate
   */
  agg?: AggDataProps
  /**
   * 编辑
   *
   * Edit
   */
  edit?: EditDataProps
  /**
   * 上下文菜单
   *
   * Context Menu
   */
  contextMenu?: ContextMenuProps
}
/**
 * 表格级别与布局级别共用的简单公共功能属性
 *
 * Simple common function properties shared by table level and layout level
 */
interface SimpleCommonFunctionProps {
  /**
   * 分片
   *
   * Slice
   */
  slice?: SimpleDataSliceProps
  /**
   * 是否显示选择列
   *
   * Whether to show the select column
   */
  showSelectColumn?: boolean
  /**
   * 子数据显示方式
   *
   * Sub-data display method
   */
  subDataShowKind?: SubDataShowKind

  /**
   * 操作列
   *
   * Action column
   */
  actionColumn?: ActionColumnProps
  /**
   * 甘特图
   *
   * Gantt chart
   */
  gantt?: SimpleGanttLayoutProps

  /**
   * 过滤
   *
   * Filter
   */
  filter?: SimpleFilterDataProps
  /**
   * 分组
   *
   * Group
   */
  group?: SimpleGroupDataProps
  /**
   * 排序
   *
   * Sort
   */
  sort?: SimpleSortDataProps
  /**
   * 聚合
   *
   * Aggregate
   */
  agg?: SimpleAggDataProps
  /**
   * 编辑
   *
   * Edit
   */
  edit?: SimpleEditDataProps
  /**
   * 上下文菜单
   *
   * Context Menu
   */
  contextMenu?: SimpleContextMenuProps
}
/**
 * 生成表格级别与布局级别共用的公共功能属性
 *
 * Generate common function properties shared by table level and layout level
 *
 * @param tableSimple 表格级别简单公共功能属性 / Table level simple common function properties
 * @param layoutSimple 布局级别简单公共功能属性 / Layout level simple common function properties
 * @returns 公共功能属性 / Common function properties
 */
function generateCommonFunctionProps(tableSimple: SimpleCommonFunctionProps, layoutSimple?: SimpleCommonFunctionProps): CommonFunctionProps {
  return {
    showSelectColumn: layoutSimple?.showSelectColumn ?? tableSimple.showSelectColumn ?? false,
    subDataShowKind: layoutSimple?.subDataShowKind ?? tableSimple.subDataShowKind ?? SubDataShowKind.FOLD_SUB_DATA,
    actionColumn: layoutSimple?.actionColumn ?? tableSimple.actionColumn,
    slice: generateDataSliceProps(tableSimple.slice, layoutSimple?.slice),
    gantt: (layoutSimple?.gantt ?? tableSimple.gantt) && generateGanttLayoutProps(tableSimple.gantt, layoutSimple?.gantt),
    filter: (layoutSimple?.filter ?? tableSimple.filter) && generateFilterDataProps(tableSimple.filter, layoutSimple?.filter),
    group: (layoutSimple?.group ?? tableSimple.group) && generateGroupDataProps(tableSimple.group, layoutSimple?.group),
    sort: (layoutSimple?.sort ?? tableSimple.sort) && generateSortDataProps(tableSimple.sort, layoutSimple?.sort),
    agg: (layoutSimple?.agg ?? tableSimple.agg) && generateAggDataProps(tableSimple.agg, layoutSimple?.agg),
    edit: (layoutSimple?.edit ?? tableSimple.edit) && generateEditDataProps(tableSimple.edit, layoutSimple?.edit),
    contextMenu: (layoutSimple?.contextMenu ?? tableSimple.contextMenu) && generateContextMenuProps(tableSimple.contextMenu, layoutSimple?.contextMenu),
  }
}

/**
 * 表格级别与布局级别共用的公共列属性
 *
 * Common column properties shared by table level and layout level
 */
export interface CommonColumnProps {
  /**
   * 列名
   *
   * Column name
   */
  name: string

  /**
   * 是否换行
   *
   * Whether to wrap
   */
  wrap: boolean
  /**
   * 是否固定
   *
   * Whether to fix
   */
  fixed: boolean
  /**
   * 宽度
   *
   * Width
   */
  width: number
  /**
   * 是否隐藏
   *
   * Whether to hide
   *
   * NOTE: 新建布局时仅会复制未隐藏的列。
   *
   * NOTE: Only unhidden columns will be copied when creating a new layout.
   */
  hide: boolean
  /**
   * 样式
   *
   * Style
   */
  styles: { [key: string]: string }
  /**
   * 分类标题
   *
   * Category title
   */
  categoryTitle?: string
  /**
   * 自定义渲染
   *
   * Custom render
   */
  render?: (record: { [columnName: string]: any }, layoutKind: LayoutKind) => any
}
/**
 * 表格级别与布局级别共用的简单公共列属性
 *
 * Simple common column properties shared by table level and layout level
 */
export type SimpleCommonColumnProps = ChangeOptionalExcept<CommonColumnProps, 'name'>
/**
 * 生成表格级别与布局级别共用的公共列属性
 *
 * Generate common column properties shared by table level and layout level
 *
 * @param tableSimple 表格级别简单公共列属性 / Table level simple common column properties
 * @param layoutSimple 布局级别简单公共列属性 / Layout level simple common column properties
 * @returns 公共列属性 / Common column properties
 */
function generateCommonColumnProps(tableSimple: SimpleCommonColumnProps, layoutSimple?: SimpleCommonColumnProps): CommonColumnProps {
  return {
    name: layoutSimple?.name ?? tableSimple.name,
    wrap: layoutSimple?.wrap ?? tableSimple.wrap ?? false,
    fixed: layoutSimple?.fixed ?? tableSimple.fixed ?? false,
    width: layoutSimple?.width ?? tableSimple.width ?? 100,
    hide: layoutSimple?.hide ?? tableSimple.hide ?? false,
    styles: layoutSimple?.styles ?? tableSimple.styles ?? {},
    categoryTitle: layoutSimple?.categoryTitle ?? tableSimple.categoryTitle,
    render: layoutSimple?.render ?? tableSimple.render,
  }
}

// --------------------------------------------------------- Table ---------------------------------------------------------

/**
 * 表格属性
 *
 * Table props
 */
export interface TableProps extends CommonFunctionProps {
  /**
   * ID
   *
   * ID
   */
  id: string
  /**
   * 主键列名
   *
   * Primary key column name
   */
  pkColumnName: string
  /**
   * 父主键列名
   *
   * Parent primary key column name
   */
  parentPkColumnName?: string
  /**
   * 列
   *
   * Columns
   */
  columns: TableColumnProps[]
  /**
   * 布局
   *
   * Layouts
   */
  layouts: LayoutProps[]
  /**
   * 事件
   *
   * Events
   */
  events: TableEventProps
  /**
   * 样式
   *
   * Styles
   */
  styles: TableStyleProps

  /**
   * 快速搜索
   *
   * Quick search
   */
  quickSearch?: QuickSearchProps

  /**
   * 迷你模式
   *
   * Mini mode
   *
   * 启用后只会显示第一个布局，且不会显示过滤、分组、排序、表格配置等功能。
   *
   * After enabling, only the first layout will be displayed, and functions such as filter, group, sort, and table configuration will not be displayed.
   */
  mini: boolean
}
/**
 * 简单表格属性
 *
 * Simple table props
 *
 * 这是入口配置属性，用于定义一个表格的所有属性。
 *
 * This is the entry configuration property, which is used to define all properties of a table.
 *
 * @example
 * const simplifiedTableProps: SimpleTableProps = {                                                                   // 简单表格属性示例 / Simple table props example
 *   pkColumnName: 'no',
 *   columns: [                                                                                                       // 列定义 / Column definition
 *     { name: 'no' },
 *     { name: 'name' },
 *   ],
 *   layouts: [                                                                                                       // 布局定义 / Layout definition
 *     {
 *       title: 'list demo',
 *     }
 *   ],
 *   events: {                                                                                                        // 实现必要的事件 / Implement necessary events
 *     loadData: async (quickSearchContent?: string, filter?: IwProps.FilterDataProps,
 *            sort?: IwProps.SortDataProps, group?: IwProps.GroupDataProps, agg?: IwProps.AggDataProps,
 *            hideSubData?: boolean, byGroupValue?: any, slice?: IwProps.DataQuerySliceReq,
 *            returnColumnNames?: string[],  returnOnlyAgg?: boolean
 *        ): Promise<IwProps.DataResp | IwProps.DataGroupResp[]> => {
 *       ...
 *     }
 *   }
 * }
 *
 *
 * const tableProps: SimpleTableProps = {                                                                             // 相对完整的表格属性示例 / Relatively complete table props example
 *   pkColumnName: 'no',
 *   parentPkColumnName: 'pno',                                                                                       // 父主键列名 / Parent primary key column name
 *   columns: [
 *     { name: 'no', title: 'ID', dataKind: IwProps.DataKind.NUMBER, width: 80, styles: { cursor: 'pointer' } },      // 自定义样式的列 / Column with custom style
 *     { name: 'pno', title: '父ID', dataKind: IwProps.DataKind.NUMBER, hide: true },                                 // 隐藏列 / Hidden column
 *     { name: 'name', title: '名称', width: 300,
 *      render: (record: { [columnName: string]: any }, layoutKind: IwProps.LayoutKind) => {                          // 自定义渲染函数 / Custom render function
 *       if (layoutKind === IwProps.LayoutKind.LIST) {
 *         return record.stats.includes('risk') ? `<span style='color:red'>${record.name}</span>` : record.name
 *       }
 *       else {
 *         return record.name
 *       }
 *     } },
 *     { name: 'creator', title: '创建人', useDict: true },                                                           // 使用字典的列 / Use dictionary column
 *     { name: 'stats', title: '状态', useDict: true, multiValue: true },                                             // 有多个值的列 / Column with multiple values
 *     { name: 'avatar', title: '头像', dataKind: IwProps.DataKind.IMAGE },                                           // 图片列 / Image column
 *     { name: 'attachment', title: '附件', dataKind: IwProps.DataKind.FILE },                                        // 文件列 / File column
 *     { name: 'planStartTime', title: '计划开始时间', dataKind: IwProps.DataKind.DATETIME },                         // 日期时间列 / Date-time column
 *     { name: 'planEndTime', title: '计划结束时间', dataKind: IwProps.DataKind.DATETIME },
 *     { name: 'actualStartTime', title: '实际开始时间', dataKind: IwProps.DataKind.DATETIME },
 *     { name: 'actualEndTime', title: '实际结束时间', dataKind: IwProps.DataKind.DATETIME },
 *     { name: 'disabled', title: '是否禁用', dataKind: IwProps.DataKind.BOOLEAN },                                   // 布尔列 / Boolean column
 *   ],
 *   events: {
 *     loadData: async (quickSearchContent?: string, filter?: IwProps.FilterDataProps,
 *            sort?: IwProps.SortDataProps, group?: IwProps.GroupDataProps, agg?: IwProps.AggDataProps,
 *            hideSubData?: boolean, byGroupValue?: any, slice?: IwProps.DataQuerySliceReq,
 *            returnColumnNames?: string[],  returnOnlyAgg?: boolean
 *        ): Promise<IwProps.DataResp | IwProps.DataGroupResp[]> => {
 *       ...
 *     }
 *   },
 *   quickSearch: {                                                                                                   // 启用快速搜索 / Enable quick search
 *     placeholder: '请输入姓名',
 *   },
 *   slice: {
 *     fetchNumber: 10,
 *     fetchNumbers: [5, 10, 20, 30, 50],                                                                             // 自定义数据分片 / Custom data slice
 *   },
 *   showSelectColumn: true,
 *   actionColumn: {                                                                                                  // 启用操作列 / Enable action column
 *     render: (record: { [columnName: string]: any }, _layoutKind: IwProps.LayoutKind) => {
 *       return `<button class="btn-row-delete" style="margin-right:2px" data-id='${record.no}'>删除</button>`
 *     },
 *     width: 100,
 *   },
 *   gantt: {                                                                                                         // 启用甘特图 / Enable Gantt chart
 *     timelineWidth: 500,
 *     planStartTimeColumnName: 'planStartTime',
 *     planEndTimeColumnName: 'planEndTime',
 *     actualStartTimeColumnName: 'actualStartTime',
 *     actualEndTimeColumnName: 'actualEndTime',
 *   },
 *   filter: {                                                                                                        // 启用过滤 / Enable filter
 *     enabledColumnNames: ['no', 'name', 'creator', 'stats', 'planStartTime', 'planEndTime'],
 *   },
 *   sort: {
 *     enabledColumnNames: ['no', 'name', 'creator', 'stats', 'planStartTime', 'planEndTime'],
 *   },
 *   group: {
 *     enabledColumnNames: ['creator', 'stats', 'disabled'],
 *   },
 *   agg: {
 *     enabledColumnNames: ['name', 'creator', 'stats', 'planStartTime', 'planEndTime'],
 *     items: [
 *       { columnName: 'name', aggKind: IwProps.AggregateKind.MIN },
 *       { columnName: 'stats', aggKind: IwProps.AggregateKind.MIN },
 *     ],
 *   },
 *   edit: {
 *     enabledColumnNames: ['name', 'creator', 'stats', 'planStartTime', 'disabled'],
 *     markEditable: true,
 *   },
 *   layouts: [
 *     {
 *       id: 'hi1',
 *       title: 'gantt demo',
 *       layoutKind: IwProps.LayoutKind.GANTT,                                                                       // 甘特图布局 / Gantt layout
 *     },
 *     {
 *       id: 'hi2',
 *       title: 'list demo',
 *       layoutKind: IwProps.LayoutKind.LIST,
 *       columns: [{                                                                                                 // 布局可重定义需要的列 / Layout can redefine the required columns
 *         name: 'name',
 *       }, {
 *         name: 'stats',
 *       }, {
 *         name: 'creator',
 *       }, {
 *         name: 'avatar',
 *       },
 *       ...
 *       ],
 *       agg: {                                                                                                       // 布局可重定义公共功能属性 / Layout can redefine common function properties
 *         enabledColumnNames: ['name', 'creator', 'stats', 'planStartTime', 'planEndTime'],
 *         items: [
 *           { columnName: 'name', aggKind: IwProps.AggregateKind.MIN },
 *         ],
 *       }
 *     }
 *   ],
 * }
 */
export interface SimpleTableProps extends SimpleCommonFunctionProps {
  /**
   * ID
   *
   * ID
   */
  id?: string
  /**
   * 主键列名
   *
   * Primary key column name
   */
  pkColumnName: string
  /**
   * 父主键列名
   *
   * Parent primary key column name
   */
  parentPkColumnName?: string
  /**
   * 列
   *
   * Columns
   */
  columns: SimpleTableColumnProps[]
  /**
   * 布局
   *
   * Layouts
   */
  layouts: SimpleLayoutProps[]
  /**
   * 事件
   *
   * Events
   */
  events: TableEventProps
  /**
   * 样式
   *
   * Styles
   */
  styles?: SimpleTableStyleProps

  /**
   * 快速搜索
   *
   * Quick search
   */
  quickSearch?: QuickSearchProps

  /**
   * 迷你模式
   *
   * Mini mode
   *
   * 启用后只会显示第一个布局，且不会显示过滤、分组、排序、表格配置等功能。
   *
   * After enabling, only the first layout will be displayed, and functions such as filter, group, sort, and table configuration will not be displayed.
   */
  mini?: boolean
}
/**
 * 生成表格属性
 *
 * Generate table props
 *
 * @param simple 简单表格属性 / Simple table props
 * @returns 表格属性 / Table props
 */
export function generateTableProps(simple: SimpleTableProps): TableProps {
  const columns = simple.columns.map(col => generateTableColumnProps(col))
  const commonFunctions = generateCommonFunctionProps(simple)
  return {
    id: simple.id ?? `iw-table-${getRandomString(12)}`,
    pkColumnName: simple.pkColumnName,
    parentPkColumnName: simple.parentPkColumnName,
    quickSearch: simple.quickSearch,
    events: simple.events,
    ...commonFunctions,
    columns,
    layouts: simple.layouts.map(layout => generateLayoutProps(layout, {
      pkColumnName: simple.pkColumnName,
      columns,
      ...commonFunctions,
    })),
    styles: generateTableStyleProps(simple.styles ?? {}),
    mini: simple.mini ?? false,
  }
}

/**
 * 表格样式属性
 *
 * Table style props
 */
export interface TableStyleProps {
  /**
   * 尺寸
   *
   * Size
   */
  size: SizeKind
  /**
   * 主题
   *
   * Theme
   */
  theme: string
  /**
   * 自定义表格类名
   *
   * Custom table class name
   */
  tableClass: string
  /**
   * 自定义表头类名
   *
   * Custom header class name
   */
  headerClass: string
  /**
   * 自定义表尾类名
   *
   * Custom footer class name
   */
  footerClass: string
  /**
   * 自定义行类名
   *
   * Custom row class name
   */
  rowClass: string
  /**
   * 自定义单元格类名
   *
   * Custom cell class name
   */
  cellClass: string
  /**
   * 自定义聚合类名
   *
   * Custom aggregate class name
   */
  aggClass: string
}
/**
 * 简单表格样式属性
 *
 * Simple table style props
 */
export type SimpleTableStyleProps = ChangeAllOptional<TableStyleProps>
/**
 * 生成表格样式属性
 *
 * Generate table style props
 *
 * @param simple 简单表格样式属性 / Simple table style props
 * @returns 表格样式属性 / Table style props
 */
function generateTableStyleProps(simple: SimpleTableStyleProps): TableStyleProps {
  return {
    size: simple.size ?? SizeKind.MEDIUM,
    theme: simple.theme ?? '',
    tableClass: simple.tableClass ?? '',
    headerClass: simple.headerClass ?? '',
    footerClass: simple.footerClass ?? '',
    rowClass: simple.rowClass ?? '',
    cellClass: simple.cellClass ?? '',
    aggClass: simple.aggClass ?? '',
  }
}
/**
 * 表格样式修改属性
 *
 * Table style modify props
 */
export type TableStyleModifyProps = SimpleTableStyleProps

/**
 * 表格列属性
 *
 * Table column props
 */
export interface TableColumnProps extends CommonColumnProps {
  /**
   * 标题
   *
   * Title
   */
  title: string
  /**
   * 图标（来自内部图标库）
   *
   * Icon (from internal icon library)
   */
  icon: string
  /**
   * 数据类型
   *
   * Data type
   */
  dataKind: DataKind
  /**
   * 是否使用字典
   *
   * Whether to use dictionary
   */
  useDict: boolean
  /**
   * 是否多值
   *
   * Whether multi-value
   */
  multiValue: boolean
  /**
   * 固定字典项
   *
   * Fixed dictionary items
   *
   * 存在固定字典项时，字典项将不会从后端获取。
   *
   * When there are fixed dictionary items, the dictionary items will not be obtained from the backend.
   */
  fixedDictItems?: DictItemProps[]
  /**
   * 日期时间格式
   *
   * Date-time format
   */
  kindDateTimeFormat?: string
}
/**
 * 简单表格列属性
 *
 * Simple table column props
 */
export type SimpleTableColumnProps = ChangeOptionalExcept<TableColumnProps, 'name'>
/**
 * 生成表格列属性
 *
 * Generate table column props
 *
 * @param simple 简单表格列属性 / Simple table column props
 * @returns 表格列属性 / Table column props
 */
function generateTableColumnProps(simple: SimpleTableColumnProps): TableColumnProps {
  return {
    title: simple.title ?? simple.name,
    icon: getDefaultIconByDataKind(simple.dataKind ?? DataKind.TEXT),
    dataKind: simple.dataKind ?? DataKind.TEXT,
    useDict: simple.useDict ?? false,
    multiValue: simple.multiValue ?? false,
    fixedDictItems: simple.fixedDictItems,
    ...generateCommonColumnProps(simple),
  }
}

// --------------------------------------------------------- Layout ---------------------------------------------------------

/**
 * 布局属性
 *
 * Layout props
 */
export interface LayoutProps extends CommonFunctionProps {
  /**
   * ID
   *
   * ID
   */
  id: string
  /**
   * 标题
   *
   * Title
   */
  title: string
  /**
   * 布局类型
   *
   * Layout kind
   */
  layoutKind: LayoutKind
  /**
   * 图标（来自内部图标库）
   *
   * Icon (from internal icon library)
   */
  icon: string
  /**
   * 列
   *
   * Columns
   */
  columns: LayoutColumnProps[]
}
/**
 * 简单布局属性
 *
 * Simple layout props
 */
export interface SimpleLayoutProps extends SimpleCommonFunctionProps {
  /**
   * ID
   *
   * ID
   */
  id?: string
  /**
   * 标题
   *
   * Title
   */
  title: string
  /**
   * 布局类型
   *
   * Layout kind
   */
  layoutKind?: LayoutKind
  /**
   * 图标（来自内部图标库）
   *
   * Icon (from internal icon library)
   */
  icon?: string
  /**
   * 列
   *
   * Columns
   */
  columns?: SimpleLayoutColumnProps[]
}
/**
 * 生成布局属性
 *
 * Generate layout props
 *
 * @param layoutSimple 简单布局属性 / Simple layout props
 * @param tableSimple 表格简单属性 / Table simple props
 * @returns 布局属性 / Layout props
 */
export function generateLayoutProps(layoutSimple: SimpleLayoutProps, tableSimple: { pkColumnName: string, columns: TableColumnProps[] } & CommonFunctionProps): LayoutProps {
  let layoutColumns = null
  if (layoutSimple.columns) {
    layoutColumns = layoutSimple.columns.map(col => generateLayoutColumnProps(col, tableSimple.columns.find(tcol => tcol.name === col.name)!))
  }
  else {
    layoutColumns = tableSimple.columns.map(tcol => generateLayoutColumnProps({ name: tcol.name }, tcol))
  }
  // Make sure the primary key is in the first column
  const pkIdx = layoutColumns.findIndex(col => col.name === tableSimple.pkColumnName)
  if (pkIdx !== -1) {
    const pkColumn = layoutColumns[pkIdx]!
    pkColumn.hide = false
    pkColumn.wrap = false
    layoutColumns.splice(pkIdx, 1)
    layoutColumns.splice(0, 0, pkColumn)
  }
  return {
    id: layoutSimple.id ?? `iw-layout-${getRandomString(12)}`,
    title: layoutSimple.title,
    layoutKind: layoutSimple.layoutKind ?? LayoutKind.LIST,
    icon: layoutSimple.icon ?? getDefaultIconByLayoutKind(layoutSimple.layoutKind ?? LayoutKind.LIST),
    columns: layoutColumns,
    ...generateCommonFunctionProps(tableSimple, layoutSimple),
  }
}

/**
 * 布局列属性
 *
 * Layout column props
 */
export interface LayoutColumnProps extends CommonColumnProps {
}
/**
 * 简单布局列属性
 *
 * Simple layout column props
 */
export type SimpleLayoutColumnProps = ChangeOptionalExcept<LayoutColumnProps, 'name'>
/**
 * 生成布局列属性
 *
 * Generate layout column props
 *
 * @param layoutSimple 简单布局列属性 / Simple layout column props
 * @param tableSimple 表格简单列属性 / Table simple column props
 * @returns 布局列属性 / Layout column props
 */
function generateLayoutColumnProps(layoutSimple: SimpleLayoutColumnProps, tableSimple: CommonColumnProps): LayoutColumnProps {
  return {
    ...generateCommonColumnProps(tableSimple, layoutSimple),
  }
}

/**
 * 布局修改属性
 *
 * Layout modify props
 */
export interface LayoutModifyProps extends Partial<CommonFunctionProps> {
  /**
   * 标题
   *
   * Title
   */
  title?: string
  /**
   * 图标（来自内部图标库）
   *
   * Icon (from internal icon library)
   */
  icon?: string

  /**
   * 变更的列
   *
   * Changed column
   */
  changedColumn?: LayoutColumnProps
}
