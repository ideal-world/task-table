<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import * as iconSvg from '../../assets/icon'
import type { DictItemProps, DictItemsResp, DictTreeItemProps, FilterDataGroupProps, FilterDataItemProps, FilterDataProps, LayoutModifyProps } from '../../props'
import { DataKind, DictKind, OperatorKind, translateOperatorKind } from '../../props'

import { AlertKind, DictTrigger, getInputTypeByDataKind, getOperatorKindsByDataKind } from '../../props/enumProps'
import { groupBy, isNotEmpty } from '../../utils/basic'
import { MenuOffsetKind, MenuSizeKind } from '../common/Menu'
import MenuComp from '../common/Menu.vue'
import type { ColumnConf } from '../conf'
import * as eb from '../eventbus'
import { deepToRaw } from '../../utils/vueHelper'
import MenuSelectComp from '../base/MenuSelect/index.vue'
import MenuTreeComp from '../base/MenuTree/index.vue'
import MInput from '../base/MInput/index.vue'
import Badge from '../common/Badge.vue'
import { AlertLevel } from '../common/Alert'
import { getChildrenDataIncludeSelf } from './FilterSetting'

const props = defineProps<{
  // 布局ID
  // Layout ID
  layoutId: string
  // 过滤配置
  // Filter configuration
  filter: FilterDataProps
  // 可能涉及的列配置
  // Possible column configuration
  columnsConf: ColumnConf[]
}>()

// 显示过滤组
// show filter
const showFilter = ref<boolean>(false)
// 过滤组容器组件引用
// Filter group container component reference
const filterGroupContainerCompRef = ref<InstanceType<typeof MenuComp>>()
// 过滤列容器组件引用
// Filter column container component reference
const filterColumnCompRef = ref<InstanceType<typeof MenuComp>>()
// 过滤操作容器组件引用
// Filter operation container component reference
const filterOpCompRef = ref<InstanceType<typeof MenuComp>>()
// 字典容器组件引用
// Dictionary container component reference
const dictContainerCompRef = ref<InstanceType<typeof MenuComp>>()
// tree字典容器组件引用
// Dictionary container component reference
const dictTreeContainerCompRef = ref<InstanceType<typeof MenuComp>>()
// 查询字典项响应
// Query dictionary item response
const queryDictItemsResp = ref<DictItemsResp>()

// 过滤组容器元素（菜单中的根元素）
// Filter group container element(root element in the menu)
let filterGroupContainerEle: HTMLElement

// 字典值输入框引用
// Dictionary value input box reference
const MInputRef = ref<InstanceType<typeof MInput>[]>()

// 过滤项
// Filter item
interface FilterItemProps {
  columnName: string
  operator: OperatorKind
  disable?: boolean
  // 无论真实的值是否是数组，都用数组存储
  // Whether the real value is an array or not, it is stored in an array
  values: any[]
  icon: string
  title: string
  dataKind: DataKind
  useDict: boolean
  multiValue: boolean
  fixedDictItems?: DictItemProps[]
  dictKind?: DictKind
  kindDateTimeFormat?: string
  fixedOperationItems?: OperatorKind[]
}
// 已选中的过滤组ID，在显示过滤组容器时设置
// Selected filter group ID, set when showing the filter group container
const selectedFilterGroupIdx = ref<number | undefined>()
// 已选中的过滤项
// Selected filter items
const selectedFilterItems = ref<FilterItemProps[] | undefined>()
// 已选中的过滤项ID，在选择过滤项时设置
// Selected filter item ID, set when selecting filter item
const selectedFilterItemIdx = ref<number | undefined>()
// 所有过滤组中已选中的字典项，格式：列名 + '-' + 列值 -> 字典项
// Dictionary items selected in all filter groups, format: column name + '-' + column value -> dictionary item
const cachedAllSelectedDictItems = ref<{ [key: string | number]: DictItemProps }>({})
// 可过滤的列
// Filterable columns
const filterColumnOptions = computed(() => props.columnsConf.filter(col => props.filter.enabledColumnNames.includes(col.name)).map((e) => {
  return {
    ...e,
    value: e.name,
  }
}))
// 选中过滤单项
// Selected filter item
const selectedFilterItem = computed(() => selectedFilterItems.value?.[selectedFilterItemIdx.value!])

