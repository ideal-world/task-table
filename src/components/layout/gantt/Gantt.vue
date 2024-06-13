<script setup lang="ts">
import type { Ref } from 'vue'
import { computed, onMounted, ref } from 'vue'
import { DataKind, SubDataShowKind } from '../../../props'
import type { CachedColumnConf, TableBasicConf, TableLayoutConf } from '../../conf'
import { registerCellClickListener } from '../../function/CellClick'
import PaginationComp from '../../function/Pagination.vue'
import RowSelectComp from '../../function/RowSelect.vue'
import { registerTreeRowToggleListener } from '../../function/RowTree'
import HeaderComp from './GanttHeader.vue'
import RowsComp from './GanttRows.vue'
import type { GanttInfo } from './gantt'

const props = defineProps<
  {
    layout: TableLayoutConf
    basic: TableBasicConf
  }
>()
const ganttCompRef: Ref<HTMLDivElement | null> = ref(null)
const tableCompRef: Ref<HTMLElement | null> = ref(null)
const ganttInfo: Ref<GanttInfo> = ref()

const COLUMN_SELECT_WIDTH = props.layout.showSelectColumn ? 25 : 0

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
// ColIdx of gantt timeline column = -2
  const styles: any = {}
  if (colIdx === 0) {
    styles.width = `${tableCompRef.value?.offsetWidth - props.layout.ganttTimelineWidth}px`
  }
  else if (colIdx === -1) {
    styles.width = `${COLUMN_SELECT_WIDTH}px`
  }
  else if (colIdx === -2) {
    styles.width = `${props.layout.ganttTimelineWidth}px`
  }
  else {
    styles.width = `${columnsWithoutHideConf.value[colIdx].width}px`
  }
  return styles
}

function setListWidth() {
  const styles: any = {}
  // 2px for border
  styles.width = `${props.layout.columns.filter(column => !column.hide).reduce((count, col) => count + col.width, COLUMN_SELECT_WIDTH + 2)}px`
  return styles
}

onMounted(() => {
  props.layout.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA && registerTreeRowToggleListener(ganttCompRef.value!)
  registerCellClickListener(ganttCompRef.value!)
  tableCompRef.value = ganttCompRef.value?.closest('.iw-tt-table') as HTMLElement
})
</script>

<template>
  <div
    ref="ganttCompRef"
    :class="`iw-gantt iw-row-select-container relative iw-gantt--size${props.basic.styles.size}`"
  >
    <HeaderComp :columns-conf="columnsWithoutHideConf" :layout="props.layout" :basic="props.basic" :set-column-styles="setColumnStyles" :set-list-width="setListWidth" :gantt-info="ganttInfo" />
    <!-- <template v-if="props.layout.data && !Array.isArray(props.layout.data)">
      <RowsComp
        :records="props.layout.data.records"
        :pk-column-name="props.basic.pkColumnName"
        :parent-pk-column-name="props.basic.parentPkColumnName"
        :sub-data-show-kind="props.layout.subDataShowKind"
        :pk-kind-is-number="pkKindIsNumber"
        :columns-conf="columnsWithoutHideConf"
        :layout-id="props.layout.id"
        :layout-kind="props.layout.layoutKind"
        :styles-conf="props.basic.styles"
        :show-select-column="props.layout.showSelectColumn"
        :action-column-render="props.layout.actionColumnRender"
        :set-column-styles="setColumnStyles"
      />
    </template>
    <template v-else-if="props.layout.data && Array.isArray(props.layout.data)">
      <template v-for="groupData in props.layout.data" :key="`${props.layout.id}-${groupData.groupValue}`">
        <RowsComp
          :records="groupData.records"
          :pk-column-name="props.basic.pkColumnName"
          :parent-pk-column-name="props.basic.parentPkColumnName"
          :sub-data-show-kind="props.layout.subDataShowKind"
          :pk-kind-is-number="pkKindIsNumber"
          :columns-conf="columnsWithoutHideConf"
          :layout-id="props.layout.id"
          :layout-kind="props.layout.layoutKind"
          :styles-conf="props.basic.styles"
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
    </template> -->
    <RowSelectComp
      v-if="props.layout.showSelectColumn"
      :selected-pks="props.layout.selectedDataPks" :pk-column-name="props.basic.pkColumnName"
      :pk-kind-is-number="pkKindIsNumber"
    />
  </div>
</template>

<style lang="css">
.iw-gantt--size-xs {
  @apply text-xs;

  .iw-gantt-cell {
    @apply p-0
  }
}

.iw-gantt--size-sm {
  @apply text-sm;

  .iw-gantt-cell {
    @apply p-[1px]
  }
}

.iw-gantt--size {
  @apply text-base;

  .iw-gantt-cell {
    @apply p-[2px] pl-[4px]
  }
}

.iw-gantt--size-lg {
  @apply text-lg;

  .iw-gantt-cell {
    @apply p-1.5
  }
}
</style>
