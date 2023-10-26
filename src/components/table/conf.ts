import { DataKind, SizeKind, TableProps } from "../props"
import { FilterGroupConf } from "../filter/conf"
import { SortConf } from "../sort/conf"
import * as iconSvg from "../../assets/icon"

export interface TableConf {
    basic: TableBasicConf
    columns: TableColumnConf[]
    data: any[]
    events: TableEventConf
    styles: TableStyleConf
}

export interface TableBasicConf {
    fixedColumnIdx: number,
    clientOnly: boolean
}

export interface TableColumnConf {
    name: string
    title: string
    icon: string
    dataKind: DataKind
    unique: boolean
    width: number
}


export interface TableEventConf {
    loadData: (filters?: FilterGroupConf[][], sorts?: SortConf[], offsetRowNumber?: number, fetchRowNumber?: number) => Promise<{ name: string, value: any }[][]>
}

export interface TableStyleConf {
    sizeClass: SizeKind
    headerClass: string
    rowClass: string
    cellClass: string
}

export function initConf(props: TableProps): TableConf {
    let fixedColumnIdx = -1
    if (props.show?.fixedColumn) {
        fixedColumnIdx = props.columns.findIndex(column => column.name === props.show?.fixedColumn)
    }
    const tableConf = {
        fixedColumnIdx: fixedColumnIdx,
        clientOnly: props.show?.clientOnly || true
    }
    const tableColumnsConf = props.columns.map(column => {
        let icon = ''
        switch (column.dataKind) {
            case DataKind.TEXT:
                icon = iconSvg.TEXT
                break
            case DataKind.TEXTAREA:
                icon = iconSvg.TEXTAREA
                break
            case DataKind.NUMBER:
                icon = iconSvg.NUMBER
                break
            case DataKind.BOOLEAN:
                icon = iconSvg.BOOLEAN
                break
            case DataKind.FILE:
                icon = iconSvg.FILE
                break
            case DataKind.IMAGE:
                icon = iconSvg.IMAGE
                break
            case DataKind.AMOUNT:
                icon = iconSvg.AMOUNT
                break
            case DataKind.SELECT:
                icon = iconSvg.SELECT
                break
            case DataKind.MULTISELECT:
                icon = iconSvg.MULTISELECT
                break
            case DataKind.CHECKBOX:
                icon = iconSvg.CHECKBOX
                break
            case DataKind.DATE:
                icon = iconSvg.DATE
                break
            case DataKind.DATETIME:
                icon = iconSvg.DATETIME
                break
            case DataKind.TIME:
                icon = iconSvg.TIME
                break
            case DataKind.EMAIL:
                icon = iconSvg.EMAIL
                break
            case DataKind.URL:
                icon = iconSvg.URL
                break
            case DataKind.PHONE:
                icon = iconSvg.PHONE
                break
            case DataKind.PASSWORD:
                icon = iconSvg.PASSWORD
                break
            default:
                icon = iconSvg.TEXT
        }
        return {
            name: column.name,
            title: column.title || column.name,
            icon: icon,
            dataKind: column.dataKind || DataKind.TEXT,
            unique: column.unique || false,
            width: column.width || 200
        }
    })
    const tableEventConf = {
        loadData: props.events?.loadData || (() => Promise.resolve([]))
    }
    const tableStyleConf = {
        sizeClass: props.styles?.size || SizeKind.MEDIUM,
        headerClass: props.styles?.headerClass || '',
        rowClass: props.styles?.rowClass || '',
        cellClass: props.styles?.cellClass || ''
    }
    return {
        basic: tableConf,
        columns: tableColumnsConf,
        data: props.data,
        events: tableEventConf,
        styles: tableStyleConf
    }
}