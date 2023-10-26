import { AggregateKind, DataKind } from "../props"

export interface GroupAbleColumnConf {
    name: string
    title: string
    dataKind: DataKind
    aggAble: AggregateKind[]
}

export interface GroupStyleConf {
    aggClass: string
}