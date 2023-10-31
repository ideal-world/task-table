import { Filter } from "element-plus"
import { DataKind, OperatorKind, TableFilterGroupProps, TableProps } from "../props"

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

export function initConf(props: TableProps): FilterGroupConf[] {
    return []
}

export function parseProps(conf: FilterGroupConf[]): TableFilterGroupProps[] {
    return []
}