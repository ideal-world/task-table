import * as iconSvg from "../assets/icon"
import locales from '../locales'
import { AggregateKind, LayoutKind, SizeKind, TableDataFilterReq, TableDataGroupReq, TableDataGroupResp, TableDataResp, TableDataSliceReq, TableDataSortReq, TableProps } from "./props"

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