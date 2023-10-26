import { DataKind, OperatorKind } from "../props"

export interface FilterableColumnConf {
    name: string
    title: string
    dataKind: DataKind
}

export interface FilterGroupConf {
    filters: FilterConf[]
    and: boolean
}

export interface FilterConf {
    columnName: string
    operator: OperatorKind
    value: any
    value2?: any
}