<script setup lang="ts">
import { computed, inject, ref, toRaw } from 'vue'
import * as iconSvg from '../../assets/icon'
import MenuComp, { MenuSizeKind } from '../common/Menu.vue'
import type { TableColumnConf } from '../conf'
import { getInputTypeByDataKind, getOperatorKindsByDataKind } from '../conf'
import { FUN_MODIFY_LAYOUT_TYPE } from '../events'
import type { TableCellDictValueResp, TableDataFilterItemReq, TableDataFilterReq, TableEventProps } from '../props'
import { DataKind, OperatorKind, translateOperatorKind } from '../props'

const props = defineProps<{
  filters?: TableDataFilterReq[]
  columnsConf: TableColumnConf[]
  events: TableEventProps
}>()
const modifyLayoutFun = inject(FUN_MODIFY_LAYOUT_TYPE)!
const simpleFilterCompRef = ref()
const filterColumnCompRef = ref()
const filterOpCompRef = ref()

const selectedFilterItem = ref<TableDataFilterItemReq & TableColumnConf & { idx: number, values: any[] } | undefined>()
const usedDictValues = ref<{ [key: string | number]: string }>({})
const selectedDictValueResp = ref<TableCellDictValueResp | undefined>()
const searchDictValue = ref<any | undefined>()

function parseDictTitle(columnName: string, value?: any): any {
  if (value === undefined)
    return ''

  if (Array.isArray(value))
    return value.map(val => usedDictValues.value[`${columnName}-${val}`] ?? val)
  else
    return usedDictValues.value[`${columnName}-${value}`] ?? value
}

const selectedDictValues = computed<{ title: string, value: any }[]>(() => {
  if (!selectedDictValueResp.value)
    return []

  let dictValues = []
  if (selectedFilterItem.value) {
    if (Array.isArray(selectedFilterItem.value.value))
      dictValues = selectedDictValueResp.value.records.filter(val => selectedFilterItem.value?.value.indexOf(val.value) === -1)
    else
      dictValues = selectedDictValueResp.value.records.filter(val => selectedFilterItem.value?.value !== val.value)
  }
  else {
    dictValues = selectedDictValueResp.value.records
  }
  if (searchDictValue.value)
    dictValues = dictValues.filter(val => val.title.includes(searchDictValue.value) || val.value.includes(searchDictValue.value))

  return dictValues
})

const simpleFilterItems = computed<TableDataFilterItemReq[]>(() => {
  // Simple mode supports only one group of and conditions
  if (props.filters && props.filters.length === 1 && props.filters[0].and)
    return props.filters[0].items

  return []
})

function showSimpleFilterItem(event: MouseEvent, filterItem?: TableDataFilterItemReq, idx?: number) {
  const targetEle = event.target as HTMLElement
  if (filterItem) {
    const selectedColumnConf = props.columnsConf.find(col => col.name === filterItem?.columnName)!
    selectedFilterItem.value = {
      ...selectedColumnConf,
      ...filterItem,
      idx: idx ?? -1,
      values: Array.isArray(filterItem.value) ? filterItem.value : [],
    }
  }
  else {
    selectedFilterItem.value = undefined
  }
  simpleFilterCompRef.value.show(targetEle, undefined, MenuSizeKind.LARGE, false)
}

function showFilterColumns(event: MouseEvent) {
  const targetEle = event.target as HTMLElement
  filterColumnCompRef.value.show(targetEle, undefined, undefined, true)
}

function showFilterOps(event: MouseEvent) {
  const targetEle = event.target as HTMLElement
  filterOpCompRef.value.show(targetEle, undefined, MenuSizeKind.MINI, true)
}

