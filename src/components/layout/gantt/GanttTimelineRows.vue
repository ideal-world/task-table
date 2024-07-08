<script setup lang="ts">
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import locales from '../../../locales'
import { GanttShowKind, SubDataShowKind } from '../../../props/enumProps'

import type { GanttLayoutProps, TableStyleProps } from '../../../props'
import { registerRowTreeTriggerEvent, unregisterRowTreeTriggerEvent } from '../../function/RowTree'
import { type GanttInfo, dragLinePositionEnum, getTimelineColumnWidth, getWeekdays, operationDateEnum } from './gantt'

const props = defineProps<{
  // 布局ID
  // Layout ID
  layoutId: string
  // 甘特图配置
  // Gantt chart configuration
  ganttProps: GanttLayoutProps
  // 数据
  // Data
  records: { [columnName: string]: any }[]
  // 主键列名
  // Primary key column name
  pkColumnName: string
  // 父主键列名
  // Parent primary key column name
  parentPkColumnName?: string
  // 子数据显示类型
  // Sub-data display type
  subDataShowKind: SubDataShowKind
  // 表格样式配置
  // Table style configuration
  styleProps: TableStyleProps
  // 甘特图信息
  // Gantt chart information
  ganttInfo: GanttInfo
}>()

const { t } = locales.global

// 甘特图时间线元素引用
// Gantt chart timeline element reference
const ganttTimelineRef = ref<HTMLElement | null>(null)

/**
 * 获取时间线栏标题
 *
 * Get timeline bar title
 *
 * @param row 行数据 / Row data
 * @param plan 是否是计划时间线栏 / Whether it is a planned timeline bar
 */
function getTimelineBarTitle(row: { [columnName: string]: any }, plan: boolean) {
  const startTime = row[plan ? props.ganttProps.planStartTimeColumnName! : props.ganttProps.actualStartTimeColumnName!]
  const endTime = row[plan ? props.ganttProps.planEndTimeColumnName! : props.ganttProps.actualEndTimeColumnName!]
  if (startTime && endTime) {
    const weekdays = getWeekdays(startTime, endTime, props.ganttInfo.holidays)
    return `${plan ? t('gantt.planTimeTitle') : t('gantt.actualTimeTitle')}: ${startTime ?? ''} / ${endTime ?? ''} ${t('gantt.totalWeekDays', { days: weekdays })}`
  }
  else {
    return `${plan ? t('gantt.planTimeTitle') : t('gantt.actualTimeTitle')}: ${startTime ?? ''} / ${endTime ?? ''}`
  }
}

/**
 * 生成子父数据间的时间关联线
 *
 * Generate time-related lines between child and parent data
 *
 *
 * 布局上，每列的left值是相对于行的偏移，每行的top值是相对于整个列表的偏移。
 *
 * In layout, the left value of each column is the offset relative to the row, and the top value of each row is the offset relative to the entire list.
 *
 * +--------------------------------------------------+
 * |  relative                                        |
 * |                                                  |
 * |  +--------------------------------------------+  |
 * |  |                                            |  |
 * |  |              +---+ +---+ +---+ +---+ +---+ |  |
 * |  |   relative   |   | |   | |   | |   | |   | |  |
 * |  |              +---+ +---+ +---+ +---+ +---+ |  |
 * |  |                                            |  |
 * |  +--------------------------------------------+  |
 * |                                                  |
 * |  +--------------------------------------------+  |
 * |  |                                            |  |
 * |  |              +---+ +---+ +---+ +---+ +---+ |  |
 * |  |   relative   |   | |   | |   | |   | |   | |  |
 * |  |              +---+ +---+ +---+ +---+ +---+ |  |
 * |  |                                            |  |
 * |  +--------------------------------------------+  |
 * |                                                  |
 * +--------------------------------------------------+
 */
function generateDataRelLine() {
  // 清除所有时间关联线
  // Clear all time-related lines
  ganttTimelineRef.value!.querySelectorAll('svg').forEach((ele) => {
    ele.remove()
  })
  if (props.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA) {
    // 遍历所有行，隐藏的行不生成关联线
    // Traverse all rows, hidden rows do not generate related lines
    ganttTimelineRef.value?.querySelectorAll('.iw-gantt-timeline-row[data-parent-pk]').forEach((ele) => {
      const currRowEle = ele as HTMLElement
      if (currRowEle.style.display === 'none') {
        return
      }
      const parentRowEle = ganttTimelineRef.value?.querySelector(`.iw-gantt-timeline-row[data-pk="${currRowEle.dataset.parentPk!}"]`)
      // 如果父行存在，生成关联线
      // If the parent row exists, generate a related line
      if (parentRowEle) {
        drawDataRelLine(currRowEle.offsetTop, currRowEle.querySelector('.iw-gantt-timeline-plan-bar')!, parentRowEle.querySelector('.iw-gantt-timeline-plan-bar')!)
      }
    })
  }
}

