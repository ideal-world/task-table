<script setup lang="ts">
import Sortable from 'sortablejs'
import { computed, inject, onMounted, ref } from 'vue'
import * as iconSvg from '../../../assets/icon'
import type { CachedColumnConf } from '../../conf'
import { FUN_DELETE_CELL_DICT_VALUE_TYPE, FUN_LOAD_CELL_DICT_VALUES_TYPE, FUN_MODIFY_COLUMN_TYPE, FUN_SAVE_CELL_DICT_VALUE_TYPE, FUN_SORT_CELL_DICT_VALUE_TYPE } from '../../events'
import type { TableCellDictValueItem, TableCellDictValueResp } from '../../props'
import MenuComp from '../common/Menu.vue'

const props = defineProps<{
  curColumnConf: CachedColumnConf | undefined
  columnsConf: CachedColumnConf[]
}>()
const modifyColumnFun = inject(FUN_MODIFY_COLUMN_TYPE)!
const loadCellDictValuesFun = inject(FUN_LOAD_CELL_DICT_VALUES_TYPE)!
const saveCellDictValueFun = inject(FUN_SAVE_CELL_DICT_VALUE_TYPE)!
const deleteCellDictValueFun = inject(FUN_DELETE_CELL_DICT_VALUE_TYPE)!
const sortCellDictValueFun = inject(FUN_SORT_CELL_DICT_VALUE_TYPE)!
const modifyDictItemCompRef = ref()
const curModifyDictItem = ref<any | undefined>()

const curDictValueResp = ref<TableCellDictValueResp>()
const searchDictValue = ref<any | undefined>()

const curDictValueItems = computed<TableCellDictValueItem[]>(() => {
  if (searchDictValue.value)
    return curDictValueResp.value!.records.filter(val => val.title.includes(searchDictValue.value) || val.value.includes(searchDictValue.value))
  else
    return curDictValueResp.value!.records
})

onMounted(async () => {
  if (props.curColumnConf?.useDict)
    curDictValueResp.value = await loadCellDictValuesFun(props.columnsConf.values!.name)

  document.querySelector('.iw-column-dict-list')?.addEventListener('click', async (event) => {
    const targetEle = event.target as HTMLElement
    if (targetEle.classList.contains('iw-column-dict-list__item--delete')) {
      const value = targetEle.parentElement!.dataset.value
      await deleteCellDictValueFun(props.curColumnConf!.name, value!)
    }
    else if (targetEle.classList.contains('iw-column-dict-list__item')) {
      const value = targetEle.parentElement!.dataset.value
      showModifyDictItemContextMenu(event as MouseEvent, value!)
    }
  })

  if (props.curColumnConf?.dictEditable) {
    Sortable.create(document.getElementsByClassName('iw-column-dict-list')[0] as HTMLElement, {
      draggable: '.iw-column-dict-list__item',
      async onEnd(evt) {
        if (evt.oldIndex !== evt.newIndex) {
          const oriValue = curDictValueItems.value[evt.oldIndex!].value
          const newValue = curDictValueItems.value[evt.newIndex!].value
          await sortCellDictValueFun(props.curColumnConf!.name, oriValue, newValue)
        }
      },
    })
  }
})

function showModifyDictItemContextMenu(event: MouseEvent, itemValue?: any) {
  curModifyDictValue.value = itemValue
  const targetEle = event.target as HTMLElement
  modifyDictItemCompRef.value.show(targetEle, undefined, undefined, true)
}
</script>

<template>
  <div v-if="props.curColumnConf?.useDict" class="iw-contextmenu__item w-full">
    <div class="divider">
      {{ $t('list.columnDict.dictTitle') }}
    </div>
    <div>
      <input
        v-model="searchDictValue"
        type="search"
        :placeholder="$t('list.columnDict.searchPlaceholder') "
        class="input input-bordered input-xs w-full max-w-xs"
      >
    </div>
    <div class="iw-column-dict-list">
      <div
        v-for="dictItem in curDictValueItems" :key="dictItem.value" :data-value="dictItem.value"
        class="iw-column-dict-list__item badge badge-outline mr-0.5 pl-0.5 w-full flex justify-between"
        :style="`background-color: ${dictItem.color}`"
      >
        <div class="flex items-center">
          <i v-if="props.curColumnConf?.dictEditable" :class="`${iconSvg.GRABBER} cursor-pointer mr-0.5`" />
          <div v-if="dictItem.avatar !== undefined" class="avatar">
            <div class="w-4 rounded-full">
              <img :src="dictItem.avatar">
            </div>
          </div>
          <span class="ml-1">{{ dictItem.title }}</span>
        </div>
        <i :class="'iw-column-dict-list__item--delete ' + `${iconSvg.DELETE} hover:text-secondary hover:font-bold`" />
      </div>
    </div>
    <div
      v-if="props.curColumnConf?.dictEditable"
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
        v-model="newColumnInfo.title" class="input input-bordered input-xs w-28" type="text"
        :placeholder="$t('list.columnNew.columnNamePlaceholder')"
      >
    </div>
  </MenuComp>
</template>