// 操作符 operator
const operatorOptions = computed(() => {
  return getOperatorKindsByDataKind(selectedFilterItem.value).map((e) => {
    return {
      title: translateOperatorKind(e),
      value: e,
    }
  })
})
/**
 * 将过滤数据项转换为过滤项
 *
 * Convert filter data items to filter items
 *
 * @param filterDataItem 过滤数据项 / Filter data items
 * @returns 过滤项 / Filter items
 */
function convertFilterDataItemToFilterItem(filterDataItem: FilterDataItemProps): FilterItemProps {
  const columnConf = props.columnsConf.find(col => col.name === filterDataItem.columnName)!
  return {
    columnName: filterDataItem.columnName,
    operator: filterDataItem.operator,
    disable: filterDataItem.disable,
    values: isNotEmpty(filterDataItem.value) ? Array.isArray(filterDataItem.value) ? filterDataItem.value : [filterDataItem.value] : [],
    icon: columnConf.icon,
    title: columnConf.title,
    dataKind: columnConf.dataKind,
    useDict: columnConf.useDict,
    fixedDictItems: columnConf.fixedDictItems,
    dictKind: columnConf.dictKind,
    multiValue: columnConf.multiValue,
    kindDateTimeFormat: columnConf.kindDateTimeFormat,
    fixedOperationItems: columnConf.fixedOperationItems,
  }
}

/**
 * 从过滤项中添加字典项
 *
 * Add dictionary items from filter items
 *
 * @param filterItems 过滤项 / Filter items
 */
async function addDictItemsByFilterItems(filterItems: FilterItemProps[]) {
  // 获取按字典名分组的过滤项
  // Get the filter items grouped by dictionary name
  const groupedFilterItems: { [key: string]: FilterItemProps[] } = groupBy(
    filterItems.filter(item => item.useDict && item.values !== undefined),
    (item) => { return item.columnName },
  )
  // 组装查询条件
  // Assemble query conditions
  const queryConds: { [key: string]: any[] } = Object.fromEntries(Object.entries(groupedFilterItems).map(
    ([columnName, items]) => [
      // 字典名
      // Dictionary name
      columnName,
      // 字典值
      // Dictionary value
      items.map(item => item.values!)
        // 打平、去重
        // Flatten and deduplicate
        .flat().filter((value, idx, arr) => arr.indexOf(value) === idx),
    ],
  ))
  const dictItemResp = await eb.loadCellDictItemsWithMultiConds(queryConds, {
    offsetNumber: 0,
    fetchNumber: Math.max(...Object.entries(queryConds).map(([_, values]) => values.length)),
  })
  // 设置字典项
  // Set dictionary items
  Object.entries(dictItemResp).forEach(([columnName, resp]) => {
    resp.records.forEach((dictItem) => {
      cachedAllSelectedDictItems.value[`${columnName}-${dictItem.value}`] = dictItem as any
    })
  })
}

/**
 * 显示过滤组容器
 *
 * Show filter group container
 *
 * @param e 事件 / Event
 * @param filterGroupIdx 过滤组ID / Filter group ID
 */
const newActiveButton = ref<boolean>(false)
async function showFilterGroupContainer(e: Event, filterGroupIdx?: number) {
  // 初始化，设置已选中的过滤组ID，清空已选中的过滤项ID
  // Initialize, set the selected filter group ID, and clear the selected filter item ID
  selectedFilterGroupIdx.value = filterGroupIdx
  selectedFilterItemIdx.value = undefined
  const targetEle = e.target as HTMLElement
  if (filterGroupIdx !== undefined) {
    // 存在过滤组，显示的是已有的过滤组，
    // There is a filter group, showing the existing filter group

    // 设置已选中的过滤项
    // Set the selected filter item
    const filterItems = deepToRaw(props.filter.groups[filterGroupIdx].items)
    selectedFilterItems.value = filterItems.map((item: FilterDataItemProps) => {
      return convertFilterDataItemToFilterItem(item)
    })
    // 设置已选中的字典项
    // Set the selected dictionary items
    addDictItemsByFilterItems(selectedFilterItems.value)
  }
  else {
    // 不存在过滤组，显示的是新建过滤组
    // There is no filter group, showing the new filter group
    selectedFilterItems.value = []
    newActiveButton.value = true
  }
  // 显示过滤组容器
  // Show filter group container
  filterGroupContainerCompRef.value?.show(targetEle, undefined, {
    width: 350,
    height: 150,
  }, false, targetEle.closest('.iw-tt') as HTMLElement)
}

