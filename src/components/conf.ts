import { FilterGroupConf } from "./filter/conf"
import { LayoutKind, TableProps } from "./props"
import { SortConf } from "./sort/conf"
import * as Filter from './filter/conf'
import * as Sort from './sort/conf'
import i18n from '../i18n'
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
    layout: LayoutKind,
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
            shows[show.id] = {
                title: show.title,
                layout: show.layout,
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
            layout: LayoutKind.LIST,
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