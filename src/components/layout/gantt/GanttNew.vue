<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUnmounted, reactive, ref, toRaw, watch, watchEffect } from 'vue'
import type { GanttConfig, GanttData, Row, Task } from 'gantt-canvas-chart'
import { DateUtils, GanttChart } from 'gantt-canvas-chart'
import dayjs from 'dayjs'
import type { Ref } from 'vue'
import { dateToEnd, dateToStart, isEqual, objectHas, objectOmit, uniqueString } from 'sculp-js'
import locales from '../../../locales'
import type { DataGroupResp, DataResp, GanttDataResp, GanttLayoutProps, LayoutModifyProps } from '../../../props'
import { AlertKind, GanttDatakind, GanttShowKind, translateGanttShowKind } from '../../../props/enumProps'

import type { ColumnConf, LayoutConf, TableConf } from '../../conf'
import * as eb from '../../eventbus'
import ColumnResizeComp from '../../function/ColumnResize.vue'
import ListComp from '../list/List.vue'
import { deepToRaw } from '../../../utils/vueHelper'
import { registerRowTreeTriggerEvent, registerRowTreeTriggerEventForGanttNew, unregisterRowTreeTriggerEvent, unregisterRowTreeTriggerEventForGanttNew } from '../../function/RowTree'

const props = defineProps<
  {
    // 布局配置
    // Layout configuration
    layoutConf: LayoutConf
    // 甘特图配置
    // Gantt chart configuration
    ganttProps: GanttLayoutProps
    // 表格配置
    // Table configuration
    tableConf: TableConf
    // 列配置
    // Column configuration
    columnsConf: ColumnConf[]
    // 是否显示主键列
    // Whether the primary key column is show
    showPkColumn: boolean
  }
>()

const { t } = locales.global

// 甘特图整体容器的引用
// Reference to the overall container of the Gantt chart
const ganttRef: Ref<HTMLElement | null> = ref(null)
// 甘特图列表引用
// Gantt chart list reference
const ganttListRef: Ref<HTMLElement | null> = ref(null)
// 甘特图时间线引用
// Gantt chart timeline reference
const ganttTimelineRef: Ref<HTMLElement | null> = ref(null)
// 甘特图宽度
// Gantt chart width
const ganttWith: Ref<number> = ref(0)

const ganttChartRef = ref()
const ganttChart = ref<InstanceType<typeof GanttChart>>()

const latestLayoutGantt = ref()

enum Attendance {
  LEAVE = 'LEAVE',
  OVERTIME = 'OVERTIME',
}

enum TaskAttendanceColor {
  LEAVE = '#f9aaa4',
  DOING = '#4984ec',
  ACTUAL = '#5AC989',
  OVERLOAD = '#489763',
}

const AttendanceMap: any = {
  LEAVE: '假',
  OVERTIME: '班',
}

const AttendanceCount: any = {
  AM: '上午',
  PM: '下午',
  ALL: '1天',
}
/**
 * 生成甘特图Row的task数据
 */
