import locales from '../locales'
const { t } = locales.global

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

export function translateDataKind(dataKind: DataKind): string {
    switch (dataKind) {
        case DataKind.TEXT:return t('_.datakind.text')
        case DataKind.TEXTAREA:return t('_.datakind.textarea')
        case DataKind.NUMBER:return t('_.datakind.number')
        case DataKind.BOOLEAN:return t('_.datakind.boolean')
        case DataKind.FILE:return t('_.datakind.file')
        case DataKind.IMAGE:return t('_.datakind.image')
        case DataKind.AMOUNT:return t('_.datakind.amount')
        case DataKind.SELECT:return t('_.datakind.select')
        case DataKind.MULTISELECT:return t('_.datakind.multiselect')
        case DataKind.CHECKBOX:return t('_.datakind.checkbox')
        case DataKind.DATE:return t('_.datakind.date')
        case DataKind.DATETIME:return t('_.datakind.datetime')
        case DataKind.TIME:return t('_.datakind.time')
        case DataKind.EMAIL:return t('_.datakind.email')
        case DataKind.URL:return t('_.datakind.url')
        case DataKind.PHONE:return t('_.datakind.phone')
        case DataKind.PASSWORD:return t('_.datakind.password')
    }
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

export function translateGroupAgg(aggKind: AggregateKind): string {
    switch (aggKind) {
        case AggregateKind.SUM:
            return t('_.agg.sum')
        case AggregateKind.COUNT: return t('_.agg.count')
        case AggregateKind.MIN: return t('_.agg.min')
        case AggregateKind.MAX: return t('_.agg.max')
        case AggregateKind.AVG: return t('_.agg.avg')
        case AggregateKind.MEDIAN: return t('_.agg.median')
        case AggregateKind.STDDEV: return t('_.agg.stddev')
        case AggregateKind.DISTINCT: return t('_.agg.distinct')
    }
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

