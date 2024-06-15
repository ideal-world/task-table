import { IwUtils } from '../utils'
import type { CommonColumnProps, DataSliceProps } from './basicProps'
import { CommonColumnPropsBuilder, DataSlicePropsBuilder } from './basicProps'

import type { LayoutKind } from './enumsProps'
import { DataKind, SizeKind, getDefaultIconByDataKind } from './enumsProps'

import type { TableEventProps } from './eventsProps'

import type { ColumnFeatureProps, TableFeatureProps } from './featuresProps'
import type { LayoutProps } from './layoutProps'

export interface TableProps {
  id: string
  pkColumnName: string
  parentPkColumnName?: string
  columns: TableColumnProps[]
  layouts: LayoutProps[]
  events: TableEventProps
  styles: TableStyleProps
  slice: DataSliceProps
  features: TableFeatureProps
}

export class TablePropsBuilder {
  private tableProps: TableProps

  static create(pkColumnName: string, columns: TableColumnProps[], layouts: LayoutProps[], events: TableEventProps): TablePropsBuilder {
    return new TablePropsBuilder({
      id: `iw-table-${IwUtils.getRandomString(12)}`,
      pkColumnName,
      columns,
      layouts,
      events,
      styles: TableStylePropsBuilder.create().build(),
      slice: DataSlicePropsBuilder.create().build(),
      features: {},
    })
  }

  private constructor(tableProps: TableProps) {
    this.tableProps = tableProps
  }

  id(id: string): TablePropsBuilder {
    this.tableProps.id = id
    return this
  }

  parentPkColumnName(parentPkColumnName: string): TablePropsBuilder {
    this.tableProps.parentPkColumnName = parentPkColumnName
    return this
  }

  styles(styles: TableStyleProps): TablePropsBuilder {
    this.tableProps.styles = styles
    return this
  }

  slice(slice: DataSliceProps): TablePropsBuilder {
    this.tableProps.slice = slice
    return this
  }

  features(features: TableFeatureProps): TablePropsBuilder {
    this.tableProps.features = features
    return this
  }

  build(): TableProps {
    return this.tableProps
  }
}

export interface TableColumnProps extends CommonColumnProps {
  title: string
  icon: string
  dataKind: DataKind
  multiValue: boolean
  kindDateTimeFormat: string
}

export class TableColumnPropsBuilder {
  private tableColumnProps: TableColumnProps

  static create(name: string): TableColumnPropsBuilder {
    return new TableColumnPropsBuilder({
      title: name,
      icon: getDefaultIconByDataKind(DataKind.TEXT),
      dataKind: DataKind.TEXT,
      multiValue: false,
      kindDateTimeFormat: '',
      ...CommonColumnPropsBuilder.create(name).build(),
    })
  }

  private constructor(tableColumnProps: TableColumnProps) {
    this.tableColumnProps = tableColumnProps
  }

  title(title: string): TableColumnPropsBuilder {
    this.tableColumnProps.title = title
    return this
  }

  icon(icon: string): TableColumnPropsBuilder {
    this.tableColumnProps.icon = icon
    return this
  }

  dataKind(dataKind: DataKind): TableColumnPropsBuilder {
    this.tableColumnProps.dataKind = dataKind
    return this
  }

  wrap(wrap: boolean): TableColumnPropsBuilder {
    this.tableColumnProps.wrap = wrap
    return this
  }

  fixed(fixed: boolean): TableColumnPropsBuilder {
    this.tableColumnProps.fixed = fixed
    return this
  }

  width(width: number): TableColumnPropsBuilder {
    this.tableColumnProps.width = width
    return this
  }

  hide(hide: boolean): TableColumnPropsBuilder {
    this.tableColumnProps.hide = hide
    return this
  }

  styles(styles: { [key: string]: string }): TableColumnPropsBuilder {
    this.tableColumnProps.styles = styles
    return this
  }

  categoryTitle(categoryTitle: string): TableColumnPropsBuilder {
    this.tableColumnProps.categoryTitle = categoryTitle
    return this
  }

  render(render: (record: { [key: string]: any }, layoutKind: LayoutKind) => any): TableColumnPropsBuilder {
    this.tableColumnProps.render = render
    return this
  }

  multiValue(multiValue: boolean): TableColumnPropsBuilder {
    this.tableColumnProps.multiValue = multiValue
    return this
  }

  kindDateTimeFormat(kindDateTimeFormat: string): TableColumnPropsBuilder {
    this.tableColumnProps.kindDateTimeFormat = kindDateTimeFormat
    return this
  }

  features(features: ColumnFeatureProps): TableColumnPropsBuilder {
    this.tableColumnProps.features = features
    return this
  }

  build(): TableColumnProps {
    return this.tableColumnProps
  }
}

export interface TableStyleProps {
  size: SizeKind
  theme: string
  tableClass: string
  headerClass: string
  footerClass: string
  rowClass: string
  cellClass: string
  aggClass: string
}

export class TableStylePropsBuilder {
  private tableStyleProps: TableStyleProps

  static create(): TableStylePropsBuilder {
    return new TableStylePropsBuilder({
      size: SizeKind.MEDIUM,
      theme: '',
      tableClass: '',
      headerClass: '',
      footerClass: '',
      rowClass: '',
      cellClass: '',
      aggClass: '',
    })
  }

  private constructor(tableStyleProps: TableStyleProps) {
    this.tableStyleProps = tableStyleProps
  }

  size(size: SizeKind): TableStylePropsBuilder {
    this.tableStyleProps.size = size
    return this
  }

  theme(theme: string): TableStylePropsBuilder {
    this.tableStyleProps.theme = theme
    return this
  }

  tableClass(tableClass: string): TableStylePropsBuilder {
    this.tableStyleProps.tableClass = tableClass
    return this
  }

  headerClass(headerClass: string): TableStylePropsBuilder {
    this.tableStyleProps.headerClass = headerClass
    return this
  }

  footerClass(footerClass: string): TableStylePropsBuilder {
    this.tableStyleProps.footerClass = footerClass
    return this
  }

  rowClass(rowClass: string): TableStylePropsBuilder {
    this.tableStyleProps.rowClass = rowClass
    return this
  }

  cellClass(cellClass: string): TableStylePropsBuilder {
    this.tableStyleProps.cellClass = cellClass
    return this
  }

  aggClass(aggClass: string): TableStylePropsBuilder {
    this.tableStyleProps.aggClass = aggClass
    return this
  }

  build(): TableStyleProps {
    return this.tableStyleProps
  }
}