/**
 * 绘制子父数据间的时间关联线
 *
 * Draw time-related lines between child and parent data
 *
 * @param globalOffsetTop 当前行在整个列表中的偏移顶部高度 / The offset top height of the current row in the entire list
 * @param currTimelineEle 当前时间线元素 / Current timeline element
 * @param parentTimelineEle 父时间线元素 / Parent timeline element
 */
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

/**
 * 生成所有时间线栏
 *
 * Generate all timeline bars
 */
function generateAllTimelineBar() {
  ganttTimelineRef.value?.querySelectorAll('.iw-gantt-timeline-plan-bar').forEach((ele) => {
    const barEle = ele as HTMLElement
    const startTime = barEle.dataset.startTime ? dayjs(barEle.dataset.startTime) : undefined
    const endTime = barEle.dataset.endTime ? dayjs(barEle.dataset.endTime) : undefined
    const timelineRowEle = barEle.parentElement as HTMLElement
    generateOneTimelineBar(barEle, timelineRowEle, true, startTime, endTime)
  })
  ganttTimelineRef.value?.querySelectorAll('.iw-gantt-timeline-actual-bar').forEach((ele) => {
    const barEle = ele as HTMLElement
    const startTime = barEle.dataset.startTime ? dayjs(barEle.dataset.startTime) : undefined
    const endTime = barEle.dataset.endTime ? dayjs(barEle.dataset.endTime) : undefined
    const timelineRowEle = barEle.parentElement as HTMLElement
    generateOneTimelineBar(barEle, timelineRowEle, false, startTime, endTime)
  })
}

/**
 * 生成一个时间线栏
 *
 * Generate a timeline bar
 *
 * @param barEle 时间线栏元素 / Timeline bar element
 * @param timelineRowEle 时间线行元素 / Timeline row element
 * @param plan 是否是计划时间线栏 / Whether it is a planned timeline bar
 * @param startTime 开始时间 / Start time
 * @param endTime 结束时间 / End time
 */
