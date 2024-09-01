<script setup lang="ts">
import { ref } from 'vue'
import type { TableStyleProps } from '../../../props'
import { GanttShowKind } from '../../../props/enumProps'
import { groupBy } from '../../../utils/basic'

import { type GanttInfo, type TimelinePerColumnInfo, getTimelineColumnWidth } from './gantt'

const props = defineProps<{
  // 布局ID
  // Layout ID
  layoutId: string
  // 甘特图信息
  // Gantt chart information
  ganttInfo: GanttInfo
  // 表格样式配置
  // Table style configuration
  styleProps: TableStyleProps
}>()

const timelineCateColumnRef = ref<HTMLElement>()
const timelineColumnRef = ref<HTMLElement>()

/**
 * 获取分类列时间线
 *
 * Get category column timeline
 */
function getCateColumTimeline() {
  const cateColumTimeline: { [key: string]: TimelinePerColumnInfo[] } = groupBy(props.ganttInfo.timeline, timeline => timeline.categoryTitle!)
  return Object.entries(cateColumTimeline)
    .map(([cateTitle, items]) => {
      return {
        cateTitle,
        offset: items.length,
      }
    }).sort((a, b) => a.cateTitle.localeCompare(b.cateTitle))
}

/**
 * 甘特图年视图时，获取时间线高度
 *
 * Gets the height of the timeline when viewing the Gantt chart year
 */
function ganttTimeLineYearHeight() {
  if (!timelineCateColumnRef.value?.clientHeight || !timelineColumnRef.value?.clientHeight)
    return
  return `${timelineCateColumnRef.value?.clientHeight + timelineColumnRef.value?.clientHeight}px`
}
</script>

<template>
  <div
    :class="`${props.styleProps.headerClass} flex items-center flex-col sticky top-0 z-[1500] bg-base-200`"
  >
    <!-- 当甘特图显示类型不是年时，显示分类列 -->
    <!-- When the Gantt chart display type is not year, display the category column -->
    <div v-show="ganttInfo.ganttShowKind !== GanttShowKind.YEAR" ref="timelineCateColumnRef" class="flex items-center gantt-timeline-cate-column">
      <div
        v-for="(cateColumTimeline, idx) in getCateColumTimeline()" :key="`${layoutId}-${idx}`"
        :style="`width:${cateColumTimeline.offset * getTimelineColumnWidth(props.ganttInfo.ganttShowKind)}px;border-left:${idx !== 0 && '1px solid var(--fallback-b3,oklch(var(--b3)/var(--tw-border-opacity)))'}`"
        :title="`${cateColumTimeline.cateTitle}`"
        :class="`${props.styleProps.cellClass} iw-gantt-timeline-cell flex justify-center items-center bg-base-200 border-b border-b-base-300 whitespace-nowrap overflow-hidden text-ellipsis flex-nowrap`"
      >
        {{ cateColumTimeline.cateTitle }}
      </div>
    </div>
    <div ref="timelineColumnRef" class="flex items-center gantt-timeline-column" :style="`height:${ganttInfo.ganttShowKind === GanttShowKind.YEAR && ganttTimeLineYearHeight()}`">
      <div
        v-for="(timeline, idx) in ganttInfo.timeline" :key="`${layoutId}-${idx}`"
        :data-value="timeline.value"
        :data-group-value="timeline.categoryTitle"
        :style="`width: ${getTimelineColumnWidth(props.ganttInfo.ganttShowKind)}px;border-left:${idx !== 0 && '1px solid var(--fallback-b3,oklch(var(--b3)/var(--tw-border-opacity)))'}`"
        :title="`${timeline.value} (${timeline.categoryTitle})`"
        :class="`${props.styleProps.cellClass} iw-gantt-timeline-cell flex justify-center items-center bg-base-200'}`"
      >
        {{ timeline.value }}
      </div>
    </div>
  </div>
</template>
