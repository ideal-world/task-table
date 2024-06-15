import locales from '../../locales'

const { t } = locales.global

export enum FeatureGanttLayoutShowKind {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export function translateGanttShowKind(ganttShowKind: FeatureGanttLayoutShowKind): string {
  switch (ganttShowKind) {
    case FeatureGanttLayoutShowKind.DAY:
      return t('gantt.kind.DAY')
    case FeatureGanttLayoutShowKind.WEEK:
      return t('gantt.kind.WEEK')
    case FeatureGanttLayoutShowKind.MONTH:
      return t('gantt.kind.MONTH')
    case FeatureGanttLayoutShowKind.YEAR:
      return t('gantt.kind.YEAR')
  }
}

export interface FeatureGanttLayoutInitProps {
  showKind: FeatureGanttLayoutShowKind
  timelineWidth: number
  planStartTimeColumnName: string
  planEndTimeColumnName: string
  actualStartTimeColumnName: string
  actualEndTimeColumnName: string
}

export class FeatureGanttLayoutInitPropsBuilder {
  private featureGanttLayoutInitProps: FeatureGanttLayoutInitProps

  static create(planStartTimeColumnName: string, planEndTimeColumnName: string): FeatureGanttLayoutInitPropsBuilder {
    return new FeatureGanttLayoutInitPropsBuilder({
      showKind: FeatureGanttLayoutShowKind.DAY,
      timelineWidth: 400,
      planStartTimeColumnName,
      planEndTimeColumnName,
      actualStartTimeColumnName: 'actual_start_time',
      actualEndTimeColumnName: 'actual_end_time',
    })
  }

  private constructor(featureGanttLayoutInitProps: FeatureGanttLayoutInitProps) {
    this.featureGanttLayoutInitProps = featureGanttLayoutInitProps
  }

  showKind(showKind: FeatureGanttLayoutShowKind): FeatureGanttLayoutInitPropsBuilder {
    this.featureGanttLayoutInitProps.showKind = showKind
    return this
  }

  timelineWidth(timelineWidth: number): FeatureGanttLayoutInitPropsBuilder {
    this.featureGanttLayoutInitProps.timelineWidth = timelineWidth
    return this
  }

  actualStartTimeColumnName(actualStartTimeColumnName: string): FeatureGanttLayoutInitPropsBuilder {
    this.featureGanttLayoutInitProps.actualStartTimeColumnName = actualStartTimeColumnName
    return this
  }

  actualEndTimeColumnName(actualEndTimeColumnName: string): FeatureGanttLayoutInitPropsBuilder {
    this.featureGanttLayoutInitProps.actualEndTimeColumnName = actualEndTimeColumnName
    return this
  }

  build(): FeatureGanttLayoutInitProps {
    return this.featureGanttLayoutInitProps
  }
}

export interface FeatureGanttLayoutModifyProps {
  showKind?: FeatureGanttLayoutShowKind
  timelineWidth?: number
}
