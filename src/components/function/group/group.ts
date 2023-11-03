import { AggregateKind, DataKind } from "../../props"
import locales from '../../../locales'
const { t } = locales.global

export interface GroupAggItem {
    code: string
    title: string
}

export function groupAggMappingByDataKind(dataKind: DataKind): GroupAggItem[] {
    switch (dataKind) {
        case DataKind.NUMBER:
            return [
                { code: AggregateKind.SUM, title: t('function.group.agg.sum') },
            ]
        case DataKind.DATE:
            return [
            ]
        default:
            return []
    }

    // export enum AggregateKind {
    //     SUM = 'SUM',
    //     COUNT = 'COUNT',
    //     MIN = 'MIN',
    //     MAX = 'MAX',
    //     AVG = 'AVG',
    //     MEDIAN = 'MEDIAN',
    //     STDDEV = 'STDDEV',
    //     DISTINCT = 'DISTINCT',
    //     // TODO
    // }

    // export enum DataKind {
    //     TEXT = 'TEXT',
    //     TEXTAREA = 'TEXTAREA',
    //     NUMBER = 'NUMBER',
    //     BOOLEAN = 'BOOLEAN',
    //     FILE = 'FILE',
    //     IMAGE = 'IMAGE',
    //     AMOUNT = 'AMOUNT',
    //     SELECT = 'SELECT',
    //     MULTISELECT = 'MULTISELECT',
    //     CHECKBOX = 'CHECKBOX',
    //     DATE = 'DATE',
    //     DATETIME = 'DATETIME',
    //     TIME = 'TIME',
    //     EMAIL = 'EMAIL',
    //     URL = 'URL',
    //     PHONE = 'PHONE',
    //     PASSWORD = 'PASSWORD',
    // }

}