function getTaskItem(data: any, memberExtInfo?: { hasDoingTask?: boolean, hasActualTask?: boolean, hide: boolean, showKind: 'plan' | 'actual' | 'attendance', date: string }) {
  const pkColumnName = props.tableConf.pkColumnName
  const { planStartTimeColumnName, planEndTimeColumnName, actualStartTimeColumnName, actualEndTimeColumnName, showKind } = props.tableConf.gantt!
  const { leftMark, rightMark } = props.layoutConf.gantt ?? {}

  const layoutGanttKind = props.layoutConf.ganttConf?.kind ?? props.tableConf.ganttConf?.kind

  const planStart = data[planStartTimeColumnName as string] ? DateUtils.format(new Date(data[planStartTimeColumnName as string]), 'yyyy/MM/dd') : ''
  const planEnd = data[planEndTimeColumnName as string] ? DateUtils.format(new Date(data[planEndTimeColumnName as string]), 'yyyy/MM/dd') : ''
  const actualStart = data[actualStartTimeColumnName as string] ? DateUtils.format(new Date(data[actualStartTimeColumnName as string]), 'yyyy/MM/dd') : ''
  const actualEnd = data[actualEndTimeColumnName as string] ? DateUtils.format(new Date(data[actualEndTimeColumnName as string]), 'yyyy/MM/dd') : ''

  const getRemark = function (markType: string) {
    switch (markType) {
      case 'name':
        return data.name
      case planStartTimeColumnName:
        return planStart
      case planEndTimeColumnName:
        return planEnd
      case '_planPeriod': {
        return `${planStart}~${planEnd} (${DateUtils.diffDaysInclusive(new Date(planStart), new Date(planEnd))} 天)`
      }
      case actualStartTimeColumnName:
        return actualStart
      case actualEndTimeColumnName:
        return actualEnd
      case '_actualPeriod': {
        return `${actualStart}~${actualEnd} (${DateUtils.diffDaysInclusive(new Date(actualStart), new Date(actualEnd))} 天)`
      }
      case 'assigned_to':
        return data.assigned_to?.length > 0 ? data.assigned_to__dict?.find((item: any) => item.value === data.assigned_to[0])?.title : ''
      case 'status':
        return data.status
      default:
        return ''
    }
  }
  let item: Omit<Task, 'id'> & { id?: string } = { name: '' }; let drawTask = false
  const todayDate = ganttChart.value?.today ?? new Date()
  if (layoutGanttKind === 'task') {
    const maybeDoing = actualStart && !actualEnd
    const todayEndTime = dateToEnd(todayDate)
    item = { name: '', planStart, planEnd, leftRemark: '', rightRemark: '', _data: data, dependencies: data.pre_feed_ids ? toRaw(data.pre_feed_ids).filter((id: string) => id !== data[pkColumnName]).map((id: string) => `${id}-task`) : [] }
    if (actualStart && new Date(actualStart) <= todayEndTime) {
      // 处理没有实际结束时间的数据：实际开始时间大于今天的任务数据为无效数据，实际开始时间不超过今天的为正在做的任务
      if (maybeDoing) {
        // doing task
        item.actualStart = actualStart
        item.actualBgColor = TaskAttendanceColor.DOING
        drawTask = true
      }
      else if (new Date(actualStart) <= new Date(actualEnd)) {
        // completed task, actualStart <= actualEnd <= today
        const isCompleted = dateToEnd(actualEnd) <= todayEndTime
        item.actualStart = actualStart
        item.actualEnd = isCompleted ? actualEnd : DateUtils.format(todayDate, 'yyyy/MM/dd')
        if (!isCompleted) {
          item.actualBgColor = TaskAttendanceColor.DOING
        }
        drawTask = true
      }
    }
    if (planStart && planEnd) {
      drawTask = true
    }
    if (drawTask) {
      if (leftMark) {
        item.leftRemark = getRemark(leftMark)
      }
      if (rightMark) {
        item.rightRemark = getRemark(rightMark)
      }
    }
  }
  else {
    const date = memberExtInfo!.date ? DateUtils.format(new Date(memberExtInfo!.date), 'yyyy/MM/dd') : ''
    const maybeDoing = actualStart && !actualEnd
    item = memberExtInfo!.showKind === 'plan' ? { name: data.feed_name ?? '', planStart: date, planEnd: date, _data: deepToRaw(data) } : { name: data.feed_name ?? '', _data: deepToRaw(data) }
    if (data.day) { // 请假、加班
      if (data.day === 'AM') {
        item.actualOffsetPercent = [0, 0.5]
      }
      else if (data.day === 'PM') {
        item.actualOffsetPercent = [0.5, 0.5]
      }
      // item.type = data.type.toLowerCase()
      if (showKind === GanttShowKind.DAY || showKind === GanttShowKind.WEEK) {
        item.centerRemark = AttendanceMap[data.type]
      }

      if (data.type === Attendance.LEAVE) {
        item.actualBgColor = TaskAttendanceColor.LEAVE
      }
      else {
        // item.actualBgColor = '#fceeb7'
        item.actualBgColor = memberExtInfo!.hasDoingTask ? TaskAttendanceColor.DOING : memberExtInfo!.hasActualTask ? TaskAttendanceColor.ACTUAL : '#f7f7f7'
      }
      item.actualStart = date
      item.actualEnd = date
    }
    else {
      item.name = data.feed_name
      // 处理没有实际结束时间的数据：实际开始时间大于今天的任务数据为无效数据，实际开始时间不超过今天的为正在做的任务
      if (memberExtInfo!.showKind === 'actual' && maybeDoing && dateToStart(actualStart) <= dateToStart(todayDate)) {
        item.actualStart = date
        item.actualEnd = date
        item.actualBgColor = TaskAttendanceColor.DOING
      }
      else if (memberExtInfo!.showKind !== 'plan' && new Date(actualStart) <= new Date(actualEnd)) {
        item.actualStart = date
        item.actualEnd = date
      }
    }

    item.hide = memberExtInfo?.hide
  }
  return item
}
/**
 * 组装包含任务的甘特图数据item
 * @param res 人员数据
 */
