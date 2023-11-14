import * as iconSvg from "../../../assets/icon"
import { TableBasicConf, getDefaultIconByDataKind } from "../../conf"
import { DataKind, TableProps } from "../../props"

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
    editable: boolean
    wrap: boolean
}

export interface ListStyleConf {
    headerClass: string
    rowClass: string
    cellClass: string
}

export function initConf(props: TableProps, basicConf: TableBasicConf): ListConf {
    const listBasicConf = {
        fillable: props.edit?.fillable ?? true,
        addable: props.edit?.addable ?? true,
        editable: props.edit?.editable ?? true,
        pkColumnName: basicConf.pkColumnName
    }
    const listColumnsConf = props.columns.map(column => {
        return {
            name: column.name,
            title: column.title ?? column.name,
            icon: column.icon ?? getDefaultIconByDataKind(column.dataKind ?? DataKind.TEXT),
            dataKind: column.dataKind ?? DataKind.TEXT,
            pk: column.pk ?? false,
            width: column.width ?? 200,
            fillable: column.fillable ?? true,
            editable: column.editable ?? true,
            wrap: column.wrap ?? true
        }
    })
    const listStyleConf = {
        headerClass: props.styles?.headerClass ?? '',
        rowClass: props.styles?.rowClass ?? '',
        cellClass: props.styles?.cellClass ?? ''
    }
    return {
        basic: listBasicConf,
        columns: listColumnsConf,
        styles: listStyleConf
    }
}