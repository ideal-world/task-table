import { DataKind, SizeKind, TableFilterGroupProps, TableProps, TableSortProps } from "../props"
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
    fillable: boolean
    addable: boolean
    editable: boolean
    clientOnly: boolean
}

export interface TableColumnConf {
    name: string
    title: string
    icon: string
    dataKind: DataKind
    pk: boolean
    width: number
    fillable: boolean
}


export interface TableEventConf {
    loadData: (filters?: TableFilterGroupProps[][], sorts?: TableSortProps[], offsetRowNumber?: number, fetchRowNumber?: number) => Promise<{ name: string, value: any }[][]>
    saveData: (data: { name: string, value: any }[][]) => Promise<boolean>
    deleteData: (ids: string[]) => Promise<boolean>
    loadCellOptions: (columnName: string, cellValue: any) => Promise<{ title: string, value: any }[]>
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
    const tableBasicConf = {
        fixedColumnIdx: fixedColumnIdx,
        fillable: props.edit?.fillable || true,
        addable: props.edit?.addable || true,
        editable: props.edit?.editable || true,
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
            pk: column.pk || false,
            width: column.width || 200,
            fillable: column.fillable || true
        }
    })
    const tableEventConf = {
        loadData: props.events?.loadData || (() => Promise.resolve([])),
        saveData: props.events?.saveData || (() => Promise.resolve(true)),
        deleteData: props.events?.deleteData || (() => Promise.resolve(true)),
        loadCellOptions: props.events?.loadCellOptions || (() => Promise.resolve([]))
    }

    const tableStyleConf = {
        sizeClass: props.styles?.size || SizeKind.MEDIUM,
        headerClass: props.styles?.headerClass || '',
        rowClass: props.styles?.rowClass || '',
        cellClass: props.styles?.cellClass || ''
    }
    return {
        basic: tableBasicConf,
        columns: tableColumnsConf,
        data: props.data,
        events: tableEventConf,
        styles: tableStyleConf
    }
}