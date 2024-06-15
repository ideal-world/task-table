import type { LayoutKind } from './enumsProps'
import type { ColumnFeatureProps } from './featuresProps'

export interface CommonColumnProps {
  name: string
  wrap: boolean
  fixed: boolean
  width: number
  hide: boolean
  styles: { [key: string]: string }
  // Header column classification
  categoryTitle?: string
  // Overwrite the value of TableColumnProps
  render?: (record: { [key: string]: any }, layoutKind: LayoutKind) => any
  features: ColumnFeatureProps
}

export class CommonColumnPropsBuilder {
  private commonColumnProps: CommonColumnProps

  static create(name: string): CommonColumnPropsBuilder {
    return new CommonColumnPropsBuilder({
      name,
      wrap: false,
      fixed: false,
      width: 100,
      hide: false,
      styles: {},
      features: {
        aggData: false,
        filterData: false,
        sortData: false,
        groupData: false,
        editData: false,
        useDict: false,
        dictEditable: false,
      },
    })
  }

  private constructor(commonColumnProps: CommonColumnProps) {
    this.commonColumnProps = commonColumnProps
  }

  wrap(wrap: boolean): CommonColumnPropsBuilder {
    this.commonColumnProps.wrap = wrap
    return this
  }

  fixed(fixed: boolean): CommonColumnPropsBuilder {
    this.commonColumnProps.fixed = fixed
    return this
  }

  width(width: number): CommonColumnPropsBuilder {
    this.commonColumnProps.width = width
    return this
  }

  hide(hide: boolean): CommonColumnPropsBuilder {
    this.commonColumnProps.hide = hide
    return this
  }

  styles(styles: { [key: string]: string }): CommonColumnPropsBuilder {
    this.commonColumnProps.styles = styles
    return this
  }

  categoryTitle(categoryTitle: string): CommonColumnPropsBuilder {
    this.commonColumnProps.categoryTitle = categoryTitle
    return this
  }

  render(render: (record: { [key: string]: any }, layoutKind: LayoutKind) => any): CommonColumnPropsBuilder {
    this.commonColumnProps.render = render
    return this
  }

  features(features: ColumnFeatureProps): CommonColumnPropsBuilder {
    this.commonColumnProps.features = features
    return this
  }

  build(): CommonColumnProps {
    return this.commonColumnProps
  }
}

export interface DataQuerySliceReq {
  offsetNumber: number
  fetchNumber: number
}

export interface DataSliceProps extends DataQuerySliceReq {
  fetchNumbers: number[]
}

export class DataSlicePropsBuilder {
  private dataSliceProps: DataSliceProps

  static create(): DataSlicePropsBuilder {
    return new DataSlicePropsBuilder({
      offsetNumber: 0,
      fetchNumber: 10,
      fetchNumbers: [5, 10, 20, 30, 50, 100],
    })
  }

  private constructor(dataSliceProps: DataSliceProps) {
    this.dataSliceProps = dataSliceProps
  }

  offsetNumber(offsetNumber: number): DataSlicePropsBuilder {
    this.dataSliceProps.offsetNumber = offsetNumber
    return this
  }

  fetchNumber(fetchNumber: number): DataSlicePropsBuilder {
    this.dataSliceProps.fetchNumber = fetchNumber
    return this
  }

  fetchNumbers(fetchNumbers: number[]): DataSlicePropsBuilder {
    this.dataSliceProps.fetchNumbers = fetchNumbers
    return this
  }

  build(): DataSliceProps {
    return this.dataSliceProps
  }
}

export interface DataResp {
  records: { [key: string]: any }[]
  aggs: { [key: string]: any }
  totalNumber: number
}