function generateOneTimelineBar(barEle: HTMLElement, timelineRowEle: HTMLElement, plan: boolean, startTime?: Dayjs, endTime?: Dayjs) {
  // 搜索时间，优先使用开始时间，否则使用结束时间
  // Search time, use start time first, otherwise use end time
  const searchTime = startTime || (endTime!)
  // 是否有开始、结束时间，存在开始及结束时间显示为线，否则显示为点
  // Whether there is a start and end time，
  // if there is a start and end time, it is displayed as a line, otherwise it is displayed as a point
  const hasStartAndEndTime = startTime !== undefined && endTime !== undefined

  // 时间线栏依附的最左侧单元格元素
  // Leftmost cell element attached to the timeline bar
  let leftCellEle: HTMLElement
  // 时间线栏位置
  // Timeline bar position
  let left: number
  // 时间线栏宽度
  // Timeline bar width
  let width: number
  // 获取时间线栏宽度
  // Get the width of the timeline bar
  const timelineColumnWidth = getTimelineColumnWidth(props.ganttInfo.ganttShowKind)
  // 根据甘特图显示类型及开始、结束时间计算时间线栏位置及宽度
  // Calculate the position and width of the timeline bar based on the Gantt chart display type and start and end times
  switch (props.ganttInfo.ganttShowKind) {
    case GanttShowKind.DAY:
      leftCellEle = timelineRowEle.querySelector(`.iw-gantt-timeline-value-cell[data-value="${searchTime.date()}"][data-group-value="${searchTime.format('YYYY-MM')}"]`) as HTMLElement
      // 从1/4处开始
      // Start from 1/4
      left = leftCellEle.offsetLeft + timelineColumnWidth / 4
      // 如果有开始及结束时间且结束时间与开始时间相差天数大于0时，宽度为结束时间与开始时间相差天数乘以时间线栏宽度，再加上1/2列栏宽度（补偿偏差），否则直接设置宽度为14
      // If there is a start and end time and the number of days between the end time and the start time is greater than 0,
      // the width is the number of days between the end time and the start time multiplied by the timeline column width, plus 1/2 column width (compensating for deviation),
      // otherwise the width is set directly to 14
      width = hasStartAndEndTime && endTime.diff(startTime, 'day') !== 0 ? endTime.diff(startTime, 'day') * timelineColumnWidth + timelineColumnWidth / 2 : 14
      break
    case GanttShowKind.WEEK:
      leftCellEle = timelineRowEle.querySelector(`.iw-gantt-timeline-value-cell[data-value="${searchTime.week()}"][data-group-value="${searchTime.year()}"]`) as HTMLElement
      // 一周7天，从0到6，设置当天在一周内的偏差
      // One week has 7 days, from 0 to 6, set the deviation of the current day within a week
      left = leftCellEle.offsetLeft + timelineColumnWidth * searchTime.weekday() / 7
      // 如果有开始及结束时间，宽度为结束时间与开始时间相差周数（包含小数点）乘以时间线栏宽度，再加上1/7列栏宽度（补偿偏差），否则直接设置宽度为8
      // If there is a start and end time, the width is the number of weeks between the end time and the start time (including decimals) multiplied by the timeline column width, plus 1/7 column width (compensating for deviation),
      // otherwise the width is set directly to 8
      width = hasStartAndEndTime ? endTime.diff(startTime, 'week', true) * timelineColumnWidth + timelineColumnWidth / 7 : 8
      break
    case GanttShowKind.MONTH:
      leftCellEle = timelineRowEle.querySelector(`.iw-gantt-timeline-value-cell[data-value="${searchTime.month() + 1}"][data-group-value="${searchTime.year()}"]`) as HTMLElement
      // 设置当天在当月内的偏差。使用min函数防止侵占到下一列栏
      // Set the deviation of the current day within the month
      // Use the min function to prevent encroachment on the next column
      left = leftCellEle.offsetLeft + Math.min(timelineColumnWidth - 6, timelineColumnWidth * (searchTime.date() - 1) / searchTime.daysInMonth())
      // 如果有开始及结束时间，宽度为结束时间与开始时间相差月数（包含小数点）乘以时间线栏宽度，再加上1/当月天数列栏宽度（补偿偏差），否则直接设置宽度为6。使用Math.max函数防止宽度小于6
      // If there is a start and end time, the width is the number of months between the end time and the start time (including decimals) multiplied by the timeline column width, plus 1/number of days in the month column width (compensating for deviation),
      // otherwise the width is set directly to 6.
      // Use the Math.max function to prevent the width from being less than 6.
      width = hasStartAndEndTime ? Math.max(6, endTime.diff(startTime, 'month', true) * timelineColumnWidth + timelineColumnWidth / searchTime.daysInMonth()) : 6
      break
    case GanttShowKind.YEAR:
      leftCellEle = timelineRowEle.querySelector(`.iw-gantt-timeline-value-cell[data-value="${searchTime.year()}"]`) as HTMLElement
      // 设置当天在当年内的偏差。使用min函数防止侵占到下一列栏
      // Set the deviation of the current day within the year.
      // Use the min function to prevent encroachment on the next column.
      left = leftCellEle.offsetLeft + Math.min(timelineColumnWidth - 6, timelineColumnWidth * searchTime.dayOfYear() / (searchTime.isLeapYear() ? 366 : 365))
      // 如果有开始及结束时间，宽度为结束时间与开始时间相差年数（包含小数点）乘以时间线栏宽度，再加上1/365列栏宽度（补偿偏差），否则直接设置宽度为6。使用Math.max函数防止宽度小于6
      // If there is a start and end time, the width is the number of years between the end time and the start time (including decimals) multiplied by the timeline column width, plus 1/365 column width (compensating for deviation),
      // otherwise the width is set directly to 6.
      // Use the Math.max function to prevent the width from being less than 6.
      width = hasStartAndEndTime ? Math.max(6, endTime.diff(startTime, 'days', true) * timelineColumnWidth / 365 + timelineColumnWidth / 365) : 6
      break
  }
  const top = leftCellEle.offsetTop + leftCellEle.offsetHeight / 2 - 6 + (plan ? 0 : 2)
  barEle.style.left = `${left}px`
  barEle.style.top = `${top}px`
  barEle.style.width = `${width}px`
  barEle.style.display = `block`
}

// 监听甘特图信息变化
// Listen for changes in Gantt chart information
watch(() => props.ganttInfo, () => {
  nextTick(() => {
    // 重新生成时间线栏
    // Regenerate timeline bar
    generateAllTimelineBar()
    // 重新生成子父数据间的时间关联线
    // Regenerate time-related lines between child and parent data
    generateDataRelLine()
  })
})

