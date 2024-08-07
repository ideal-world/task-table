/**
 * @fileoverview 事件属性 / Event props
 */

import type { DataGroupResp, DataResp, DictItemsResp } from './basicProps'
import type { AlertKind, LayoutKind } from './enumProps'
import type { AggDataProps, ContextMenuItemProps, DataQuerySliceReq, EditableDataResp, FilterDataProps, GroupDataProps, SortDataProps } from './functionProps'
import type { LayoutModifyProps, LayoutProps, TableStyleModifyProps } from './kernelProps'

/**
 * 表格事件属性
 *
 * Table event props
 *
 * 此处定义了表格的各类需要外部实现的事件。
 *
 * Here defines various events of the table that need to be implemented externally.
 */
export interface TableEventProps {
  /**
   * 加载数据
   *
   * Load data
   *
   * @param quickSearchContent 快速搜索内容(需要启用 {@link TableProps#quickSearch}) / Quick search content(Need to enable {@link TableProps#quickSearch})
   * @param filter 过滤(需要启用 {@link TableProps#filter}) / Filter(Need to enable {@link TableProps#filter})
   * @param sort 排序(需要启用 {@link TableProps#sort}) / Sorts(Need to enable {@link TableProps#sort})
   * @param group 分组(需要启用 {@link TableProps#group}) / Group(Need to enable {@link TableProps#group})
   * @param agg 聚合(需要启用 {@link TableProps#agg}) / Agg(Need to enable {@link TableProps#agg})
   * @param hideSubData 是否隐藏子数据 / Whether to hide sub-data
   * @param byGroupValue 分组值，当分组及分组值存在时仅加载对应分组值的数据 / Group value, when group and group value exist, only load the data of the corresponding group value
   * @param slice 分片 / Slice
   * @param returnColumnNames 返回的列名 / Returned column names
   * @param returnOnlyAgg 仅返回聚合数据 / Only return aggregated data
   * @returns 数据或分组数据 / Data or grouped data
   */
  loadData: (
    quickSearchContent?: string,
    filter?: FilterDataProps,
    sort?: SortDataProps,
    group?: GroupDataProps,
    agg?: AggDataProps,
    hideSubData?: boolean,
    byGroupValue?: any,
    slice?: DataQuerySliceReq,
    returnColumnNames?: string[],
    returnOnlyAgg?: boolean) => Promise<DataResp | DataGroupResp[]>

  /**
   * 新建数据
   *
   * Create new data
   *
   * @param newRecords 要新建的数据 / Records to be created
   */
  newData?: (newRecords: { [columnName: string]: any }[]) => Promise<void>

  /**
   * 复制数据
   *
   * Copy data
   *
   * @param targetRecordPks 要复制的数据主键 / Data primary keys to be copied
   */
  copyData?: (targetRecordPks: any[]) => Promise<void>

  /**
   * 修改数据
   *
   * Modify data
   *
   * @param changedRecords 要修改的数据 / Data to be modified
   */
  modifyData?: (changedRecords: { [columnName: string]: any }[]) => Promise<void>

  /**
   * 删除数据
   *
   * Delete data
   *
   * NOTE: 删除数据时，需要同时删除子数据 / When deleting data, you need to delete sub-data at the same time
   *
   * @param deletedRecordPks 要删除的数据主键 / Data primary keys to be deleted
   */
  deleteData?: (deletedRecordPks: any[]) => Promise<void>

  /**
   * 加载可编辑数据
   *
   * Load editable data
   *
   * @param checkRecordPks 要检查的数据主键 / Data primary keys to be checked
   */
  loadEditableData?: (checkRecordPks: any[]) => Promise<EditableDataResp>

  /**
   * 选择数据
   *
   * Select data
   *
   * @param selectedRecordPks 选择的数据主键 / Selected data primary keys
   */
  selectData?: (selectedRecordPks: any[]) => Promise<void>

  /**
   * 点击单元格
   *
   * Click cell
   *
   * @param clickedRecordPk 点击的数据主键 / Clicked data primary key
   * @param clickedColumnName 点击的列名 / Clicked column name
   * @param byLayoutId 所在布局ID / Layout ID
   * @param byLayoutKind 所在布局类型 / Layout kind
   */
  clickCell?: (clickedRecordPk: any, clickedColumnName: string, byLayoutId: string, byLayoutKind: LayoutKind) => Promise<void>

  /**
   * 加载字典项列表
   *
   * Load dictionary item list
   *
   * @param dictName 字典名 / Dictionary name
   * @param filterValue 过滤值 / Filter value
   * @param slice 分片 / Slice
   * @returns 字典项列表 / Dictionary item list
   */
  loadDictItems?: (dictName: string, filterValue?: any, slice?: DataQuerySliceReq) => Promise<DictItemsResp>

  /**
   * 加载多条件字典项列表
   *
   * Load multi-condition dictionary item list
   *
   * @param conds 条件 / Conditions
   * @param slice 分片 / Slice
   * @returns 字典项列表 / Dictionary item list
   */
  loadDictItemsWithMultiConds?: (conds: { [dictName: string]: any[] }, slice?: DataQuerySliceReq) => Promise<{ [dictName: string]: DictItemsResp }>

  /**
   * 修改样式
   *
   * Modify style
   *
   * @param changedStyleProps 修改的样式属性 / Modified style properties
   */
  modifyStyles?: (changedStyleProps: TableStyleModifyProps) => Promise<void>

  /**
   * 新建布局
   *
   * Create new layout
   *
   * @param newLayoutProps 新建布局属性 / New layout properties
   * @returns 新建布局ID / New layout ID
   */
  newLayout?: (newLayoutProps: LayoutProps) => Promise<string>

  /**
   * 修改布局
   *
   * Modify layout
   *
   * @param changedLayoutId 修改的布局ID / Changed layout ID
   * @param changedLayoutProps 修改的布局属性 / Changed layout properties
   */
  modifyLayout?: (changedLayoutId: string, changedLayoutProps: LayoutModifyProps) => Promise<void>

  /**
   * 删除布局
   *
   * Delete layout
   *
   * @param deletedLayoutId 删除的布局ID / Deleted layout ID
   */
  deleteLayout?: (deletedLayoutId: string) => Promise<void>

  /**
   * 加载假日列表
   *
   * Load holidays
   *
   * @param startTime 开始时间 / Start time
   * @param endTime 结束时间 / End time
   * @returns 假日列表 / Holidays
   */
  loadHolidays?: (startTime: Date, endTime: Date) => Promise<Date[]>

  /**
   * 自定义警告处理
   *
   * Custom alert handling
   *
   * @param errorKind 警告类型 / Alert kind
   * @param message 警告消息 / Alert message
   */
  handleAlert?: (alertKind: AlertKind, message: string) => void

  /**
   * 选择上下文菜单
   *
   * Select content menu
   *
   * @param item 上下文菜单项 / Context menu item
   *
   * @param rowPk 列表行主键 / Row PK
   */
  selectContextMenu?: (item: ContextMenuItemProps, exArg?: any) => void
}