function generateGanttData(res: DataResp) {
  const pkColumnName = props.tableConf.pkColumnName
  const todayDate = ganttChart.value?.today ?? new Date()
  return res.records.map((el: any) => {
    const { planStartTimeColumnName, planEndTimeColumnName, actualStartTimeColumnName, actualEndTimeColumnName } = props.tableConf.gantt!
    const { name } = el
    const tasks = []
    if ((el[planStartTimeColumnName as string] && el[planEndTimeColumnName as string]) || (el[actualStartTimeColumnName as string] && (el[actualEndTimeColumnName as string] || dateToStart(el[actualStartTimeColumnName as string]) <= dateToEnd(todayDate)))) {
      tasks.push({ id: `${el[pkColumnName]}-task`, ...getTaskItem(el) })
    }
    return {
      id: el[pkColumnName],
      name,
      // tasks: [{ leftRemark: '刘玲', rightRemark: '待开始', id: `${no}-task`, planStart: el[planStartTimeColumnName as string], planEnd: el[planEndTimeColumnName], actualStart: el[actualStartTimeColumnName as string], actualEnd: el[actualEndTimeColumnName as string] }],
      tasks,
    }
  }) as GanttData
}
/**
 * 组装包含任务、加班、请假的甘特图数据item
 * @param res 人员数据
 * @param _taskAttendanceData
 */
function generateGanttDataWithAttendance(res: DataResp, _taskAttendanceData: Record<string, Record<string, { account_attendance_list: object[], idp: Record<string, object> }>>) {
  const { planStartTimeColumnName, planEndTimeColumnName, actualStartTimeColumnName, actualEndTimeColumnName } = props.tableConf.gantt!
  const { dataSeries } = props.layoutConf.gantt ?? {}
  const { count = 8 } = props.tableConf.ganttConf?.worktime ?? {}
  const pkColumnName = props.tableConf.pkColumnName

  const userTaskAttendanceMap = new Map()

  for (const userKey of Object.keys(_taskAttendanceData)) {
    userTaskAttendanceMap.set(userKey, _taskAttendanceData[userKey])
  }

  const showLeave = dataSeries?.includes(GanttDatakind.LEAVE)
  const showOvertime = dataSeries?.includes(GanttDatakind.OVERTIME)
  const showPlan = dataSeries?.includes(GanttDatakind.PLAN)
  const showActual = dataSeries?.includes(GanttDatakind.ACTUAL)
  // console.log('dataSeries', dataSeries, showPlan, showActual, showLeave, showOvertime)
  const handleGanttItemHide = function (type: GanttDatakind) {
    let hide = false
    if (type === GanttDatakind.LEAVE) {
      hide = !showLeave
    }
    else if (type === GanttDatakind.OVERTIME) {
      hide = !showOvertime
    }
    else if (type === GanttDatakind.PLAN) {
      hide = !showPlan
    }
    else if (type === GanttDatakind.ACTUAL) {
      hide = !showActual
    }
    return hide
  }

  const todayDate = ganttChart.value?.today ?? new Date()
  const result = res.records.map((el) => {
    // const { name } = el
    const tasks: Task[] = []

    if (userTaskAttendanceMap.has(el[pkColumnName])) {
      for (const dateKey of Object.keys(userTaskAttendanceMap.get(el[pkColumnName]))) {
        const taskAttendanceItem = userTaskAttendanceMap.get(el[pkColumnName])[dateKey]
        try {
          let hasPlanTask = false; let hasActualTask = false; let hasDoingTask = false
          taskAttendanceItem.idp?.plan_tasks?.forEach((planItem: any) => {
            if (planItem[planStartTimeColumnName as string] && planItem[planEndTimeColumnName as string]) {
              hasPlanTask = true

              tasks.push({ id: `plan-${uniqueString()}`, type: GanttDatakind.PLAN, ...getTaskItem(planItem, { hide: handleGanttItemHide(GanttDatakind.PLAN), showKind: 'plan', date: dateKey }) } as Task)
            }
          })
          if (hasPlanTask && taskAttendanceItem.idp.day_plan_effective_hours > count) {
            tasks[tasks.length - 1].planBorderColor = TaskAttendanceColor.OVERLOAD
          }
          taskAttendanceItem.idp?.real_task?.forEach((actualItem: any) => {
            // 过滤掉实际开始时间大于今天的任务数据
            if (actualItem[actualStartTimeColumnName as string] && dateToStart(actualItem[actualStartTimeColumnName as string]) > dateToStart(todayDate)) {
              return
            }
            if (!actualItem[actualEndTimeColumnName as string]) {
              hasDoingTask = true
            }
            hasActualTask = true
            tasks.push({ id: `actual-${uniqueString()}`, type: GanttDatakind.ACTUAL, ...getTaskItem(actualItem, { hide: handleGanttItemHide(GanttDatakind.ACTUAL), showKind: 'actual', date: dateKey }) } as Task)
          })
          if (hasActualTask && taskAttendanceItem.idp.day_real_effective_hours > count) {
            tasks[tasks.length - 1].actualBgColor = TaskAttendanceColor.OVERLOAD
          }

          taskAttendanceItem.account_attendance_list.forEach((attendanceItem: any) => {
            tasks.push({ id: `attendance-${uniqueString()}`, type: attendanceItem.type.toLowerCase(), ...getTaskItem(attendanceItem, { hasDoingTask, hasActualTask, hide: handleGanttItemHide(attendanceItem.type.toLowerCase()), showKind: 'attendance', date: dateKey }) } as Task)
          })
        }
        catch (error) {
          console.log('error', taskAttendanceItem, userTaskAttendanceMap, el[pkColumnName], error)
        }
      }
    }

    return {
      id: el[pkColumnName],
      name: el.title || el.name,
      // tasks: [{ leftRemark: '刘玲', rightRemark: '待开始', id: `${no}-task`, planStart: el[planStartTimeColumnName as string], planEnd: el[planEndTimeColumnName], actualStart: el[actualStartTimeColumnName as string], actualEnd: el[actualEndTimeColumnName as string] }],
      // tasks: [{ id: `${no}-task`, ...getTaskItem(el) }],
      tasks,
    }
  })
  console.log('result', result)
  return result
}

