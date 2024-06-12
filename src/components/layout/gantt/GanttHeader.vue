<script setup lang="ts">
import type { CachedColumnConf, TableBasicConf, TableLayoutConf } from '../../conf'
import ColumnResizeComp from '../../function/ColumnResize'
import type { GanttInfo } from './gantt'
import TimelineHeaderComp from './GanttTimelineHeader.vue'

const props = defineProps<{
  columnsConf: CachedColumnConf[]
  layout: TableLayoutConf
  basic: TableBasicConf
  ganttInfo: GanttInfo
  setColumnStyles: (colIdx: number) => any
}>()
</script>

<template>
  <div
    :class="`${props.basic.styles.headerClass} iw-column-header flex items-center sticky top-0 z-[1500] bg-base-200 border-t border-t-base-300 border-b border-b-base-300 border-r border-r-base-300`"
  >
    <div
      v-if="props.layout.showSelectColumn"
      :class="`${props.basic.styles.cellClass} iw-gantt-cell iw-column-header-cell flex justify-center items-center bg-base-200 border-l border-l-base-300`"
      :style="props.setColumnStyles(-1)"
    >
      <input type="checkbox" class="iw-row-select-all-cell__chk iw-checkbox iw-checkbox-xs">
    </div>
    <div
      v-for="(column, colIdx) in columnsConf" :key="`${props.layout.id}-${column.name}`"
      :class="`${props.basic.styles.cellClass} iw-gantt-cell iw-column-header-cell ${column.name !== props.basic.pkColumnName ? 'iw-gantt-header-normal-cell' : ''} flex items-center bg-base-200 border-l border-l-base-300`"
      :data-column-name="column.name"
      :style="props.setColumnStyles(colIdx)"
    >
      <i :class="`${column.icon} mr-1`" /> {{ column.title }}
    </div>
    <div
      :class="`${props.basic.styles.cellClass} iw-gantt-cell iw-column-header-cell flex justify-center items-center bg-base-200 border-l border-l-base-300`"
      :style="props.setColumnStyles(-2)"
    >
      <TimelineHeaderComp :info="ganttInfo" />
    </div>
  </div>
  <ColumnResizeComp :columns-conf="columnsConf" />
</template>
