<script setup lang="ts">
import type { Ref } from 'vue'
import { computed, onMounted, ref } from 'vue'
import type { TableDataResp } from '../../../props'
import { DataKind, SubDataShowKind } from '../../../props'
import type { CachedColumnConf, TableBasicConf, TableLayoutConf } from '../../conf'
import { registerCellClickListener } from '../../function/CellClick'
import PaginationComp from '../../function/Pagination.vue'
import { registerTreeRowToggleListener } from '../../function/RowTree'
import ColumnAggsComp from './ColumnAggs.vue'
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
const listCompRef: Ref<HTMLDivElement | null> = ref(null)

const COLUMN_SELECT_WIDTH = listConf.layout.showSelectColumn ? 25 : 0
const COLUMN_ACTION_WIDTH = listConf.layout.actionColumnRender ? listConf.layout.actionColumnWidth ?? 100 : 0

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

onMounted(() => {
  listConf.layout.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA && registerTreeRowToggleListener(listCompRef.value!)
  registerCellClickListener(listCompRef.value!)
})
</script>

<template>
  <div
    ref="listCompRef"
    :class="`iw-list relative iw-list--size${listConf.basic.styles.size}`"
    :style="setTableWidth()"
  >
    <HeaderComp :columns-conf="columnsWithoutHideConf" :layout="listConf.layout" :basic="listConf.basic" :set-column-styles="setColumnStyles" />
    <template v-if="listConf.layout.data && !Array.isArray(listConf.layout.data)">
      <RowsComp
        :records="listConf.layout.data.records"
        :pk-column-name="listConf.basic.pkColumnName"
        :parent-pk-column-name="listConf.basic.parentPkColumnName"
        :sub-data-show-kind="listConf.layout.subDataShowKind"
        :pk-kind-is-number="pkKindIsNumber"
        :columns-conf="columnsWithoutHideConf"
        :styles-conf="listConf.basic.styles"
        :show-select-column="listConf.layout.showSelectColumn"
        :action-column-render="listConf.layout.actionColumnRender"
        :set-column-styles="setColumnStyles"
      />
      <ColumnAggsComp
        v-if="layout.aggs"
        :layout-aggs="layout.aggs"
        :data-basic="layout.data as TableDataResp"
        :show-select-column="layout.showSelectColumn"
        :show-action-column="layout.actionColumnRender !== undefined"
        :columns-conf="columnsWithoutHideConf" :styles-conf="listConf.basic.styles"
        :set-column-styles="setColumnStyles"
      />
    </template>
    <template v-else-if="listConf.layout.data && Array.isArray(listConf.layout.data)">
      <template v-for="groupData in listConf.layout.data" :key="groupData.groupValue">
        <ColumnAggsComp
          v-if="layout.aggs"
          :layout-aggs="layout.aggs"
          :data-basic="groupData"
          :show-select-column="layout.showSelectColumn"
          :show-action-column="layout.actionColumnRender !== undefined"
          :columns-conf="columnsWithoutHideConf" :styles-conf="listConf.basic.styles"
          :group-column-name="listConf.layout.group?.columnName"
          :group-value="groupData.groupShowTitle ?? groupData.groupValue"
          :set-column-styles="setColumnStyles"
        />
        <RowsComp
          :records="groupData.records"
          :pk-column-name="listConf.basic.pkColumnName"
          :parent-pk-column-name="listConf.basic.parentPkColumnName"
          :sub-data-show-kind="listConf.layout.subDataShowKind"
          :pk-kind-is-number="pkKindIsNumber"
          :columns-conf="columnsWithoutHideConf"
          :styles-conf="listConf.basic.styles"
          :show-select-column="listConf.layout.showSelectColumn"
          :action-column-render="listConf.layout.actionColumnRender"
          :set-column-styles="setColumnStyles"
        />
        <div
          class="flex justify-end p-2 min-h-0"
        >
          <PaginationComp :default-slice="layout.defaultSlice" :group-slices="layout.groupSlices" :group-value="groupData.groupValue" :total-number="groupData.totalNumber" />
        </div>
      </template>
    </template>
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
    @apply p-[2px] pl-[4px]
  }
}

.iw-list--size-lg {
  @apply text-lg;

  .iw-list-cell {
    @apply p-1.5
  }
}
</style>
