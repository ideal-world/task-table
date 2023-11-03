import { AggregateKind, DataKind } from "../../props"
import locales from '../../../locales'
const { t } = locales.global

export interface GroupAggItem {
    kind: AggregateKind
    title: string
}

export function translateGroupAgg(aggKind: AggregateKind): string {
    switch (aggKind) {
        case AggregateKind.SUM:
            return t('function.group.agg.sum')
        case AggregateKind.COUNT: return t('function.group.agg.count')
        case AggregateKind.MIN: return t('function.group.agg.min')
        case AggregateKind.MAX: return t('function.group.agg.max')
        case AggregateKind.AVG: return t('function.group.agg.avg')
        case AggregateKind.MEDIAN: return t('function.group.agg.median')
        case AggregateKind.STDDEV: return t('function.group.agg.stddev')
        case AggregateKind.DISTINCT: return t('function.group.agg.distinct')
    }
}

export function showGroupAggMappingByDataKind(dataKind: DataKind): GroupAggItem[] {
    let items = [
        { kind: AggregateKind.COUNT, title: translateGroupAgg(AggregateKind.COUNT) },
    ]
    switch (dataKind) {
        case DataKind.NUMBER:
        case DataKind.AMOUNT:
            items.push(...[
                { kind: AggregateKind.MAX, title: translateGroupAgg(AggregateKind.MAX) },
                { kind: AggregateKind.MIN, title: translateGroupAgg(AggregateKind.MIN) },
                { kind: AggregateKind.DISTINCT, title: translateGroupAgg(AggregateKind.DISTINCT) }
            ])
            break
        case DataKind.TEXT:
        case DataKind.TEXTAREA:
            items.push(...[
                { kind: AggregateKind.SUM, title: translateGroupAgg(AggregateKind.SUM) },
                { kind: AggregateKind.AVG, title: translateGroupAgg(AggregateKind.AVG) },
                { kind: AggregateKind.MEDIAN, title: translateGroupAgg(AggregateKind.MEDIAN) },
                { kind: AggregateKind.STDDEV, title: translateGroupAgg(AggregateKind.STDDEV) },
                { kind: AggregateKind.MAX, title: translateGroupAgg(AggregateKind.MAX) },
                { kind: AggregateKind.MIN, title: translateGroupAgg(AggregateKind.MIN) },
                { kind: AggregateKind.DISTINCT, title: translateGroupAgg(AggregateKind.DISTINCT) }
            ])
            break
        case DataKind.DATE:
        case DataKind.DATETIME:
        case DataKind.TIME:
            // TODO
            break
        case DataKind.FILE:
        case DataKind.IMAGE:
            // TODO
            break
    }
    return items


}
