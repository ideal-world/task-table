<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import type { DataKind, TableCellDictItemsResp, TableDataFilterItemProps, TableDataFilterProps } from '../../props'
import { OperatorKind, translateOperatorKind } from '../../props'
import MenuComp, { MenuOffsetKind, MenuSizeKind } from '../common/Menu.vue'
import type { TableColumnConf } from '../conf'
import { getInputTypeByDataKind, getOperatorKindsByDataKind } from '../conf'
import * as eb from '../eventbus'
import { IwUtils } from '../../utils'

const props = defineProps<{
  filters?: TableDataFilterProps[]
  columnsConf: TableColumnConf[]
}>()

// const selectedDictItemResp = ref<TableCellDictItemsResp | undefined>()
// const searchDictValue = ref<any | undefined>()

// const selectedDictItems = computed<TableCellDictItemProps[]>(() => {
//   if (!selectedDictItemResp.value)
//     return []

//   let dictItems = []
//   if (selectedFilterItem.value) {
//     if (Array.isArray(selectedFilterItem.value.value))
//       dictItems = selectedDictItemResp.value.records.filter(val => selectedFilterItem.value?.value.indexOf(val.value) === -1)
//     else
//       dictItems = selectedDictItemResp.value.records.filter(val => selectedFilterItem.value?.value !== val.value)
//   }
//   else {
//     dictItems = selectedDictItemResp.value.records
//   }
//   if (searchDictValue.value)
//     dictItems = dictItems.filter(val => val.title.includes(searchDictValue.value) || val.value.includes(searchDictValue.value))

//   return dictItems
// })

// const simpleFilterItems = computed<TableDataFilterItemProps[]>(() => {
//   // Simple mode supports only one group of and conditions
//   if (props.filters && props.filters.length === 1)
//     return props.filters[0].items

//   return []
// })

// async function setFilterColumn(e: MouseEvent) {
//   const targetEle = e.target as HTMLElement
//   const selectedColumnName = targetEle.dataset.columnName
//   filterColumnCompRef.value?.close()
//   if (!selectedColumnName)
//     return

//   const selectedColumnConf = props.columnsConf.find(col => col.name === selectedColumnName)!
//   if (!selectedFilterItem.value) {
//     // New filter
//     selectedFilterItem.value = {
//       columnName: selectedColumnName,
//       operator: OperatorKind.EQ,
//       ...selectedColumnConf,
//       idx: -1,
//       values: [],
//     }
//   }
//   else {
//     selectedFilterItem.value = {
//       ...selectedFilterItem.value,
//       ...selectedColumnConf,
//       columnName: selectedColumnName,
//       operator: OperatorKind.EQ,
//       value: undefined,
//       values: [],
//     }
//   }
//   if (selectedFilterItem.value.value !== undefined || selectedFilterItem.value.operator === OperatorKind.IS_EMPTY || selectedFilterItem.value.operator === OperatorKind.NOT_EMPTY)
//     await newOrModifySimpleFilterItem(selectedFilterItem.value)

//   if (selectedFilterItem.value && selectedFilterItem.value.useDict) {
//     const values = await eb.loadCellDictItems(selectedFilterItem.value.columnName as string)
//     selectedDictItemResp.value = values
//   }
//   else {
//     selectedDictItemResp.value = undefined
//   }
//   searchDictValue.value = undefined
// }

// async function setFilterDictItem(e: Event) {
//   const targetEle = getParentWithClass(e.target as HTMLElement, 'iw-contextmenu__item')
//   if (!targetEle)
//     return

//   if (!targetEle.dataset.value || !targetEle.dataset.title)
//     return
//   const value = targetEle.dataset.value
//   const title = targetEle.dataset.title
//   if (selectedFilterItem.value && Array.isArray(selectedFilterItem.value.value))
//     selectedFilterItem.value.values.push(value)
//   else
//     selectedFilterItem.value!.value = value

//   usedDictValues.value[`${selectedFilterItem.value?.columnName}-${value}`] = title
//   if (!Array.isArray(selectedFilterItem.value?.value))
//     simpleFilterCompRef.value?.close()

//   await newOrModifySimpleFilterItem(selectedFilterItem.value!)
// }

// async function newOrModifySimpleFilterItem(changedFilterItem: TableDataFilterItemProps & { idx: number, values: any[] }) {
//   if (changedFilterItem.operator === OperatorKind.IN || changedFilterItem.operator === OperatorKind.NOT_IN)
//     changedFilterItem.value = changedFilterItem.values

//   if (props.filters && props.filters.length === 1) {
//     const filters = JSON.parse(JSON.stringify(props.filters[0]))
//     if (changedFilterItem.idx === -1) {
//       filters.items.push({
//         columnName: changedFilterItem.columnName,
//         operator: changedFilterItem.operator,
//         value: changedFilterItem.value,
//       })
//     }
//     else {
//       filters.items.splice(changedFilterItem.idx, 1, {
//         columnName: changedFilterItem.columnName,
//         operator: changedFilterItem.operator,
//         value: changedFilterItem.value,
//       })
//     }
//     await eb.modifyLayout({
//       filters: [filters],
//     })
//   }
//   else if (props.filters === undefined || props.filters.length === 0) {
//     await eb.modifyLayout({
//       filters: [
//         {
//           items: [{
//             columnName: changedFilterItem.columnName,
//             operator: changedFilterItem.operator,
//             value: changedFilterItem.value,
//           }],
//         },
//       ],
//     })
//   }
// }

