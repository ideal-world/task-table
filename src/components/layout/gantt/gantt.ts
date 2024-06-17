import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import weekday from 'dayjs/plugin/weekday'
import locales from '../../../locales'
import { GanttShowKind } from '../../../props/enumProps'

const { t } = locales.global

dayjs.extend(weekOfYear)
dayjs.extend(weekday)
dayjs.extend(isSameOrBefore)

const TIMELINE_COLUMN_WIDTH = 25

export interface GanttInfo {
  timeline: TimelineInfo[]
  ganttShowKind: GanttShowKind
  holidays: Dayjs[]
}

export function getTimelineColumnWidth(ganttShowKind: GanttShowKind) {
  switch (ganttShowKind) {
    case GanttShowKind.DAY:
      return TIMELINE_COLUMN_WIDTH
    case GanttShowKind.WEEK:
      return TIMELINE_COLUMN_WIDTH * 2
    case GanttShowKind.MONTH:
      return TIMELINE_COLUMN_WIDTH * 4
    case GanttShowKind.YEAR:
      return TIMELINE_COLUMN_WIDTH * 8
  }
}

export interface TimelineInfo {
  // Day、Week、Month、Year
  value: number
  // The aggregation of the date is the year-month
  // The aggregation of the week is the year
  // The aggregation of the month is the year
  categoryTitle?: string
  holiday?: boolean
  today?: boolean
}

export function getStartAndEndDay(records: { [key: string]: any }[], planStartTimeColumnName: string, planEndTimeColumnName: string, actualStartTimeColumnName?: string, actualEndTimeColumnName?: string): { startDate: Date, endDate: Date } {
  let timelineStartDate: Date | null = null
  let timelineEndDate: Date | null = null
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
    // Use the previous and next 10 days of the current time
    timelineStartDate = dayjs().subtract(10, 'day').toDate()
    timelineEndDate = dayjs().add(10, 'day').toDate()
  }
  else if (timelineStartDate && !timelineEndDate) {
    timelineEndDate = dayjs(timelineStartDate).add(1, 'day').toDate()
  }
  else if (!timelineStartDate && timelineEndDate) {
    timelineStartDate = dayjs(timelineEndDate).subtract(1, 'day').toDate()
  }
  else if (timelineStartDate! > timelineEndDate!) {
    // Switch
    const temp = timelineStartDate
    timelineStartDate = timelineEndDate
    timelineEndDate = temp
  }

  timelineStartDate = dayjs(timelineStartDate).subtract(10, 'day').toDate()
  timelineEndDate = dayjs(timelineEndDate).add(10, 'day').toDate()
  return { startDate: timelineStartDate, endDate: timelineEndDate }
}

export function generateTimeline(showKind: GanttShowKind, startDate: Date, endDate: Date, holidays: Dayjs[]): TimelineInfo[] {
  let timelineStartDate = dayjs(startDate)
  const timelineEndDate = dayjs(endDate)
  const timelineInfo: TimelineInfo[] = []
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
