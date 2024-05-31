<script setup lang="ts">
import { ref } from 'vue'
import * as iconSvg from '../../../assets/icon'
import MenuComp, { MenuSizeKind } from '../../common/Menu.vue'
import type { CachedColumnConf, TableBasicConf, TableLayoutConf } from '../../conf'
import ColumnWrapComp from './ColumnWrap.vue'
import ColumnFixedComp from './ColumnFixed.vue'
import ColumnHideComp from './ColumnHide.vue'
import ColumnMoreComp from './ColumnMore.vue'

const props = defineProps<{
  columnsConf: CachedColumnConf[]
  layout: TableLayoutConf
  basic: TableBasicConf
  setColumnStyles: (colIdx: number) => any
}>()

const selectedColumnConf = ref<CachedColumnConf | undefined>()

const headerMenuCompRef = ref<InstanceType<typeof MenuComp>>()
const headerColumnMoreCompRef = ref<InstanceType<typeof MenuComp>>()

function showHeaderContextMenu(event: MouseEvent, columName: string) {
  selectedColumnConf.value = props.columnsConf.find(col => col.name === columName)
  const targetEle = event.target as HTMLElement
  headerMenuCompRef.value?.show(targetEle, undefined, MenuSizeKind.LARGE)
}

async function showColumnMoreContextMenu(event: MouseEvent) {
  const targetEle = event.target as HTMLElement
  await headerColumnMoreCompRef.value?.show(targetEle)
}
</script>

<template>
  <div
    :class="`${props.basic.styles.headerClass} iw-list-header flex items-center sticky top-0 z-[1500] border-solid border-t border-t-base-300 border-r border-r-base-300`"
  >
    <div
      v-for="(column, colIdx) in columnsConf" :key="column.name"
      :class="`${props.basic.styles.cellClass} iw-list-cell iw-list-header-cell ${column.name !== props.basic.pkColumnName ? 'iw-list-header-normal-cell' : ''} flex items-center bg-base-100 border-solid border-b border-b-base-300 border-l border-l-base-300 hover:cursor-pointer hover:bg-base-200`"
      :data-column-name="column.name"
      :style="props.setColumnStyles(colIdx)"
      @click="(event: MouseEvent) => showHeaderContextMenu(event, column.name)"
    >
      <i :class="`${column.icon} mr-1`" /> {{ column.title }}
    </div>
    <div
      :class="`${props.basic.styles.cellClass} iw-list-cell flex justify-end items-center bg-base-100 border-solid border-b border-b-base-300 border-l border-l-base-300 hover:cursor-pointer hover:bg-base-200`"
      :style="props.setColumnStyles(-1)"
    >
      <i :class="iconSvg.MORE" @click="showColumnMoreContextMenu" />
    </div>
  </div>
  <MenuComp ref="headerMenuCompRef">
    <template v-if="selectedColumnConf">
      <div
        class="iw-contextmenu__item flex justify-between w-full p-1 mb-1 mt-1"
      >
        <ColumnHideComp :cur-column-conf="selectedColumnConf" :pk-column-name="props.basic.pkColumnName" :columns-conf="columnsConf" />
      </div>
      <div
        class="iw-contextmenu__item flex justify-between w-full p-1"
      >
        <ColumnFixedComp :cur-column-conf="selectedColumnConf" :columns-conf="columnsConf" />
        <ColumnWrapComp :cur-column-conf="selectedColumnConf!" :pk-column-name="props.basic.pkColumnName" :columns-conf="columnsConf" />
      </div>
    </template>
  </MenuComp>
  <ColumnMoreComp
    ref="headerColumnMoreCompRef" :basic-columns-conf="props.basic.columns"
    :layout-columns-conf="props.layout.columns"
  />
</template>
