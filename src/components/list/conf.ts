import { DataKind, SizeKind, TableProps } from "../props"
import * as iconSvg from "../../assets/icon"
import { TableBasicConf, TableShowConf } from "../conf"

export interface ListConf {
    basic: ListBasicConf
    columns: ListColumnConf[]
    styles: ListStyleConf
}
export interface ListBasicConf {
    fillable: boolean
    addable: boolean
    editable: boolean
    pkColumnName: string
}

export interface ListColumnConf {
    name: string
    title: string
    icon: string
    dataKind: DataKind
    width: number
    fillable: boolean
}

export interface ListStyleConf {
    sizeClass: SizeKind
    headerClass: string
    rowClass: string
    cellClass: string
}

export function initConf(props: TableProps, basicConf: TableBasicConf): ListConf {
    const tableBasicConf = {
        fillable: props.edit?.fillable ?? true,
        addable: props.edit?.addable ?? true,
        editable: props.edit?.editable ?? true,
        pkColumnName: basicConf.pkColumnName
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
            title: column.title ?? column.name,
            icon: icon,
            dataKind: column.dataKind ?? DataKind.TEXT,
            pk: column.pk ?? false,
            width: column.width ?? 200,
            fillable: column.fillable ?? true
        }
    })
    const tableStyleConf = {
        sizeClass: props.styles?.size ?? SizeKind.MEDIUM,
        headerClass: props.styles?.headerClass ?? '',
        rowClass: props.styles?.rowClass ?? '',
        cellClass: props.styles?.cellClass ?? ''
    }
    return {
        basic: tableBasicConf,
        columns: tableColumnsConf,
        styles: tableStyleConf
    }
}