// async function deleteSimpleFilterItem(idx: number) {
//   if (props.filters && props.filters.length === 1) {
//     const filters = JSON.parse(JSON.stringify(props.filters[0]))
//     filters.items.splice(idx, 1)
//     await eb.modifyLayout({
//       filters: [filters],
//     })
//   }
// }
const filterGroupContainerCompRef = ref<InstanceType<typeof MenuComp>>()
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
const selectedFilterItemIdx = ref<number | undefined>()
// column name + '-' + column value -> dict title
const mappingColumValueAndDictTitle = ref<{ [key: string | number]: string }>({})

function showFilterGroupContainer(e: Event, filterGroupIdx?: number) {
  const targetEle = e.target as HTMLElement
  if (filterGroupIdx) {
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

function parseDictTitle(columnName: string, value?: any): any {
  if (value === undefined) {
    return ''
  }
  if (Array.isArray(value)) {
    return value.map(val => mappingColumValueAndDictTitle.value[`${columnName}-${val}`] ?? val)
  }
  else {
    return mappingColumValueAndDictTitle.value[`${columnName}-${value}`] ?? value
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
}

function deleteAValue(filterItemIdx: number, valueIdx: number) {
  selectedFilterGroup.value?.[filterItemIdx]?.values.slice(valueIdx, 1)
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
  if (e.target instanceof HTMLElement && e.target.classList.contains('iw-contextmenu__item')) {
    const dictItemTitle = e.target.dataset.title
    const dictItemValue = e.target.dataset.value
    const currFilterItem = selectedFilterGroup.value?.[electedFilterItemIdx.value!]
    setFilterAValue(dictItemValue, selectedFilterItemIdx.value!)
    mappingColumValueAndDictTitle.value[`${currFilterItem+'-'+dictItemValue}`] = dictItemTitle
  }
}
</script>

<template>
  <div class="flex justify-center overflow-x-auto">
    <button v-for="(filterGroup, filterGroupIdx) in props.filters" :key="filterGroupIdx" class="iw-btn iw-btn-outline iw-btn-xs flex-none mr-1">
      <span @click="e => showFilterGroupContainer(e, filterGroupIdx)">
        <template v-if="filterGroup.items.length === 1">
          <span class="mr-0.5">{{ props.columnsConf.find(col => col.name === filterGroup.items[0].columnName)?.title }}</span>
          <span class="mr-0.5">{{ translateOperatorKind(filterGroup.items[0].operator) }}</span>
          <span class="mr-0.5 max-w-[100px] whitespace-nowrap overflow-hidden text-ellipsis">{{
            parseDictTitle(filterGroup.items[0].columnName as string, filterGroup.items[0].value) }}</span>
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
        <input
          v-if="filterItem.operator !== OperatorKind.IN && filterItem.operator !== OperatorKind.NOT_IN && filterItem.useDict"
          class="iw-input iw-input-bordered iw-input-xs w-full" :type="getInputTypeByDataKind(filterItem.dataKind)"
          :value="filterItem.values" @change="e => { showDictItems((e.target as HTMLInputElement).value, filterItemIdx, e) }"
        >
        <label v-else-if="!filterItem.useDict" class="iw-input iw-input-xs iw-input-bordered flex items-center gap-2">
          <span v-for="(valueTitle, valueIdx) in parseDictTitle(filterItem.columnName, filterItem.values)" :key="valueIdx" class="iw-badge iw-badge-info">
            {{ valueTitle }}
            <i
              :class="`${iconSvg.DELETE} ml-0.5 cursor-pointer`"
              @click="deleteAValue(filterItemIdx, valueIdx)"
            />
          </span>
          <input
            class="iw-grow" :type="getInputTypeByDataKind(filterItem.dataKind)"
            :value="filterItem.values" @keyup.enter="e => setFilterAValue((e.target as HTMLInputElement).value, filterItemIdx)"
          >
        </label>
        <label v-else class="iw-input iw-input-xs iw-input-bordered flex items-center gap-2">
          <span v-for="(valueTitle, valueIdx) in parseDictTitle(filterItem.columnName, filterItem.values)" :key="valueIdx" class="iw-badge iw-badge-info">
            {{ valueTitle }}
            <i
              :class="`${iconSvg.DELETE} ml-0.5 cursor-pointer`"
              @click="deleteAValue(filterItemIdx, valueIdx)"
            />
          </span>
          <input
            class="iw-grow" :type="getInputTypeByDataKind(filterItem.dataKind)"
            :value="filterItem.values" @change="e => { showDictItems((e.target as HTMLInputElement).value, filterItemIdx, e) }"
          >
        </label>
      </div>
      <i :class="`${iconSvg.DELETE} hover:text-secondary hover:font-bold`" @click="deleteFilterItem(filterItemIdx)" />
    </div>
    <button class="iw-btn iw-btn-outline iw-btn-xs" @click="showFilterColumns">
      <span class="mr-0.5">{{ $t('function.filter.selectColumnPlaceholder') }}</span>
      <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
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
        class="iw-contextmenu__item flex cursor-pointer iw-badge iw-badge-outline m-1.5 pl-0.5" :data-value="dictItem.value"
        :data-title="dictItem.title"
      >
        <div v-if="dictItem.avatar !== undefined" class="avatar">
          <div class="w-4 rounded-full">
            <img :src="dictItem.avatar">
          </div>
        </div>
        <span class="ml-1 whitespace-nowrap">{{ dictItem.title }}{{ dictItem.title !== dictItem.value ? `(${dictItem.value})` : '' }}</span>
      </div>
    </div>
  </MenuComp>
</template>
