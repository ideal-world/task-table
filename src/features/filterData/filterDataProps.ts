import type { OperatorKind } from '../../props/enumsProps'

export interface FeatureFilterDataInitProps {
  // OR relationship between groups
  filters: FeatureFilterDataGroupProps[]
}

export class FeatureFilterDataInitPropsBuilder {
  private featureFilterDataInitProps: FeatureFilterDataInitProps

  static create(): FeatureFilterDataInitPropsBuilder {
    return new FeatureFilterDataInitPropsBuilder({
      filters: [],
    })
  }

  private constructor(featureFilterDataInitProps: FeatureFilterDataInitProps) {
    this.featureFilterDataInitProps = featureFilterDataInitProps
  }

  filters(filters: FeatureFilterDataGroupProps[]): FeatureFilterDataInitPropsBuilder {
    this.featureFilterDataInitProps.filters = filters
    return this
  }

  build(): FeatureFilterDataInitProps {
    return this.featureFilterDataInitProps
  }
}

export interface FeatureFilterDataModifyProps {
  // OR relationship between groups
  filters: FeatureFilterDataGroupProps[]
}

export interface FeatureFilterDataGroupProps {
  // AND relationship between items
  items: FeatureFilterItemProps[]
}

export interface FeatureFilterItemProps {
  columnName: string
  operator: OperatorKind
  value?: any
}
