import { AggregateKind, DataKind, translateAggregateKind } from '../../props'

export interface GroupAggItem {
  kind: AggregateKind
  title: string
}

export function showGroupAggMappingByDataKind(dataKind: DataKind): GroupAggItem[] {
  const items = [
    { kind: AggregateKind.COUNT, title: translateAggregateKind(AggregateKind.COUNT) },
    { kind: AggregateKind.DISTINCT, title: translateAggregateKind(AggregateKind.DISTINCT) },
  ]
  switch (dataKind) {
    case DataKind.SERIAL:
    case DataKind.NUMBER:
    case DataKind.AMOUNT:
      items.push(...[
        { kind: AggregateKind.SUM, title: translateAggregateKind(AggregateKind.SUM) },
        { kind: AggregateKind.AVG, title: translateAggregateKind(AggregateKind.AVG) },
        { kind: AggregateKind.MEDIAN, title: translateAggregateKind(AggregateKind.MEDIAN) },
        { kind: AggregateKind.STDDEV, title: translateAggregateKind(AggregateKind.STDDEV) },
        { kind: AggregateKind.MAX, title: translateAggregateKind(AggregateKind.MAX) },
        { kind: AggregateKind.MIN, title: translateAggregateKind(AggregateKind.MIN) },
        { kind: AggregateKind.DISTINCT, title: translateAggregateKind(AggregateKind.DISTINCT) },
      ])
      break
    case DataKind.TEXT:
    case DataKind.TEXTAREA:
      items.push(...[
        { kind: AggregateKind.MAX, title: translateAggregateKind(AggregateKind.MAX) },
        { kind: AggregateKind.MIN, title: translateAggregateKind(AggregateKind.MIN) },
        { kind: AggregateKind.DISTINCT, title: translateAggregateKind(AggregateKind.DISTINCT) },
      ])
      break
    case DataKind.DATE:
    case DataKind.DATETIME:
    case DataKind.TIME:
      items.push(...[
        { kind: AggregateKind.MAX, title: translateAggregateKind(AggregateKind.MAX) },
        { kind: AggregateKind.MIN, title: translateAggregateKind(AggregateKind.MIN) },
        { kind: AggregateKind.DISTINCT, title: translateAggregateKind(AggregateKind.DISTINCT) },
      ])
      break
    default:
      break
  }
  return items
}
