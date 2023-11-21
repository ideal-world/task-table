<script setup lang="ts">
import Sortable from 'sortablejs';
import { inject, onMounted, ref } from 'vue';
import * as iconSvg from '../../assets/icon';
import MenuComp from '../common/Menu.vue';
import { TableColumnConf } from '../conf';
import { FUN_MODIFY_LAYOUT_TYPE } from '../events';
import { TableDataSortReq } from '../props';

const props = defineProps<{
  sorts?: TableDataSortReq[],
  columnsConf: TableColumnConf[]
}>()
const modifyLayoutFun = inject(FUN_MODIFY_LAYOUT_TYPE)!
const sortCompRef = ref()
const sortColumnCompRef = ref()
const sortAscDescCompRef = ref()
const tmpNewSortColumnName = ref<string | undefined>()
const tmpNewSortOrderDesc = ref<boolean | undefined>()

const curModifyColumnName = ref<string | undefined>()

const showRowSort = (event: MouseEvent) => {
  const targetEle = event.target as HTMLElement
  sortCompRef.value.show(targetEle)
}

const showSortColumns = (event: MouseEvent, columnName?: string) => {
  curModifyColumnName.value = columnName
  const targetEle = event.target as HTMLElement
  sortColumnCompRef.value.show(targetEle, undefined, undefined, true)
}

const showSortAscDesc = (event: MouseEvent, columnName?: string) => {
  curModifyColumnName.value = columnName
  const targetEle = event.target as HTMLElement
  sortAscDescCompRef.value.show(targetEle, undefined, undefined, true)
}

const setSortColumn = async (event: MouseEvent) => {
  const targetEle = event.target as HTMLElement
  const selectedColumnName = targetEle.dataset.columnName
  sortColumnCompRef.value.close()
  if (!selectedColumnName) {
    return
  }
  if (curModifyColumnName.value && props.sorts) {
    modifySort(curModifyColumnName.value, selectedColumnName, props.sorts.find(sort => sort.columnName == curModifyColumnName.value)?.orderDesc ?? false)
  } else if (tmpNewSortOrderDesc.value) {
    addSort(selectedColumnName, tmpNewSortOrderDesc.value)
  } else {
    tmpNewSortColumnName.value = selectedColumnName
  }
}

const setSortAscDesc = async (event: MouseEvent) => {
  const targetEle = event.target as HTMLElement
  const selectedDesc = targetEle.dataset.desc != undefined
  sortAscDescCompRef.value.close()
  if (curModifyColumnName.value) {
    modifySort(curModifyColumnName.value, curModifyColumnName.value, selectedDesc)
  } else if (tmpNewSortColumnName.value) {
    addSort(tmpNewSortColumnName.value, selectedDesc)
  } else {
    tmpNewSortOrderDesc.value = selectedDesc
  }
}

const addSort = async (newColumnName: string, newOrderDesc: boolean) => {
  if (props.sorts) {
    props.sorts.push({
      columnName: newColumnName,
      orderDesc: newOrderDesc
    })
    await modifyLayoutFun({
      sorts: props.sorts
    })
  } else {
    await modifyLayoutFun({
      sorts: [{
        columnName: newColumnName,
        orderDesc: newOrderDesc
      }]
    })
  }
  tmpNewSortColumnName.value = undefined
  tmpNewSortOrderDesc.value = undefined
}


const modifySort = async (oriColumnName: string, newColumnName: string, newOrderDesc: boolean) => {
  props.sorts?.splice(props.sorts?.findIndex(sort => sort.columnName == oriColumnName), 1, {
    columnName: newColumnName,
    orderDesc: newOrderDesc
  })
  await modifyLayoutFun({
    sorts: props.sorts
  })
}

const deleteSort = async (columnName: string) => {
  const newSorts = props.sorts?.filter(sort => sort.columnName != columnName)
  await modifyLayoutFun({
    sorts: newSorts
  })
}