const ViewModeMap = {
  [GanttShowKind.DAY]: 'Day',
  [GanttShowKind.WEEK]: 'Week',
  [GanttShowKind.MONTH]: 'Month',
  [GanttShowKind.YEAR]: 'Year',
}

const taskAttendanceData = ref<GanttDataResp>({})
const hideRowKeys = ref<Map<string, boolean>>(new Map())
const state = reactive<{ isInited: 'false' | 'doing' | 'true', loadingMore: boolean, latestQueryStartDate: string, latestQueryEndDate: string, latestAccountIds: string[] }>({ isInited: 'false', loadingMore: false, latestQueryStartDate: '', latestQueryEndDate: '', latestAccountIds: [] })

watch(() => props.layoutConf.gantt, (newV) => {
  // console.log('gantt', newV)
  const current = objectOmit(deepToRaw(props.layoutConf.gantt), ['timelineWidth'])
  if (state.isInited === 'true' && !isEqual(current, latestLayoutGantt.value)) {
    console.log('latestLayoutGantt.value:change', latestLayoutGantt.value)
    const layoutGanttKind = props.layoutConf.ganttConf?.kind ?? props.tableConf.ganttConf?.kind
    const isTaskGantt = layoutGanttKind === 'task'
    const { showPlanPeriod = true, showRealPeriod = true, dataSeries } = props.layoutConf.gantt ?? {}
    const showKind = props.layoutConf.gantt!.showKind ?? props.tableConf.gantt!.showKind
    const config: GanttConfig = {
      viewMode: ViewModeMap[showKind] as any,
      showLeftRemark: isTaskGantt,
      showRightRemark: isTaskGantt,
      showPlan: isTaskGantt ? showPlanPeriod : true,
      showActual: isTaskGantt ? showRealPeriod : true,
    }
    if (isTaskGantt) {
      // const { leftMark, rightMark } = latestLayoutGantt.value
      // if (current.leftMark !== leftMark || current.rightMark !== rightMark) {
      ganttChart.value!.setData(generateGanttData(deepToRaw(props.layoutConf.data) as DataResp), config)
      // }
    }
    else {
      config.showCenterRemark = getShowCenterRemark(showKind)
      if (!isEqual(dataSeries, latestLayoutGantt.value?.dataSeries)) {
        const showLeave = dataSeries?.includes(GanttDatakind.LEAVE)
        const showOvertime = dataSeries?.includes(GanttDatakind.OVERTIME)
        const showPlan = dataSeries?.includes(GanttDatakind.PLAN)
        const showActual = dataSeries?.includes(GanttDatakind.ACTUAL)

        // console.log('dataSeries', dataSeries, showPlan, showActual, showLeave, showOvertime, ganttChart.value?.data)
        ganttChart.value?.data.forEach((row) => {
          row.tasks.forEach((task) => {
            if (task.type === GanttDatakind.LEAVE) {
              task.hide = !showLeave
            }
            else if (task.type === GanttDatakind.OVERTIME) {
              task.hide = !showOvertime
            }
            else if (task.type === GanttDatakind.PLAN) {
              task.hide = !showPlan
            }
            else if (task.type === GanttDatakind.ACTUAL) {
              task.hide = !showActual
            }
          })
        })
        ganttChart.value!.setData(ganttChart.value!.data, config)
      }
      else {
        ganttChart.value?.updateConfig(config)
      }
    }
  }

  latestLayoutGantt.value = current
})

