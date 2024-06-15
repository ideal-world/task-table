import locales from '../../locales'
import { DataKind } from '../../props/enumsProps'

const { t } = locales.global

export enum FeatureAggDataKind {
  SUM = 'SUM',
  COUNT = 'COUNT',
  MIN = 'MIN',
  MAX = 'MAX',
  AVG = 'AVG',
  MEDIAN = 'MEDIAN',
  STDDEV = 'STDDEV',
  DISTINCT = 'DISTINCT',
}

export function translateAggregateKind(aggKind: FeatureAggDataKind): string {
  switch (aggKind) {
    case FeatureAggDataKind.SUM:
      return t('_.agg.sum')
    case FeatureAggDataKind.COUNT: return t('_.agg.count')
    case FeatureAggDataKind.MIN: return t('_.agg.min')
    case FeatureAggDataKind.MAX: return t('_.agg.max')
    case FeatureAggDataKind.AVG: return t('_.agg.avg')
    case FeatureAggDataKind.MEDIAN: return t('_.agg.median')
    case FeatureAggDataKind.STDDEV: return t('_.agg.stddev')
    case FeatureAggDataKind.DISTINCT: return t('_.agg.distinct')
  }
}

export interface FeatureAggDataItem {
  kind: FeatureAggDataKind
  title: string
}

export function showAggMappingByDataKind(dataKind: DataKind): FeatureAggDataItem[] {
  const items = [
    { kind: FeatureAggDataKind.COUNT, title: translateAggregateKind(FeatureAggDataKind.COUNT) },
    { kind: FeatureAggDataKind.DISTINCT, title: translateAggregateKind(FeatureAggDataKind.DISTINCT) },
  ]
  switch (dataKind) {
    case DataKind.SERIAL:
    case DataKind.NUMBER:
    case DataKind.AMOUNT:
      items.push(...[
        { kind: FeatureAggDataKind.SUM, title: translateAggregateKind(FeatureAggDataKind.SUM) },
        { kind: FeatureAggDataKind.AVG, title: translateAggregateKind(FeatureAggDataKind.AVG) },
        { kind: FeatureAggDataKind.MEDIAN, title: translateAggregateKind(FeatureAggDataKind.MEDIAN) },
        { kind: FeatureAggDataKind.STDDEV, title: translateAggregateKind(FeatureAggDataKind.STDDEV) },
        { kind: FeatureAggDataKind.MAX, title: translateAggregateKind(FeatureAggDataKind.MAX) },
        { kind: FeatureAggDataKind.MIN, title: translateAggregateKind(FeatureAggDataKind.MIN) },
        { kind: FeatureAggDataKind.DISTINCT, title: translateAggregateKind(FeatureAggDataKind.DISTINCT) },
      ])
      break
    case DataKind.TEXT:
    case DataKind.TEXTAREA:
      items.push(...[
        { kind: FeatureAggDataKind.MAX, title: translateAggregateKind(FeatureAggDataKind.MAX) },
        { kind: FeatureAggDataKind.MIN, title: translateAggregateKind(FeatureAggDataKind.MIN) },
        { kind: FeatureAggDataKind.DISTINCT, title: translateAggregateKind(FeatureAggDataKind.DISTINCT) },
      ])
      break
    case DataKind.DATE:
    case DataKind.DATETIME:
    case DataKind.TIME:
      items.push(...[
        { kind: FeatureAggDataKind.MAX, title: translateAggregateKind(FeatureAggDataKind.MAX) },
        { kind: FeatureAggDataKind.MIN, title: translateAggregateKind(FeatureAggDataKind.MIN) },
        { kind: FeatureAggDataKind.DISTINCT, title: translateAggregateKind(FeatureAggDataKind.DISTINCT) },
      ])
      break
    default:
      break
  }
  return items
}

export interface FeatureAggDataInitProps {
  aggs: FeatureAggDataItemProps[]
}

export class FeatureAggDataInitPropsBuilder {
  private featureAggDataInitProps: FeatureAggDataInitProps

  static create(): FeatureAggDataInitPropsBuilder {
    return new FeatureAggDataInitPropsBuilder({
      aggs: [],
    })
  }

  private constructor(featureAggDataInitProps: FeatureAggDataInitProps) {
    this.featureAggDataInitProps = featureAggDataInitProps
  }

  aggs(aggs: FeatureAggDataItemProps[]): FeatureAggDataInitPropsBuilder {
    this.featureAggDataInitProps.aggs = aggs
    return this
  }

  build(): FeatureAggDataInitProps {
    return this.featureAggDataInitProps
  }
}

export interface FeatureAggDataModifyProps {
  aggs: FeatureAggDataItemProps[]
}

export interface FeatureAggDataItemProps {
  columnName: string
  aggKind: FeatureAggDataKind
}

export interface FeatureAggDataAggsResp {
  aggs: { [key: string]: any }
}

export interface FeatureAggDataAggsGroupResp extends FeatureAggDataAggsResp {
  groupValue: string
}
