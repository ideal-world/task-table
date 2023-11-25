<script setup lang="ts">
import { computed, ref } from 'vue'
import MenuComp from '../../common/Menu.vue'
import type { CachedColumnConf, TableBasicConf, TableLayoutConf } from '../../conf'
import type { TableDataResp } from '../../props'
import { DataKind } from '../../props'
import * as iconSvg from '../../../assets/icon'
import CellFillComp from './CellFill.vue'
import CellWrapComp from './CellWrap.vue'
import ColumnAggsComp from './ColumnAggs.vue'
import ColumnCopyComp from './ColumnCopy.vue'
import ColumnDeleteComp from './ColumnDelete.vue'
import ColumnFixedComp, { setFixedColumnStyles } from './ColumnFixed.vue'
import ColumnHideComp from './ColumnHide.vue'
import ColumnRenameComp from './ColumnRename.vue'
import ColumnResizeComp from './ColumnResize.vue'
import ColumnSortComp from './ColumnSort.vue'
import ColumnMoreComp from './ColumnMore.vue'
import RowDeleteComp from './RowDelete.vue'
import RowSelectComp from './RowSelect.vue'
import RowsComp from './Rows.vue'

const listConf = defineProps<
  {
    layout: TableLayoutConf
    basic: TableBasicConf
  }
>()

const NEW_COLUMN_WIDTH = 80

const selectedDataPks = ref<string[] | number[]>([])
const selectedColumnName = ref<string>('')
const pkKindIsNumber = listConf.basic.columns.find(col => col.name === listConf.basic.pkColumnName)?.dataKind === DataKind.NUMBER

const columnsConf = computed<CachedColumnConf[]>(() => {
  return listConf.layout.columns.filter(column => !column.hide).map((column) => {
    return {
      ...column,
      ...listConf.basic.columns.find(col => col.name === column.name)!,
    }
  })
})

const headerMenuCompRef = ref()
const headerColumnMoreCompRef = ref()
const rowMenuCompRef = ref()

function showRowContextMenu(event: MouseEvent) {
  rowMenuCompRef.value.show(event)
}

function setColumnStyles(colIdx: number) {
  const styles: any = {}
  if (colIdx === -1) {
    styles.width = `${NEW_COLUMN_WIDTH}px`
  }
  else {
    styles.width = `${columnsConf.value[colIdx].width}px`
    setFixedColumnStyles(styles, colIdx, columnsConf.value)
  }
  return styles
}

function showHeaderContextMenu(event: MouseEvent, columName: string) {
  selectedColumnName.value = columName
  const targetEle = event.target as HTMLElement
  headerMenuCompRef.value.show(targetEle)
}

function showColumnMoreContextMenu(event: MouseEvent) {
  const targetEle = event.target as HTMLElement
  headerColumnMoreCompRef.value.show(targetEle)
}

function setTableWidth() {
  const styles: any = {}
  styles.width = `${listConf.layout.columns.filter(column => !column.hide).reduce((count, col) => count + col.width, NEW_COLUMN_WIDTH)}px`
  return styles
}
</script>

