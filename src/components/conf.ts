import { FilterGroupConf } from "./filter/conf"
import { LayoutKind, TableProps } from "./props"
import { SortConf } from "./sort/conf"
import * as Filter from './filter/conf'
import * as Sort from './sort/conf'
import i18n from '../i18n'
import * as iconSvg from "../assets/icon"

const { t } = i18n.global

export interface TableBasicConf {
    tableId: string
    pkColumnName: string
}

export interface TableStyleConf {
    tableClass: string
}

export interface TableShowConf {
    title: string,
    layoutKind: LayoutKind,
    icon: string,
    dateColumn?: { start: string, end: string }
    fixedColumnIdx: number,
    filters: FilterGroupConf[]
    sorts: SortConf[]
    data: { [key: string]: any }[]
    offsetRowNumber?: number
    fetchRowNumber?: number
}

export function initConf(props: TableProps): [TableBasicConf, { [key: string]: TableShowConf }, TableStyleConf] {
    let shows: { [key: string]: TableShowConf } = {}
    if (props.shows) {
        props.shows.forEach(show => {
            let icon = ''
            switch (show.layoutKind) {
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
            shows[show.id] = {
                title: show.title,
                layoutKind: show.layoutKind,
                icon: icon,
                dateColumn: show.dateColumn,
                fixedColumnIdx: props.columns.findIndex(column => column.name === show.fixedColumn) ?? -1,
                filters: Filter.initConf(props),
                sorts: Sort.initConf(props),
                data: []
            }
        })
    } else {
        shows['default'] = {
            title: t('show.title.default'),
            layoutKind: LayoutKind.LIST,
            icon: iconSvg.TEXT,
            fixedColumnIdx: -1,
            filters: [],
            sorts: [],
            data: []
        }
    }
    return [
        {
            tableId: props.tableId ?? 'iw-table' + Math.floor(Math.random() * 1000000),
            pkColumnName: props.columns.find(column => column.pk)?.name ?? 'id'
        }, shows, {
            tableClass: ''
        }
    ]
}