import type { Ref } from 'vue'
import { reactive, ref } from 'vue'
import type { FeatureGroupDataResp } from '../features/groupData/groupDataProps'
import type { DataResp, DataSliceProps } from '../props/basicProps'
import type { TableFeatureProps } from '../props/featuresProps'
import type { LayoutColumnProps, LayoutProps } from '../props/layoutProps'
import type { TableColumnProps, TableProps, TableStyleProps } from '../props/tableProps'
import { deepToRaw } from '../utils/vueHelper'
import * as eb from './eventbus'

export interface TableConf {
  id: string
  pkColumnName: string
  parentPkColumnName?: string
  columns: TableColumnProps[]
  styles: TableStyleProps
  slice: DataSliceProps
  features: TableFeatureProps
}

export interface LayoutConf extends LayoutProps {
  data?: DataResp | FeatureGroupDataResp[]
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
    slice: rawProps.slice,
    features: rawProps.features,
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
