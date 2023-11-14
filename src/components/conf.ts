import * as iconSvg from "../assets/icon"
import locales from '../locales'
import { AggregateKind, DataKind, LayoutKind, SizeKind, TableDataFilterReq, TableDataGroupReq, TableDataGroupResp, TableDataResp, TableDataSliceReq, TableDataSortReq, TableProps } from "./props"

const { t } = locales.global

export interface TableBasicConf {
    tableId: string
    pkColumnName: string
}

export interface TableStyleConf {
    tableClass: string
    size: SizeKind
}

export interface TableLayoutConf {
    id: string
    title: string
    layoutKind: LayoutKind
    icon: string
    sort: number
    dateColumn?: { start: string, end: string }
    fixedColumnIdx: number,
    filters?: TableDataFilterReq[]
    sorts?: TableDataSortReq[]
    group?: TableDataGroupReq
    aggs?: { [key: string]: AggregateKind }
    slice?: TableDataSliceReq
    data?: TableDataResp | TableDataGroupResp[]
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

export function initConf(props: TableProps): [TableBasicConf, { [key: string]: TableLayoutConf }, TableStyleConf] {
    let layouts: { [key: string]: TableLayoutConf } = {}
    let sort = 0
    if (props.layouts) {
        props.layouts.forEach(layout => {
            let icon = ''
            switch (layout.layoutKind) {
                case LayoutKind.CHART:
                    icon = iconSvg.CHART
                    break
                case LayoutKind.CALENDAR:
                    icon = iconSvg.CALENDAR
                    break
                case LayoutKind.BOARD:
                    icon = iconSvg.BOARD
                    break
                case LayoutKind.GANTT:
                    icon = iconSvg.GANTT
                    break
                default:
                    icon = iconSvg.TEXT
            }
            layouts[layout.id] = {
                id: layout.id,
                title: layout.title,
                layoutKind: layout.layoutKind,
                icon: icon,
                sort: sort++,
                dateColumn: layout.dateColumn,
                fixedColumnIdx: props.columns.findIndex(column => column.name === layout.fixedColumn) ?? -1,
                filters: layout.filters,
                sorts: layout.sorts,
                group: layout.group,
                aggs: layout.aggs
            }
        })
    } else {
        layouts['default'] = {
            id: 'default',
            title: t('layout.title.default'),
            layoutKind: LayoutKind.LIST,
            icon: iconSvg.TEXT,
            sort: sort++,
            fixedColumnIdx: -1,
            filters: [],
            sorts: [],
        }
    }
    return [
        {
            tableId: props.tableId ?? 'iw-table' + Math.floor(Math.random() * 1000000),
            pkColumnName: props.columns.find(column => column.pk)?.name ?? 'id'
        }, layouts, {
            tableClass: '',
            size: SizeKind.MEDIUM
        }
    ]
}