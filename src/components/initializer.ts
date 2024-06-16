import type { Ref } from 'vue'
import { reactive, ref } from 'vue'
import type { CommonFeatureProps, LayoutColumnProps, LayoutProps, TableColumnProps, TableProps, TableStyleProps } from '../props'
import type { DataGroupResp, DataResp } from '../props/basicProps'
import type { QuickSearchProps } from '../props/functionProps'
import { deepToRaw } from '../utils/vueHelper'
import * as eb from './eventbus'

export interface TableConf extends CommonFeatureProps {
  id: string
  pkColumnName: string
  parentPkColumnName?: string
  columns: TableColumnProps[]
  styles: TableStyleProps
  quickSearch?: QuickSearchProps
}

export interface LayoutConf extends LayoutProps {
  data?: DataResp | DataGroupResp[]
  selectedDataPks?: any[]
}

export interface CachedColumnConf extends TableColumnProps, LayoutColumnProps {
}

/**
 * Initialize the configuration of the table
 * @param props Original parameters
 * @returns Processed parameters
 */
export function init(props: TableProps): {
  tableConf: TableConf
  layoutsConf: LayoutConf[]
  currentLayoutId: Ref<string>
} {
  // Blocking external references
  const rawProps = deepToRaw(props)
  // Create a new reactive object
  const tableConf = reactive({
    id: rawProps.id,
    pkColumnName: rawProps.pkColumnName,
    parentPkColumnName: rawProps.parentPkColumnName,
    columns: rawProps.columns,
    styles: rawProps.styles,
    quickSearch: rawProps.quickSearch,

    slice: rawProps.slice,
    showSelectColumn: rawProps.showSelectColumn,
    subDataShowKind: rawProps.subDataShowKind,

    actionColumn: rawProps.actionColumn,
    gantt: rawProps.gantt,

    filter: rawProps.filter,
    group: rawProps.group,
    sort: rawProps.sort,
    agg: rawProps.agg,
    edit: rawProps.edit,
  })
  const layoutsConf = reactive(rawProps.layouts)
  const currentLayoutId = ref(layoutsConf[0].id!)
  // Initialize events
  eb.init(tableConf, layoutsConf, currentLayoutId, props.events)
  return {
    tableConf,
    layoutsConf,
    currentLayoutId,
  }
}
