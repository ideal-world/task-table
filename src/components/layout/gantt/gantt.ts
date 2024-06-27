import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import weekday from 'dayjs/plugin/weekday'
import locales from '../../../locales'
import { GanttShowKind } from '../../../props/enumProps'

const { t } = locales.global

dayjs.extend(weekOfYear)
dayjs.extend(weekday)
dayjs.extend(dayOfYear)
dayjs.extend(isLeapYear)
dayjs.extend(isSameOrBefore)

// 时间线每列最小宽度
// Minimum width of each column of the timeline
const TIMELINE_COLUMN_MIN_WIDTH = 25

/**
 * 甘特图信息
 *
 * Gantt chart information
 */
export interface GanttInfo {
  /**
   * 时间线
   *
   * Timeline
   */
  timeline: TimelinePerColumnInfo[]
  /**
   * 甘特图显示类型
   *
   * Gantt chart display type
   */
  ganttShowKind: GanttShowKind
  /**
   * 假日列表
   *
   * List of holidays
   */
  holidays: Dayjs[]
}

/**
 * 时间线每列信息
 *
 * Information of each column of the timeline
 */
export interface TimelinePerColumnInfo {
  /**
   * 值
   *
   * Value
   *
   * 根据甘特图显示类型不同，值的含义不同。
   *
   * According to the different Gantt chart display types, the meaning of the value is different.
   */
  value: number
  /**
   * 分类标题
   *
   * Category title
   *
   * 当甘特图显示类型为天 {@link GanttShowKind.DAY} 时，分类标题为年-月
   * 当甘特图显示类型为周 {@link GanttShowKind.WEEK} 时，分类标题为年
   * 当甘特图显示类型为月 {@link GanttShowKind.MONTH} 时，分类标题为年
   *
   * When the Gantt chart display type is day {@link GanttShowKind.DAY}, the category title is year-month
   * When the Gantt chart display type is week {@link GanttShowKind.WEEK}, the category title is year
   * When the Gantt chart display type is month {@link GanttShowKind.MONTH}, the category title is year
   */
  categoryTitle?: string
  /**
   * 是否假日
   *
   * Is it a holiday
   */
  holiday?: boolean
  /**
   * 是否今天
   *
   * Is it today
   */
  today?: boolean
}

/**
 * 根据甘特图显示类型获取时间线列宽
 *
 * Get the timeline column width according to the Gantt chart display type、
 *
 * @param ganttShowKind 甘特图显示类型 / Gantt chart display type
 * @returns 时间线列宽 / Timeline column width
 */
export function getTimelineColumnWidth(ganttShowKind: GanttShowKind) {
  switch (ganttShowKind) {
    case GanttShowKind.DAY:
      return TIMELINE_COLUMN_MIN_WIDTH
    case GanttShowKind.WEEK:
      return TIMELINE_COLUMN_MIN_WIDTH * 2
    case GanttShowKind.MONTH:
      return TIMELINE_COLUMN_MIN_WIDTH * 6
    case GanttShowKind.YEAR:
      return TIMELINE_COLUMN_MIN_WIDTH * 10
  }
}

/**
 * 从要显示的数据中获取时间线的开始和结束日期
 *
 * Get the start and end date of the timeline from the data to be displayed
 *
 * @param records 数据 / Data
 * @param planStartTimeColumnName 计划开始时间列名 / Plan start time column name
 * @param planEndTimeColumnName 计划结束时间列名 / Plan end time column name
 * @param actualStartTimeColumnName 实际开始时间列名 / Actual start time column name
 * @param actualEndTimeColumnName 实际结束时间列名 / Actual end time column name
 * @returns 开始和结束日期 / Start and end date
 */