/**
 * 删除过滤组
 *
 * Delete filter group
 *
 * @param filterGroupIdx 过滤组ID / Filter group ID
 */
async function deleteFilterGroup(filterGroupIdx: number) {
  const filter = deepToRaw(props.filter!)
  filter.groups.splice(filterGroupIdx, 1)
  await eb.modifyLayout({
    filter,
  })
}

/**
 * 尝试解析字典项
 *
 * Try to parse dictionary items
 *
 * 如果存在字典项，则解析字典项，否则返回原值。
 *
 * If there are dictionary items, parse the dictionary items, otherwise return the original value.
 *
 * @param columnName 列名 / Column name
 * @param value 值 / Value
 * @returns 解析后的值 / Parsed value
 */
function tryParseDictItems(columnName: string, value?: any): any | DictItemProps[] {
  if (value === undefined) {
    return ''
  }
  if (Array.isArray(value)) {
    return value.map(val => cachedAllSelectedDictItems.value[`${columnName}-${val}`] ?? val)
  }
  else {
    return [cachedAllSelectedDictItems.value[`${columnName}-${value}`] ?? value]
  }
}

/**
 * 显示过滤列容器
 *
 * Show filter column container
 *
 * @param e 事件 / Event
 * @param filterItemIdx 过滤项ID / Filter item ID
 */
function showFilterColumns(e: Event, filterItemIdx?: number) {
  // 设置已选中的过滤项ID
  // Set the selected filter item ID
  selectedFilterItemIdx.value = filterItemIdx
  filterColumnCompRef.value?.show((e.target as HTMLElement).closest('.iw-btn') as HTMLElement, MenuOffsetKind.LEFT_TOP, undefined, true)
}

/**
 * 显示过滤操作容器
 *
 * Show filter operation container
 *
 * @param e 事件 / Event
 * @param filterItemIdx 过滤项ID / Filter item ID
 */
function showFilterOps(e: Event, filterItemIdx: number) {
  // 设置已选中的过滤项ID
  // Set the selected filter item ID
  selectedFilterItemIdx.value = filterItemIdx
  const targetEle = (e.target as HTMLElement).closest('.iw-btn')
  filterOpCompRef.value?.show(targetEle as HTMLElement, undefined, MenuSizeKind.MINI, true)
}

/**
 * 删除过滤项
 *
 * Delete filter item
 *
 * @param filterItemIdx 过滤项ID / Filter item ID
 */
async function deleteFilterItem(filterItemIdx: number) {
  selectedFilterItems.value?.splice(filterItemIdx, 1)
}
/**
 * 启用、禁用过滤项
 *
 * Delete filter item
 *
 * @param filterItemIdx 过滤项ID / Filter item ID
 */
async function disableFilterItem(filterItemIdx: number) {
  const currFilterItem = selectedFilterItems.value?.[filterItemIdx]
  if (!currFilterItem)
    return
  if ((!currFilterItem?.values?.length && ![OperatorKind.IS_EMPTY, OperatorKind.NOT_EMPTY].includes(currFilterItem.operator))) {
    eb.handleAlert(AlertKind.EVENT_INVOKE_ERROR, '请先填写数据', AlertLevel.WARNING, 1)
    return
  }

  currFilterItem.disable = !currFilterItem.disable
}

/**
 * 设置过滤列
 *
 * Set filter column
 *
 * @param e 事件 / Event
 */