function getShowCenterRemark(kind: GanttShowKind) {
  switch (kind) {
    case GanttShowKind.DAY:
      return true
    case GanttShowKind.WEEK:
      return true

    default:
      return false
  }
}

// 监听布局配置变化
// Listen for layout configuration changes
watch(() => [props.layoutConf.data, props.layoutConf.ganttConf], async () => {
  const pkColumnName = props.tableConf.pkColumnName
  // const { queryStartDate: oldStartDate, queryEndDate: oldEndDate } = oldValue?.ganttConf ?? {}
  const { defaultQueryStartDate, defaultQueryEndDate, queryStartDate, queryEndDate } = props.layoutConf.ganttConf ?? {}
  const layoutGanttKind = props.layoutConf.ganttConf?.kind ?? props.tableConf.ganttConf?.kind
  const isTaskGantt = layoutGanttKind === 'task'
  const { showPlanPeriod = true, showRealPeriod = true } = props.layoutConf.gantt ?? {}

  // let taskAttendanceData:Record<string, any>[] = [ ]
  if (!props.layoutConf.data) {
    return
  }
  // const temp = deepToRaw(props.layoutConf)
  // if (latestLayout.value) {
  //   console.log('diff:', diff(latestLayout, temp))
  // }
  // latestLayout.value = temp

  const accountIds = (props.layoutConf.data as DataResp).records.map(el => el[pkColumnName])
  const dataChange = !isEqual(accountIds, state.latestAccountIds)
  if (dataChange) {
    state.loadingMore = false
  }
  else if (state.loadingMore) {
    state.loadingMore = false
    return
  }
  if (!isTaskGantt) {
    try {
      if (defaultQueryStartDate && defaultQueryEndDate && Object.keys(taskAttendanceData.value).length === 0) {
        taskAttendanceData.value = await eb.loadWorkTasksAndAttendance({ startTime: dateToStart(defaultQueryStartDate), endTime: dateToEnd(defaultQueryEndDate), accountIds })

        props.layoutConf.ganttConf!.queryStartDate = state.latestQueryStartDate = defaultQueryStartDate ?? ''
        props.layoutConf.ganttConf!.queryEndDate = state.latestQueryEndDate = defaultQueryEndDate ?? ''

        // console.log('[task, attendance]', taskAttendanceData)
      }
      else if (dataChange && defaultQueryStartDate && defaultQueryEndDate) {
        taskAttendanceData.value = await eb.loadWorkTasksAndAttendance({ startTime: dateToStart(defaultQueryStartDate), endTime: dateToEnd((defaultQueryEndDate)), accountIds })

        props.layoutConf.ganttConf!.queryStartDate = state.latestQueryStartDate = defaultQueryStartDate ?? ''
        props.layoutConf.ganttConf!.queryEndDate = state.latestQueryEndDate = defaultQueryEndDate ?? ''
      }
      else if (queryStartDate && queryEndDate) {
        const start = dateToStart(queryStartDate); const end = dateToEnd(queryEndDate)
        const dateRange = end.getTime() - start.getTime()
        // console.log('dateRange', end, start, dateRange, DateUtils.ONE_DAY_MS * 30)
        if (!(dateRange > 0 && dateRange <= DateUtils.ONE_DAY_MS * 31)) {
          eb.handleAlert(AlertKind.EVENT_INVOKE_ERROR, t('gantt.error.queryDateRangeError', { msg: 30 }))
          return
        }
        if (queryStartDate !== state.latestQueryStartDate || queryEndDate !== state.latestQueryEndDate) {
          taskAttendanceData.value = await eb.loadWorkTasksAndAttendance({ startTime: start, endTime: end, accountIds })
        }
        state.latestQueryStartDate = queryStartDate ?? ''
        state.latestQueryEndDate = queryEndDate ?? ''
      }
    }
    catch (error: any) {
      console.log('error', error.message)
    }
  }
  state.latestAccountIds = accountIds
  const showKind = props.layoutConf.gantt!.showKind ?? props.tableConf.gantt!.showKind
  // console.log('watch:: taskAttendanceData', taskAttendanceData.value, state.isInited)
  const config: GanttConfig = {
    viewMode: ViewModeMap[showKind] as any,
    showLeftRemark: isTaskGantt,
    showRightRemark: isTaskGantt,
    showPlan: isTaskGantt ? showPlanPeriod : true,
    showActual: isTaskGantt ? showRealPeriod : true,
    queryStartDate: new Date(state.latestQueryStartDate),
    queryEndDate: new Date(state.latestQueryEndDate),
  }

  config.showCenterRemark = getShowCenterRemark(showKind)

  // 生成甘特图信息
  // Generate Gantt information
  if (!ganttChart.value && state.isInited === 'false') {
    state.isInited = 'doing'
    setTimeout(() => {
      // handle page position offset of Micro frontend framework
      const { left = 0, top = 0 } = ganttRef.value?.closest('micro-app')?.getBoundingClientRect() ?? {}
      config.offsetLeft = -left
      config.offsetTop = -top
      initGantt(isTaskGantt ? generateGanttData(deepToRaw(props.layoutConf.data) as DataResp) : generateGanttDataWithAttendance(deepToRaw(props.layoutConf.data) as DataResp, taskAttendanceData.value as any), config)
      if (isTaskGantt) {
        // automatically horizonal scroll to today date for task gantt
        setTimeout(() => {
          ganttChart.value?.horizontalScrollTo(new Date())
        })
      }
    })
  }
  else if (state.isInited === 'true') {
    // handle page position offset of Micro frontend framework
    const { left = 0, top = 0 } = ganttRef.value?.closest('micro-app')?.getBoundingClientRect() ?? {}
    config.offsetLeft = -left
    config.offsetTop = -top
    ganttChart.value!.setData(isTaskGantt ? generateGanttData(deepToRaw(props.layoutConf.data) as DataResp) : generateGanttDataWithAttendance(deepToRaw(props.layoutConf.data) as DataResp, taskAttendanceData.value as any), config)
    if (isTaskGantt) {
      // automatically horizonal scroll to today date for task gantt
      setTimeout(() => {
        ganttChart.value?.horizontalScrollTo(new Date())
      })
    }
  }
}, { deep: true, immediate: true })