<template>
  <div
    :class="`iw-list relative iw-list--size-${listConf.basic.styles.size}`"
    :style="setTableWidth()"
  >
    <div
      :class="`${listConf.basic.styles.headerClass} iw-list-header flex items-center sticky top-0 z-[1500] border-solid border-t border-t-base-300 border-r border-r-base-300`"
    >
      <div
        v-for="(column, colIdx) in columnsConf" :key="column.name"
        :class="`${listConf.basic.styles.cellClass} iw-list-cell iw-list-header-cell flex items-center bg-base-100 border-solid border-b border-b-base-300 border-l border-l-base-300 hover:cursor-pointer hover:bg-base-200`"
        :data-column-name="column.name"
        :style="setColumnStyles(colIdx)"
        @click="(event: MouseEvent) => showHeaderContextMenu(event, column.name)"
      >
        <i :class="`${column.icon} mr-1`" /> {{ column.title }}
      </div>
      <div
        :class="`${listConf.basic.styles.cellClass} iw-list-cell flex justify-end items-center bg-base-100 border-solid border-b border-b-base-300 border-l border-l-base-300 hover:cursor-pointer hover:bg-base-200`"
        :style="setColumnStyles(-1)"
      >
        <i :class="iconSvg.MORE" @click="showColumnMoreContextMenu" />
      </div>
    </div>
    <template v-if="listConf.layout.data && !Array.isArray(listConf.layout.data)">
      <RowsComp
        :records="listConf.layout.data.records" :pk-column-name="listConf.basic.pkColumnName"
        :columns-conf="columnsConf" :styles-conf="listConf.basic.styles" :set-column-styles="setColumnStyles"
        :open-context-menu-fun="showRowContextMenu"
      />
      <ColumnAggsComp
        :layout-aggs="layout.aggs!" :data-basic="layout.data as TableDataResp"
        :pk-column-name="listConf.basic.pkColumnName" :columns-conf="columnsConf" :styles-conf="listConf.basic.styles"
        :set-column-styles="setColumnStyles"
      />
    </template>
    <template v-else-if="listConf.layout.data && Array.isArray(listConf.layout.data)">
      <template v-for="groupData in listConf.layout.data" :key="groupData.groupValue">
        <ColumnAggsComp
          :layout-aggs="layout.aggs!" :data-basic="groupData"
          :pk-column-name="listConf.basic.pkColumnName" :columns-conf="columnsConf" :styles-conf="listConf.basic.styles"
          :group-value="groupData.groupValue" :set-column-styles="setColumnStyles"
        />
        <RowsComp
          :records="groupData.records" :pk-column-name="listConf.basic.pkColumnName" :columns-conf="columnsConf"
          :styles-conf="listConf.basic.styles" :set-column-styles="setColumnStyles"
          :open-context-menu-fun="showRowContextMenu"
        />
      </template>
    </template>
  </div>
  <ColumnSortComp :columns-conf="columnsConf" />
  <ColumnResizeComp :columns-conf="columnsConf" />
  <CellFillComp
    :columns-conf="columnsConf" :data="listConf.layout.data!"
    :pk-column-name="listConf.basic.pkColumnName"
  />
  <MenuComp ref="headerMenuCompRef">
    <ColumnRenameComp
      :cur-column-name="selectedColumnName" :columns-conf="columnsConf"
      :pk-column-name="listConf.basic.pkColumnName"
    />
    <ColumnCopyComp :cur-column-name="selectedColumnName" :columns-conf="columnsConf" />
    <ColumnHideComp :cur-column-name="selectedColumnName" :columns-conf="columnsConf" />
    <ColumnDeleteComp
      :cur-column-name="selectedColumnName"
      :pk-column-name="listConf.basic.pkColumnName"
    />
    <ColumnFixedComp :cur-column-name="selectedColumnName" :columns-conf="columnsConf" />
    <CellWrapComp :cur-column-name="selectedColumnName" :columns-conf="columnsConf" />
  </MenuComp>
  <ColumnMoreComp
    ref="headerColumnMoreCompRef" :basic-columns-conf="listConf.basic.columns"
    :layout-columns-conf="listConf.layout.columns"
  />
  <MenuComp ref="rowMenuCompRef">
    <RowDeleteComp v-show="selectedDataPks.length > 0" :selected-pks="selectedDataPks" />
  </MenuComp>
  <RowSelectComp
    :selected-pks="selectedDataPks" :pk-column-name="listConf.basic.pkColumnName"
    :pk-kind-is-number="pkKindIsNumber"
  />
</template>

<style lang="css" scoped>
.iw-list--size-mini {
  @apply text-xs;

  .iw-list-cell {
    @apply p-0
  }
}

.iw-list--size-small {
  @apply text-sm;

  .iw-list-cell {
    @apply p-0.5
  }
}

.iw-list--size-medium {
  @apply text-base;

  .iw-list-cell {
    @apply p-1
  }
}

.iw-list--size-large {
  @apply text-lg;

  .iw-list-cell {
    @apply p-2
  }
}
</style>