function setFilterColumn(e: Event) {
  if (!(e.target instanceof HTMLElement)) {
    return
  }
  const itemEle = e.target.closest('.iw-contextmenu__item')
  if (!itemEle || !(itemEle instanceof HTMLElement)) {
    return
  }
  const currColumnName = itemEle.dataset.value!
  const columnConf = props.columnsConf.find(col => col.name === currColumnName)!
  const operatorKinds = getOperatorKindsByDataKind(columnConf)
  if (selectedFilterItemIdx.value !== undefined) {
    // 存在已选中的过滤项，重置过滤项到初始状态
    // There is a selected filter item, reset the filter item to the initial state
    const currFilterItem = selectedFilterItems.value?.[selectedFilterItemIdx.value]
    if (currFilterItem!.columnName === currColumnName) {
      return
    }
    currFilterItem!.columnName = currColumnName
    currFilterItem!.operator = operatorKinds[0]
    currFilterItem!.disable = false
    currFilterItem!.values = []
    currFilterItem!.icon = columnConf.icon
    currFilterItem!.title = columnConf.title
    currFilterItem!.dataKind = columnConf.dataKind
    currFilterItem!.useDict = columnConf.useDict
    currFilterItem!.dictKind = columnConf.dictKind
    currFilterItem!.fixedDictItems = columnConf.fixedDictItems
    currFilterItem!.multiValue = columnConf.multiValue
    currFilterItem!.kindDateTimeFormat = columnConf.kindDateTimeFormat
    currFilterItem!.fixedOperationItems = columnConf.fixedOperationItems
  }
  else {
    // 不存在已选中的过滤项，添加新的过滤项
    // There is no selected filter item, add a new filter item
    selectedFilterItems.value?.push({
      columnName: currColumnName,
      operator: operatorKinds[0],
      disable: false,
      values: [],
      icon: columnConf.icon,
      title: columnConf.title,
      dataKind: columnConf.dataKind,
      useDict: columnConf.useDict,
      dictKind: columnConf.dictKind,
      fixedDictItems: columnConf.fixedDictItems,
      multiValue: columnConf.multiValue,
      kindDateTimeFormat: columnConf.kindDateTimeFormat,
      fixedOperationItems: columnConf.fixedOperationItems,
    })
  }
  filterColumnCompRef.value?.close()
}

/**
 * 设置过滤操作符
 *
 * Set filter operator
 *
 * @param e 事件 / Event
 */
function setFilterOp(e: Event) {
  if (!(e.target instanceof HTMLElement)) {
    return
  }
  const targetEle = e.target!.closest('.iw-contextmenu__item')
  if (!targetEle || !(targetEle instanceof HTMLElement)) {
    return
  }
  const selectedOp = targetEle!.dataset!.value as OperatorKind
  const currFilterItem = selectedFilterItems.value?.[selectedFilterItemIdx.value!]
  currFilterItem!.operator = selectedOp
  // 重置值
  // Reset value
  currFilterItem!.values = []
  filterOpCompRef.value?.close()
}

/**
 * 设置单个的过滤值
 *
 * Set a single filter value
 *
 * @param value 值 / Value
 * @param filterItemIdx 过滤项ID / Filter item ID
 */
function setFilterAValue(value: any, filterItemIdx: number) {
  const currFilterItem = selectedFilterItems.value?.[filterItemIdx]
  if (currFilterItem?.values.includes(value)) {
    // 已存在，移除
    // Already exists, remove
    currFilterItem.values = currFilterItem.values.filter(val => val !== value)
  }
  else {
    // 不存在，添加
    // Does not exist, add
    // currFilterItem!.values = [...currFilterItem!.values, value]
    let dealValue = value

    if (currFilterItem && [DataKind.DATE, DataKind.DATETIME].includes(currFilterItem.dataKind)) {
      // dealValue = currFilterItem?.kindDateTimeFormat ? dayjs(value).format(currFilterItem?.kindDateTimeFormat.replace('yyyy-MM-dd', 'YYYY-MM-DD')) : value
      dealValue = dayjs(value).format(currFilterItem.dataKind === DataKind.DATETIME ? 'YYYY-MM-DDTHH:mm:ss' : 'YYYY-MM-DD')
    }
    if (currFilterItem?.operator === OperatorKind.IN || currFilterItem?.operator === OperatorKind.NOT_IN) {
      currFilterItem!.values = [...currFilterItem!.values, dealValue]
    }
    else {
      currFilterItem!.values = [dealValue]
    }
  }
  if (filterGroupContainerEle) {
    // 清空输入框
    // Clear the input box
    const inputEle = filterGroupContainerEle.querySelector(`input[data-value-input-idx='${filterItemIdx}']`)
    if (inputEle) {
      (inputEle as HTMLInputElement).value = ''
    }
  }
}

/**
 * 删除单个值
 *
 * Delete a single value
 *
 * @param filterItemIdx 过滤项ID / Filter item ID
 * @param valueIdx 值索引ID / Value index ID
 */
function deleteAValue(filterItemIdx: number, valueIdx: number) {
  // eslint-disable-next-line ts/no-unused-expressions
  selectedFilterItems.value?.[filterItemIdx] && selectedFilterItems.value[filterItemIdx].values.splice(valueIdx, 1)
}

