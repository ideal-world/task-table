<script setup lang="ts">
import Sortable from 'sortablejs'
import { inject, onMounted, ref, watch } from 'vue'
import * as iconSvg from '../../../assets/icon'
import { getParentWithClass, hasParentWithClass } from '../../../utils/basic'
import MenuComp, { MenuSizeKind } from '../../common/Menu.vue'
import type { CachedColumnConf } from '../../conf'
import { FUN_DELETE_CELL_DICT_ITEM_TYPE, FUN_LOAD_CELL_DICT_ITEMS_TYPE, FUN_SAVE_CELL_DICT_ITEM_TYPE, FUN_SORT_CELL_DICT_ITEM_TYPE } from '../../events'
import type { TableCellDictItem } from '../../props'

const props = defineProps<{
  curColumnConf: CachedColumnConf
  columnsConf: CachedColumnConf[]
}>()
const loadCellDictItemsFun = inject(FUN_LOAD_CELL_DICT_ITEMS_TYPE)!
const saveCellDictItemFun = inject(FUN_SAVE_CELL_DICT_ITEM_TYPE)!
const deleteCellDictItemFun = inject(FUN_DELETE_CELL_DICT_ITEM_TYPE)!
const sortCellDictItemFun = inject(FUN_SORT_CELL_DICT_ITEM_TYPE)!

const modifyDictItemCompRef = ref()
const curAllDictItems = ref<TableCellDictItem[]>([])
const curDictItems = ref<TableCellDictItem[]>([])

const selectedDictItem = ref< {
  value?: string
  title?: string
  color?: string
}>({})

watch(props, async () => {
  if (props.curColumnConf.useDict) {
    curAllDictItems.value = (await loadCellDictItemsFun(props.curColumnConf.name)).records
    curDictItems.value = curAllDictItems.value
  }
})

function searchDictItems(value: string) {
  curDictItems.value = curAllDictItems.value.filter(item => item.title.includes(value) || item.value.includes(value))
}

onMounted(async () => {
  if (props.curColumnConf.useDict) {
    curAllDictItems.value = (await loadCellDictItemsFun(props.curColumnConf.name)).records
    curDictItems.value = curAllDictItems.value
  }
  document.querySelector('.iw-column-dict-list')?.addEventListener('click', async (event) => {
    const targetEle = event.target as HTMLElement
    if (targetEle.classList.contains('iw-column-dict-list__item--delete')) {
      const value = targetEle.parentElement!.dataset.value
      await deleteCellDictItemFun(props.curColumnConf.name, value!)
      curDictItems.value = curDictItems.value.filter(val => val.value !== value)
      curAllDictItems.value = curAllDictItems.value.filter(val => val.value !== value)
    }
    else if (hasParentWithClass(targetEle, 'iw-column-dict-list__item')) {
      showModifyDictItemContextMenu(event as MouseEvent, getParentWithClass(targetEle, 'iw-column-dict-list__item')!.dataset.value)
    }
  })
  Sortable.create(document.getElementsByClassName('iw-column-dict-list')[0] as HTMLElement, {
    draggable: '.iw-column-dict-list__item',
    async onEnd(evt) {
      if (evt.oldIndex !== evt.newIndex) {
        const oriItem = curDictItems.value[evt.oldIndex!]
        const newItem = curDictItems.value[evt.newIndex!]
        await sortCellDictItemFun(props.curColumnConf.name, oriItem.value, newItem.value)
        curDictItems.value[evt.oldIndex!] = newItem
        curDictItems.value[evt.newIndex!] = oriItem
        const oriAllOriItemIdx = curAllDictItems.value.findIndex(val => val.value === oriItem.value)
        const oriAllNewItemIdx = curAllDictItems.value.findIndex(val => val.value === newItem.value)
        curAllDictItems.value[oriAllOriItemIdx] = newItem
        curAllDictItems.value[oriAllNewItemIdx] = oriItem
      }
    },
  })
})

function showModifyDictItemContextMenu(event: MouseEvent, itemValue?: any) {
  if (itemValue !== undefined) {
    selectedDictItem.value = curDictItems.value.find(val => val.value === itemValue)!
  }
  else {
    selectedDictItem.value = {
    }
  }

  const targetEle = event.target as HTMLElement
  modifyDictItemCompRef.value.show(targetEle, undefined, MenuSizeKind.SMALL, true)
}

async function setDictItemTitle(title: string) {
  const selectedValue = selectedDictItem.value.value === undefined ? title : selectedDictItem.value.value
  await saveCellDictItemFun(props.curColumnConf.name, {
    value: selectedValue,
    title,
    color: selectedDictItem.value.color,
  })
  if (selectedDictItem.value.value === undefined) {
    curAllDictItems.value.push({
      value: selectedValue,
      title,
      color: selectedDictItem.value.color,
    })
  }
  else {
    const findItem = curAllDictItems.value.find(val => val.value === selectedDictItem.value.value)!
    findItem.value = selectedValue
    findItem.title = title
    findItem.color = selectedDictItem.value.color
  }
}

