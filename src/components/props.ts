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
    shows?: TableShowProps[]
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
    aggAble?: AggregateKind[]
    width?: number
}

export interface TableShowProps {
    id: string,
    title: string,
    layout: LayoutKind,
    dateColumn?: { start: string, end: string }
    fixedColumn?: string,
    filters?: TableFilterGroupProps[][]
    sorts?: TableSortProps[]
}

export interface TableEditProps {
    fillable: boolean
    addable: boolean
    editable: boolean
}

export interface TableEventProps {
    loadData: (filters: TableFilterGroupProps[], sorts: TableSortProps[], offsetRowNumber?: number, fetchRowNumber?: number) => Promise<{ [key: string]: any }[]>
    saveData?: (data: { [key: string]: any }[]) => Promise<boolean>
    deleteData?: (ids: string[] | number[]) => Promise<boolean>
    loadCellOptions?: (columnName: string, cellValue: any) => Promise<{ title: string, value: any }[]>
}

export interface TableSortProps {
    columnName: string,
    desc: boolean
}

export interface TableFilterGroupProps {
    filters: TableFilterProps[]
    and: boolean
}

export interface TableFilterProps {
    columnName: string
    operator: OperatorKind
    value: any
    value2?: any
}

export interface TableStyleProps {
    size?: SizeKind
    tableClass?: string
    headerClass?: string
    rowClass?: string
    cellClass?: string
    aggClass?: string
}