/**
 * 显示字典项选择容器
 *
 * Show dictionary item selection container
 *
 * @param value 字典值 / Dictionary value
 * @param filterItemIdx 过滤项ID / Filter item ID
 * @param e 事件 / Event
 */
const filterValue = ref<string>()
async function showDictItems(value: any, filterItemIdx: number, e: Event) {
  let containerRef: any = null
  if (containerRef?.isShow && containerRef?.isShow())
    return
  selectedFilterItemIdx.value = filterItemIdx
  const currFilterItem = selectedFilterItems.value?.[filterItemIdx]
  filterValue.value = value
  queryDictItemsResp.value = await eb.loadCellDictItems(currFilterItem!.columnName, value, {
    offsetNumber: 0,
    fetchNumber: 20,
  }, DictTrigger.FILTER)
  /**
   * 根据dictKind判断显示menu
   */
  const dictKind = currFilterItem?.dictKind
  containerRef = dictContainerCompRef.value
  if (dictKind === DictKind.TREE_SELECT) {
    containerRef = dictTreeContainerCompRef.value
  }
  const labelEle = (e.target as HTMLElement).closest('.value-input')
  containerRef?.show(labelEle as HTMLElement, MenuOffsetKind.LEFT_TOP, undefined, true)
}

/**
 * 设置字典项值
 *
 * Set dictionary item value
 *
 * @param e 事件 / Event
 */
function setFilterADictValue(e: Event) {
  if (!(e.target instanceof HTMLElement)) {
    return
  }
  if (e.target.closest('.icon-tree-arrow')) {
    return
  }
  const itemEle = e.target.closest('.iw-contextmenu__item')
  if (!itemEle || !(itemEle instanceof HTMLElement)) {
    return
  }
  const dictItemValue = itemEle.dataset.value!
  if (selectedFilterItem.value?.dictKind !== DictKind.TREE_SELECT || ![OperatorKind.IN, OperatorKind.NOT_IN].includes(selectedFilterItem.value.operator)) {
    setFilterAValue(dictItemValue, selectedFilterItemIdx.value!)
    cachedAllSelectedDictItems.value[`${`${selectedFilterItem.value?.columnName}-${dictItemValue}`}`] = {
      title: itemEle.dataset.title!,
      value: dictItemValue!,
      avatar: itemEle.dataset.avatar,
      color: itemEle.dataset.color,
    }
  }
  else { // tree select need choose child data
    const childrenData = getChildrenDataIncludeSelf(queryDictItemsResp.value?.records as DictTreeItemProps[], dictItemValue)
    if (!childrenData || !childrenData.length)
      return
    const isAlreadyClickItem = selectedFilterItem.value.values.includes(dictItemValue)
    childrenData.forEach((item) => {
      const isAlreadyChild = selectedFilterItem.value?.values.includes(item.value)
      if (isAlreadyClickItem) { // 之前已经选中，全部取消
        if (isAlreadyChild) {
          setFilterAValue(item.value, selectedFilterItemIdx.value!)
        }
      }
      else { // 之前没有选中，全部选上
        if (!isAlreadyChild) {
          cachedAllSelectedDictItems.value[`${`${selectedFilterItem.value?.columnName}-${item.value}`}`] = {
            title: item.title,
            value: item.value,
            avatar: item.avatar,
            color: item.color,
          }
          setFilterAValue(item.value, selectedFilterItemIdx.value!)
        }
      }
    })
  }
  if (selectedFilterItem.value?.operator !== OperatorKind.IN && selectedFilterItem.value?.operator !== OperatorKind.NOT_IN) {
    const dictKind = selectedFilterItem.value?.dictKind
    let containerRef = dictContainerCompRef.value
    if (dictKind === DictKind.TREE_SELECT) {
      containerRef = dictTreeContainerCompRef.value
    }
    containerRef?.close()
  }
}

/**
 * 保存过滤组
 *
 * Save filter group
 */
