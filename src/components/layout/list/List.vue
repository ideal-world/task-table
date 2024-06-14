<script setup lang="ts">
import type { Ref } from 'vue'
import { computed, onMounted, ref } from 'vue'
import type { TableDataResp } from '../../../props'
import { DataKind, SubDataShowKind } from '../../../props'
import type { CachedColumnConf, TableBasicConf, TableLayoutConf } from '../../conf'
import { registerCellClickListener } from '../../function/CellClick'
import PaginationComp from '../../function/Pagination.vue'
import RowSelectComp from '../../function/RowSelect.vue'
import { registerTreeRowToggleListener } from '../../function/RowTree'
import ColumnAggsComp from './ListColumnAggs.vue'
import { setFixedColumnStyles } from './ListColumnFixed.vue'
import HeaderComp from './ListHeader.vue'
import RowsComp from './ListRows.vue'

const props = defineProps<
  {
    layout: TableLayoutConf
    basic: TableBasicConf
  }
>()
const listRef: Ref<HTMLDivElement | null> = ref(null)

const selectColumnWidth = computed(() => props.layout.showSelectColumn ? 25 : 0)
const actionColumnWidth = computed(() => props.layout.actionColumnRender ? props.layout.actionColumnWidth : 0)

const pkKindIsNumber = props.basic.columns.some(col => col.name === props.basic.pkColumnName && [DataKind.NUMBER, DataKind.SERIAL].includes(col.dataKind))

const columnsWithoutHideConf = computed<CachedColumnConf[]>(() => {
  return props.layout.columns.filter(column => !column.hide).map((column) => {
    return {
      ...props.basic.columns.find(col => col.name === column.name)!,
      ...column,
    }
  })
})

function setColumnStyles(colIdx: number) {
// ColIdx of select column = -1
// ColIdx of action column = -2
  const styles: any = {}
  if (colIdx === -1) {
    styles.width = `${selectColumnWidth.value}px`
  }
  else if (colIdx === -2) {
    styles.width = `${actionColumnWidth.value}px`
  }
  else {
    styles.width = `${columnsWithoutHideConf.value[colIdx].width}px`
  }
  setFixedColumnStyles(styles, colIdx, columnsWithoutHideConf.value, selectColumnWidth.value)
  return styles
}

function setTableWidth() {
  const styles: any = {}
  // 2px for border
  styles.width = `${props.layout.columns.filter(column => !column.hide).reduce((count, col) => count + col.width, selectColumnWidth.value + actionColumnWidth.value + 2)}px`
  return styles
}

onMounted(() => {
  props.layout.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA && registerTreeRowToggleListener(listRef.value!)
  registerCellClickListener(listRef.value!)
})
</script>

<template>
  <div
    ref="listRef"
    :class="`iw-list iw-row-select-container relative iw-list--size${props.basic.styles.size}`"
    :style="setTableWidth()"
  >
    <HeaderComp :columns-conf="columnsWithoutHideConf" :layout="props.layout" :basic="props.basic" :set-column-styles="setColumnStyles" />
    <template v-if="props.layout.data && !Array.isArray(props.layout.data)">
      <RowsComp
        :records="props.layout.data.records"
        :pk-column-name="props.basic.pkColumnName"
        :parent-pk-column-name="props.basic.parentPkColumnName"
        :sub-data-show-kind="props.layout.subDataShowKind"
        :pk-kind-is-number="pkKindIsNumber"
        :columns-conf="columnsWithoutHideConf"
        :layout-id="props.layout.id"
        :layout-kind="props.layout.layoutKind"
        :style-conf="props.basic.styles"
        :show-select-column="props.layout.showSelectColumn"
        :action-column-render="props.layout.actionColumnRender"
        :set-column-styles="setColumnStyles"
      />
      <ColumnAggsComp
        v-if="layout.aggs"
        :layout-id="props.layout.id"
        :layout-aggs="layout.aggs"
        :data-basic="layout.data as TableDataResp"
        :show-select-column="layout.showSelectColumn"
        :show-action-column="layout.actionColumnRender !== undefined"
        :columns-conf="columnsWithoutHideConf" :style-conf="props.basic.styles"
        :set-column-styles="setColumnStyles"
      />
    </template>
    <template v-else-if="props.layout.data && Array.isArray(props.layout.data)">
      <template v-for="groupData in props.layout.data" :key="`${props.layout.id}-${groupData.groupValue}`">
        <ColumnAggsComp
          v-if="layout.aggs"
          :layout-id="props.layout.id"
          :layout-aggs="layout.aggs"
          :data-basic="groupData"
          :show-select-column="layout.showSelectColumn"
          :show-action-column="layout.actionColumnRender !== undefined"
          :columns-conf="columnsWithoutHideConf" :style-conf="props.basic.styles"
          :group-column-name="props.layout.group?.columnName"
          :group-value="groupData.groupShowTitle ?? groupData.groupValue"
          :set-column-styles="setColumnStyles"
        />
        <RowsComp
          :records="groupData.records"
          :pk-column-name="props.basic.pkColumnName"
          :parent-pk-column-name="props.basic.parentPkColumnName"
          :sub-data-show-kind="props.layout.subDataShowKind"
          :pk-kind-is-number="pkKindIsNumber"
          :columns-conf="columnsWithoutHideConf"
          :layout-id="props.layout.id"
          :layout-kind="props.layout.layoutKind"
          :style-conf="props.basic.styles"
          :show-select-column="props.layout.showSelectColumn"
          :action-column-render="props.layout.actionColumnRender"
          :set-column-styles="setColumnStyles"
        />
        <div
          class="flex justify-end p-2 min-h-0"
        >
          <PaginationComp :default-slice="layout.defaultSlice" :group-slices="layout.groupSlices" :group-value="groupData.groupValue" :total-number="groupData.totalNumber" />
        </div>
      </template>
    </template>
    <RowSelectComp
      v-if="props.layout.showSelectColumn"
      :selected-pks="props.layout.selectedDataPks" :pk-column-name="props.basic.pkColumnName"
      :pk-kind-is-number="pkKindIsNumber"
    />
  </div>
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
