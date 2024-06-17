import type { Ref } from 'vue'
import { reactive, ref } from 'vue'
import { type CommonFunctionProps, type LayoutColumnProps, type LayoutProps, type SimpleTableProps, type TableColumnProps, type TableStyleProps, generateTableProps } from '../props'

import type { DataGroupResp, DataResp } from '../props/basicProps'
import type { QuickSearchProps } from '../props/functionProps'
import { deepToRaw } from '../utils/vueHelper'
import * as eb from './eventbus'

export interface TableConf extends CommonFunctionProps {
  id: string
  pkColumnName: string
  parentPkColumnName?: string
  columns: TableColumnProps[]
  styles: TableStyleProps
  quickSearch?: QuickSearchProps
}

export interface LayoutConf extends LayoutProps {
  data?: DataResp | DataGroupResp[]
  selectedDataPks: any[]
}

export interface ColumnConf extends TableColumnProps, LayoutColumnProps {
}

/**
 * Initialize the configuration of the table
 * @param props Original parameters
 * @returns Processed parameters
 */
export function init(props: SimpleTableProps): {
  tableConf: TableConf
  layoutsConf: LayoutConf[]
  currentLayoutId: Ref<string>
} {
  // Blocking external references
  const rawProps = deepToRaw(props)
  // Generate table configuration
  const tableProps = generateTableProps(rawProps)
  // Create a new reactive object
  const tableConf = reactive({
    id: tableProps.id,
    pkColumnName: tableProps.pkColumnName,
    parentPkColumnName: tableProps.parentPkColumnName,
    columns: tableProps.columns,
    styles: tableProps.styles,
    quickSearch: tableProps.quickSearch,

    slice: tableProps.slice,
    showSelectColumn: tableProps.showSelectColumn,
    subDataShowKind: tableProps.subDataShowKind,

    actionColumn: tableProps.actionColumn,
    gantt: tableProps.gantt,

    filter: tableProps.filter,
    group: tableProps.group,
    sort: tableProps.sort,
    agg: tableProps.agg,
    edit: tableProps.edit,
  })
  const layoutsConf = reactive(tableProps.layouts.map((layout) => {
    return {
      ...layout,
      selectedDataPks: [],
    }
  }))
  const currentLayoutId = ref(layoutsConf[0].id)
  // Initialize events
  eb.init(tableConf, layoutsConf, currentLayoutId, props.events)
  return {
    tableConf,
    layoutsConf,
    currentLayoutId,
  }
}
