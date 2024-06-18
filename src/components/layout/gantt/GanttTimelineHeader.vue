<script setup lang="ts">
import type { TableStyleProps } from '../../../props'
import { GanttShowKind } from '../../../props/enumProps'
import { IwUtils } from '../../../utils'

import { type GanttInfo, type TimelineInfo, getTimelineColumnWidth } from './gantt'

const props = defineProps<{
  layoutId: string
  ganttInfo: GanttInfo
  styleProps: TableStyleProps
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
    :class="`${props.styleProps.headerClass} flex items-center flex-col sticky top-0 z-[1500] bg-base-200`"
  >
    <div v-if="ganttInfo.ganttShowKind !== GanttShowKind.YEAR" class="flex items-center">
      <div
        v-for="(cateColumTimeline, idx) in getCateColumTimeline()" :key="`${layoutId}-${idx}`"
        :style="`width:${cateColumTimeline.offset * getTimelineColumnWidth(props.ganttInfo.ganttShowKind)}px`"
        :title="`${cateColumTimeline.cateTitle}`"
        :class="`${props.styleProps.cellClass} iw-gantt-timeline-cell flex justify-center items-center bg-base-200 border-b border-b-base-300 ${idx !== 0 && 'border-l border-l-base-300'} whitespace-nowrap overflow-hidden text-ellipsis flex-nowrap`"
      >
        {{ cateColumTimeline.cateTitle }}
      </div>
    </div>
    <div class="flex items-center">
      <div
        v-for="(timeline, idx) in ganttInfo.timeline" :key="`${layoutId}-${idx}`"
        :data-value="timeline.value"
        :data-group-value="timeline.categoryTitle"
        :style="`width: ${getTimelineColumnWidth(props.ganttInfo.ganttShowKind)}px`"
        :title="`${timeline.value} (${timeline.categoryTitle})`"
        :class="`${props.styleProps.cellClass} iw-gantt-timeline-cell flex justify-center items-center bg-base-200 ${idx !== 0 && 'border-l border-l-base-300'}`"
      >
        {{ timeline.value }}
      </div>
    </div>
  </div>
</template>