/**
 * 设置新的宽度
 *
 * Set new width
 *
 * @param timelineWidth 时间线宽度 / Timeline width
 * @param _itemId 项ID，此处不需要 / Item ID,not needed here
 */
async function setNewWidth(timelineWidth: number, _itemId?: string) {
  const changedLayoutReq: LayoutModifyProps = {
    gantt: {
      ...props.ganttProps,
      timelineWidth,
    },
  }
  await eb.modifyLayout(changedLayoutReq)
}

function initGantt(data: GanttData, config?: GanttConfig) {
  const { headerHeight = 41, rowHeight = 31, theme = 'white', holidays = [] } = props.tableConf.ganttConf!
  // const { kind: layoutGanttKind } = props.layoutConf.ganttConf!
  const layoutGanttKind = props.layoutConf.ganttConf?.kind ?? props.tableConf.ganttConf?.kind
  const isMemeber = layoutGanttKind === 'member'
  ganttChart.value = new GanttChart(ganttChartRef.value, data as any, {
    viewMode: 'Day',
    showCenterRemark: true,
    showLeftRemark: true,
    showRightRemark: true,
    showActual: true,
    showPlan: true,
    headerHeight,
    rowHeight,
    tooltipColor: theme,
    enabledLoadMore: isMemeber ? ['left', 'right'] : [],
    showTooltip: isMemeber,
    holidays,
    xGap: 0,
    tooltipFormat: layoutGanttKind === 'task' ? null : (row, date, config: GanttConfig) => {
      // console.log('date', date,)
      const uniquePlanTaskIds = new Map()
      const uniqueActualTaskIds = new Map()
      const overlappingTasks = row.tasks.filter((task: Task) => {
        if (task.planStart && task.planEnd && date >= dateToStart(task.planStart!) && date <= dateToEnd(task.planEnd!)) {
          if (task._data?.feed_id) {
            if (uniquePlanTaskIds.has(task._data?.feed_id)) {
              return false
            }
            uniquePlanTaskIds.set(task._data?.feed_id, true)
          }
          return true
        }
        if (task.actualStart) {
          const aEnd = task.actualEnd ?? ganttChart.value!.today
          if (date >= dateToStart(task.actualStart!) && date <= dateToEnd(aEnd!)) {
            if (task._data?.feed_id) {
              if (uniqueActualTaskIds.has(task._data?.feed_id)) {
                return false
              }
              uniqueActualTaskIds.set(task._data?.feed_id, true)
            }
            return true
          }
        }
        return false
      })
      // console.log('row, date, config', row, date, config, overlappingTasks)
      let planHtml = `<div><strong>资源计划分配</strong><br></div>`
      let actualHtml = `<div><strong>资源实际分配</strong><br></div>`
      let attendanceHtml = `<div><strong>出勤</strong><br></div>`
      let planTaskIndex = 0
      let actualTaskIndex = 0
      let attendanceIndex = 0

      overlappingTasks.forEach((task) => {
        if (task.id.startsWith('attendance-')) {
          attendanceIndex++
          attendanceHtml += `<span class="__gantt_tooltip-indent"> ${AttendanceMap[task._data.type]} (${
            AttendanceCount[task._data.day]
          })</span><br>`
        }
        else {
          if (task.planStart && task.planEnd) {
            planHtml += `<span class="__gantt_tooltip-indent"><span class="inline-block w-[10px]">${++planTaskIndex}</span>、${task.name} (${
              task._data?.effective_hours ?? 0
            }小时)</span><br>`
          }
          if (task.actualStart) {
            actualHtml += `<span class="__gantt_tooltip-indent"><span class="inline-block w-[10px]">${++actualTaskIndex}</span>、${task.name} (${
              task._data?.real_effective_hours ?? 0
            }小时)</span><br>`
          }
        }
      })
      if (!planTaskIndex && !actualTaskIndex && !attendanceIndex) {
        return ''
      }

      let _worktime = ''
      if (isMemeber) {
        const { worktime } = props.tableConf.ganttConf ?? {}
        if (worktime) {
          _worktime = `${DateUtils.format(new Date(worktime.start_time), 'hh:mm')} - ${DateUtils.format(new Date(worktime.end_time), 'hh:mm')}`
        }
      }
      const html = `<strong>${row.name}</strong> (${DateUtils.format(
        date,
        'yyyy-MM-dd',
      )} ${_worktime})<hr class="__gantt_tooltip-divider">`
      return html + (planTaskIndex > 0 ? planHtml : '') + (actualTaskIndex > 0 ? actualHtml : '') + (attendanceIndex > 0 ? attendanceHtml : '')
    },
    ...config,
  })
  // console.log('ganttChart', ganttChart)

  if (isMemeber) {
    ganttChart.value.setOnDataLoadCallback(async (direction, { date }) => {
      console.log('direction, {date}', direction, { date })
      const pkColumnName = props.tableConf.pkColumnName
      const { queryStartDate, queryEndDate } = props.layoutConf.ganttConf ?? {}
      const accountIds = (props.layoutConf.data as DataResp).records.map(el => el[pkColumnName])
      if (!queryStartDate || !queryEndDate) {
        return []
      }
      const nextDateRange: any = {
        left: (date: any) => DateUtils.addDays(date, -30),
        right: (date: any) => DateUtils.addDays(date, 30),
      }
      let nextStartDate = null
      let nextEndDate = null
      if (direction === 'left') {
        nextStartDate = nextDateRange[direction](queryStartDate)
        nextEndDate = queryStartDate
      }
      else if (direction === 'right') {
        nextStartDate = queryEndDate
        nextEndDate = nextDateRange[direction](queryEndDate)
      }
      const res = await eb.loadWorkTasksAndAttendance({ startTime: dateToStart(nextStartDate), endTime: dateToEnd(nextEndDate), accountIds })

      for (const userKey of Object.keys(res)) {
        if (!objectHas(taskAttendanceData.value, userKey)) {
          taskAttendanceData.value[userKey] = {}
        }
        for (const dateKey of Object.keys(res[userKey])) {
          if (!objectHas(taskAttendanceData.value[userKey], dateKey)) {
            taskAttendanceData.value[userKey][dateKey] = { account_attendance_list: [], idp: {} }
          }
          taskAttendanceData.value[userKey][dateKey].account_attendance_list.push(...res[userKey][dateKey].account_attendance_list)
          taskAttendanceData.value[userKey][dateKey].idp = res[userKey][dateKey].idp
        }
      }

      const formatData = generateGanttDataWithAttendance(deepToRaw(props.layoutConf.data) as DataResp, res as any)
      if (direction === 'left') {
        props.layoutConf.ganttConf!.queryStartDate = state.latestQueryStartDate = nextStartDate
      }
      else if (direction === 'right') {
        props.layoutConf.ganttConf!.queryEndDate = state.latestQueryEndDate = nextEndDate
      }
      state.loadingMore = true
      // console.log('formatData', formatData, taskAttendanceData.value)
      return formatData
    })
  }

  let isGanttScrolling = false
  let isTableScrolling = false
  ganttChart.value!.container.addEventListener('ganttscroll', (e: any) => {
    if (isTableScrolling)
      return
    isGanttScrolling = true
    ganttListRef.value!.scrollTop = e.detail.scrollTop
    setTimeout(() => {
      isGanttScrolling = false
    }, 0)
  })
  ganttListRef.value!.addEventListener('scroll', () => {
    if (isGanttScrolling)
      return
    isTableScrolling = true
    ganttChart.value!.setScrollTop(ganttListRef.value!.scrollTop)
    setTimeout(() => {
      isTableScrolling = false
    }, 0)
  })
  state.isInited = 'true'
  console.log('ganttChart:', ganttChart.value)
}
let rowTreeEventId: string | null = null

