import type { Dayjs } from 'dayjs'
import type { GanttShowKind } from '../../../props'

export interface GanttInfo {
  startTime: Dayjs
  endTime: Dayjs
  holidays: Dayjs[]
  ganttShowKind?: GanttShowKind
}
