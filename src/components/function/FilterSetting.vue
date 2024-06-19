<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue'
import * as iconSvg from '../../assets/icon'
import type { DataKind, DictItemProps, DictItemsResp, FilterDataGroupProps, FilterDataItemProps, FilterDataProps, LayoutModifyProps } from '../../props'
import { OperatorKind, translateOperatorKind } from '../../props'
import { getInputTypeByDataKind, getOperatorKindsByDataKind } from '../../props/enumProps'
import { IwUtils } from '../../utils'
import MenuComp, { MenuOffsetKind, MenuSizeKind } from '../common/Menu.vue'
import type { ColumnConf } from '../conf'
import * as eb from '../eventbus'

const props = defineProps<{
  layoutId: string
  filter: FilterDataProps
  layoutColumnsConf: ColumnConf[]
}>()

const filterGroupContainerCompRef = ref<InstanceType<typeof MenuComp>>()
const filterColumnCompRef = ref<InstanceType<typeof MenuComp>>()
const filterOpCompRef = ref<InstanceType<typeof MenuComp>>()
const dictContainerCompRef = ref<InstanceType<typeof MenuComp>>()
const queryDictItemsResp = ref<DictItemsResp>()

let filterGroupContainerEle: HTMLElement

interface FilterItemProps {
  columnName: string
  operator: OperatorKind
  values: any[]
  icon: string
  title: string
  dataKind: DataKind
  useDict: boolean
  multiValue: boolean
}
const selectedFilterGroup = ref<FilterItemProps[] | undefined>()
const selectedFilterGroupIdx = ref<number | undefined>()
const selectedFilterItemIdx = ref<number | undefined>()
// column name + '-' + column value -> dict item
const mappingColumValueAndDictTitle = ref<{ [key: string | number]: DictItemProps }>({})

async function showFilterGroupContainer(e: Event, filterGroupIdx?: number) {
  selectedFilterGroupIdx.value = filterGroupIdx
  selectedFilterItemIdx.value = undefined
  const targetEle = e.target as HTMLElement
  if (filterGroupIdx !== undefined) {
    const filterItems = toRaw(props.filter.groups[filterGroupIdx].items)
    selectedFilterGroup.value = filterItems.map((item: FilterDataItemProps) => {
      const columnConf = props.layoutColumnsConf.find(col => col.name === item.columnName)!
      return {
        columnName: item.columnName,
        operator: item.operator,
        values: item.value ? Array.isArray(item.value) ? item.value : [item.value] : [],
        icon: columnConf.icon,
        title: columnConf.title,
        dataKind: columnConf.dataKind,
        useDict: columnConf.useDict,
        multiValue: columnConf.multiValue,
      }
    })
    // init mapping dict
    let groupedFilterItems: { [key: string]: FilterDataItemProps[] } = IwUtils.groupBy(
      filterItems.filter((item: FilterDataItemProps) => item.value !== undefined),
      (item: FilterDataItemProps) => { return item.columnName },
    )
    const queryConds: { [key: string]: any[] } = groupedFilterItems = Object.fromEntries(Object.entries(groupedFilterItems).map(([columnName, values]) => [columnName, values.map((item: FilterDataItemProps) => item.value!)]))
    const dictItemResp = await eb.loadCellDictItemsWithMultiConds(queryConds, {
      offsetNumber: 0,
      fetchNumber: Math.max(...Object.entries(queryConds).map(([_, values]) => values.length)),
    })
    Object.entries(dictItemResp).forEach(([columnName, resp]) => {
      resp.records.forEach((dictItem) => {
        mappingColumValueAndDictTitle.value[`${columnName}-${dictItem.value}`] = dictItem
      })
    })
  }
  else {
    selectedFilterGroup.value = []
  }
  filterGroupContainerCompRef.value?.show(targetEle, undefined, {
    width: 350,
    height: 150,
  }, false, targetEle.closest('.iw-tt') as HTMLElement)
}

async function deleteFilterGroup(filterGroupIdx: number) {
  const filter = toRaw(props.filter!)
  filter.groups.splice(filterGroupIdx, 1)
  await eb.modifyLayout({
    filter,
  })
}

function parseDict(columnName: string, value?: any): any | DictItemProps[] {
  if (value === undefined) {
    return ''
  }
  if (Array.isArray(value)) {
    return value.map(val => mappingColumValueAndDictTitle.value[`${columnName}-${val}`] ?? val)
  }
  else {
    return [mappingColumValueAndDictTitle.value[`${columnName}-${value}`] ?? value]
  }
}

