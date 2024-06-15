<script setup lang="ts">
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import locales from '../../../locales'
import { GanttShowKind, SubDataShowKind } from '../../../props'

import type { TableLayoutConf, TableStyleConf } from '../../conf'
import { registerRowTreeTriggerEvent, unregisterRowTreeTriggerEvent } from '../../function/RowTree'
import { type GanttInfo, getTimelineColumnWidth, getWeekdays } from './gantt'

const props = defineProps<{
  records: { [key: string]: any }[]
  pkColumnName: string
  parentPkColumnName?: string
  subDataShowKind: SubDataShowKind
  layout: TableLayoutConf
  styleConf: TableStyleConf
  ganttInfo: GanttInfo
}>()

const { t } = locales.global

const ganttTimelineRef = ref<HTMLElement | null>(null)

function setTimelineBar(barEle: HTMLElement, timelineRowEle: HTMLElement, plan: boolean, startTime?: Dayjs, endTime?: Dayjs) {
  const searchTime = startTime || (endTime!)
  const hasStartAndEndTime = startTime && endTime
  let cellEle: HTMLElement
  let left: number
  let width: number

  const timelineColumnWidth = getTimelineColumnWidth(props.ganttInfo.ganttShowKind)
  switch (props.ganttInfo.ganttShowKind) {
    case GanttShowKind.DAY:
      cellEle = timelineRowEle.querySelector(`.iw-gantt-timeline-value-cell[data-value="${searchTime.date()}"][data-group-value="${searchTime.format('YYYY-MM')}"]`) as HTMLElement
      // Center a cell
      left = cellEle.offsetLeft + (hasStartAndEndTime ? timelineColumnWidth / 2 : timelineColumnWidth / 4)
      width = hasStartAndEndTime ? endTime.diff(startTime, 'day') * timelineColumnWidth : 0
      break
    case GanttShowKind.WEEK:
      cellEle = timelineRowEle.querySelector(`.iw-gantt-timeline-value-cell[data-value="${searchTime.week()}"][data-group-value="${searchTime.year()}"]`) as HTMLElement
      // Add a deviation of the week day,
      // if a small rectangle is displayed at the start or end time,
      // the width of this rectangle needs to be compensated for 1/2, otherwise it will overflow.
      left = cellEle.offsetLeft + timelineColumnWidth * (startTime ?? endTime!).weekday() / 6 + (hasStartAndEndTime ? 0 : -6)
      width = hasStartAndEndTime ? endTime.diff(startTime, 'week', true) * timelineColumnWidth : 0
      break
    case GanttShowKind.MONTH:
      cellEle = timelineRowEle.querySelector(`.iw-gantt-timeline-value-cell[data-value="${searchTime.month() + 1}"][data-group-value="${searchTime.year()}"]`) as HTMLElement
      left = cellEle.offsetLeft + timelineColumnWidth * (startTime ?? endTime!).date() / (startTime ?? endTime!).daysInMonth() + (hasStartAndEndTime ? 0 : -6)
      width = hasStartAndEndTime ? endTime.diff(startTime, 'month', true) * timelineColumnWidth : 0
      break
    case GanttShowKind.YEAR:
      cellEle = timelineRowEle.querySelector(`.iw-gantt-timeline-value-cell[data-value="${searchTime.year()}"]`) as HTMLElement
      left = cellEle.offsetLeft + timelineColumnWidth * (startTime ?? endTime!).month() / 11 + (hasStartAndEndTime ? 0 : -6)
      width = hasStartAndEndTime ? endTime.diff(startTime, 'year', true) * timelineColumnWidth : 0
      break
  }
  const top = cellEle.offsetTop + cellEle.offsetHeight / 2 - 6 + (plan ? 0 : 2)
  barEle.style.left = `${left}px`
  barEle.style.top = `${top}px`
  barEle.style.width = `${width}px`
  barEle.style.display = `block`
}

