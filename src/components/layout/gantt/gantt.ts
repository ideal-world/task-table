import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import locales from '../../../locales'
import { GanttShowKind } from '../../../props'

const { t } = locales.global

dayjs.extend(weekOfYear)

export const TIMELINE_COLUMN_WIDTH = 25

export interface GanttInfo {
  timeline: TimelineInfo[]
  ganttShowKind: GanttShowKind
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

export function getStartAndEndDay(records: { [key: string]: any }[], planStartTimeColumnName?: string, planEndTimeColumnName?: string, actualStartTimeColumnName?: string, actualEndTimeColumnName?: string): { startDate: Date, endDate: Date } {
  let timelineStartDate: Date | null = null
  let timelineEndDate: Date | null = null
  records.forEach((d) => {
    if (planStartTimeColumnName && planEndTimeColumnName) {
      const startDate = d[planStartTimeColumnName] ? d[planStartTimeColumnName] instanceof Date ? d[planStartTimeColumnName] : new Date(d[planStartTimeColumnName]) : null
      const endDate = d[planEndTimeColumnName] ? d[planEndTimeColumnName] instanceof Date ? d[planEndTimeColumnName] : new Date(d[planEndTimeColumnName]) : null
      if (startDate && endDate && startDate > endDate) {
        throw new Error(t('gantt.error.startDateGreaterThanEndDate', { startDate: dayjs(startDate).format('YYYY-MM-DD HH:mm:ss.SSS'), endDate: dayjs(endDate).format('YYYY-MM-DD HH:mm:ss.SSS') }))
      }
      else if (startDate && (!timelineStartDate || timelineStartDate > startDate)) {
        timelineStartDate = startDate
      }
      else if (endDate && (!timelineEndDate || timelineEndDate < endDate)) {
        timelineEndDate = endDate
      }
    }
    if (actualStartTimeColumnName && actualEndTimeColumnName) {
      const startDate = d[actualStartTimeColumnName] ? d[actualStartTimeColumnName] instanceof Date ? d[actualStartTimeColumnName] : new Date(d[actualStartTimeColumnName]) : null
      const endDate = d[actualEndTimeColumnName] ? d[actualEndTimeColumnName] instanceof Date ? d[actualEndTimeColumnName] : new Date(d[actualEndTimeColumnName]) : null
      if (startDate && endDate && startDate > endDate) {
        throw new Error(t('gantt.error.startDateGreaterThanEndDate', { startDate: dayjs(startDate).format('YYYY-MM-DD HH:mm:ss.SSS'), endDate: dayjs(endDate).format('YYYY-MM-DD HH:mm:ss.SSS') }))
      }
      else if (startDate && (!timelineStartDate || timelineStartDate > startDate)) {
        timelineStartDate = startDate
      }
      else if (endDate && (!timelineEndDate || timelineEndDate < endDate)) {
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

export function generateTimeline(showKind: GanttShowKind, startDate: Date, endDate: Date, holidays: Date[]): TimelineInfo[] {
  const holidayJs = holidays.map(d => dayjs(d))
  let timelineStartDate = dayjs(startDate)
  const timelineEndDate = dayjs(endDate)
  const timelineInfo: TimelineInfo[] = []
  switch (showKind) {
    case GanttShowKind.DAY:
      while (timelineStartDate.isBefore(timelineEndDate)) {
        timelineInfo.push({
          value: timelineStartDate.date(),
          categoryTitle: `${timelineStartDate.format('YYYY-MM')}`,
          holiday: holidayJs.some(d => d.isSame(timelineStartDate, 'day')),
          today: timelineStartDate.isSame(dayjs(), 'day'),
        })
        timelineStartDate = timelineStartDate.add(1, 'day')
      }
      break
    case GanttShowKind.WEEK:
      while (timelineStartDate.isBefore(timelineEndDate)) {
        timelineInfo.push({
          value: timelineStartDate.week(),
          categoryTitle: `${timelineStartDate.year()}`,
        })
        timelineStartDate = timelineStartDate.add(1, 'week')
      }
      break
    case GanttShowKind.MONTH:
      while (timelineStartDate.isBefore(timelineEndDate)) {
        timelineInfo.push({
          value: timelineStartDate.month() + 1,
          categoryTitle: `${timelineStartDate.year()}`,
        })
        timelineStartDate = timelineStartDate.add(1, 'month')
      }
      break
    case GanttShowKind.YEAR:
      while (timelineStartDate.isBefore(timelineEndDate)) {
        timelineInfo.push({
          value: timelineStartDate.year(),
        })
        timelineStartDate = timelineStartDate.add(1, 'year')
      }
      break
  }
  return timelineInfo
}