async function setFilterColumn(event: MouseEvent) {
  const targetEle = event.target as HTMLElement
  const selectedColumnName = targetEle.dataset.columnName
  filterColumnCompRef.value.close()
  if (!selectedColumnName)
    return

  const selectedColumnConf = props.columnsConf.find(col => col.name === selectedColumnName)!
  if (!selectedFilterItem.value) {
    // New filter
    selectedFilterItem.value = {
      columnName: selectedColumnName,
      operator: OperatorKind.EQ,
      ...selectedColumnConf,
      idx: -1,
      values: [],
    }
  }
  else {
    selectedFilterItem.value = {
      ...selectedFilterItem.value,
      ...selectedColumnConf,
      columnName: selectedColumnName,
      operator: OperatorKind.EQ,
      value: undefined,
      values: [],
    }
  }
  if (selectedFilterItem.value.value !== undefined || selectedFilterItem.value.operator === OperatorKind.ISEMPTY || selectedFilterItem.value.operator === OperatorKind.NOTEMPTY)
    await addOrModifySimpleFilterItem(selectedFilterItem.value)

  if (props.events.loadCellDictValues && selectedFilterItem.value && selectedFilterItem.value.useDict) {
    const values = await props.events.loadCellDictValues(selectedFilterItem.value.columnName)
    selectedDictValueResp.value = values
  }
  else {
    selectedDictValueResp.value = undefined
  }
  searchDictValue.value = undefined
}

async function setFilterOp(event: MouseEvent) {
  const targetEle = event.target as HTMLElement
  const selectedOp = targetEle.dataset.op as OperatorKind
  filterOpCompRef.value.close()
  selectedFilterItem.value!.operator = selectedOp
  if (!selectedFilterItem.value)
    return

  if (selectedFilterItem.value.value !== undefined || selectedFilterItem.value.operator === OperatorKind.ISEMPTY || selectedFilterItem.value.operator === OperatorKind.NOTEMPTY)
    await addOrModifySimpleFilterItem(selectedFilterItem.value)
}

async function deleteSelectedAValue(val: any) {
  selectedFilterItem.value!.values = selectedFilterItem.value!.values.filter(item => item !== val)
  await addOrModifySimpleFilterItem(selectedFilterItem.value!)
}

async function setFilterValue(value: any) {
  if (selectedFilterItem.value && Array.isArray(selectedFilterItem.value.value))
    selectedFilterItem.value.values.push(value)
  else
    selectedFilterItem.value!.value = value

  if (!Array.isArray(selectedFilterItem.value?.value))
    simpleFilterCompRef.value.close()

  await addOrModifySimpleFilterItem(selectedFilterItem.value!)
}

async function setFilterDictValue(event: Event) {
  const targetEle = event.target as HTMLElement
  if (!targetEle.dataset.value || !targetEle.dataset.title)
    return
  const value = targetEle.dataset.value
  const title = targetEle.dataset.title
  if (selectedFilterItem.value && Array.isArray(selectedFilterItem.value.value))
    selectedFilterItem.value.values.push(value)
  else
    selectedFilterItem.value!.value = value

  usedDictValues.value[`${selectedFilterItem.value?.columnName}-${value}`] = title
  if (!Array.isArray(selectedFilterItem.value?.value))
    simpleFilterCompRef.value.close()

  await addOrModifySimpleFilterItem(selectedFilterItem.value!)
}

async function addOrModifySimpleFilterItem(changedFilterItem: TableDataFilterItemReq & { idx: number, values: any[] }) {
  if (changedFilterItem.operator === OperatorKind.IN || changedFilterItem.operator === OperatorKind.NIN)
    changedFilterItem.value = changedFilterItem.values

  if (props.filters && props.filters.length === 1) {
    const filters = toRaw(props.filters[0])
    if (changedFilterItem.idx === -1)
      filters.items.push(changedFilterItem)
    else
      filters.items.splice(changedFilterItem.idx, 1, changedFilterItem)
    await modifyLayoutFun({
      filters: [filters],
    })
  }
  else if (props.filters === undefined || props.filters.length === 0) {
    await modifyLayoutFun({
      filters: [
        {
          and: true,
          items: [changedFilterItem],
        },
      ],
    })
  }
}

async function deleteSimpleFilterItem(idx: number) {
  if (props.filters && props.filters.length === 1) {
    const filters = toRaw(props.filters[0])
    filters.items.splice(idx, 1)
    await modifyLayoutFun({
      filters: [filters],
    })
  }
}
</script>

