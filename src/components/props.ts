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
    pkColumnName: string
    columns: TableColumnProps[]
    layouts?: TableLayoutProps[]
    events: TableEventProps
    styles?: TableStyleProps
}

export interface TableColumnProps {
    name: string
    icon?: string
    title?: string
    dataKind?: DataKind
    dataEditable?: boolean
}

export interface TableLayoutProps {
    id: string
    title: string
    layoutKind: LayoutKind
    icon?: string
    columns: TableLayoutColumnProps[]
    // And relationship between groups
    filters?: TableDataFilterReq[]
    sorts?: TableDataSortReq[]
    group?: TableDataGroupReq
    aggs?: { [key: string]: AggregateKind }
}

export interface TableLayoutColumnProps {
    name: string
    wrap?: boolean
    fixed?: boolean
    width?: number
    hide?: boolean
    dateStart?: boolean
    dateEnd?: boolean
}

export interface TableStyleProps {
    size?: SizeKind
    theme?: string
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

    newColumn?: (newColumnProps: TableColumnProps, fromColumnName?: string) => Promise<boolean>
    modifyColumn?: (changedColumnProps: TableColumnProps) => Promise<boolean>
    deleteColumn?: (deletedColumnName: string) => Promise<boolean>

    loadCellOptions?: (columnName: string, cellValue: any) => Promise<{ title: string, value: any }[]>

    modifyStyles?: (changedStyleProps: TableStyleProps) => Promise<boolean>

    newLayout?: (newLayoutProps: TableLayoutProps, fromLayoutId?: string) => Promise<boolean>
    modifyLayout?: (changedLayoutProps: TableLayoutModifyReq) => Promise<boolean>
    deleteLayout?: (deletedLayoutId: string) => Promise<boolean>
    sortLayouts?: (leftLayoutId: string, rightLayoutId:string) => Promise<boolean>
}

export interface TableLayoutModifyReq {
    id?: string
    title?: string
    icon?: string
    filters?: TableDataFilterReq[]
    sorts?: TableDataSortReq[]
    group?: TableDataGroupReq
    aggs?: { [key: string]: AggregateKind }
    columnSortedNames?: [string, string]
    newColumn?: TableLayoutColumnProps
    changedColumn?: TableLayoutColumnProps
    deletedColumnName?: string
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

