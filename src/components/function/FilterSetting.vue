<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import * as iconSvg from '../../assets/icon'
import { DataKind, DictItemProps, DictItemsResp, DictKind, FilterDataGroupProps, FilterDataItemProps, FilterDataProps, LayoutModifyProps } from '../../props'

import { OperatorKind, translateOperatorKind } from '../../props'
import { getInputTypeByDataKind, getOperatorKindsByDataKind } from '../../props/enumProps'

import { groupBy } from '../../utils/basic'
import { MenuOffsetKind, MenuSizeKind } from '../common/Menu'
import MenuComp from '../common/Menu.vue'
import type { ColumnConf } from '../conf'
import * as eb from '../eventbus'
import { deepToRaw } from '../../utils/vueHelper'
import MenuSelectComp from '../base/MenuSelect/index.vue'
import MenuTreeComp from '../base/MenuTree/index.vue'
import MInput from '../base/MInput/index.vue'
import Badge from '../common/Badge.vue'

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

// 过滤项
// Filter item
interface FilterItemProps {
  columnName: string
  operator: OperatorKind
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
//可过滤的列
// Filterable columns
const filterColumnOptions = computed(()=> props.columnsConf.filter(col => props.filter.enabledColumnNames.includes(col.name)).map(e=> {
  return {
    ...e, 
    value: e.name
  }
}))
// 选中过滤单项
// Selected filter item
const selectedFilterItem = computed(()=> selectedFilterItems.value?.[selectedFilterItemIdx.value!])
//操作符 operator
const operatorOptions = computed(()=> {
  return getOperatorKindsByDataKind(selectedFilterItem.value?.dataKind).map(e=> {
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
    values: filterDataItem.value ? Array.isArray(filterDataItem.value) ? filterDataItem.value : [filterDataItem.value] : [],
    icon: columnConf.icon,
    title: columnConf.title,
    dataKind: columnConf.dataKind,
    useDict: columnConf.useDict,
    fixedDictItems: columnConf.fixedDictItems,
    dictKind: columnConf.dictKind,
    multiValue: columnConf.multiValue,
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
  filterColumnCompRef.value?.show(e.target as HTMLElement, undefined, undefined, true)
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
  if (selectedFilterItemIdx.value !== undefined) {
    // 存在已选中的过滤项，重置过滤项到初始状态
    // There is a selected filter item, reset the filter item to the initial state
    const currFilterItem = selectedFilterItems.value?.[selectedFilterItemIdx.value]
    if(currFilterItem!.columnName === currColumnName) return
    currFilterItem!.columnName = currColumnName
    currFilterItem!.operator = OperatorKind.EQ
    currFilterItem!.values = []
    currFilterItem!.icon = columnConf.icon
    currFilterItem!.title = columnConf.title
    currFilterItem!.dataKind = columnConf.dataKind
    currFilterItem!.useDict = columnConf.useDict
    currFilterItem!.dictKind = columnConf.dictKind
    currFilterItem!.fixedDictItems = columnConf.fixedDictItems
    currFilterItem!.multiValue = columnConf.multiValue
  }
  else {
    // 不存在已选中的过滤项，添加新的过滤项
    // There is no selected filter item, add a new filter item
    selectedFilterItems.value?.push({
      columnName: currColumnName,
      operator: OperatorKind.EQ,
      values: [],
      icon: columnConf.icon,
      title: columnConf.title,
      dataKind: columnConf.dataKind,
      useDict: columnConf.useDict,
      dictKind: columnConf.dictKind,
      fixedDictItems: columnConf.fixedDictItems,
      multiValue: columnConf.multiValue,
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
    if (currFilterItem?.operator === OperatorKind.IN || currFilterItem?.operator === OperatorKind.NOT_IN) {
      currFilterItem!.values = [...currFilterItem!.values, value]
    }
    else {
      currFilterItem!.values = [value]
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
async function showDictItems(value: any, filterItemIdx: number, e: Event) {
  selectedFilterItemIdx.value = filterItemIdx
  const currFilterItem = selectedFilterItems.value?.[filterItemIdx]
  queryDictItemsResp.value = await eb.loadCellDictItems(currFilterItem!.columnName, value, {
    offsetNumber: 0,
    fetchNumber: 20,
  })
  /**
   * 根据dictKind判断显示menu
   */
  const dictKind = currFilterItem?.dictKind
  let containerRef = dictContainerCompRef.value
  if (dictKind === DictKind.TREE_SELECT) {
    containerRef = dictTreeContainerCompRef.value
  }
  const labelEle = (e.target as HTMLElement).closest('.value-input')
  // dictTreeContainerCompRef
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
  if (e.target.closest('.icon-tree-arrow')) return
  const itemEle = e.target.closest('.iw-contextmenu__item')
  if (!itemEle || !(itemEle instanceof HTMLElement)) {
    return
  }
  const dictItemValue = itemEle.dataset.value!
  const currFilterItem = selectedFilterItems.value?.[selectedFilterItemIdx.value!]
  setFilterAValue(dictItemValue, selectedFilterItemIdx.value!)
  cachedAllSelectedDictItems.value[`${`${currFilterItem?.columnName}-${dictItemValue}`}`] = {
    title: itemEle.dataset.title!,
    value: dictItemValue!,
    avatar: itemEle.dataset.avatar,
    color: itemEle.dataset.color,
  }
  // if (currFilterItem?.operator !== OperatorKind.IN && currFilterItem?.operator !== OperatorKind.NOT_IN) {
  //   dictContainerCompRef.value?.close()
  // }
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
      filterGroupContainerCompRef.value?.close()
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
  filterGroupContainerCompRef.value?.close()
}

async function initDictItemsByFilterGroups(filterGroups: FilterDataGroupProps[]) {
  if (filterGroups.length === 0) {
    return
  }
  const filterItems = filterGroups.map(filterGroup => filterGroup.items).flat().map((filterItem) => {
    return convertFilterDataItemToFilterItem(filterItem)
  })
  addDictItemsByFilterItems(filterItems)
}

onMounted(() => {
  filterGroupContainerCompRef.value?.onInit(async (menuEle: HTMLElement) => {
    filterGroupContainerEle = menuEle
  })
  filterGroupContainerCompRef.value?.onClose(async (_) => {
    // 关闭时保存过滤组
    // Save filter group when closing
    // await saveFilterGroup()
  })
  // 初始化字典项
  // Initialize dictionary items
  initDictItemsByFilterGroups(props.filter.groups)
})
</script>

<template>
  <div class="flex items-center text-nowrap">
    <!-- 显示已保存的过滤组 -->
    <!-- Display saved filter groups -->
    <div v-for="(filterGroup, filterGroupIdx) in props.filter.groups" :key="`${props.layoutId}-${filterGroupIdx}`"
      class="button-box w-max flex items-center mr-3">
      <button class="iw-btn iw-btn-sm rounded-sm flex-none">
        <span class="flex items-center" @click="e => showFilterGroupContainer(e, filterGroupIdx)">
          <template v-if="filterGroup.items.length === 1">
            <!-- 只有一个过滤项时显示详情 -->
            <!-- Show details when there is only one filter item -->
            <span class="mr-0.5">{{ props.columnsConf.find(col => col.name === filterGroup.items[0].columnName)?.title
              }}</span>
            <span class="mr-0.5 p-1 bg-gray-200 rounded-sm text-gray-500">{{
              translateOperatorKind(filterGroup.items[0].operator)
              }}</span>
            <span class="mr-0.5 max-w-[100px] whitespace-nowrap overflow-hidden text-ellipsis">
              <Badge
                v-for="(dictItemOrRawValue, valueIdx) in tryParseDictItems(filterGroup.items[0].columnName, filterGroup.items[0].value)"
                :key="`${filterGroup.items[0].columnName}-${valueIdx}`"
                readonly
                :option="dictItemOrRawValue"
                :style="`background-color: ${dictItemOrRawValue.color ?? ''}`" class="iw-badge">
              </Badge>
            </span>
          </template>
          <template v-else>
            <!-- 多个过滤项时显示数量 -->
            <!-- Show quantity when there are multiple filter items -->
            <span class="mr-0.5">{{ filterGroup.items.length }}</span>
            {{ $t('function.filter.items') }}
          </template>
        </span>
        <i :class="`${iconSvg.DELETE} hover:text-secondary hover:font-bold`"
          @click="deleteFilterGroup(filterGroupIdx)" />
      </button>
      <span v-if="props.filter.groups.length > 0 && filterGroupIdx !== props.filter.groups.length - 1"
        class="text-gray-400 pl-3">或
      </span>
    </div>

    <div class="self-center cursor-pointer" @click="showFilterGroupContainer">
      <i :class="iconSvg.NEW" />
      <span>{{ $t('function.filter.new') }}</span>
    </div>
  </div>
  <!-- 过滤组容器 -->
  <!-- Filter group container -->
  <MenuComp ref="filterGroupContainerCompRef" class="p-2 pb-6">
    <!-- 显示已选中的过滤项 -->
    <!-- Display selected filter items -->
    <div v-for="(filterItem, filterItemIdx) in selectedFilterItems"
      :key="`${layoutId}-${selectedFilterGroupIdx}-${filterItemIdx}`"
      class="iw-contextmenu__item p-1 flex items-center w-full">
      <!-- 列名 -->
      <!-- Column name -->
      <button class="iw-btn  border-gray-200 bg-white iw-btn-xs rounded-sm mr-1 w-[100px] h-[30px]"
        :title="filterItem.title" @click="e => { showFilterColumns(e, filterItemIdx) }">
        <i :class="filterItem.icon" />
        <span class="mr-0.5 w-[38px] overflow-hidden text-ellipsis whitespace-nowrap">{{ filterItem.title }}</span>
        <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
      </button>
      <!-- 操作符 -->
      <!-- Operator -->
      <button class="iw-btn border-gray-200 bg-white iw-btn-xs rounded-sm mr-1 h-[30px]"
        @click="e => { showFilterOps(e, filterItemIdx) }">
        <span class="mr-0.5 w-[28px] overflow-hidden text-ellipsis whitespace-nowrap">{{ translateOperatorKind(filterItem.operator) }}</span>
        <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
      </button>
      <!-- 值 -->
      <!-- Value -->
      <div v-if="filterItem.operator !== OperatorKind.IS_EMPTY && filterItem.operator !== OperatorKind.NOT_EMPTY">
        <!-- 单值且不是字典的值的处理 -->
        <!-- Processing of single value and non-dictionary values -->
        <input
          v-if="filterItem.operator !== OperatorKind.IN && filterItem.operator !== OperatorKind.NOT_IN && !filterItem.useDict"
          class="iw-input iw-input-bordered iw-input-xs w-full" :type="getInputTypeByDataKind(filterItem.dataKind)"
          :value="filterItem.values"
          @change="e => { setFilterAValue((e.target as HTMLInputElement).value, filterItemIdx) }">
        <MInput v-else :filterItem="filterItem" :filterItemIdx="filterItemIdx"
          :options="tryParseDictItems(filterItem.columnName, filterItem.values)" :showDictItems="showDictItems"
          :deleteAValue="deleteAValue" />

      </div>
      <button class="iw-btn iw-btn-sm iw-btn-square ml-2 rounded-sm" @click="deleteFilterItem(filterItemIdx)">
        <i :class="`${iconSvg.DELETE} ml-1 cursor-pointer`" />
      </button>
    </div>
    <!-- 可添加的过滤列 -->
    <!-- Filter columns that can be added -->
    <button class="iw-btn iw-btn-xs bg-white border-gray-200 ml-1 my-2" @click="showFilterColumns">
      <span class="mr-0.5 text-gray-400">{{ $t('function.filter.selectColumnPlaceholder') }}</span>
      <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
    </button>
    <button v-if="(selectedFilterItems && selectedFilterItems.length) || selectedFilterGroupIdx !== undefined"
      class="iw-btn block iw-btn-xs iw-btn-primary absolute right-2 bottom-6" @click="saveFilterGroup">{{
        $t('function.filter.confirm') }}</button>
    <span class="absolute bottom-1 right-1 text-xs text-neutral-content">{{ $t('function.filter.note') }}</span>
  </MenuComp>

  <MenuSelectComp ref="filterColumnCompRef" :values="[selectedFilterItem?.columnName]"
    :options="filterColumnOptions" @click="setFilterColumn" />
  <MenuSelectComp ref="filterOpCompRef" :values="[selectedFilterItem?.operator]"
    :options="operatorOptions" @click="setFilterOp" />
  <MenuSelectComp ref="dictContainerCompRef" :values="selectedFilterItem?.values"
    :options="queryDictItemsResp?.records" @click="setFilterADictValue" />
  <MenuTreeComp ref="dictTreeContainerCompRef" :values="selectedFilterItem?.values"
    :options="queryDictItemsResp?.records" @click="setFilterADictValue" />
</template>
