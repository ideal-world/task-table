import { DataKind } from "../../props"

export interface FormConf {
    fillable: boolean
    addable: boolean
    editable: boolean
}

export interface FormColumnConf {
    name: string
    title: string
    dataKind: DataKind
    unique: boolean
    editable: boolean
}

export interface FormEventConf {
    saveData: (data: { name: string, value: any }[][]) => Promise<boolean>
    deleteData: (ids: string[]) => Promise<boolean>
    loadCellOptions: (columnName: string, cellValue: any) => Promise<{ title: string, value: any }[]>
}