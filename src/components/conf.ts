import * as iconSvg from "../assets/icon"
import locales from '../locales'
import { AggregateKind, DataKind, LayoutKind, SizeKind, TableDataFilterReq, TableDataGroupReq, TableDataGroupResp, TableDataResp, TableDataSliceReq, TableDataSortReq, TableProps } from "./props"

const { t } = locales.global

export interface TableBasicConf {
    tableId: string
    pkColumnName: string
    columns: TableColumnConf[]
    styles: TableStyleConf
}

export interface TableColumnConf {
    name: string
    title: string
    icon: string
    dataKind: DataKind
    dataEditable: boolean
}

export interface TableLayoutConf {
    id: string
    title: string
    layoutKind: LayoutKind
    icon: string
    columns: TableLayoutColumnConf[]
    filters?: TableDataFilterReq[]
    sorts?: TableDataSortReq[]
    group?: TableDataGroupReq
    aggs?: { [key: string]: AggregateKind }
    slice?: TableDataSliceReq
    data?: TableDataResp | TableDataGroupResp[]
}

export interface TableLayoutColumnConf {
    name: string
    wrap: boolean
    fixed: boolean
    width: number
    hide: boolean
    dateStart: boolean
    dateEnd: boolean
}

export interface CachedColumnConf extends TableColumnConf, TableLayoutColumnConf {
    name: string
}


export interface TableStyleConf {
    size: SizeKind
    theme: string
    tableClass: string
    headerClass: string
    rowClass: string
    cellClass: string
    aggClass: string
}

export function getDefaultValueByDataKind(dataKind: DataKind): any {
    switch (dataKind) {
        case DataKind.NUMBER:
        case DataKind.AMOUNT:
            return 0
        case DataKind.BOOLEAN:
            return false
        case DataKind.SELECT:
        case DataKind.MULTISELECT:
        case DataKind.CHECKBOX:
        case DataKind.DATE:
        case DataKind.DATETIME:
        case DataKind.TIME:
            return null
        default:
            return ''
    }
}

export function getDefaultIconByDataKind(dataKind: DataKind): string {
    switch (dataKind) {
        case DataKind.TEXT:
            return iconSvg.TEXT
        case DataKind.TEXTAREA:
            return iconSvg.TEXTAREA
        case DataKind.NUMBER:
            return iconSvg.NUMBER
        case DataKind.BOOLEAN:
            return iconSvg.BOOLEAN
        case DataKind.FILE:
            return iconSvg.FILE
        case DataKind.IMAGE:
            return iconSvg.IMAGE
        case DataKind.AMOUNT:
            return iconSvg.AMOUNT
        case DataKind.SELECT:
            return iconSvg.SELECT
        case DataKind.MULTISELECT:
            return iconSvg.MULTISELECT
        case DataKind.CHECKBOX:
            return iconSvg.CHECKBOX
        case DataKind.DATE:
            return iconSvg.DATE
        case DataKind.DATETIME:
            return iconSvg.DATETIME
        case DataKind.TIME:
            return iconSvg.TIME
        case DataKind.EMAIL:
            return iconSvg.EMAIL
        case DataKind.URL:
            return iconSvg.URL
        case DataKind.PHONE:
            return iconSvg.PHONE
        case DataKind.PASSWORD:
            return iconSvg.PASSWORD
        default:
            return iconSvg.TEXT
    }
}


export function getDefaultIconByLayoutKind(layoutKind: LayoutKind): string {
    switch (layoutKind) {
        case LayoutKind.CHART:
            return iconSvg.CHART
        case LayoutKind.CALENDAR:
            return iconSvg.CALENDAR
        case LayoutKind.BOARD:
            return iconSvg.BOARD
        case LayoutKind.GANTT:
            return iconSvg.GANTT
        default:
            return iconSvg.TEXT
    }
}

export function initConf(props: TableProps): [TableBasicConf, TableLayoutConf[]] {
    const basicConf = {
        tableId: props.tableId ?? 'iw-table' + Math.floor(Math.random() * 1000000),
        pkColumnName: props.pkColumnName,
        columns: props.columns.map(column => {
            return {
                name: column.name,
                title: column.title ?? column.name,
                dataKind: column.dataKind ?? DataKind.TEXT,
                icon: column.icon ?? getDefaultIconByDataKind(column.dataKind ?? DataKind.TEXT),
                dataEditable: column.dataEditable ?? true,
            }
        }),
        styles: {
            tableClass: props.styles?.tableClass ?? '',
            headerClass: props.styles?.headerClass ?? '',
            rowClass: props.styles?.rowClass ?? '',
            cellClass: props.styles?.cellClass ?? '',
            aggClass: props.styles?.aggClass ?? '',
            size: props.styles?.size ?? SizeKind.MEDIUM,
            theme: ''
        }
    }
    const layoutsConf: TableLayoutConf[] = []
    if (props.layouts) {
        props.layouts.forEach(layout => {
            layoutsConf.push({
                id: layout.id,
                title: layout.title,
                layoutKind: layout.layoutKind,
                icon: layout.icon ?? getDefaultIconByLayoutKind(layout.layoutKind),
                columns: layout.columns.map(column => {
                    return {
                        name: column.name,
                        wrap: column.wrap ?? true,
                        fixed: column.fixed ?? false,
                        width: column.width ?? 200,
                        hide: column.hide ?? false,
                        dateStart: column.dateStart ?? false,
                        dateEnd: column.dateEnd ?? false,
                    }
                }),
                filters: layout.filters,
                sorts: layout.sorts,
                group: layout.group,
                aggs: layout.aggs
            })
        })
    } else {
        layoutsConf.push({
            id: 'default',
            title: t('layout.title.default'),
            layoutKind: LayoutKind.LIST,
            icon: iconSvg.TEXT,
            columns: props.columns.map(column => {
                return {
                    name: column.name,
                    wrap: true,
                    fixed: false,
                    width: 200,
                    hide: false,
                    dateStart: false,
                    dateEnd: false,
                }
            }),
            filters: [],
            sorts: [],
        })
    }
    return [basicConf, layoutsConf]
}