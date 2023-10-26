import { TableProps } from "./props"

export interface BasicConf {
    tableId: string
}

export interface BasicStyleConf {
    tableClass: string
}

export function initConf(props: TableProps): [BasicConf, BasicStyleConf] {
    return [
        {
            tableId: props.tableId || 'iw-table' + Math.floor(Math.random() * 1000000)
        }, {
            tableClass: ''
        }
    ]
}