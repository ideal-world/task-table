export enum DataKind {
    TEXT = 'TEXT',
    TEXTAREA = 'TEXTAREA',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN',
    FILE = 'FILE',
    IMAGE = 'IMAGE',
    AMOUNT = 'AMOUNT',
    SELECT = 'SELECT',
    MULTISELECT = 'MULTISELECT',
    CHECKBOX = 'CHECKBOX',
    DATE = 'DATE',
    DATETIME = 'DATETIME',
    TIME = 'TIME',
    EMAIL = 'EMAIL',
    URL = 'URL',
    PHONE = 'PHONE',
    PASSWORD = 'PASSWORD',
}

export enum OperatorKind {
    EQ = 'EQ',
    NEQ = 'NEQ',
    LT = 'LT',
    LTE = 'LTE',
    GT = 'GT',
    GTE = 'GTE',
    IN = 'IN',
    NIN = 'NIN',
    CONTAINS = 'CONTAINS',
    NCONTAINS = 'NCONTAINS',
    STARTSWITH = 'STARTSWITH',
    NSTARTSWITH = 'NSTARTSWITH',
    ENDSWITH = 'ENDSWITH',
    NENDSWITH = 'NENDSWITH',
    BETWEEN = 'BETWEEN',
    NBETWEEN = 'NBETWEEN',
    ISEMPTY = 'ISEMPTY',
    NOTEMPTY = 'NOTEMPTY',
}

export enum AggregateKind {
    SUM = 'SUM',
    COUNT = 'COUNT',
    MIN = 'MIN',
    MAX = 'MAX',
    AVG = 'AVG',
    MEDIAN = 'MEDIAN',
    STDDEV = 'STDDEV',
    DISTINCT = 'DISTINCT',
    // TODO
}

export enum SizeKind {
    MINI = 'mini',
    SMALL = 'small',
    MEDIUM = 'medium',
    LARGE = 'large',
}

export enum LayoutKind {
    LIST = 'LIST',
    GANTT = 'GANTT',
    CALENDAR = 'CALENDAR',
    BOARD = 'BOARD',
    CHART = 'CHART',
}

export interface TableProps {
    tableId?: string
    columns: TableColumnProps[]
    layouts?: TableLayoutProps[]
    edit?: TableEditProps
    events: TableEventProps
    styles?: TableStyleProps
}

export interface TableColumnProps {
    name: string
    title?: string
    dataKind?: DataKind
    pk?: boolean
    sortable?: boolean
    filterable?: boolean
    editable?: boolean
    fillable?: boolean
    wrap?: boolean
    width?: number
}

export interface TableLayoutProps {
    id: string,
    title: string,
    default: boolean,
    layoutKind: LayoutKind,
    dateColumn?: { start: string, end: string }
    fixedColumn?: string,
    // And relationship between groups
    filters?: TableDataFilterReq[]
    sorts?: TableDataSortReq[]
    group?: TableDataGroupReq
    aggs?: { [key: string]: AggregateKind }
}

export interface TableEditProps {
    fillable: boolean
    addable: boolean
    editable: boolean
}

export interface TableStyleProps {
    size?: SizeKind
    tableClass?: string
    headerClass?: string
    rowClass?: string
    cellClass?: string
    aggClass?: string
}

export interface TableEventProps {
    loadData: (filters?: TableDataFilterReq[],
        sorts?: TableDataSortReq[],
        group?: TableDataGroupReq,
        aggs?: { [key: string]: AggregateKind },
        slice?: TableDataSliceReq) => Promise<TableDataResp | TableDataGroupResp[]>
    saveData?: (changedRecords: { [key: string]: any }[]) => Promise<boolean>
    deleteData?: (deletedPks: any[]) => Promise<boolean>
    loadCellOptions?: (columnName: string, cellValue: any) => Promise<{ title: string, value: any }[]>
}

export interface TableDataSortReq {
    columnName: string
    orderDesc: boolean
}

export interface TableDataFilterReq {
    items: TableDataFilterItemReq[]
    and: boolean
}

export interface TableDataFilterItemReq {
    columnName: string
    operator: OperatorKind
    value: any
    value2?: any
}

export interface TableDataGroupReq {
    columnName: string
    groupOrderDesc: boolean
    useDictValue: boolean
    hideEmptyRecord: boolean
}

export interface TableDataSliceReq {
    offsetNumber: number
    fetchNumber: number
}

export interface TableDataResp {
    records: { [key: string]: any }[]
    aggs: { [key: string]: any }
    totalNumber: number
}

export interface TableDataGroupResp extends TableDataResp {
    groupValue: string
    offsetNumber: number
    fetchNumber: number
}

