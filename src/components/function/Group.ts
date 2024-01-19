import { AggregateKind, DataKind, translateGroupAgg } from '../props'

export interface GroupAggItem {
  kind: AggregateKind
  title: string
}

export function showGroupAggMappingByDataKind(dataKind: DataKind): GroupAggItem[] {
  const items = [
    { kind: AggregateKind.COUNT, title: translateGroupAgg(AggregateKind.COUNT) },
    { kind: AggregateKind.DISTINCT, title: translateGroupAgg(AggregateKind.DISTINCT) },
  ]
  switch (dataKind) {
    case DataKind.NUMBER:
    case DataKind.AMOUNT:
      items.push(...[
        { kind: AggregateKind.SUM, title: translateGroupAgg(AggregateKind.SUM) },
        { kind: AggregateKind.AVG, title: translateGroupAgg(AggregateKind.AVG) },
        { kind: AggregateKind.MEDIAN, title: translateGroupAgg(AggregateKind.MEDIAN) },
        { kind: AggregateKind.STDDEV, title: translateGroupAgg(AggregateKind.STDDEV) },
        { kind: AggregateKind.MAX, title: translateGroupAgg(AggregateKind.MAX) },
        { kind: AggregateKind.MIN, title: translateGroupAgg(AggregateKind.MIN) },
        { kind: AggregateKind.DISTINCT, title: translateGroupAgg(AggregateKind.DISTINCT) },
      ])
      break
    case DataKind.TEXT:
    case DataKind.TEXTAREA:
      items.push(...[
        { kind: AggregateKind.MAX, title: translateGroupAgg(AggregateKind.MAX) },
        { kind: AggregateKind.MIN, title: translateGroupAgg(AggregateKind.MIN) },
        { kind: AggregateKind.DISTINCT, title: translateGroupAgg(AggregateKind.DISTINCT) },
      ])
      break
    case DataKind.DATE:
    case DataKind.DATETIME:
    case DataKind.TIME:
      items.push(...[
        { kind: AggregateKind.MAX, title: translateGroupAgg(AggregateKind.MAX) },
        { kind: AggregateKind.MIN, title: translateGroupAgg(AggregateKind.MIN) },
        { kind: AggregateKind.DISTINCT, title: translateGroupAgg(AggregateKind.DISTINCT) },
      ])
      break
    default:
      break
  }
  return items
}