async function saveFilterGroup() {
  if (selectedFilterItems.value?.length === 0) {
    if (selectedFilterGroupIdx.value !== undefined) {
      deleteFilterGroup(selectedFilterGroupIdx.value)
      // filterGroupContainerCompRef.value?.close()
    }
    return
  }
  // 组装当前过滤组
  // Assemble the current filter group
  const currFilterGroup: FilterDataGroupProps = {
    items: selectedFilterItems.value?.filter(item =>
      item.operator === OperatorKind.IS_EMPTY || item.operator === OperatorKind.NOT_EMPTY || item.values.length > 0,
    ).map((item) => {
      const actualValue = item.operator === OperatorKind.IS_EMPTY || item.operator === OperatorKind.NOT_EMPTY
        ? undefined
        : item.operator === OperatorKind.IN || item.operator === OperatorKind.NOT_IN
          ? item.values
          : item.values[0]
      return {
        columnName: item.columnName,
        operator: item.operator,
        disable: item.disable,
        value: actualValue,
      }
    }) ?? [],
  }
  if (currFilterGroup.items.length === 0) {
    return
  }
  const filterGroups = deepToRaw(props.filter.groups)
  if (selectedFilterGroupIdx.value === undefined) {
    filterGroups.push(currFilterGroup)
  }
  else {
    filterGroups[selectedFilterGroupIdx.value] = currFilterGroup
  }
  const layout: LayoutModifyProps = {
    filter: {
      enabledColumnNames: props.filter.enabledColumnNames,
      groups: filterGroups,
    },
  }
  await eb.modifyLayout(layout)
  // filterGroupContainerCompRef.value?.close()
}

async function initDictItemsByFilterGroups(filterGroups: FilterDataGroupProps[]) {
  if (filterGroups.length === 0) {
    return
  }
  const filterItems = filterGroups.map(filterGroup => filterGroup.items).flat().map((filterItem) => {
    return convertFilterDataItemToFilterItem(filterItem)
  })
  await addDictItemsByFilterItems(filterItems)
}

onMounted(async () => {
  filterGroupContainerCompRef.value?.onInit(async (menuEle: HTMLElement) => {
    filterGroupContainerEle = menuEle
  })
  filterGroupContainerCompRef.value?.onClose(async (_) => {
    // resetData()
    // newActiveButton.value = false
    const isChange = selectedFilterGroupIdx.value !== undefined ? isNotEqual(props.filter.groups[selectedFilterGroupIdx.value].items, selectedFilterItems.value as FilterItemProps[]) : true
    if (isChange) {
      // 关闭时保存过滤组
    // Save filter group when closing
      await saveFilterGroup()
    }

    resetData()
  })
  // 初始化字典项
  // Initialize dictionary items
  await initDictItemsByFilterGroups(props.filter.groups)
  showFilter.value = true
})

function resetData() {
  newActiveButton.value = false
  // 清空输入框
  // Clear the input box
  const MInputs = MInputRef.value
  if (MInputs) {
    MInputs.forEach((input) => {
      input.clearInput()
    })
  }
  filterValue.value = ''
  selectedFilterGroupIdx.value = undefined
  selectedFilterItemIdx.value = undefined
}
// 比较筛选项编辑前后值
// Compare the values before and after editing the filter items
function isNotEqual(originGroup: FilterDataItemProps[], editGroup: FilterItemProps[]) {
  if (!Array.isArray(originGroup) || !Array.isArray(editGroup))
    return false
  if (originGroup.length !== editGroup.length)
    return true
  for (let i = 0; i < originGroup.length; i++) {
    const compare1Item = originGroup[i]
    const compare2Item = editGroup.find(item => item.columnName === compare1Item.columnName)
    if (JSON.stringify(isNotEmpty(compare1Item.value) ? Array.isArray(compare1Item.value) ? compare1Item.value : [compare1Item.value] : []) !== JSON.stringify(compare2Item?.values)
      || compare1Item.disable !== compare2Item?.disable
      || compare1Item.operator !== compare2Item?.operator) {
      return true
    }
  }
  return false
}

// 设置标志位等待输入完成
// Set singal waiting input done
const isComposing = ref<boolean>(false)
function onCompositionstart() {
  isComposing.value = true
}
function onCompositionend(e: Event, filterItemIdx: number) {
  isComposing.value = false
  handleFilterInput(e, filterItemIdx)
}

function handleFilterInput(e: Event, filterItemIdx: number) {
  if (!isComposing.value)
    setFilterAValue((e.target as HTMLInputElement).value, filterItemIdx)
}
</script>

