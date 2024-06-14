<script setup lang="ts">
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { nextTick, onMounted, ref, watch } from 'vue'
import { GanttShowKind, SubDataShowKind } from '../../../props'

import type { TableLayoutConf, TableStyleConf } from '../../conf'
import type { GanttInfo } from './gantt'
import { TIMELINE_COLUMN_WIDTH } from './gantt'

const props = defineProps<{
  records: { [key: string]: any }[]
  pkColumnName: string
  parentPkColumnName?: string
  subDataShowKind: SubDataShowKind
  layout: TableLayoutConf
  styleConf: TableStyleConf
  ganttInfo: GanttInfo
}>()

const ganttTimelineRef = ref<HTMLElement | null>(null)

function setTimelineBar(barEle: HTMLElement, timelineRowEle: HTMLElement, plan: boolean, startTime?: Dayjs, endTime?: Dayjs) {
  const searchTime = startTime || (endTime!)
  const hasStartAndEndTime = startTime && endTime
  let cellEle: HTMLElement
  let width: number

  switch (props.ganttInfo.ganttShowKind) {
    case GanttShowKind.DAY:
      cellEle = timelineRowEle.querySelector(`.iw-gantt-timeline-value-cell[data-value="${searchTime.date()}"][data-group-value="${searchTime.format('YYYY-MM')}"]`) as HTMLElement
      width = hasStartAndEndTime ? endTime.diff(startTime, 'day') * TIMELINE_COLUMN_WIDTH : 0
      break
    case GanttShowKind.WEEK:
      cellEle = timelineRowEle.querySelector(`.iw-gantt-timeline-value-cell[data-value="${searchTime.week()}"][data-group-value="${searchTime.year()}"]`) as HTMLElement
      width = hasStartAndEndTime ? endTime.diff(startTime, 'week') * TIMELINE_COLUMN_WIDTH : 0
      break
    case GanttShowKind.MONTH:
      cellEle = timelineRowEle.querySelector(`.iw-gantt-timeline-value-cell[data-value="${searchTime.month() + 1}"][data-group-value="${searchTime.year()}"]`) as HTMLElement
      width = hasStartAndEndTime ? endTime.diff(startTime, 'month') * TIMELINE_COLUMN_WIDTH : 0
      break
    case GanttShowKind.YEAR:
      cellEle = timelineRowEle.querySelector(`.iw-gantt-timeline-value-cell[data-value="${searchTime.year()}"]`) as HTMLElement
      width = hasStartAndEndTime ? endTime.diff(startTime, 'year') * TIMELINE_COLUMN_WIDTH : 0
      break
  }
  const left = cellEle.offsetLeft + (width !== 0 ? TIMELINE_COLUMN_WIDTH / 2 : TIMELINE_COLUMN_WIDTH / 4)
  const top = cellEle.offsetTop + cellEle.offsetHeight / 2 - 6 + (plan ? 0 : 2)
  barEle.style.left = `${left}px`
  barEle.style.top = `${top}px`
  barEle.style.width = `${width}px`
  barEle.style.display = `block`
}

function generateTimelineBar() {
  ganttTimelineRef.value?.querySelectorAll('.iw-gantt-timeline-plan-bar').forEach((ele) => {
    const barEle = ele as HTMLElement
    const startTime = barEle.dataset.startTime ? dayjs(barEle.dataset.startTime) : undefined
    const endTime = barEle.dataset.endTime ? dayjs(barEle.dataset.endTime) : undefined
    const timelineRowEle = barEle.parentElement as HTMLElement
    setTimelineBar(barEle, timelineRowEle, true, startTime, endTime)
  })
  ganttTimelineRef.value?.querySelectorAll('.iw-gantt-timeline-actual-bar').forEach((ele) => {
    const barEle = ele as HTMLElement
    const startTime = barEle.dataset.startTime ? dayjs(barEle.dataset.startTime) : undefined
    const endTime = barEle.dataset.endTime ? dayjs(barEle.dataset.endTime) : undefined
    const timelineRowEle = barEle.parentElement as HTMLElement
    setTimelineBar(barEle, timelineRowEle, false, startTime, endTime)
  })
}

watch(() => props.ganttInfo, () => {
  nextTick(() => {
    generateTimelineBar()
  })
})

onMounted(() => {
  generateTimelineBar()
})
</script>

<template>
  <div ref="ganttTimelineRef">
    <div
      v-for="row in props.records"
      :key="`${layout.id}-${row[props.pkColumnName]}-${props.subDataShowKind}`"
      :data-pk="row[props.pkColumnName] "
      :data-parent-pk="props.parentPkColumnName ? row[props.parentPkColumnName] : undefined"
      :class="`${props.styleConf.rowClass} iw-gantt-timeline-row ${props.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA ? 'iw-data-fold' : ''} flex bg-base-100 border-b border-b-base-300 border-r border-r-base-300`"
    >
      <div
        v-for="(timeline, idx) in ganttInfo.timeline" :key="`${layout.id}-${idx}`"
        :data-value="timeline.value"
        :data-group-value="timeline.categoryTitle"
        :style="`width: ${TIMELINE_COLUMN_WIDTH}px`"
        :title="`${timeline.value} (${timeline.categoryTitle})`"
        :class="`${props.styleConf.cellClass}
      iw-gantt-timeline-cell iw-gantt-timeline-value-cell flex justify-center items-center bg-base-100
      ${timeline.holiday && 'bg-base-200'}
      ${idx !== 0 && 'border-l border-l-base-300'}`"
      >
        <div v-if="timeline.today" class="bg-accent pl-0.5 mr-0.5 h-3/4" />
        <template v-else>
            &nbsp;
        </template>
      </div>
      <div
        v-if="layout.ganttPlanStartTimeColumnName && layout.ganttPlanEndTimeColumnName && (row[layout.ganttPlanStartTimeColumnName] || row[layout.ganttPlanEndTimeColumnName])"
        class="iw-gantt-timeline-plan-bar absolute hidden p-1 border-2 border-info rounded"
        :title="`${$t('gantt.planTimeTitle')}: ${row[layout.ganttPlanStartTimeColumnName] ?? ''}-${row[layout.ganttPlanEndTimeColumnName] ?? ''}`"
        :data-start-time="row[layout.ganttPlanStartTimeColumnName]"
        :data-end-time="row[layout.ganttPlanEndTimeColumnName]"
      />
      <div
        v-if="layout.ganttActualStartTimeColumnName && layout.ganttActualEndTimeColumnName && (row[layout.ganttActualStartTimeColumnName] || row[layout.ganttActualEndTimeColumnName])"
        class="iw-gantt-timeline-actual-bar absolute hidden p-1 bg-success rounded-sm"
        :title="`${$t('gantt.actualTimeTitle')}: ${row[layout.ganttActualStartTimeColumnName] ?? ''}-${row[layout.ganttActualEndTimeColumnName] ?? ''}`"
        :data-start-time="row[layout.ganttActualStartTimeColumnName]"
        :data-end-time="row[layout.ganttActualEndTimeColumnName]"
      />
    </div>
  </div>
</template>