export function getStartAndEndDay(records: { [columnName: string]: any }[], planStartTimeColumnName: string, planEndTimeColumnName: string, actualStartTimeColumnName?: string, actualEndTimeColumnName?: string): { startDate: Date, endDate: Date } {
  let timelineStartDate: Date | null = null
  let timelineEndDate: Date | null = null
  // 遍历所有数据，获取所有数据中最早及最晚的时间
  // Traverse all data to get the earliest and latest time in all data
  records.forEach((d) => {
    const startDate = d[planStartTimeColumnName] ? d[planStartTimeColumnName] instanceof Date ? d[planStartTimeColumnName] : new Date(d[planStartTimeColumnName]) : null
    const endDate = d[planEndTimeColumnName] ? d[planEndTimeColumnName] instanceof Date ? d[planEndTimeColumnName] : new Date(d[planEndTimeColumnName]) : null
    if (startDate && endDate && startDate > endDate) {
      throw new Error(t('gantt.error.startDateGreaterThanEndDate', { startDate: dayjs(startDate).format('YYYY-MM-DD HH:mm:ss.SSS'), endDate: dayjs(endDate).format('YYYY-MM-DD HH:mm:ss.SSS') }))
    }
    if (startDate && (!timelineStartDate || timelineStartDate > startDate)) {
      timelineStartDate = startDate
    }
    if (endDate && (!timelineEndDate || timelineEndDate < endDate)) {
      timelineEndDate = endDate
    }
    if (actualStartTimeColumnName && actualEndTimeColumnName) {
      const startDate = d[actualStartTimeColumnName] ? d[actualStartTimeColumnName] instanceof Date ? d[actualStartTimeColumnName] : new Date(d[actualStartTimeColumnName]) : null
      const endDate = d[actualEndTimeColumnName] ? d[actualEndTimeColumnName] instanceof Date ? d[actualEndTimeColumnName] : new Date(d[actualEndTimeColumnName]) : null
      if (startDate && endDate && startDate > endDate) {
        throw new Error(t('gantt.error.startDateGreaterThanEndDate', { startDate: dayjs(startDate).format('YYYY-MM-DD HH:mm:ss.SSS'), endDate: dayjs(endDate).format('YYYY-MM-DD HH:mm:ss.SSS') }))
      }
      if (startDate && (!timelineStartDate || timelineStartDate > startDate)) {
        timelineStartDate = startDate
      }
      if (endDate && (!timelineEndDate || timelineEndDate < endDate)) {
        timelineEndDate = endDate
      }
    }
  })
  if (!timelineStartDate && !timelineEndDate) {
    // 当开始和结束时间都不存在时，使用当前时间的前后10天
    // When the start and end time do not exist, use the previous and next 10 days of the current time
    timelineStartDate = dayjs().subtract(10, 'day').toDate()
    timelineEndDate = dayjs().add(10, 'day').toDate()
  }
  else if (timelineStartDate && !timelineEndDate) {
    // 当开始时间存在，结束时间不存在时，使用开始时间的后一天作为结束时间
    // When the start time exists and the end time does not exist, use the day after the start time as the end time
    timelineEndDate = dayjs(timelineStartDate).add(1, 'day').toDate()
  }
  else if (!timelineStartDate && timelineEndDate) {
    // 当开始时间不存在，结束时间存在时，使用结束时间的前一天作为开始时间
    // When the start time does not exist and the end time exists, use the day before the end time as the start time
    timelineStartDate = dayjs(timelineEndDate).subtract(1, 'day').toDate()
  }
  else if (timelineStartDate! > timelineEndDate!) {
    // 当开始时间大于结束时间时，交换开始和结束时间
    // When the start time is greater than the end time, swap the start and end times
    const temp = timelineStartDate
    timelineStartDate = timelineEndDate
    timelineEndDate = temp
  }

  // 将开始时间提前10天，结束时间延后10天
  // Advance the start time by 10 days and postpone the end time by 10 days
  timelineStartDate = dayjs(timelineStartDate).subtract(10, 'day').toDate()
  timelineEndDate = dayjs(timelineEndDate).add(10, 'day').toDate()
  return { startDate: timelineStartDate, endDate: timelineEndDate }
}

/**
 * 生成时间线
 *
 * Generate timeline
 *
 * @param showKind 甘特图显示类型 / Gantt chart display type
 * @param startDate 开始日期 / Start date
 * @param endDate 结束日期 / End date
 * @param holidays 假日列表 / List of holidays
 * @returns 时间线 / Timeline
 */
export function generateTimeline(showKind: GanttShowKind, startDate: Date, endDate: Date, holidays: Dayjs[]): TimelinePerColumnInfo[] {
  let timelineStartDate = dayjs(startDate)
  const timelineEndDate = dayjs(endDate)
  const timelineInfo: TimelinePerColumnInfo[] = []
  switch (showKind) {
    case GanttShowKind.DAY:
      while (timelineStartDate.isSameOrBefore(timelineEndDate, 'day')) {
        timelineInfo.push({
          value: timelineStartDate.date(),
          categoryTitle: `${timelineStartDate.format('YYYY-MM')}`,
          holiday: holidays.some(d => d.isSame(timelineStartDate, 'day')),
          today: timelineStartDate.isSame(dayjs(), 'day'),
        })
        timelineStartDate = timelineStartDate.add(1, 'day')
      }
      break
    case GanttShowKind.WEEK:
      while (timelineStartDate.isSameOrBefore(timelineEndDate, 'week')) {
        timelineInfo.push({
          value: timelineStartDate.week(),
          categoryTitle: `${timelineStartDate.year()}`,
        })
        timelineStartDate = timelineStartDate.add(1, 'week')
      }
      break
    case GanttShowKind.MONTH:
      while (timelineStartDate.isSameOrBefore(timelineEndDate, 'month')) {
        timelineInfo.push({
          value: timelineStartDate.month() + 1,
          categoryTitle: `${timelineStartDate.year()}`,
        })
        timelineStartDate = timelineStartDate.add(1, 'month')
      }
      break
    case GanttShowKind.YEAR:
      while (timelineStartDate.isSameOrBefore(timelineEndDate, 'year')) {
        timelineInfo.push({
          value: timelineStartDate.year(),
        })
        timelineStartDate = timelineStartDate.add(1, 'year')
      }
      break
  }
  return timelineInfo
}

/**
 * 获取指定开始和结束日期之间的工作日数
 *
 * Get the number of weekdays between the specified start and end dates
 *
 * @param startDate 开始日期 / Start date
 * @param endDate 结束日期 / End date
 * @param holidays 假日列表 / List of holidays
 * @returns 工作日数 / Number of weekdays
 */
export function getWeekdays(startDate: Date, endDate: Date, holidays: Dayjs[]): number {
  let timelineStartDate = dayjs(startDate)
  const timelineEndDate = dayjs(endDate)
  let weekdays = 0
  while (timelineStartDate.isSameOrBefore(timelineEndDate, 'day')) {
    if (!holidays.some(d => d.isSame(timelineStartDate, 'day'))) {
      weekdays++
    }
    timelineStartDate = timelineStartDate.add(1, 'day')
  }
  return weekdays
}
