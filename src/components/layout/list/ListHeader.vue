<script setup lang="ts">
import { onMounted, ref } from 'vue'
import MenuComp from '../../common/Menu.vue'
import type { CachedColumnConf, TableBasicConf, TableLayoutConf } from '../../conf'
import * as columnResize from '../../function/ColumnResize'
import ColumnFixedComp from './ListColumnFixed.vue'
import ColumnWrapComp from './ListColumnWrap.vue'

const props = defineProps<{
  columnsConf: CachedColumnConf[]
  layout: TableLayoutConf
  basic: TableBasicConf
  setColumnStyles: (colIdx: number) => any
}>()

const selectedColumnConf = ref<CachedColumnConf | undefined>()

const listHeaderCompRef = ref<InstanceType<typeof HTMLElement>>()

const headerMenuCompRef = ref<InstanceType<typeof MenuComp>>()

function showHeaderContextMenu(event: MouseEvent, columName: string) {
  selectedColumnConf.value = props.columnsConf.find(col => col.name === columName)
  const targetEle = event.target as HTMLElement
  headerMenuCompRef.value?.show(targetEle)
}

onMounted(() => {
  columnResize.init(listHeaderCompRef.value!,props.columnsConf)
})
</script>

<template>
  <div ref="listHeaderCompRef"
    :class="`${props.basic.styles.headerClass} iw-column-header flex items-center sticky top-0 z-[1500] bg-base-200 border-t border-t-base-300 border-b border-b-base-300 border-r border-r-base-300`"
  >
    <div
      v-if="props.layout.showSelectColumn"
      :class="`${props.basic.styles.cellClass} iw-list-cell iw-column-header-cell flex justify-center items-center bg-base-200 border-l border-l-base-300`"
      :style="props.setColumnStyles(-1)"
    >
      <input type="checkbox" class="iw-row-select-all-cell__chk iw-checkbox iw-checkbox-xs">
    </div>
    <div
      v-for="(column, colIdx) in columnsConf" :key="`${props.layout.id}-${column.name}`"
      :class="`${props.basic.styles.cellClass} iw-list-cell iw-column-header-cell ${column.name !== props.basic.pkColumnName ? 'iw-list-header-normal-cell' : ''} flex items-center bg-base-200 border-l border-l-base-300 hover:cursor-pointer`"
      :data-column-name="column.name"
      :style="props.setColumnStyles(colIdx)"
      @click="(event: MouseEvent) => showHeaderContextMenu(event, column.name)"
    >
      <i :class="`${column.icon} mr-1`" /> {{ column.title }}
    </div>
    <div
      v-if="props.layout.actionColumnRender"
      :class="`${props.basic.styles.cellClass} iw-list-cell iw-column-header-cell flex justify-center items-center bg-base-200 border-l border-l-base-300`"
      :style="props.setColumnStyles(-2)"
    >
      {{ $t('layout.action.title') }}
    </div>
  </div>
  <ColumnResizeComp :columns-conf="columnsConf" />
  <MenuComp ref="headerMenuCompRef" class="text-sm">
    <template v-if="selectedColumnConf">
      <div
        class="iw-contextmenu__item flex justify-between w-full p-1"
      >
        <ColumnFixedComp :cur-column-conf="selectedColumnConf" :columns-conf="columnsConf" />
      </div>
      <div
        class="iw-contextmenu__item flex justify-between w-full p-1"
      >
        <ColumnWrapComp :cur-column-conf="selectedColumnConf!" :pk-column-name="props.basic.pkColumnName" :columns-conf="columnsConf" />
      </div>
    </template>
  </MenuComp>
</template>
