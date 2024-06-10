<script setup lang="ts">
import Sortable from 'sortablejs'
import { onMounted, ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import type { TableDataSortProps } from '../../props'
import MenuComp, { MenuOffsetKind } from '../common/Menu.vue'
import type { TableColumnConf } from '../conf'
import * as eb from '../eventbus'

const props = defineProps<{
  layoutId: string
  sorts?: TableDataSortProps[]
  columnsConf: TableColumnConf[]
}>()

const sortCompRef = ref<InstanceType<typeof MenuComp>>()

function showRowSortContextMenu(event: MouseEvent) {
  const targetEle = event.target as HTMLElement
  sortCompRef.value?.show(targetEle, MenuOffsetKind.LEFT_TOP)
}

onMounted(() => {
  Sortable.create(document.getElementsByClassName('iw-row-sort')[0] as HTMLElement, {
    draggable: '.iw-row-sort__item',
    async onEnd(evt) {
      if (evt.oldIndex !== evt.newIndex && evt.oldIndex !== -1 && evt.newIndex !== -1 && props.sorts) {
        const oriSort = props.sorts[evt.oldIndex! - 1]
        const sorts = JSON.parse(JSON.stringify(props.sorts))
        sorts.splice(evt.oldIndex! - 1, 1)
        sorts.splice(evt.newIndex! - 1, 0, oriSort)
        await eb.modifyLayout({
          sorts,
        })
      }
    },
  })
})

async function toggleSort(columnName: string, orderDesc: boolean) {
  props.sorts?.find(sort => sort.columnName === columnName && sort.orderDesc === orderDesc)
    ? await deleteSort(columnName)
    : await addSort(columnName, orderDesc)
}

async function deleteSort(columnName: string) {
  const sorts = props.sorts?.filter(sort => sort.columnName !== columnName)
  await eb.modifyLayout({
    sorts,
  })
}

function addSort(columnName: string, orderDesc: boolean) {
  const sorts = props.sorts ? props.sorts.filter(sort => sort.columnName !== columnName) : []
  sorts.push({
    columnName,
    orderDesc,
  })
  eb.modifyLayout({
    sorts,
  })
}
</script>

<template>
  <button class="iw-btn iw-btn-outline iw-btn-xs" @click="showRowSortContextMenu">
    <i :class="iconSvg.SORT" />
    <span class="mr-0.5">{{ props.sorts?.length }}</span>
    {{ $t(props.sorts?.length! > 1 ? 'function.rowSort.multiTitle' : 'function.rowSort.singleTitle') }}
    <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
  </button>
  <MenuComp ref="sortCompRef" class="iw-row-sort">
    <div class="iw-divider">
      {{ $t('function.rowSort.sortedColumns') }}
    </div>
    <div
      v-for="column in props.sorts"
      :key="column.columnName"
      class="iw-row-sort__item p-1 flex w-full justify-between cursor-pointer"
    >
      <div>
        <i :class="`${iconSvg.GRABBER} cursor-pointer mr-0.5`" />
        <i :class="`${props.columnsConf.find(col => col.name === column.columnName)?.icon} mr-0.5`" />
        {{ props.columnsConf.find(col => col.name === column.columnName)?.title }}
      </div>
      <div class="iw-join ml-1">
        <button
          class="iw-join-item iw-btn iw-btn-xs"
          :class="props.sorts?.find(sort => sort.columnName === column.columnName && !sort.orderDesc) ? 'iw-btn-active' : ''"
          :title="$t('function.rowSort.asc')" @click="toggleSort(column.columnName, false)"
        >
          <i :class="`${iconSvg.ASC}`" />
        </button>
        <button
          class="iw-join-item iw-btn iw-btn-xs"
          :class="props.sorts?.find(sort => sort.columnName === column.columnName && sort.orderDesc) ? 'iw-btn-active' : ''"
          :title="$t('function.rowSort.desc')" @click="toggleSort(column.columnName, true)"
        >
          <i :class="`${iconSvg.DESC}`" />
        </button>
      </div>
    </div>
    <div class="iw-divider">
      {{ $t('function.rowSort.sortableColumns') }}
    </div>
    <div
      v-for="column in props.columnsConf.filter(col => col.sortable && !props.sorts?.find(sort => sort.columnName === col.name))"
      :key="`${props.layoutId}-${column.name}`"
      class="p-1 flex w-full justify-between cursor-pointer" :data-column-name="column.name"
    >
      <div>
        <i :class="`${column.icon} mr-0.5 ml-1`" />
        {{ column.title }}
      </div>
      <div class="iw-join ml-1">
        <button
          class="iw-join-item iw-btn iw-btn-xs"
          :class="props.sorts?.find(sort => sort.columnName === column.name && !sort.orderDesc) ? 'iw-btn-active' : ''"
          :title="$t('function.rowSort.asc')" @click="toggleSort(column.name, false)"
        >
          <i :class="`${iconSvg.ASC}`" />
        </button>
        <button
          class="iw-join-item iw-btn iw-btn-xs"
          :class="props.sorts?.find(sort => sort.columnName === column.name && sort.orderDesc) ? 'iw-btn-active' : ''"
          :title="$t('function.rowSort.desc')" @click="toggleSort(column.name, true)"
        >
          <i :class="`${iconSvg.DESC}`" />
        </button>
      </div>
    </div>
  </MenuComp>
</template>