const dragBarRef = ref<HTMLElement>() //  拖拽条
const isDragging = ref(false) // 是否正在拖拽
const operationDate = ref('') // 当前操作的日期
const curTimelineBar = ref<HTMLElement>() // 当前操作的甘特图时间线条
const dragLinePosition = ref(dragLinePositionEnum.LEFT) // 当前操作条的方向
const timelineRowRef = ref() // 甘特图时间线
const curTimelineRowRef = ref() // 当前操作的甘特图时间线

let rowTreeEventId: string | null = null
onMounted(() => {
  // 生成时间线栏
  // Generate timeline bar
  generateAllTimelineBar()
  // 生成子父数据间的时间关联线
  // Generate time-related lines between child and parent data
  generateDataRelLine()

  // 注册行树触发事件
  // Register row tree trigger event
  rowTreeEventId = registerRowTreeTriggerEvent(async (dataPk, hide) => {
    if (ganttTimelineRef.value) {
      const rowEle = ganttTimelineRef.value?.querySelector(`.iw-gantt-timeline-row[data-pk="${dataPk}"]`) as HTMLElement
      rowEle.style.display = hide ? 'none' : 'flex'
      // 重新生成子父数据间的时间关联线
      // Regenerate time-related lines between child and parent data
      generateDataRelLine()
    }
  })

  dragBarRef.value!.onpointerdown = (e: PointerEvent) => {
    isDragging.value = true
    dragBarRef.value!.setPointerCapture(e.pointerId)
  }
  dragBarRef.value!.onpointerup = (e: PointerEvent) => {
    stopResize(e, true)
  }
  dragBarRef.value!.onpointerleave = (e: PointerEvent) => {
    stopResize(e, false)
  }
  dragBarRef.value!.onpointermove = (e: PointerEvent) => {
    updateResize(e)
  }
})

onUnmounted(() => {
  // 注销行树触发事件
  // Unregister row tree trigger event
  unregisterRowTreeTriggerEvent(rowTreeEventId!)
})

function handleMouseMove(event: MouseEvent, date: string, idx: number) {
  if (curTimelineBar.value && curTimelineBar.value !== event.target) {
    isDragging.value = false
    dragBarRef.value!.style.display = 'none'
  }

  const parentRect = ganttTimelineRef.value!.getBoundingClientRect()
  const childRect = (event.target as HTMLElement).getBoundingClientRect()

  const leftPosInParent = childRect.left - parentRect.left
  const rightPosInParent = childRect.right - parentRect.left

  const heightDeviation = date === operationDateEnum.PLAN ? 16 : -8
  operationDate.value = date

  dragBarRef.value!.style.display = 'none'
  if (Math.abs(event.clientX - childRect.left) <= 5) {
    dragBarRef.value!.style.left = `${leftPosInParent}px`
    dragBarRef.value!.style.top = `${childRect.top - parentRect.top - heightDeviation}px`
    dragBarRef.value!.style.display = 'block'
    dragLinePosition.value = dragLinePositionEnum.LEFT
  }
  if (Math.abs(childRect.right - event.clientX) <= 5) {
    dragBarRef.value!.style.left = `${rightPosInParent - 5}px`
    dragBarRef.value!.style.top = `${childRect.top - parentRect.top - heightDeviation}px`
    dragBarRef.value!.style.display = 'block'
    dragLinePosition.value = dragLinePositionEnum.RIGHT
  }

  curTimelineBar.value = (event.target as HTMLElement)
  curTimelineRowRef.value = timelineRowRef.value[idx]
}

