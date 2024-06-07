<script setup lang="ts">
import { ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import type { DataKind, TableCellDictItemProps, TableCellDictItemsResp, TableDataFilterItemProps, TableDataFilterProps, TableLayoutModifyProps } from '../../props'
import { OperatorKind, translateOperatorKind } from '../../props'
import { IwUtils } from '../../utils'
import MenuComp, { MenuOffsetKind, MenuSizeKind } from '../common/Menu.vue'
import type { TableColumnConf } from '../conf'
import { getInputTypeByDataKind, getOperatorKindsByDataKind } from '../conf'
import * as eb from '../eventbus'

const props = defineProps<{
  filters?: TableDataFilterProps[]
  columnsConf: TableColumnConf[]
}>()

const filterGroupContainerCompRef = ref<InstanceType<typeof MenuComp>>()
const filterGroupContainerItemsCompRef = ref<InstanceType<typeof HTMLDivElement>>()
const filterColumnCompRef = ref<InstanceType<typeof MenuComp>>()
const filterOpCompRef = ref<InstanceType<typeof MenuComp>>()
const dictContainerCompRef = ref<InstanceType<typeof MenuComp>>()
const queryDictItemsResp = ref<TableCellDictItemsResp>()

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
const mappingColumValueAndDictTitle = ref<{ [key: string | number]: TableCellDictItemProps }>({})

async function showFilterGroupContainer(e: Event, filterGroupIdx?: number) {
  selectedFilterGroupIdx.value = filterGroupIdx
  const targetEle = e.target as HTMLElement
  if (filterGroupIdx !== undefined) {
    const filterItems = JSON.parse(JSON.stringify(props.filters![filterGroupIdx].items))
    selectedFilterGroup.value = filterItems.map((item: TableDataFilterItemProps) => {
      const columnConf = props.columnsConf.find(col => col.name === item.columnName)!
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
    let groupedFilterItems: { [key: string]: TableDataFilterItemProps[] } = IwUtils.groupBy(
      filterItems.filter((item: TableDataFilterItemProps) => item.value !== undefined),
      (item: TableDataFilterItemProps) => { return item.columnName },
    )
    const queryConds: { [key: string]: any[] } = groupedFilterItems = Object.fromEntries(Object.entries(groupedFilterItems).map(([columnName, values]) => [columnName, values.map((item: TableDataFilterItemProps) => item.value!)]))
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
  filterGroupContainerCompRef.value?.show(targetEle, undefined, MenuSizeKind.LARGE, false)
}

async function deleteFilterGroup(filterGroupIdx: number) {
  const filters = JSON.parse(JSON.stringify(props.filters))
  filters.splice(filterGroupIdx, 1)
  await eb.modifyLayout({
    filters,
  })
}

function parseDict(columnName: string, value?: any): any | TableCellDictItemProps[] {
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
  const columnConf = props.columnsConf.find(col => col.name === currColumnName)!
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
  if (currFilterItem?.operator === OperatorKind.IN || currFilterItem?.operator === OperatorKind.NOT_IN) {
    currFilterItem!.values = [...currFilterItem!.values, value]
  }
  else {
    currFilterItem!.values = [value]
  }
  if (filterGroupContainerItemsCompRef.value) {
    const inputEle = filterGroupContainerItemsCompRef.value.querySelector(`input[data-value-input-idx='${filterItemIdx}']`)
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
  dictContainerCompRef.value?.close()
}

async function saveFilterGroup() {
  const currFilterGroup: TableDataFilterProps = {
    items: selectedFilterGroup.value?.map((item) => {
      const realValue = item.operator === OperatorKind.IS_EMPTY || item.operator === OperatorKind.NOT_EMPTY
        ? undefined
        : item.operator === OperatorKind.IN || item.operator === OperatorKind.NOT_IN
          ? item.values
          : item.values[0]
      return {
        columnName: item.columnName,
        operator: item.operator,
        value: realValue,
      }
    }) ?? [],
  }
  const filters = props.filters ? JSON.parse(JSON.stringify(props.filters)) : []
  if (selectedFilterGroupIdx.value === undefined) {
    filters.push(currFilterGroup)
  }
  else {
    filters[selectedFilterGroupIdx.value] = currFilterGroup
  }
  const layout: TableLayoutModifyProps = {
    filters,
  }
  await eb.modifyLayout(layout)
}
</script>

<template>
  <div class="flex justify-center overflow-x-auto">
    <button v-for="(filterGroup, filterGroupIdx) in props.filters" :key="filterGroupIdx" class="iw-btn iw-btn-outline iw-btn-xs flex-none mr-1">
      <span @click="e => showFilterGroupContainer(e, filterGroupIdx)">
        <template v-if="filterGroup.items.length === 1">
          <span class="mr-0.5">{{ props.columnsConf.find(col => col.name === filterGroup.items[0].columnName)?.title }}</span>
          <span class="mr-0.5">{{ translateOperatorKind(filterGroup.items[0].operator) }}</span>
          <span class="mr-0.5 max-w-[100px] whitespace-nowrap overflow-hidden text-ellipsis">
            <span
              v-for="(dictItemOrRawValue, valueIdx) in parseDict(filterGroup.items[0].columnName, filterGroup.items[0].value)"
              :key="valueIdx"
              :style="`background-color: ${dictItemOrRawValue.color ?? ''}`"
              class="iw-badge iw-badge-info"
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
    <div ref="filterGroupContainerItemsCompRef">
      <div v-for="(filterItem, filterItemIdx) in selectedFilterGroup" :key="filterItemIdx" class="iw-contextmenu__item p-1 flex justify-between w-full">
        <button class="iw-btn iw-btn-outline iw-btn-xs" @click="e => { showFilterColumns(e, filterItemIdx) }">
          <i :class="filterItem.icon " />
          <span class="mr-0.5">{{ filterItem.title }}</span>
          <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
        </button>
        <button class="iw-btn iw-btn-outline iw-btn-xs" @click="e => { showFilterOps(e, filterItemIdx) }">
          <span class="mr-0.5">{{ translateOperatorKind(filterItem.operator) }}</span>
          <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
        </button>
        <div v-if="filterItem.operator !== OperatorKind.IS_EMPTY && filterItem.operator !== OperatorKind.NOT_EMPTY">
          <input
            v-if="filterItem.operator !== OperatorKind.IN && filterItem.operator !== OperatorKind.NOT_IN && !filterItem.useDict"
            class="iw-input iw-input-bordered iw-input-xs w-full" :type="getInputTypeByDataKind(filterItem.dataKind)"
            :value="filterItem.values" @change="e => { setFilterAValue((e.target as HTMLInputElement).value, filterItemIdx) }"
          >
          <label v-else class="iw-input iw-input-xs iw-input-bordered flex items-center gap-2">
            <span
              v-for="(dictItemOrRawValue, valueIdx) in parseDict(filterItem.columnName, filterItem.values)"
              :key="valueIdx"
              :style="`background-color: ${dictItemOrRawValue.color ?? ''}`"
              class="iw-badge iw-badge-info"
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
              class="iw-grow" :type="getInputTypeByDataKind(filterItem.dataKind)"
              :data-value-input-idx="filterItemIdx"
              @change="e => setFilterAValue((e.target as HTMLInputElement).value, filterItemIdx)"
            >
            <input
              v-else
              class="iw-grow" :type="getInputTypeByDataKind(filterItem.dataKind)"
              :data-value-input-idx="filterItemIdx"
              @keyup="e => { showDictItems((e.target as HTMLInputElement).value, filterItemIdx, e) }"
            >
          </label>
        </div>
        <i :class="`${iconSvg.DELETE} hover:text-secondary hover:font-bold`" @click="deleteFilterItem(filterItemIdx)" />
      </div>
    </div>
    <button class="iw-btn iw-btn-outline iw-btn-xs" @click="showFilterColumns">
      <span class="mr-0.5">{{ $t('function.filter.selectColumnPlaceholder') }}</span>
      <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
    </button>

    <button class="iw-btn iw-btn-outline iw-btn-xs" @click="saveFilterGroup">
      <i :class="`${iconSvg.NEW} ml-0.5`" />
      <span class="mr-0.5">{{ $t('function.filter.save') }}</span>
    </button>
  </MenuComp>

  <MenuComp ref="filterColumnCompRef" @click="setFilterColumn">
    <div
      v-for="column in props.columnsConf" :key="column.name" class="iw-contextmenu__item flex w-full cursor-pointer"
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
        v-for="dictItem in queryDictItemsResp?.records" :key="dictItem.value"
        :style="`background-color: ${dictItem.color}`"
        class="iw-contextmenu__item flex cursor-pointer iw-badge iw-badge-outline m-1.5 pl-0.5"
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