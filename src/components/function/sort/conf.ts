import { DataKind, TableProps, TableSortProps } from "../../props"

export interface SortableColumnConf {
    name: string
    title: string
    dataKind: DataKind
}

export interface SortConf {
    columnName: string,
    desc: boolean
}

export function initConf(props?: TableSortProps[]): SortConf[] {
    return []
}

export function parseProps(conf: SortConf[]): TableSortProps[] {
    return []
}