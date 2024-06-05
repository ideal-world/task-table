<script setup lang="ts">
import { computed, ref } from 'vue'
import { DataKind, SubDataShowKind } from '../../../props'
import type { CachedColumnConf, TableBasicConf, TableLayoutConf } from '../../conf'
import { setFixedColumnStyles } from './ColumnFixed.vue'
import HeaderComp from './Header.vue'
import RowSelectComp from './RowSelect.vue'
import RowsComp from './Rows.vue'

const listConf = defineProps<
  {
    layout: TableLayoutConf
    basic: TableBasicConf
  }
>()

const COLUMN_SELECT_WIDTH = listConf.layout.showSelectColumn ? 25 : 0
const COLUMN_ACTION_WIDTH = listConf.layout.actionColumnRender ? listConf.layout.actionColumnWidth ?? 100 : 0

const expandDataPks = ref<string[] | number[]>([])

const pkKindIsNumber = listConf.basic.columns.some(col => col.name === listConf.basic.pkColumnName && [DataKind.NUMBER, DataKind.SERIAL].includes(col.dataKind))

const columnsWithoutHideConf = computed<CachedColumnConf[]>(() => {
  return listConf.layout.columns.filter(column => !column.hide).map((column) => {
    return {
      ...listConf.basic.columns.find(col => col.name === column.name)!,
      ...column,
    }
  })
})

function setColumnStyles(colIdx: number) {
// ColIdx of select column = -1
// ColIdx of action column = -2
  const styles: any = {}
  if (colIdx === -1) {
    styles.width = `${COLUMN_SELECT_WIDTH}px`
  }
  else if (colIdx === -2) {
    styles.width = `${COLUMN_ACTION_WIDTH}px`
  }
  else {
    styles.width = `${columnsWithoutHideConf.value[colIdx].width}px`
  }
  setFixedColumnStyles(styles, colIdx, columnsWithoutHideConf.value, COLUMN_SELECT_WIDTH)
  return styles
}

function setTableWidth() {
  const styles: any = {}
  // 2px for border
  styles.width = `${listConf.layout.columns.filter(column => !column.hide).reduce((count, col) => count + col.width, COLUMN_SELECT_WIDTH + COLUMN_ACTION_WIDTH + 2)}px`
  return styles
}
</script>

<template>
  <div
    :class="`iw-list relative iw-list--size${listConf.basic.styles.size}`"
    :style="setTableWidth()"
  >
    <HeaderComp :columns-conf="columnsWithoutHideConf" :layout="listConf.layout" :basic="listConf.basic" :set-column-styles="setColumnStyles" />
    <template v-if="listConf.layout.data && !Array.isArray(listConf.layout.data)">
      <RowsComp
        :records="listConf.layout.data.records" :pk-column-name="listConf.basic.pkColumnName"
        :parent-pk-column-name="listConf.basic.parentPkColumnName"
        :tile-all-data="listConf.layout.subDataShowKind === SubDataShowKind.TILE_ALL_DATA"
        :expand-data-pks="expandDataPks"
        :pk-kind-is-number="pkKindIsNumber"
        :columns-conf="columnsWithoutHideConf"
        :styles-conf="listConf.basic.styles"
        :show-select-column="listConf.layout.showSelectColumn"
        :action-column-render="listConf.layout.actionColumnRender"
        :set-column-styles="setColumnStyles"
      />
      <!-- <ColumnAggsComp
        v-if="layout.aggs"
        :layout-aggs="layout.aggs" :data-basic="layout.data as TableDataResp"
        :columns-conf="columnsWithoutHideConf" :styles-conf="listConf.basic.styles"
        :set-column-styles="setColumnStyles"
      /> -->
    </template>
    <!-- <template v-else-if="listConf.layout.data && Array.isArray(listConf.layout.data)">
      <template v-for="groupData in listConf.layout.data" :key="groupData.groupValue">
        <ColumnAggsComp
          v-if="layout.aggs"
          :layout-aggs="layout.aggs" :data-basic="groupData"
          :columns-conf="columnsWithoutHideConf" :styles-conf="listConf.basic.styles"
          :group-value="groupData.groupValue" :set-column-styles="setColumnStyles"
        />
        <RowsComp
          :records="groupData.records" :pk-column-name="listConf.basic.pkColumnName" :parent-pk-column-name="listConf.basic.parentPkColumnName"
          :expand-data-pks="expandDataPks"
          :pk-kind-is-number="pkKindIsNumber"
          :columns-conf="columnsWithoutHideConf"
          :styles-conf="listConf.basic.styles"
          :show-select-column="listConf.layout.showSelectColumn"
          :action-column-render="listConf.layout.actionColumnRender"
          :set-column-styles="setColumnStyles"
        />
      </template>
    </template> -->
  </div>
  <RowSelectComp
    v-if="listConf.layout.showSelectColumn"
    :selected-pks="listConf.layout.selectedDataPks" :pk-column-name="listConf.basic.pkColumnName"
    :pk-kind-is-number="pkKindIsNumber"
  />
</template>

<style lang="css">
.iw-list--size-xs {
  @apply text-xs;

  .iw-list-cell {
    @apply p-0
  }
}

.iw-list--size-sm {
  @apply text-sm;

  .iw-list-cell {
    @apply p-[1px]
  }
}

.iw-list--size {
  @apply text-base;

  .iw-list-cell {
    @apply p-[2px]
  }
}

.iw-list--size-lg {
  @apply text-lg;

  .iw-list-cell {
    @apply p-1.5
  }
}
</style>
