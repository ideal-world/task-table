<script setup lang="ts">
import { SubDataShowKind } from '../../../props'

import type { TableStyleConf } from '../../conf'
import type { GanttInfo } from './gantt'
import { TIMELINE_COLUMN_WIDTH } from './gantt'

const props = defineProps<{
  records: { [key: string]: any }[]
  pkColumnName: string
  parentPkColumnName?: string
  subDataShowKind: SubDataShowKind
  layoutId: string
  styleConf: TableStyleConf
  ganttInfo: GanttInfo
}>()
</script>

<template>
  <div
    v-for="row in props.records"
    :key="`${layoutId}-${row[props.pkColumnName]}-${props.subDataShowKind}`"
    :data-pk="row[props.pkColumnName] "
    :data-parent-pk="props.parentPkColumnName ? row[props.parentPkColumnName] : undefined"
    :class="`${props.styleConf.rowClass} iw-gantt-timeline-row ${props.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA ? 'iw-data-fold' : ''} flex bg-base-100 border-b border-b-base-300 border-r border-r-base-300`"
  >
    <div
      v-for="(timeline, idx) in ganttInfo.timeline" :key="`${layoutId}-${idx}`"
      :data-value="timeline.value"
      :data-group-value="timeline.categoryTitle"
      :style="`width: ${TIMELINE_COLUMN_WIDTH}px`"
      :title="`${timeline.value} (${timeline.categoryTitle})`"
      :class="`${props.styleConf.cellClass} iw-gantt-timeline-cell flex justify-center items-center bg-base-100 ${idx !== 0 && 'border-l border-l-base-300'}`"
    >
        &nbsp;
    </div>
  </div>
</template>