async function deleteFilterItem(filterItemIdx: number) {
  selectedFilterGroup.value?.splice(filterItemIdx, 1)
}

function showFilterColumns(e: Event, filterItemIdx?: number) {
  selectedFilterItemIdx.value = filterItemIdx
  const targetEle = e.target as HTMLElement
  filterColumnCompRef.value?.show(targetEle, undefined, undefined, true)
}

function showFilterOps(e: Event, filterItemIdx: number) {
  selectedFilterItemIdx.value = filterItemIdx
  const targetEle = e.target as HTMLElement
  filterOpCompRef.value?.show(targetEle, undefined, MenuSizeKind.MINI, true)
}

function setFilterColumn(e: Event) {
  const targetEle = e.target as HTMLElement
  const currColumnName = targetEle.dataset.columnName!
  const columnConf = props.layoutColumnsConf.find(col => col.name === currColumnName)!
  if (selectedFilterItemIdx.value !== undefined) {
    const currFilterItem = selectedFilterGroup.value?.[selectedFilterItemIdx.value]
    currFilterItem!.columnName = currColumnName
    currFilterItem!.operator = OperatorKind.EQ
    currFilterItem!.values = []
    currFilterItem!.icon = columnConf.icon
    currFilterItem!.title = columnConf.title
    currFilterItem!.dataKind = columnConf.dataKind
    currFilterItem!.useDict = columnConf.useDict
    currFilterItem!.multiValue = columnConf.multiValue
  }
  else {
    selectedFilterGroup.value?.push({
      columnName: currColumnName,
      operator: OperatorKind.EQ,
      values: [],
      icon: columnConf.icon,
      title: columnConf.title,
      dataKind: columnConf.dataKind,
      useDict: columnConf.useDict,
      multiValue: columnConf.multiValue,
    })
  }
  filterColumnCompRef.value?.close()
}

function setFilterOp(e: Event) {
  const targetEle = e.target as HTMLElement
  const selectedOp = targetEle.dataset.op as OperatorKind
  const currFilterItem = selectedFilterGroup.value?.[selectedFilterItemIdx.value!]
  currFilterItem!.operator = selectedOp
  currFilterItem!.values = []
  filterOpCompRef.value?.close()
}

function setFilterAValue(value: any, filterItemIdx: number) {
  const currFilterItem = selectedFilterGroup.value?.[filterItemIdx]
  if (currFilterItem?.values.includes(value)) {
    // remove already exists
    currFilterItem.values = currFilterItem.values.filter(val => val !== value)
  }
  else {
    if (currFilterItem?.operator === OperatorKind.IN || currFilterItem?.operator === OperatorKind.NOT_IN) {
      currFilterItem!.values = [...currFilterItem!.values, value]
    }
    else {
      currFilterItem!.values = [value]
    }
  }
  if (filterGroupContainerEle) {
    const inputEle = filterGroupContainerEle.querySelector(`input[data-value-input-idx='${filterItemIdx}']`)
    if (inputEle) {
      (inputEle as HTMLInputElement).value = ''
    }
  }
}

function deleteAValue(filterItemIdx: number, valueIdx: number) {
  selectedFilterGroup.value?.[filterItemIdx] && selectedFilterGroup.value[filterItemIdx].values.splice(valueIdx, 1)
}

async function showDictItems(value: any, filterItemIdx: number, e: Event) {
  selectedFilterItemIdx.value = filterItemIdx
  const currFilterItem = selectedFilterGroup.value?.[filterItemIdx]
  queryDictItemsResp.value = await eb.loadCellDictItems(currFilterItem!.columnName, value, {
    offsetNumber: 0,
    // TODO
    fetchNumber: 10,
  })
  dictContainerCompRef.value?.show(e.target as HTMLElement, MenuOffsetKind.LEFT_TOP, undefined, true)
}

function setFilterADictValue(e: Event) {
  if (!(e.target instanceof HTMLElement)) {
    return
  }
  const itemEle = e.target.closest('.iw-contextmenu__item')
  if (!itemEle || !(itemEle instanceof HTMLElement)) {
    return
  }
  const dictItemValue = itemEle.dataset.value!
  const currFilterItem = selectedFilterGroup.value?.[selectedFilterItemIdx.value!]
  setFilterAValue(dictItemValue, selectedFilterItemIdx.value!)
  mappingColumValueAndDictTitle.value[`${`${currFilterItem?.columnName}-${dictItemValue}`}`] = {
    title: itemEle.dataset.title!,
    value: dictItemValue!,
    avatar: itemEle.dataset.avatar,
    color: itemEle.dataset.color,
  }
  if (currFilterItem?.operator !== OperatorKind.IN && currFilterItem?.operator !== OperatorKind.NOT_IN) {
    dictContainerCompRef.value?.close()
  }
}