function drawDataRelLine(globalOffsetTop: number, currTimelineEle: HTMLElement, parentTimelineEle: HTMLElement) {
  function doDrawDataRelLine(x1: number, y1: number, x2: number, y2: number) {
    const svgEle = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svgEle.style.position = 'absolute'
    svgEle.style.top = `${0}px`
    svgEle.style.left = `${0}px`
    svgEle.style.width = '100%'
    svgEle.style.height = '100%'
    svgEle.style.pointerEvents = 'none'
    ganttTimelineRef.value!.appendChild(svgEle)

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const curve = `M ${x1},${y1} C ${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`
    path.setAttribute('d', curve)
    path.setAttribute('stroke', 'black')
    path.setAttribute('fill', 'transparent')
    svgEle.appendChild(path)
  }
  const hasStartTime = currTimelineEle.dataset.startTime && parentTimelineEle.dataset.startTime
  const hasEndTime = currTimelineEle.dataset.endTime && parentTimelineEle.dataset.endTime
  const offsetHeight = globalOffsetTop - (currTimelineEle.getBoundingClientRect().top - parentTimelineEle.getBoundingClientRect().top) + currTimelineEle.offsetHeight
  if (hasStartTime) {
    const x1 = currTimelineEle.offsetLeft
    const y1 = globalOffsetTop + currTimelineEle.offsetTop + currTimelineEle.offsetHeight / 2
    const x2 = parentTimelineEle.offsetLeft + 2
    const y2 = offsetHeight + currTimelineEle.offsetHeight / 2

    doDrawDataRelLine(x1, y1, x2, y2)
  }
  if (hasEndTime) {
    const x1 = currTimelineEle.offsetLeft + currTimelineEle.offsetWidth
    const y1 = globalOffsetTop + currTimelineEle.offsetTop + currTimelineEle.offsetHeight / 2
    const x2 = parentTimelineEle.offsetLeft + parentTimelineEle.offsetWidth - 2
    const y2 = offsetHeight + currTimelineEle.offsetHeight / 2
    doDrawDataRelLine(x1, y1, x2, y2)
  }
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

function generateDataRelLine() {
  ganttTimelineRef.value!.querySelectorAll('svg').forEach((ele) => {
    ele.remove()
  })
  if (props.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA) {
    ganttTimelineRef.value?.querySelectorAll('.iw-gantt-timeline-row[data-parent-pk]').forEach((ele) => {
      const currRowEle = ele as HTMLElement
      if (currRowEle.style.display === 'none') {
        return
      }
      const parentRowEle = ganttTimelineRef.value?.querySelector(`.iw-gantt-timeline-row[data-pk="${currRowEle.dataset.parentPk!}"]`)
      if (parentRowEle) {
        drawDataRelLine(currRowEle.offsetTop, currRowEle.querySelector('.iw-gantt-timeline-plan-bar')!, parentRowEle.querySelector('.iw-gantt-timeline-plan-bar')!)
      }
    })
  }
}

function getTimelineBarTitle(row: { [key: string]: any }, plan: boolean) {
  const startTime = row[plan ? props.layout.ganttPlanStartTimeColumnName! : props.layout.ganttActualStartTimeColumnName!]
  const endTime = row[plan ? props.layout.ganttPlanEndTimeColumnName! : props.layout.ganttActualEndTimeColumnName!]
  if (startTime && endTime) {
    const weekdays = getWeekdays(startTime, endTime, props.ganttInfo.holidays)
    return `${plan ? t('gantt.planTimeTitle') : t('gantt.actualTimeTitle')}: ${startTime ?? ''} / ${endTime ?? ''} ${t('gantt.totalWeekDays', { days: weekdays })}`
  }
  else {
    return `${plan ? t('gantt.planTimeTitle') : t('gantt.actualTimeTitle')}: ${startTime ?? ''} / ${t('gantt.endTime')}: ${endTime ?? ''}`
  }
}

watch(() => props.ganttInfo, () => {
  nextTick(() => {
    generateTimelineBar()
    generateDataRelLine()
  })
})

let rowTreeEventId: string | null = null
onMounted(() => {
  generateTimelineBar()
  generateDataRelLine()

  rowTreeEventId = registerRowTreeTriggerEvent(async (dataPk, hide) => {
    if (ganttTimelineRef.value) {
      const rowEle = ganttTimelineRef.value?.querySelector(`.iw-gantt-timeline-row[data-pk="${dataPk}"]`) as HTMLElement
      rowEle.style.display = hide ? 'none' : 'flex'
      generateDataRelLine()
    }
  })
})

onUnmounted(() => {
  unregisterRowTreeTriggerEvent(rowTreeEventId!)
})
</script>

<template>
  <div ref="ganttTimelineRef" class="relative">
    <div
      v-for="row in props.records"
      :key="`${layout.id}-${row[props.pkColumnName]}`"
      :data-pk="row[props.pkColumnName]"
      :data-parent-pk="props.parentPkColumnName ? row[props.parentPkColumnName] : undefined"
      :class="`${props.styleConf.rowClass} relative iw-gantt-timeline-row flex bg-base-100 border-b border-b-base-300 border-r border-r-base-300`"
    >
      <div
        v-for="(timeline, idx) in ganttInfo.timeline" :key="`${layout.id}-${idx}`"
        :data-value="timeline.value"
        :data-group-value="timeline.categoryTitle"
        :style="`width: ${getTimelineColumnWidth(props.ganttInfo.ganttShowKind)}px`"
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
        :title="getTimelineBarTitle(row, true)"
        :data-start-time="row[layout.ganttPlanStartTimeColumnName]"
        :data-end-time="row[layout.ganttPlanEndTimeColumnName]"
      />
      <div
        v-if="layout.ganttActualStartTimeColumnName && layout.ganttActualEndTimeColumnName && (row[layout.ganttActualStartTimeColumnName] || row[layout.ganttActualEndTimeColumnName])"
        class="iw-gantt-timeline-actual-bar absolute hidden p-1 bg-success rounded-sm"
        :title="getTimelineBarTitle(row, false)"
        :data-start-time="row[layout.ganttActualStartTimeColumnName]"
        :data-end-time="row[layout.ganttActualEndTimeColumnName]"
      />
    </div>
  </div>
</template>