<template>
  <div class="flex justify-center overflow-x-auto">
    <button v-for="(item, idx) in simpleFilterItems" :key="idx" class="btn btn-outline btn-xs flex-none mr-1">
      <span @click="event => showSimpleFilterItem(event, item, idx)">
        <i :class="props.columnsConf.find(col => col.name === item.columnName)?.icon" />
        <span class="mr-0.5">{{ props.columnsConf.find(col => col.name === item.columnName)?.title }}</span>
        <span class="mr-0.5">{{ translateOperatorKind(item.operator) }}</span>
        <span class="mr-0.5 max-w-[100px] whitespace-nowrap overflow-hidden text-ellipsis">{{
          parseDictTitle(item.columnName, item.value) }}</span>
      </span>
      <i :class="`${iconSvg.DELETE} hover:text-secondary hover:font-bold`" @click="deleteSimpleFilterItem(idx)" />
    </button>
    <div class="self-center cursor-pointer" @click="showSimpleFilterItem">
      <i :class="iconSvg.ADD" />
      <span>{{ $t('function.filter.new') }}</span>
    </div>
  </div>
  <MenuComp ref="simpleFilterCompRef">
    <div class="iw-contextmenu__item flex justify-between w-full">
      <button class="btn btn-outline btn-xs" @click="showFilterColumns">
        <i :class="selectedFilterItem?.icon ?? ''" />
        <span class="mr-0.5">{{ selectedFilterItem?.title ? selectedFilterItem?.title
          : $t('function.filter.selectColumnPlaceholder') }}</span>
        <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
      </button>
      <button v-show="selectedFilterItem" class="btn btn-outline btn-xs" @click="showFilterOps">
        <span class="mr-0.5">{{ translateOperatorKind(selectedFilterItem?.operator) }}</span>
        <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
      </button>
    </div>
    <div v-if="selectedFilterItem" class="iw-contextmenu__item flex flex-wrap w-48">
      <div
        v-for="(val, idx) in parseDictTitle(selectedFilterItem.columnName, selectedFilterItem?.values)" :key="idx"
        class="badge gap-2 m-1"
      >
        {{ val }}
        <i
          :class="`${iconSvg.DELETE} ml-0.5 cursor-pointer`"
          @click="deleteSelectedAValue(selectedFilterItem?.values[idx])"
        />
      </div>
    </div>
    <template
      v-if="selectedFilterItem && !selectedFilterItem.useDict && selectedFilterItem.operator !== OperatorKind.ISEMPTY && selectedFilterItem.operator !== OperatorKind.NOTEMPTY"
    >
      <div v-if="selectedFilterItem?.dataKind === DataKind.BOOLEAN" class="iw-contextmenu__item w-full">
        <input
          class="toggle toggle-sm" type="checkbox" :checked="selectedFilterItem.value"
          @click="event => setFilterValue((event.target as HTMLInputElement).checked)"
        >
      </div>
      <div v-else class="iw-contextmenu__item w-full">
        <input
          class="input input-bordered input-xs w-full" :type="getInputTypeByDataKind(selectedFilterItem?.dataKind)"
          :value="selectedFilterItem.value" @change="event => setFilterValue((event.target as HTMLInputElement).value)"
        >
      </div>
    </template>
    <div v-show="selectedFilterItem?.useDict" class="iw-contextmenu__item w-full" @click="setFilterDictValue">
      <div class="divider">
        {{ $t('function.filter.dictTitle') }}
      </div>
      <div>
        <input
          v-model="searchDictValue"
          type="search"
          :placeholder="$t('function.filter.searchPlaceholder') "
          class="input input-bordered input-xs w-full max-w-xs"
        >
      </div>
      <div
        v-for="dictValue in selectedDictValues" :key="dictValue.value"
        class="iw-contextmenu__item flex w-full cursor-pointer hover:bg-base-200" :data-value="dictValue.value"
        :data-title="dictValue.title"
      >
        {{ `${dictValue.title}(${dictValue.value})` }}
      </div>
    </div>
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
    <div
      v-for="op in getOperatorKindsByDataKind(selectedFilterItem?.dataKind)" :key="op"
      class="iw-contextmenu__item flex w-full cursor-pointer" :data-op="op"
    >
      {{ translateOperatorKind(op) }}
    </div>
  </MenuComp>
</template>