async function saveFilterGroup() {
  if (selectedFilterGroup.value?.length === 0) {
    return
  }
  const currFilterGroup: FilterDataGroupProps = {
    items: selectedFilterGroup.value?.filter(item =>
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
  const filterGroups = toRaw(props.filter.groups)
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
}

onMounted(() => {
  filterGroupContainerCompRef.value?.onInit(async (menuEle: HTMLElement) => {
    filterGroupContainerEle = menuEle
  })
  filterGroupContainerCompRef.value?.onClose(async (_) => {
    await saveFilterGroup()
  })
})
</script>

<template>
  <div class="flex items-center text-nowrap">
    <button v-for="(filterGroup, filterGroupIdx) in props.filter.groups" :key="`${props.layoutId}-${filterGroupIdx}`" class="iw-btn iw-btn-outline iw-btn-xs flex-none mr-1">
      <span class="flex items-center" @click="e => showFilterGroupContainer(e, filterGroupIdx)">
        <template v-if="filterGroup.items.length === 1">
          <span class="mr-0.5">{{ props.layoutColumnsConf.find(col => col.name === filterGroup.items[0].columnName)?.title }}</span>
          <span class="mr-0.5">{{ translateOperatorKind(filterGroup.items[0].operator) }}</span>
          <span class="mr-0.5 max-w-[100px] whitespace-nowrap overflow-hidden text-ellipsis">
            <span
              v-for="(dictItemOrRawValue, valueIdx) in parseDict(filterGroup.items[0].columnName, filterGroup.items[0].value)"
              :key="`${filterGroup.items[0].columnName}-${valueIdx}`"
              :style="`background-color: ${dictItemOrRawValue.color ?? ''}`"
              class="iw-badge"
            >
              <span v-if="dictItemOrRawValue.avatar !== undefined" class="avatar">
                <img :src="dictItemOrRawValue.avatar" class="w-4 rounded-full">
              </span>
              <span class="ml-1 whitespace-nowrap">{{ dictItemOrRawValue.title ?? dictItemOrRawValue }}</span>
            </span>
          </span>
        </template>
        <template v-else>
          <span class="mr-0.5">{{ filterGroup.items.length }}</span>
          {{ $t('function.filter.items') }}
        </template>
      </span>
      <i :class="`${iconSvg.DELETE} hover:text-secondary hover:font-bold`" @click="deleteFilterGroup(filterGroupIdx)" />
    </button>
    <div class="self-center cursor-pointer" @click="showFilterGroupContainer">
      <i :class="iconSvg.NEW" />
      <span>{{ $t('function.filter.new') }}</span>
    </div>
  </div>
  <MenuComp ref="filterGroupContainerCompRef">
    <div v-for="(filterItem, filterItemIdx) in selectedFilterGroup" :key="`${layoutId}-${selectedFilterGroupIdx}-${filterItemIdx}`" class="iw-contextmenu__item p-1 flex items-center w-full">
      <button class="iw-btn iw-btn-outline iw-btn-xs mr-1" :title="filterItem.title" @click="e => { showFilterColumns(e, filterItemIdx) }">
        <i :class="filterItem.icon " />
        <span class="mr-0.5 max-w-[40px] overflow-hidden text-ellipsis whitespace-nowrap">{{ filterItem.title }}</span>
        <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
      </button>
      <button class="iw-btn iw-btn-outline iw-btn-xs mr-1" @click="e => { showFilterOps(e, filterItemIdx) }">
        <span class="mr-0.5">{{ translateOperatorKind(filterItem.operator) }}</span>
        <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
      </button>
      <div v-if="filterItem.operator !== OperatorKind.IS_EMPTY && filterItem.operator !== OperatorKind.NOT_EMPTY">
        <input
          v-if="filterItem.operator !== OperatorKind.IN && filterItem.operator !== OperatorKind.NOT_IN && !filterItem.useDict"
          class="iw-input iw-input-bordered iw-input-xs w-full" :type="getInputTypeByDataKind(filterItem.dataKind)"
          :value="filterItem.values"
          @change="e => { setFilterAValue((e.target as HTMLInputElement).value, filterItemIdx) }"
        >
        <label v-else class="iw-input iw-input-xs iw-input-bordered flex items-center gap-2 h-[30px]">
          <span
            v-for="(dictItemOrRawValue, valueIdx) in parseDict(filterItem.columnName, filterItem.values)"
            :key="`${filterItem.columnName}-${valueIdx}`"
            :style="`background-color: ${dictItemOrRawValue.color ?? ''}`"
            class="iw-badge"
          >
            <span v-if="dictItemOrRawValue.avatar !== undefined" class="avatar">
              <img :src="dictItemOrRawValue.avatar" class="w-4 rounded-full">
            </span>
            <span class="ml-1 whitespace-nowrap">{{ dictItemOrRawValue.title ?? dictItemOrRawValue }}</span>
            <i
              :class="`${iconSvg.DELETE} ml-0.5 cursor-pointer`"
              @click="deleteAValue(filterItemIdx, valueIdx)"
            />
          </span>
          <input
            v-if="!filterItem.useDict"
            :type="getInputTypeByDataKind(filterItem.dataKind)"
            :data-value-input-idx="filterItemIdx"
            @change="e => setFilterAValue((e.target as HTMLInputElement).value, filterItemIdx)"
          >
          <input
            v-else
            :class="filterItem.values && filterItem.values.length > 0 ? 'w-12' : ''"
            class="pl-1 rounded-md iw-input-bordered" :type="getInputTypeByDataKind(filterItem.dataKind)"
            :data-value-input-idx="filterItemIdx"
            @keyup="e => { showDictItems((e.target as HTMLInputElement).value, filterItemIdx, e) }"
          >
        </label>
      </div>
      <i :class="`${iconSvg.DELETE} hover:text-secondary hover:font-bold ml-1 cursor-pointer`" @click="deleteFilterItem(filterItemIdx)" />
    </div>
    <button class="iw-btn iw-btn-xs ml-1 mb-1" @click="showFilterColumns">
      <span class="mr-0.5">{{ $t('function.filter.selectColumnPlaceholder') }}</span>
      <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
    </button>
    <span class="absolute bottom-1 right-1 text-xs text-neutral-content">{{ $t('function.filter.note') }}</span>
  </MenuComp>

  <MenuComp ref="filterColumnCompRef" @click="setFilterColumn">
    <div
      v-for="column in props.layoutColumnsConf.filter(col => props.filter.enabledColumnNames.includes(col.name))" :key="column.name" class="iw-contextmenu__item flex w-full cursor-pointer"
      :data-column-name="column.name"
    >
      <i :class="`${column.icon} mr-0.5`" />
      {{ column.title }}
    </div>
  </MenuComp>
  <MenuComp ref="filterOpCompRef" @click="setFilterOp">
    <template v-if="selectedFilterItemIdx !== undefined">
      <div
        v-for="op in getOperatorKindsByDataKind(selectedFilterGroup?.[selectedFilterItemIdx!].dataKind, selectedFilterGroup?.[selectedFilterItemIdx!].multiValue)"
        :key="op"
        class="iw-contextmenu__item flex w-full cursor-pointer" :data-op="op"
      >
        {{ translateOperatorKind(op) }}
      </div>
    </template>
  </MenuComp>
  <MenuComp ref="dictContainerCompRef">
    <div @click="setFilterADictValue">
      <div
        v-for="dictItem in queryDictItemsResp?.records" :key="`${props.layoutId}-${selectedFilterGroupIdx}-${selectedFilterItemIdx}-${dictItem.value}`"
        :style="`background-color: ${dictItem.color}`"
        class="iw-contextmenu__item flex cursor-pointer iw-badge m-1.5 pl-0.5"
        :class="selectedFilterGroup?.[selectedFilterItemIdx!]?.values.includes(dictItem.value) ? 'iw-badge-primary' : 'iw-badge-outline'"
        :data-value="dictItem.value"
        :data-title="dictItem.title"
        :data-avatar="dictItem.avatar"
        :data-color="dictItem.color"
      >
        <div v-if="dictItem.avatar !== undefined" class="avatar">
          <img :src="dictItem.avatar" class="w-4 rounded-full">
        </div>
        <span class="ml-1 whitespace-nowrap">{{ dictItem.title }}{{ dictItem.title !== dictItem.value ? `(${dictItem.value})` : '' }}</span>
      </div>
    </div>
  </MenuComp>
</template>