async function setDictItemColor(event: MouseEvent) {
  const color = (event.target as HTMLElement).dataset.color!
  selectedDictItem.value.color = color
  if (selectedDictItem.value.value === undefined)
    return

  await saveCellDictItemFun(props.curColumnConf.name, {
    value: selectedDictItem.value.value,
    title: selectedDictItem.value.title!,
    color,
  })
}
</script>

<template>
  <div v-show="props.curColumnConf.useDict && props.curColumnConf.dictEditable" class="iw-contextmenu__item w-full">
    <div class="iw-divider">
      {{ $t('list.columnDict.dictTitle') }}
    </div>
    <div>
      <input
        type="search"
        :placeholder="$t('list.columnDict.searchPlaceholder') "
        class="iw-input iw-input-bordered iw-input-xs w-full max-w-xs"
        @input="(event) => searchDictItems((event.target as HTMLInputElement).value)"
      >
    </div>
    <div class="iw-column-dict-list">
      <div
        v-for="dictItem in curDictItems" :key="dictItem.value" :data-value="dictItem.value"
        class="iw-column-dict-list__item iw-badge iw-badge-outline m-1.5 pl-0.5 pr-0.5 flex justify-between items-center cursor-pointer"
        :style="`background-color: ${dictItem.color}`"
      >
        <div class="flex items-center">
          <i :class="iconSvg.GRABBER" />
          <div v-if="dictItem.avatar !== undefined" class="avatar">
            <div class="w-4 rounded-full">
              <img :src="dictItem.avatar">
            </div>
          </div>
          <span class="ml-1 whitespace-nowrap">{{ dictItem.title }}{{ dictItem.title !== dictItem.value ? `(${dictItem.value})` : '' }}</span>
        </div>
        <i :class="'iw-column-dict-list__item--delete cursor-pointer ' + `${iconSvg.DELETE} hover:text-secondary hover:font-bold`" />
      </div>
    </div>
    <div
      class="cursor-pointer"
      @click="event => showModifyDictItemContextMenu(event)"
    >
      <i :class="`${iconSvg.ADD} cursor-pointer mr-0.5`" /> {{ $t('list.columnDict.addTitle') }}
    </div>
  </div>
  <MenuComp ref="modifyDictItemCompRef">
    <div
      class="iw-contextmenu__item flex w-full"
    >
      <input
        :value="selectedDictItem.title" class="iw-input iw-input-bordered iw-input-xs w-32" type="text"
        :placeholder="$t('list.columnDict.titlePlaceholder')"
        @change="event => setDictItemTitle((event.target as HTMLInputElement).value)"
      >
    </div>
    <div
      class="iw-contextmenu__item flex flex-col w-full justify-center items-center" @click="setDictItemColor"
    >
      <div>
        <input type="radio" class="iw-radio iw-radio-xs border-4 m-1" data-color="#F1F0EF" style="border-color: #F1F0EF;" :checked="selectedDictItem.color === '#F1F0EF'">
        <input type="radio" class="iw-radio iw-radio-xs border-4 m-1" data-color="#E3E2E0" style="border-color: #E3E2E0;" :checked="selectedDictItem.color === '#E3E2E0'">
        <input type="radio" class="iw-radio iw-radio-xs border-4 m-1" data-color="#EEE0DA" style="border-color: #EEE0DA;" :checked="selectedDictItem.color === '#EEE0DA'">
        <input type="radio" class="iw-radio iw-radio-xs border-4 m-1" data-color="#FADEC9" style="border-color: #FADEC9;" :checked="selectedDictItem.color === '#FADEC9'">
        <input type="radio" class="iw-radio iw-radio-xs border-4 m-1" data-color="#FDECC8" style="border-color: #FDECC8;" :checked="selectedDictItem.color === '#FDECC8'">
      </div>
      <div>
        <input type="radio" class="iw-radio iw-radio-xs border-4 m-1" data-color="#FDECC8" style="border-color: #FDECC8;" :checked="selectedDictItem.color === '#FDECC8'">
        <input type="radio" class="iw-radio iw-radio-xs border-4 m-1" data-color="#D3E5EF" style="border-color: #D3E5EF;" :checked="selectedDictItem.color === '#D3E5EF'">
        <input type="radio" class="iw-radio iw-radio-xs border-4 m-1" data-color="#E8DEEE" style="border-color: #E8DEEE;" :checked="selectedDictItem.color === '#E8DEEE'">
        <input type="radio" class="iw-radio iw-radio-xs border-4 m-1" data-color="#F5E0E9" style="border-color: #F5E0E9;" :checked="selectedDictItem.color === '#F5E0E9'">
        <input type="radio" class="iw-radio iw-radio-xs border-4 m-1" data-color="#FFE2DD" style="border-color: #FFE2DD;" :checked="selectedDictItem.color === '#FFE2DD'">
      </div>
    </div>
  </MenuComp>
</template>