<template>
  <div>
    <div v-if="showFilter" class="flex items-center text-nowrap">
      <!-- 显示已保存的过滤组 -->
      <!-- Display saved filter groups -->
      <div
        v-for="(filterGroup, filterGroupIdx) in props.filter.groups" :key="`${props.layoutId}-${filterGroupIdx}`"
        class="button-box w-max flex items-center mr-3"
      >
        <button class="iw-btn iw-btn-sm rounded-sm flex-none h-[28px] min-h-[28px]">
          <span class="flex items-center" @click="e => showFilterGroupContainer(e, filterGroupIdx)">
            <template v-if="filterGroup.items.length === 1 && !filterGroup.items[0].disable">
              <!-- 只有一个过滤项时显示详情 -->
              <!-- Show details when there is only one filter item -->
              <span class="mr-0.5">{{ props.columnsConf.find(col => col.name === filterGroup.items[0].columnName)?.title }}</span>
              <span class="mr-0.5 p-1 bg-gray-200 rounded-sm text-gray-500">{{ translateOperatorKind(filterGroup.items[0].operator) }}</span>
              <span class="mr-0.5 max-w-[100px] whitespace-nowrap overflow-hidden text-ellipsis">
                <template v-for="(dictItemOrRawValue, valueIdx) in tryParseDictItems(filterGroup.items[0].columnName, filterGroup.items[0].value)">
                  <Badge
                    v-if="dictItemOrRawValue"
                    :key="`${filterGroup.items[0].columnName}-${valueIdx}`" readonly :option="dictItemOrRawValue"
                    :style="`background-color: ${dictItemOrRawValue.color ?? ''}`" class="iw-badge"
                  />
                </template>
              </span>
            </template>
            <template v-else>
              <!-- 多个过滤项时显示数量 -->
              <!-- Show quantity when there are multiple filter items -->
              <span class="mr-0.5">{{ filterGroup.items.filter(item => !item.disable).length }}</span>
              {{ $t('function.filter.items') }}
            </template>
          </span>
          <i
            :class="`${iconSvg.DELETE} hover:text-secondary hover:font-bold`"
            @click="deleteFilterGroup(filterGroupIdx)"
          />
        </button>
        <span
          v-if="props.filter.groups.length > 0 && filterGroupIdx !== props.filter.groups.length - 1"
          class="text-gray-400 pl-3"
        >或
        </span>
      </div>

      <div class="self-center cursor-pointer p-1 rounded-sm hover:text-gray-500" :class="[{ 'iw-active-button': newActiveButton }]" @click="showFilterGroupContainer">
        <i :class="iconSvg.NEW" />
        <span>{{ $t('function.filter.new') }}</span>
      </div>
    </div>
    <!-- 过滤组容器 -->
    <!-- Filter group container -->
    <MenuComp ref="filterGroupContainerCompRef" class="p-2 pb-6">
      <!-- 显示已选中的过滤项 -->
      <!-- Display selected filter items -->
      <div
        v-for="(filterItem, filterItemIdx) in selectedFilterItems"
        :key="`${layoutId}-${selectedFilterGroupIdx}-${filterItemIdx}`"
        class="iw-contextmenu__item p-1 flex items-center w-full"
      >
        <!-- 列名 -->
        <!-- Column name -->
        <button
          class="iw-btn border-gray-200 bg-white iw-btn-xs rounded mr-1 w-[135px] h-[30px]"
          :disabled="filterItem.disable"
          :title="filterItem.title" @click="e => { showFilterColumns(e, filterItemIdx) }"
        >
          <i :class="filterItem.icon" />
          <span class="mr-0.5 w-[72px] overflow-hidden text-ellipsis whitespace-nowrap text-left">{{ filterItem.title }}</span>
          <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
        </button>
        <!-- 操作符 -->
        <!-- Operator -->
        <button
          class="iw-btn border-gray-200 bg-white iw-btn-xs rounded mr-1 h-[30px]"
          :disabled="filterItem.disable"
          :title="translateOperatorKind(filterItem.operator)"
          @click="e => { showFilterOps(e, filterItemIdx) }"
        >
          <span class="mr-0.5 w-[38px] overflow-hidden text-ellipsis whitespace-nowrap">{{
            translateOperatorKind(filterItem.operator) }}</span>
          <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
        </button>
        <!-- 值 -->
        <!-- Value -->
        <div v-if="filterItem.operator !== OperatorKind.IS_EMPTY && filterItem.operator !== OperatorKind.NOT_EMPTY" class="w-[240px] h-[30px]">
          <!-- 单值且不是字典的值的处理 -->
          <!-- Processing of single value and non-dictionary values -->
          <!-- <input
          v-if="filterItem.operator !== OperatorKind.IN && filterItem.operator !== OperatorKind.NOT_IN && !filterItem.useDict"
          class="iw-input iw-input-bordered iw-input-xs rounded-sm w-[240px] h-[30px]" :type="getInputTypeByDataKind(filterItem.dataKind)"
          :value="filterItem.values"
          @change="e => { setFilterAValue((e.target as HTMLInputElement).value, filterItemIdx) }"
        > -->
          <input
            v-if="!filterItem.useDict"
            class="iw-input iw-input-bordered iw-input-xs rounded w-full h-full" step="1" :type="getInputTypeByDataKind(filterItem.dataKind)"
            :disabled="filterItem.disable"
            :value="filterItem.values"
            @input="e => handleFilterInput(e, filterItemIdx)"
            @compositionstart="onCompositionstart"
            @compositionend="e => onCompositionend(e, filterItemIdx)"
          >
          <!-- <input
            v-if="!filterItem.useDict"
            v-model="filterItem.values" class="iw-input iw-input-bordered iw-input-xs rounded w-full h-full" step="1"
            :type="getInputTypeByDataKind(filterItem.dataKind)"
            :disabled="filterItem.disable"
          > -->
          <MInput
            v-else ref="MInputRef"
            :disabled="filterItem.disable"
            :filter-item="filterItem" :filter-item-idx="filterItemIdx"
            :options="tryParseDictItems(filterItem.columnName, filterItem.values)"
            :show-dict-items="showDictItems"
            :delete-a-value="deleteAValue"
          />
        </div>
        <button
          v-if="filterItem.hasOwnProperty('disable')"
          :title="$t(`function.filter.${filterItem.disable ? 'enable' : 'disable'}`)"
          class="iw-btn iw-btn-sm iw-btn-square ml-2 rounded"
          @click="disableFilterItem(filterItemIdx)"
        >
          <i :class="`${iconSvg.ICON_CIRCLE_SLASH} ml-1 cursor-pointer ${(filterItem.disable) && 'text-red-600'}`" />
        </button>
        <button class="iw-btn iw-btn-sm iw-btn-square ml-2 rounded" @click="deleteFilterItem(filterItemIdx)">
          <i :class="`${iconSvg.DELETE} ml-1 cursor-pointer`" />
        </button>
      </div>
      <!-- 可添加的过滤列 -->
      <!-- Filter columns that can be added -->
      <button class="iw-btn iw-btn-xs bg-white border-gray-200 ml-1 my-2" @click="showFilterColumns">
        <span class="mr-0.5 text-gray-400">{{ $t('function.filter.selectColumnPlaceholder') }}</span>
        <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
      </button>
      <!-- <button
        v-if="(selectedFilterItems && selectedFilterItems.length) || selectedFilterGroupIdx !== undefined"
        class="iw-btn block iw-btn-xs iw-btn-primary absolute right-2 bottom-6" @click="saveFilterGroup"
      >
        {{ $t('function.filter.confirm') }}
      </button> -->
      <span class="absolute bottom-1 right-1 text-xs text-neutral-content">{{ $t('function.filter.note') }}</span>
    </MenuComp>

    <MenuSelectComp
      ref="filterColumnCompRef" :values="[selectedFilterItem?.columnName]" :options="filterColumnOptions"
      @click="setFilterColumn"
    />
    <MenuSelectComp
      ref="filterOpCompRef" :values="[selectedFilterItem?.operator]" :options="operatorOptions"
      @click="setFilterOp"
    />
    <MenuSelectComp
      v-if="selectedFilterItem?.dictKind === DictKind.SELECT" ref="dictContainerCompRef"
      :values="selectedFilterItem?.values" :options="queryDictItemsResp?.records" @click="setFilterADictValue"
    />
    <MenuTreeComp
      v-if="selectedFilterItem?.dictKind === DictKind.TREE_SELECT" ref="dictTreeContainerCompRef"
      :values="selectedFilterItem?.values" :filter-value="filterValue" :options="queryDictItemsResp?.records" @click="setFilterADictValue"
    />
  </div>
</template>