onMounted(() => {
  ganttWith.value = ganttRef.value!.offsetWidth
  // 注册行树触发事件
  // Register row tree trigger event
  rowTreeEventId = registerRowTreeTriggerEventForGanttNew(async () => {
    if (ganttTimelineRef.value) {
      setTimeout(() => {
        const allRows = ganttListRef.value?.querySelectorAll(`div.iw-list-row[data-pk]`)
        // const allHideElKeys: string[] = []
        hideRowKeys.value.clear()
        allRows?.forEach((el: any) => {
          if (el.style.display === 'none') {
            // hideRowKeys.value.push(el.dataset.pk!)
            hideRowKeys.value.set(el.dataset.pk!, true)
            // hideRowKeys.value.push(['3', '5'].includes(el.dataset.pk!) ? el.dataset.pk! : +el.dataset.pk)
          }
        })
        ganttChart.value?.data.forEach((el: Row) => {
          if (hideRowKeys.value.has(el.id)) {
            el.hide = true
          }
          else {
            el.hide = false
          }
        })
        console.log('hideRowKeys', ganttChart.value?.data, hideRowKeys, allRows)
        ganttChart.value?.setData(ganttChart.value?.data)
      })
    }
  })
})
onBeforeUnmount(() => {
  if (ganttChart.value) {
    ganttChart.value.destroy()
  }
})
onUnmounted(() => {
  // 注销行树触发事件
  // Unregister row tree trigger event
  unregisterRowTreeTriggerEventForGanttNew(rowTreeEventId!)
})
</script>

