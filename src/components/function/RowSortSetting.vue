<script setup lang="ts">
import Sortable from 'sortablejs'
import { onMounted, ref, toRaw } from 'vue'
import * as iconSvg from '../../assets/icon'
import type { SortDataProps } from '../../props'
import MenuComp, { MenuOffsetKind } from '../common/Menu.vue'
import type { ColumnConf } from '../conf'
import * as eb from '../eventbus'

const props = defineProps<{
  layoutId: string
  sort: SortDataProps
  layoutColumnsConf: ColumnConf[]
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
      if (evt.oldIndex !== evt.newIndex && evt.oldIndex !== -1 && evt.newIndex !== -1) {
        const oriSort = props.sort.conds[evt.oldIndex! - 1]
        const sort = toRaw(props.sort)
        sort.conds.splice(evt.oldIndex! - 1, 1)
        sort.conds.splice(evt.newIndex! - 1, 0, oriSort)
        await eb.modifyLayout({
          sort,
        })
      }
    },
  })
})

async function toggleSortCond(columnName: string, orderDesc: boolean) {
  props.sort.conds.find(cond => cond.columnName === columnName && cond.orderDesc === orderDesc)
    ? await deleteSortCond(columnName)
    : await addSortCond(columnName, orderDesc)
}

async function deleteSortCond(columnName: string) {
  const conds = props.sort.conds.filter(cond => cond.columnName !== columnName)
  await eb.modifyLayout({
    sort: {
      enabledColumnNames: props.sort.enabledColumnNames,
      conds,
    },
  })
}

function addSortCond(columnName: string, orderDesc: boolean) {
  const conds = props.sort.conds.filter(cond => cond.columnName !== columnName)
  conds.push({
    columnName,
    orderDesc,
  })
  eb.modifyLayout({
    sort: {
      enabledColumnNames: props.sort.enabledColumnNames,
      conds,
    },
  })
}
</script>

<template>
  <button class="iw-btn iw-btn-outline iw-btn-xs" @click="showRowSortContextMenu">
    <i :class="iconSvg.SORT" />
    <span class="mr-0.5">{{ props.sort.conds.length }}</span>
    {{ $t(props.sort.conds.length! > 1 ? 'function.rowSort.multiTitle' : 'function.rowSort.singleTitle') }}
    <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
  </button>
  <MenuComp ref="sortCompRef" class="iw-row-sort">
    <div class="iw-divider">
      {{ $t('function.rowSort.sortedColumns') }}
    </div>
    <div
      v-for="column in props.sort.conds"
      :key="`${props.layoutId}-${column.columnName}`"
      class="iw-row-sort__item p-1 flex w-full justify-between cursor-move"
    >
      <div>
        <i :class="`${iconSvg.GRABBER} cursor-pointer mr-0.5`" />
        <i :class="`${props.layoutColumnsConf.find(col => col.name === column.columnName)?.icon} mr-0.5`" />
        {{ props.layoutColumnsConf.find(col => col.name === column.columnName)?.title }}
      </div>
      <div class="iw-join ml-1">
        <button
          class="iw-join-item iw-btn iw-btn-xs"
          :class="props.sort.conds?.find(cond => cond.columnName === column.columnName && !cond.orderDesc) ? 'iw-btn-active' : ''"
          :title="$t('function.rowSort.asc')" @click="toggleSortCond(column.columnName, false)"
        >
          <i :class="`${iconSvg.ASC}`" />
        </button>
        <button
          class="iw-join-item iw-btn iw-btn-xs"
          :class="props.sort.conds?.find(cond => cond.columnName === column.columnName && cond.orderDesc) ? 'iw-btn-active' : ''"
          :title="$t('function.rowSort.desc')" @click="toggleSortCond(column.columnName, true)"
        >
          <i :class="`${iconSvg.DESC}`" />
        </button>
      </div>
    </div>
    <div class="iw-divider">
      {{ $t('function.rowSort.sortableColumns') }}
    </div>
    <div
      v-for="column in props.layoutColumnsConf.filter(col => props.sort.enabledColumnNames.includes(col.name) && !props.sort.conds?.find(cond => cond.columnName === col.name))"
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
          :class="props.sort.conds?.find(cond => cond.columnName === column.name && !cond.orderDesc) ? 'iw-btn-active' : ''"
          :title="$t('function.rowSort.asc')" @click="toggleSortCond(column.name, false)"
        >
          <i :class="`${iconSvg.ASC}`" />
        </button>
        <button
          class="iw-join-item iw-btn iw-btn-xs"
          :class="props.sort.conds?.find(cond => cond.columnName === column.name && cond.orderDesc) ? 'iw-btn-active' : ''"
          :title="$t('function.rowSort.desc')" @click="toggleSortCond(column.name, true)"
        >
          <i :class="`${iconSvg.DESC}`" />
        </button>
      </div>
    </div>
  </MenuComp>
</template>
