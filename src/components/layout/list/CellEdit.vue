<script setup lang="ts">
import { inject, onMounted, ref, toRaw } from 'vue'
import * as iconSvg from '../../../assets/icon'
import { getParentWithClass } from '../../../utils/basic'
import MenuComp, { MenuOffsetKind } from '../../common/Menu.vue'
import type { CachedColumnConf } from '../../conf'
import { getInputTypeByDataKind } from '../../conf'
import { FUN_LOAD_CELL_DICT_ITEMS_TYPE, FUN_UPDATE_DATA_TYPE } from '../../events'
import type { TableCellDictItem, TableDataGroupResp, TableDataResp } from '../../props'
import { DATA_DICT_POSTFIX, DataKind } from '../../props'

const props = defineProps<{
  columnsConf: CachedColumnConf[]
  data: TableDataResp | TableDataGroupResp[]
  pkColumnName: string
}>()

const loadCellDictItemsFun = inject(FUN_LOAD_CELL_DICT_ITEMS_TYPE)!
const updateDataFun = inject(FUN_UPDATE_DATA_TYPE)!

const cellEditSimpleRef = ref()
const cellEditDictContextMenuRef = ref()

const curColumnConf = ref<CachedColumnConf>()
const curRowPk = ref()
const curCellValue = ref()

const curAllDictItems = ref<TableCellDictItem[]>([])
const curDictItems = ref<TableCellDictItem[]>([])
const selectedDictItems = ref<TableCellDictItem[]>([])
const searchDictValue = ref()

async function enterEditMode(curCellEle: HTMLElement) {
  const columnName = curCellEle.dataset.targetColumnName!
  const columnConf = props.columnsConf.find(col => col.name === columnName)!
  curColumnConf.value = columnConf
  const rowPkStr = curCellEle.dataset.targetRowPk!
  curRowPk.value = props.columnsConf.find(col => col.name === props.pkColumnName)?.dataKind === DataKind.NUMBER ? Number.parseInt(rowPkStr)! : rowPkStr
  if (Array.isArray(props.data)) {
    for (const group of props.data) {
      for (const record of group.records) {
        if (record[props.pkColumnName] === curRowPk.value) {
          curCellValue.value = record[columnName]
          break
        }
      }
      if (curCellValue.value !== undefined)
        break
    }
  }
  else {
    for (const record of props.data.records) {
      if (record[props.pkColumnName] === curRowPk.value) {
        curCellValue.value = record[columnName]
        break
      }
    }
  }
  if (curColumnConf.value.useDict) {
    curAllDictItems.value = (await loadCellDictItemsFun(curColumnConf.value!.name)).records
    selectedDictItems.value = []
    if (curColumnConf.value.multiValue) {
      for (const val of curCellValue.value)
        selectedDictItems.value.push(curAllDictItems.value.find(dictItem => dictItem.value === val)!)
    }
    else {
      selectedDictItems.value.push(curAllDictItems.value.find(dictItem => dictItem.value === curCellValue.value)!)
    }
    filterCurDictItems()
    cellEditDictContextMenuRef.value.show(curCellEle, MenuOffsetKind.LEFT_TOP)
  }
  else {
    const cellEditEle = cellEditSimpleRef.value as HTMLElement
    cellEditEle.style.left = `${curCellEle.offsetLeft - 1}px`
    cellEditEle.style.top = `${curCellEle.offsetTop - 1}px`
    cellEditEle.style.width = `${curCellEle.offsetWidth + 2}px`
    cellEditEle.style.height = `${curCellEle.offsetHeight + 2}px`
    cellEditEle.style.display = `flex`
    const inputElement = cellEditEle.children[0] as HTMLElement
    inputElement.focus()
  }
  curCellEle.style.display = `none`
}

function leaveEditMode() {
  curColumnConf.value = undefined
  curRowPk.value = undefined
  curCellValue.value = undefined
  const cellEditEle = cellEditSimpleRef.value as HTMLElement
  cellEditEle.style.display = `none`
}

onMounted(() => {
  document.addEventListener('click', async (event) => {
    if (!(event.target instanceof HTMLElement))
      return

    const cellEle = getParentWithClass(event.target, 'iw-list-fill--select')
    if (!cellEle)
      return

    leaveEditMode()
    await enterEditMode(cellEle)
  })
  document.addEventListener('keydown', async (event: KeyboardEvent) => {
    if (event.key !== 'Enter')
      return

    if (!(event.target instanceof HTMLElement))
      return

    const cellEle = event.target.querySelector('.iw-list-fill--select')
    if (!cellEle || (cellEle as HTMLElement).style.display === 'none')
      return
    
    leaveEditMode()
    await enterEditMode(cellEle as HTMLElement)
  })
})