<template>
  <div
    ref="ganttRef"
    class="iw-gantt flex h-full relative"
  >
    <div ref="ganttListRef" class="overflow-y-hidden overflow-x-auto" :style="`width: ${ganttWith - props.ganttProps.timelineWidth}px`">
      <!-- 甘特图列表，直接引用列表视图 -->
      <!-- Gantt chart list, directly reference the list view -->
      <ListComp :layout-conf="props.layoutConf" :table-conf="props.tableConf" :columns-conf="props.columnsConf" :show-pk-column="props.showPkColumn" />
    </div>
    <div
      ref="ganttTimelineRef"
      class="iw-gantt-timeline-container overflow-auto border-l-2 border-l-base-300 w-full flex-1"
      :style="`width: ${props.ganttProps.timelineWidth}px`"
    >
      <div

        :class="`iw-gantt-timeline h-full relative iw-gantt-timeline--size${props.tableConf.styles.size}`"
      >
        <!-- 与列表视图保持一致，不分组模式的处理 -->
        <!-- Consistent with the list view, the processing of non-grouping mode -->
        <template v-if="props.layoutConf.data && !Array.isArray(props.layoutConf.data)">
          <div ref="ganttChartRef" class="gantt-chart-wrapper overflow-auto h-full" />
        </template>
        <!-- 与列表视图保持一致，分组模式的处理 -->
        <!-- Consistent with the list view, the processing of grouping mode -->
      </div>
      <ColumnResizeComp resize-item-class="iw-gantt-timeline-container" handle-left :set-size="setNewWidth" />
    </div>
  </div>
</template>

<style lang="css">
.iw-gantt-timeline--size-xs {
  @apply text-xs;

  .iw-gantt-timeline-cell {
    @apply p-0
  }
}

.iw-gantt-timeline-size-sm {
  @apply text-sm;

  .iw-gantt-timeline-cell {
    @apply p-[1px]
  }
}

.iw-gantt-timeline--size {
  @apply text-base;

  .iw-gantt-timeline-cell {
    @apply p-[2px] pl-[4px]
  }
}

.iw-gantt-timeline--size-lg {
  @apply text-lg;

  .iw-gantt-timeline-cell {
    @apply p-1.5
  }
}
</style>
