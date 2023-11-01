import { FilterGroupConf } from "./filter/conf"
import { LayoutKind, SizeKind, TableProps } from "./props"
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
    size: SizeKind
}

export interface TableLayoutConf {
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

export function initConf(props: TableProps): [TableBasicConf, { [key: string]: TableLayoutConf }, TableStyleConf] {
    let layouts: { [key: string]: TableLayoutConf } = {}
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
                title: layout.title,
                layoutKind: layout.layoutKind,
                icon: icon,
                dateColumn: layout.dateColumn,
                fixedColumnIdx: props.columns.findIndex(column => column.name === layout.fixedColumn) ?? -1,
                filters: Filter.initConf(props),
                sorts: Sort.initConf(props),
                data: []
            }
        })
    } else {
        layouts['default'] = {
            title: t('layout.title.default'),
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
        }, layouts, {
            tableClass: '',
            size: SizeKind.MEDIUM
        }
    ]
}