import { IwUtils } from '../utils'
import type { CommonColumnProps, DataSliceProps } from './basicProps'
import { CommonColumnPropsBuilder, DataSlicePropsBuilder } from './basicProps'
import type { LayoutKind } from './enumsProps'
import { SubDataShowKind, getDefaultIconByLayoutKind } from './enumsProps'
import { type ColumnFeatureProps, type LayoutFeatureModifyProps, type LayoutFeatureProps, type TableFeatureProps, tableFeaturePropsToLayoutFeatureProps } from './featuresProps'
import type { TableColumnProps } from './tableProps'

export interface LayoutProps {
  id?: string
  title: string
  layoutKind: LayoutKind
  icon: string
  columns: LayoutColumnProps[]
  slice: DataSliceProps
  groupSlices: { [key: string]: DataSliceProps }
  subDataShowKind: SubDataShowKind
  features: LayoutFeatureProps
}

export class LayoutPropsBuilder {
  private layoutKernelProps: LayoutProps
  private pkColumnName: string

  static extend(title: string, layoutKind: LayoutKind, pkColumnName: string, tableColumns: TableColumnProps[], tableSlice: DataSliceProps, tableFeatures: TableFeatureProps): LayoutPropsBuilder {
    return new LayoutPropsBuilder({
      id: `iw-layout-${IwUtils.getRandomString(12)}`,
      title,
      layoutKind,
      icon: getDefaultIconByLayoutKind(layoutKind),
      columns: tableColumns.filter(column => !column.hide).map(column => LayoutColumnPropsBuilder.extend(column).build()),
      slice: tableSlice,
      groupSlices: {},
      subDataShowKind: SubDataShowKind.FOLD_SUB_DATA,
      features: tableFeaturePropsToLayoutFeatureProps(tableFeatures),
    }, pkColumnName)
  }

  static new(title: string, layoutKind: LayoutKind, columns: LayoutColumnProps[], pkColumnName: string): LayoutPropsBuilder {
    return new LayoutPropsBuilder({
      title,
      layoutKind,
      icon: getDefaultIconByLayoutKind(layoutKind),
      columns,
      slice: DataSlicePropsBuilder.create().build(),
      groupSlices: {},
      subDataShowKind: SubDataShowKind.FOLD_SUB_DATA,
      features: {},
    }, pkColumnName)
  }

  private constructor(layoutKernelProps: LayoutProps, pkColumnName: string) {
    this.layoutKernelProps = layoutKernelProps
    this.pkColumnName = pkColumnName
  }

  id(id: string): LayoutPropsBuilder {
    this.layoutKernelProps.id = id
    return this
  }

  icon(icon: string): LayoutPropsBuilder {
    this.layoutKernelProps.icon = icon
    return this
  }

  columns(columns: LayoutColumnProps[]): LayoutPropsBuilder {
    this.layoutKernelProps.columns = columns
    return this
  }

  slice(slice: DataSliceProps): LayoutPropsBuilder {
    this.layoutKernelProps.slice = slice
    return this
  }

  groupSlices(groupSlices: { [key: string]: DataSliceProps }): LayoutPropsBuilder {
    this.layoutKernelProps.groupSlices = groupSlices
    return this
  }

  subDataShowKind(subDataShowKind: SubDataShowKind): LayoutPropsBuilder {
    this.layoutKernelProps.subDataShowKind = subDataShowKind
    return this
  }

  features(features: LayoutFeatureProps): LayoutPropsBuilder {
    this.layoutKernelProps.features = features
    return this
  }

  build(): LayoutProps {
    // Make sure the primary key is in the first column
    const pkIdx = this.layoutKernelProps.columns.findIndex(column => column.name === this.pkColumnName)
    if (pkIdx !== -1) {
      const pkColumn = this.layoutKernelProps.columns[pkIdx]!
      pkColumn.hide = false
      pkColumn.wrap = false
      this.layoutKernelProps.columns.splice(pkIdx, 1)
      this.layoutKernelProps.columns.splice(0, 0, pkColumn)
    }
    return this.layoutKernelProps
  }
}

export interface LayoutColumnProps extends CommonColumnProps {
}

export class LayoutColumnPropsBuilder {
  private layoutColumnProps: LayoutColumnProps

  static extend(tableColumn: TableColumnProps): LayoutColumnPropsBuilder {
    return new LayoutColumnPropsBuilder({
      name: tableColumn.name,
      wrap: tableColumn.wrap,
      fixed: tableColumn.fixed,
      width: tableColumn.width,
      hide: tableColumn.hide,
      styles: tableColumn.styles,
      features: {
        aggData: tableColumn.features.aggData,
        filterData: tableColumn.features.filterData,
        sortData: tableColumn.features.sortData,
        groupData: tableColumn.features.groupData,
        editData: tableColumn.features.editData,
        useDict: tableColumn.features.useDict,
        dictEditable: tableColumn.features.dictEditable,
      },
    })
  }

  static new(name: string): LayoutColumnPropsBuilder {
    return new LayoutColumnPropsBuilder({
      ...CommonColumnPropsBuilder.create(name).build(),
    })
  }

  private constructor(layoutColumnProps: LayoutColumnProps) {
    this.layoutColumnProps = layoutColumnProps
  }

  wrap(wrap: boolean): LayoutColumnPropsBuilder {
    this.layoutColumnProps.wrap = wrap
    return this
  }

  fixed(fixed: boolean): LayoutColumnPropsBuilder {
    this.layoutColumnProps.fixed = fixed
    return this
  }

  width(width: number): LayoutColumnPropsBuilder {
    this.layoutColumnProps.width = width
    return this
  }

  hide(hide: boolean): LayoutColumnPropsBuilder {
    this.layoutColumnProps.hide = hide
    return this
  }

  styles(styles: { [key: string]: string }): LayoutColumnPropsBuilder {
    this.layoutColumnProps.styles = styles
    return this
  }

  categoryTitle(categoryTitle: string): LayoutColumnPropsBuilder {
    this.layoutColumnProps.categoryTitle = categoryTitle
    return this
  }

  render(render: (record: { [key: string]: any }, layoutKind: LayoutKind) => any): LayoutColumnPropsBuilder {
    this.layoutColumnProps.render = render
    return this
  }

  features(features: ColumnFeatureProps): LayoutColumnPropsBuilder {
    this.layoutColumnProps.features = features
    return this
  }

  build(): LayoutColumnProps {
    return this.layoutColumnProps
  }
}

export interface LayoutModifyProps {
  title?: string
  icon?: string
  slice?: DataSliceProps
  groupSlices?: { [key: string]: DataSliceProps }
  subDataShowKind?: SubDataShowKind
  newColumn?: LayoutColumnProps
  changedColumn?: LayoutColumnProps
  deletedColumnName?: string
  features: LayoutFeatureModifyProps
}
