import { DataKind } from "../props"

export interface SortableColumnConf {
    name: string
    title: string
    dataKind: DataKind
}

export interface SortConf {
    columnName: string,
    desc: boolean
}