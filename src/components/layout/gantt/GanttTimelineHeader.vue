<script setup lang="ts">
import { GanttShowKind } from '../../../props'
import { IwUtils } from '../../../utils'
import type { TableStyleConf } from '../../conf'
import type { GanttInfo, TimelineInfo } from './gantt'
import { TIMELINE_COLUMN_WIDTH } from './gantt'

const props = defineProps<{
  layoutId: string
  ganttInfo: GanttInfo
  styleConf: TableStyleConf
}>()

function getCateColumTimeline() {
  const cateColumTimeline: { [key: string]: TimelineInfo[] } = IwUtils.groupBy(props.ganttInfo.timeline, timeline => timeline.categoryTitle!)
  return Object.entries(cateColumTimeline)
    .map(([cateTitle, items]) => {
      return {
        cateTitle,
        offset: items.length,
      }
    }).sort((a, b) => a.cateTitle.localeCompare(b.cateTitle))
}
</script>

<template>
  <div
    :class="`${props.styleConf.headerClass} flex items-center flex-col bg-base-200`"
  >
    <div v-if="ganttInfo.ganttShowKind !== GanttShowKind.YEAR" class="flex items-center">
      <div
        v-for="(cateColumTimeline, idx) in getCateColumTimeline()" :key="`${layoutId}-${idx}`"
        :style="`width:${cateColumTimeline.offset * TIMELINE_COLUMN_WIDTH}px`"
        :title="`${cateColumTimeline.cateTitle}`"
        :class="`${props.styleConf.cellClass} iw-gantt-timeline-cell flex justify-center items-center bg-base-200 border-b border-b-base-300 ${idx !== 0 && 'border-l border-l-base-300'} whitespace-nowrap overflow-hidden text-ellipsis flex-nowrap`"
      >
        {{ cateColumTimeline.cateTitle }}
      </div>
    </div>
    <div class="flex items-center">
      <div
        v-for="(timeline, idx) in ganttInfo.timeline" :key="`${layoutId}-${idx}`"
        :data-value="timeline.value"
        :data-group-value="timeline.categoryTitle"
        :style="`width: ${TIMELINE_COLUMN_WIDTH}px`"
        :title="`${timeline.value} (${timeline.categoryTitle})`"
        :class="`${props.styleConf.cellClass} iw-gantt-timeline-cell flex justify-center items-center bg-base-200 ${idx !== 0 && 'border-l border-l-base-300'}`"
      >
        {{ timeline.value }}
      </div>
    </div>
  </div>
</template>