async function stopResize(e: PointerEvent, isSave = false) {
  dragBarRef.value!.releasePointerCapture(e.pointerId)
  isDragging.value = false
  dragBarRef.value!.style.display = 'none'

  if (isSave) {
    const timelineColumnWidth = getTimelineColumnWidth(props.ganttInfo.ganttShowKind)
    const ganttLeft = dragLinePosition.value === dragLinePositionEnum.LEFT ? Number.parseFloat(curTimelineBar.value!.style.left) : Number.parseFloat(curTimelineBar.value!.style.left) + Number.parseFloat(curTimelineBar.value!.style.width)
    const travelDistance = Number.parseFloat(dragBarRef.value!.style.left) - ganttLeft // 拖拽的距离
    let cellIdx // 获取当前拖拽到的格的索引0
    if (dragLinePosition.value === dragLinePositionEnum.LEFT) {
      // 拖拽左边临界值
      if (Number.parseFloat(dragBarRef.value!.style.left) < 0) {
        dragBarRef.value!.style.left = curTimelineBar.value!.style.left
        return
      }
      curTimelineBar.value!.style.width = `${Number.parseFloat(curTimelineBar.value!.style.width) - travelDistance}px`
      curTimelineBar.value!.style.left = dragBarRef.value!.style.left
      cellIdx = Math.floor((Number.parseFloat(curTimelineBar.value!.style.left) / timelineColumnWidth))
    }
    else {
      // 拖拽右边临界值
      if (Number.parseFloat(curTimelineBar.value!.style.width) + travelDistance + Number.parseFloat(curTimelineBar.value!.style.left) > curTimelineRowRef.value!.offsetWidth) {
        return
      }
      curTimelineBar.value!.style.width = `${Number.parseFloat(curTimelineBar.value!.style.width) + travelDistance}px`
      cellIdx = Math.floor(((Number.parseFloat(curTimelineBar.value!.style.width) + Number.parseFloat(curTimelineBar.value!.style.left)) / timelineColumnWidth))
    }
    // 获取到拖拽到哪个格子
    if (cellIdx || cellIdx === 0) {
      console.log(
        curTimelineRowRef.value.children[cellIdx].dataset,
      )
    }
  }
}

function updateResize(e: PointerEvent) {
  if (!isDragging.value)
    return
  const rect = ganttTimelineRef.value!.getBoundingClientRect()
  dragBarRef.value!.style.left = `${e.clientX - rect.left}px`
}
</script>

<template>
  <div ref="ganttTimelineRef" class="relative iw-gantt-timeline-area">
    <div
      v-for="(row, rowIdx) in props.records"
      ref="timelineRowRef"
      :key="`${props.layoutId}-${row[props.pkColumnName]}`"
      :data-pk="row[props.pkColumnName]"
      :data-parent-pk="props.parentPkColumnName ? row[props.parentPkColumnName] : undefined"
      :class="`${props.styleProps.rowClass} relative iw-gantt-timeline-row flex bg-base-100 border-b border-b-base-300`"
    >
      <div
        v-for="(timeline, idx) in ganttInfo.timeline" :key="`${props.layoutId}-${idx}`"
        :data-value="timeline.value"
        :data-group-value="timeline.categoryTitle"
        :style="`width: ${getTimelineColumnWidth(props.ganttInfo.ganttShowKind)}px`"
        :title="`${timeline.value} (${timeline.categoryTitle})`"
        :class="`${props.styleProps.cellClass}
      iw-gantt-timeline-cell iw-gantt-timeline-value-cell flex justify-center items-center bg-base-100
      ${timeline.holiday && 'bg-base-200'}
      ${idx !== 0 && 'border-l border-l-base-300'}`"
      >
        <!-- 特殊标记当前天的列 -->
        <!-- Special mark the current day column -->
        <div v-if="timeline.today" class="bg-accent pl-0.5 mr-0.5 h-3/4" />
        <template v-else>
            &nbsp;
        </template>
      </div>
      <!-- 在每行行尾添加计划、实际的时间线栏 -->
      <!-- Add plan and actual timeline bars at the end of each row -->
      <div
        v-if="row[props.ganttProps.planStartTimeColumnName] || row[props.ganttProps.planEndTimeColumnName]"
        class="iw-gantt-timeline-plan-bar absolute hidden py-1 border-2 border-info rounded"
        :title="getTimelineBarTitle(row, true)"
        :data-start-time="row[props.ganttProps.planStartTimeColumnName]"
        :data-end-time="row[props.ganttProps.planEndTimeColumnName]"
        @mousemove="(e) => { handleMouseMove(e, operationDateEnum.PLAN, rowIdx) }"
      />
      <div
        v-if="props.ganttProps.actualStartTimeColumnName && props.ganttProps.actualEndTimeColumnName && (row[props.ganttProps.actualStartTimeColumnName] || row[props.ganttProps.actualEndTimeColumnName])"
        class="iw-gantt-timeline-actual-bar absolute hidden py-1 bg-success rounded-sm"
        :title="getTimelineBarTitle(row, false)"
        :data-start-time="row[props.ganttProps.actualStartTimeColumnName]"
        :data-end-time="row[props.ganttProps.actualEndTimeColumnName]"
        @mousemove="(e) => { handleMouseMove(e, operationDateEnum.ACT, rowIdx) }"
      />
    </div>
    <div
      ref="dragBarRef"
      class="hidden absolute cursor-e-resize bg-red-300 px-1 h-[20px]"
    />
  </div>
</template>