function filterCurDictItems() {
  curDictItems.value = curAllDictItems.value.filter(item =>
    (!searchDictValue.value || (item.title.includes(searchDictValue.value) || item.value.includes(searchDictValue.value)))
    && selectedDictItems.value.findIndex(dictItem => dictItem.value === item.value) === -1,
  )
}

function searchDictItems(value: string) {
  searchDictValue.value = value
  filterCurDictItems()
}

async function updateDictItem() {
  filterCurDictItems()
  const newValue = curColumnConf.value!.multiValue ? selectedDictItems.value.map(item => item.value) : selectedDictItems.value[0].value
  await updateDataFun([{
    [props.pkColumnName]: curRowPk.value,
    [curColumnConf.value!.name]: newValue,
    [curColumnConf.value!.name + DATA_DICT_POSTFIX]: toRaw(selectedDictItems.value),
  }])
}

async function selectDictItem(event: MouseEvent) {
  const dictItemEle = getParentWithClass(event.target as HTMLElement, 'iw-column-dict-list__item')!
  const dictItemValue = dictItemEle.dataset.value!
  selectedDictItems.value.push(curAllDictItems.value.find(item => item.value === dictItemValue)!)
  updateDictItem()
}

async function deleteDictItem(value: string) {
  selectedDictItems.value = selectedDictItems.value.filter(item => item.value !== value)
  updateDictItem()
}

async function setCellValue(value: any) {
  if (value !== curCellValue.value) {
    await updateDataFun([{
      [props.pkColumnName]: curRowPk.value,
      [curColumnConf.value!.name]: value,
    }])
  }
  leaveEditMode()
}
</script>

<template>
  <div ref="cellEditSimpleRef" class="items-center absolute z-50 hidden">
    <template v-if="curColumnConf?.dataKind === DataKind.BOOLEAN">
      <input
        class="toggle ml-1" type="checkbox" :checked="curCellValue"
        @click="event => setCellValue((event.target as HTMLInputElement).checked)"
      >
    </template>
    <template v-else>
      <input
        class="input input-bordered rounded-none border-2 pl-0.5 pr-0.5 h-full w-full" :type="getInputTypeByDataKind(curColumnConf?.dataKind)"
        :value="curCellValue" @change="event => setCellValue((event.target as HTMLInputElement).value)"
      >
    </template>
  </div>
  <MenuComp ref="cellEditDictContextMenuRef">
    <div v-if="selectedDictItems.length > 0" class="iw-contextmenu__item flex flex-wrap w-48">
      <div
        v-for="selectedDictItem in selectedDictItems" :key="selectedDictItem.value"
        class="iw-column-dict-list__item badge badge-outline m-1.5 pl-0.5 pr-0.5 flex items-center cursor-pointer"
        :style="`background-color: ${selectedDictItem.color}`"
      >
        <div v-if="selectedDictItem.avatar !== undefined" class="avatar">
          <div class="w-4 rounded-full">
            <img :src="selectedDictItem.avatar">
          </div>
        </div>
        <span class="ml-1 whitespace-nowrap">{{ selectedDictItem.title }}{{ selectedDictItem.title !== selectedDictItem.value ? `(${selectedDictItem.value})` : '' }}</span>
        <i
          :class="`${iconSvg.DELETE} ml-0.5 cursor-pointer`"
          @click="deleteDictItem(selectedDictItem.value)"
        />
      </div>
    </div>
    <div class="iw-contextmenu__item w-full">
      <div class="divider">
        {{ $t('list.cellEdit.dictTitle') }}
      </div>
      <div>
        <input
          type="search"
          :placeholder="$t('list.cellEdit.searchPlaceholder') "
          class="input input-bordered input-xs w-full max-w-xs"
          @input="(event) => searchDictItems((event.target as HTMLInputElement).value)"
        >
      </div>
      <div class="iw-column-dict-list" @click="selectDictItem">
        <div
          v-for="dictItem in curDictItems" :key="dictItem.value" :data-value="dictItem.value"
          class="iw-column-dict-list__item badge badge-outline m-1.5 pl-0.5 pr-0.5 flex items-center cursor-pointer"
          :style="`background-color: ${dictItem.color}`"
        >
          <div v-if="dictItem.avatar !== undefined" class="avatar">
            <div class="w-4 rounded-full">
              <img :src="dictItem.avatar">
            </div>
          </div>
          <span class="ml-1 whitespace-nowrap">{{ dictItem.title }}{{ dictItem.title !== dictItem.value ? `(${dictItem.value})` : '' }}</span>
        </div>
      </div>
    </div>
  </MenuComp>
</template>
