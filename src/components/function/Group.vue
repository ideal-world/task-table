<script setup lang="ts">
</script>

<script lang="ts">
import { AggregateKind, DataKind, translateGroupAgg } from "../props"

export interface GroupAggItem {
    kind: AggregateKind
    title: string
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
</script>

<template></template>
