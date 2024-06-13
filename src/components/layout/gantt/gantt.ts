import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { GanttShowKind } from '../../../props'

dayjs.extend(weekOfYear)

export const TIMELINE_COLUMN_WIDTH = 25

export interface GanttInfo {
  timeline: TimelineInfo[]
  ganttShowKind?: GanttShowKind
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

export function getStartAndEndDay(records: { [key: string]: any }[], planStartTimeColumnName?: string, planEndTimeColumnName?: string, realStartTimeColumnName?: string, realEndTimeColumnName?: string): { startDate: Date, endDate: Date } {
  let startDate = new Date('9999-12-31')
  let endDate = new Date('1970-01-01')
  records.forEach((d) => {
    if (planStartTimeColumnName && d[planStartTimeColumnName]) {
      const planDate = d[planStartTimeColumnName] instanceof Date ? d[planStartTimeColumnName] : new Date(d[planStartTimeColumnName])
      if (startDate > planDate) {
        startDate = planDate
      }
    }
    if (planEndTimeColumnName && d[planEndTimeColumnName]) {
      const planDate = d[planEndTimeColumnName] instanceof Date ? d[planEndTimeColumnName] : new Date(d[planEndTimeColumnName])
      if (endDate < planDate) {
        endDate = planDate
      }
    }
    if (realStartTimeColumnName && d[realStartTimeColumnName]) {
      const realDate = d[realStartTimeColumnName] instanceof Date ? d[realStartTimeColumnName] : new Date(d[realStartTimeColumnName])
      if (startDate > realDate) {
        startDate = realDate
      }
      if (endDate < realDate) {
        endDate = realDate
      }
    }
    if (realEndTimeColumnName && d[realEndTimeColumnName]) {
      const realDate = d[realEndTimeColumnName] instanceof Date ? d[realEndTimeColumnName] : new Date(d[realEndTimeColumnName])
      if (endDate < realDate) {
        endDate = realDate
      }
    }
  })
  if (startDate > endDate || startDate === new Date('9999-12-31') || endDate === new Date('1970-01-01')) {
    // Use the previous and next 10 days of the current time
    startDate = dayjs().subtract(10, 'day').toDate()
    endDate = dayjs().add(10, 'day').toDate()
  }
  else {
    startDate = dayjs(startDate).subtract(10, 'day').toDate()
    endDate = dayjs(endDate).add(10, 'day').toDate()
  }
  return { startDate, endDate }
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
