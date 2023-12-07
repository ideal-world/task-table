<script setup lang="ts">
import Sortable from 'sortablejs'
import { inject, onMounted, ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import MenuComp from '../common/Menu.vue'
import type { TableColumnConf } from '../conf'
import { FUN_MODIFY_LAYOUT_TYPE } from '../events'
import type { TableDataSortReq } from '../props'

const props = defineProps<{
  sorts?: TableDataSortReq[]
  columnsConf: TableColumnConf[]
}>()

const modifyLayoutFun = inject(FUN_MODIFY_LAYOUT_TYPE)!
const sortCompRef = ref()
const sortColumnCompRef = ref()
const sortAscDescCompRef = ref()
const tmpNewSortColumnName = ref<string | undefined>()
const tmpNewSortOrderDesc = ref<boolean | undefined>()

const curModifyColumnName = ref<string | undefined>()

function showRowSortContextMenu(event: MouseEvent) {
  const targetEle = event.target as HTMLElement
  sortCompRef.value.show(targetEle)
}

function showSortColumnContextMenu(event: MouseEvent, columnName?: string) {
  curModifyColumnName.value = columnName
  const targetEle = event.target as HTMLElement
  sortColumnCompRef.value.show(targetEle, undefined, undefined, true)
}

function showSortAscDescContextMenu(event: MouseEvent, columnName?: string) {
  curModifyColumnName.value = columnName
  const targetEle = event.target as HTMLElement
  sortAscDescCompRef.value.show(targetEle, undefined, undefined, true)
}

async function setSortColumn(event: MouseEvent) {
  const targetEle = event.target as HTMLElement
  const selectedColumnName = targetEle.dataset.columnName
  sortColumnCompRef.value.close()
  if (!selectedColumnName)
    return

  if (curModifyColumnName.value && props.sorts)
    await modifySort(curModifyColumnName.value, selectedColumnName, props.sorts.find(sort => sort.columnName === curModifyColumnName.value)?.orderDesc ?? false)
  else if (tmpNewSortOrderDesc.value)
    await addSort(selectedColumnName, tmpNewSortOrderDesc.value)
  else
    tmpNewSortColumnName.value = selectedColumnName
}

async function setSortAscDesc(event: MouseEvent) {
  const targetEle = event.target as HTMLElement
  const selectedDesc = targetEle.dataset.desc !== undefined
  sortAscDescCompRef.value.close()
  if (curModifyColumnName.value)
    await modifySort(curModifyColumnName.value, curModifyColumnName.value, selectedDesc)
  else if (tmpNewSortColumnName.value)
    await addSort(tmpNewSortColumnName.value, selectedDesc)
  else
    tmpNewSortOrderDesc.value = selectedDesc
}

async function addSort(newColumnName: string, newOrderDesc: boolean) {
  if (props.sorts) {
    const sorts = JSON.parse(JSON.stringify(props.sorts))
    sorts.push({
      columnName: newColumnName,
      orderDesc: newOrderDesc,
    })
    await modifyLayoutFun({
      sorts,
    })
  }
  else {
    await modifyLayoutFun({
      sorts: [{
        columnName: newColumnName,
        orderDesc: newOrderDesc,
      }],
    })
  }
  tmpNewSortColumnName.value = undefined
  tmpNewSortOrderDesc.value = undefined
}

async function modifySort(oriColumnName: string, newColumnName: string, newOrderDesc: boolean) {
  const sorts = JSON.parse(JSON.stringify(props.sorts!)) as TableDataSortReq[]
  sorts.splice(sorts.findIndex(sort => sort.columnName === oriColumnName), 1, {
    columnName: newColumnName,
    orderDesc: newOrderDesc,
  })
  await modifyLayoutFun({
    sorts,
  })
}

async function deleteSort(columnName: string) {
  const newSorts = JSON.parse(JSON.stringify(props.sorts?.filter(sort => sort.columnName !== columnName)))
  await modifyLayoutFun({
    sorts: newSorts,
  })
}

onMounted(() => {
  Sortable.create(document.getElementsByClassName('iw-row-sort')[0] as HTMLElement, {
    draggable: '.iw-row-sort__item',
    async onEnd(evt) {
      if (evt.oldIndex !== evt.newIndex && props.sorts) {
        const oriSort = props.sorts[evt.oldIndex!]
        const sorts = JSON.parse(JSON.stringify(props.sorts))
        sorts.splice(evt.oldIndex!, 1)
        sorts.splice(evt.newIndex!, 0, oriSort)
        await modifyLayoutFun({
          sorts,
        })
      }
    },
  })
})
</script>

<template>
  <button class="btn btn-outline btn-xs" @click="showRowSortContextMenu">
    <i :class="iconSvg.SORT" />
    <span class="mr-0.5">{{ props.sorts?.length }}</span>
    {{ $t(props.sorts?.length! > 1 ? 'function.rowSort.multiTitle' : 'function.rowSort.singleTitle') }}
    <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
  </button>
  <MenuComp ref="sortCompRef">
    <div class="iw-row-sort">
      <div
        v-for="sort of props.sorts" :key="sort.columnName"
        class="iw-contextmenu__item iw-row-sort__item flex justify-between w-full mb-1"
      >
        <span>
          <i :class="`${iconSvg.GRABBER} cursor-pointer mr-0.5`" />
          <button class="btn btn-outline btn-xs" @click="event => showSortColumnContextMenu(event, sort.columnName)">
            <i :class="props.columnsConf.find(col => col.name === sort.columnName)?.icon" />
            <span class="mr-0.5">{{ props.columnsConf.find(col => col.name === sort.columnName)?.title }}</span>
            <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
          </button>
        </span>
        <span class="ml-1">
          <button class="btn btn-outline btn-xs" @click="event => showSortAscDescContextMenu(event, sort.columnName)">
            {{ $t(sort.orderDesc ? 'function.rowSort.desc' : 'function.rowSort.asc') }}
            <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
          </button>
          <i :class="`${iconSvg.DELETE}  cursor-pointer`" @click="deleteSort(sort.columnName)" />
        </span>
      </div>
    </div>
    <div class="iw-contextmenu__item flex justify-center w-full">
      <button class="btn btn-outline btn-xs" @click="showSortColumnContextMenu">
        <i :class="props.columnsConf.find(col => col.name === tmpNewSortColumnName)?.icon" />
        <span class="mr-0.5">{{ props.columnsConf.find(col => col.name === tmpNewSortColumnName)?.title
          ?? $t('function.rowSort.selectColumnPlaceholder') }}</span>
        <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
      </button>
      <button class="btn btn-outline btn-xs ml-1" @click="showSortAscDescContextMenu">
        {{ tmpNewSortOrderDesc !== undefined ? $t(tmpNewSortOrderDesc ? 'function.rowSort.desc' : 'function.rowSort.asc')
          : $t('function.rowSort.selectAscPlaceholder') }}
        <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
      </button>
    </div>
  </MenuComp>
  <MenuComp ref="sortColumnCompRef" @click="setSortColumn">
    <div
      v-for="column in props.columnsConf.filter(col => col.name !== curModifyColumnName && !props.sorts?.find(sort => sort.columnName === col.name))"
      :key="column.name"
      class="iw-contextmenu__item flex w-full cursor-pointer" :data-column-name="column.name"
    >
      <i :class="`${column.icon} mr-0.5`" />
      {{ column.title }}
    </div>
  </MenuComp>
  <MenuComp ref="sortAscDescCompRef" @click="setSortAscDesc">
    <div class="iw-contextmenu__item w-full cursor-pointer" data-desc>
      {{ $t('function.rowSort.desc') }}
    </div>
    <div class="iw-contextmenu__item w-full cursor-pointer" data-asc>
      {{ $t('function.rowSort.asc') }}
    </div>
  </MenuComp>
</template>
