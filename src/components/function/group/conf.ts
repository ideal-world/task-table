import { AggregateKind, TableGroupProps } from "../../props"

export interface GroupConf {
    columnName: string
    desc: boolean
    useDictValue: boolean
    hideEmptyRecord: boolean
    columnAggs: { [key: string]: AggregateKind }[]
}

export function initConf(props?: TableGroupProps): GroupConf | undefined {
    if (props) {
        return {
            columnName: props.columnName,
            desc: props.desc,
            useDictValue: props.useDictValue,
            hideEmptyRecord: props.hideEmptyRecord,
            columnAggs: props.columnAggs,
        }
    } else {
        return undefined
    }
}