onMounted(() => {
  Sortable.create(document.getElementsByClassName('iw-row-sort')[0] as HTMLElement, {
    draggable: '.iw-row-sort__item',
    onEnd: async function (evt) {
      if (evt.oldIndex != evt.newIndex && props.sorts) {
        const oriSort = props.sorts[evt.oldIndex!]
        props.sorts?.splice(evt.oldIndex!, 1)
        props.sorts?.splice(evt.newIndex!, 0, oriSort)
        await modifyLayoutFun({
          sorts: props.sorts
        })
      }
    },
  })
})

</script>

<template>
  <button class="btn btn-outline btn-xs" @click="showRowSort">
    <i :class="iconSvg.SORT"></i>
    <span class="mr-0.5">{{ props.sorts?.length }}</span>
    {{ $t(props.sorts?.length! > 1 ? 'function.rowSort.multiTitle' : 'function.rowSort.singleTitle') }}
    <i :class="iconSvg.CHEVRON_DOWN + ' ml-0.5'"></i>
  </button>
  <menu-comp ref="sortCompRef" class="iw-row-sort">
    <div v-for="sort of props.sorts" :key="sort.columnName"
      class="iw-contextmenu__item iw-row-sort__item flex justify-between w-full">
      <span>
        <i :class="iconSvg.GRABBER + ' cursor-pointer mr-0.5'"></i>
        <button class="btn btn-outline btn-xs" @click="event => showSortColumns(event, sort.columnName)">
          <i :class="props.columnsConf.find(col => col.name == sort.columnName)?.icon"></i>
          <span class="mr-0.5">{{ props.columnsConf.find(col => col.name == sort.columnName)?.title }}</span>
          <i :class="iconSvg.CHEVRON_DOWN + ' ml-0.5'"></i>
        </button>
      </span>
      <span> <button class="btn btn-outline btn-xs" @click="event => showSortAscDesc(event, sort.columnName)">
          {{ $t(sort.orderDesc ? 'function.rowSort.desc' : 'function.rowSort.asc') }}
          <i :class="iconSvg.CHEVRON_DOWN + ' ml-0.5'"></i>
        </button>
        <i :class="iconSvg.DELETE + '  cursor-pointer'" @click="deleteSort(sort.columnName)"></i></span>
    </div>
    <div class="iw-contextmenu__item flex justify-center w-full">
      <button class="btn btn-outline btn-xs" @click="showSortColumns">
        <i :class="props.columnsConf.find(col => col.name == tmpNewSortColumnName)?.icon"></i>
        <span class="mr-0.5">{{ props.columnsConf.find(col => col.name == tmpNewSortColumnName)?.title ??
          $t('function.rowSort.selectColumnPlaceholder') }}</span>
        <i :class="iconSvg.CHEVRON_DOWN + ' ml-0.5'"></i>
      </button>
      <button class="btn btn-outline btn-xs" @click="showSortAscDesc">
        {{ tmpNewSortOrderDesc != undefined ? $t(tmpNewSortOrderDesc ? 'function.rowSort.desc' : 'function.rowSort.asc') :
          $t('function.rowSort.selectAscPlaceholder') }}
        <i :class="iconSvg.CHEVRON_DOWN + ' ml-0.5'"></i>
      </button>
    </div>
  </menu-comp>
  <menu-comp ref="sortColumnCompRef" @click="setSortColumn">
    <div
      v-for="column in props.columnsConf.filter(col => col.name != curModifyColumnName && !props.sorts?.find(sort => sort.columnName == col.name))"
      class="iw-contextmenu__item flex w-full cursor-pointer" :data-column-name="column.name">
      <i :class="column.icon + ' mr-0.5'"></i>
      {{ column.title }}
    </div>
  </menu-comp>
  <menu-comp ref="sortAscDescCompRef" @click="setSortAscDesc">
    <div class="iw-contextmenu__item w-full cursor-pointer" data-desc>
      {{ $t('function.rowSort.desc') }}
    </div>
    <div class="iw-contextmenu__item w-full cursor-pointer" data-asc>
      {{ $t('function.rowSort.asc') }}
    </div>
  </menu-comp>
</template>

