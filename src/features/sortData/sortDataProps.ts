export interface FeatureSortDataInitProps {
  sorts: FeatureSortDataItemProps[]
}

export class FeatureSortDataInitPropsBuilder {
  private featureSortDataInitProps: FeatureSortDataInitProps

  static create(): FeatureSortDataInitPropsBuilder {
    return new FeatureSortDataInitPropsBuilder({
      sorts: [],
    })
  }

  private constructor(featureSortDataInitProps: FeatureSortDataInitProps) {
    this.featureSortDataInitProps = featureSortDataInitProps
  }

  sorts(sorts: FeatureSortDataItemProps[]): FeatureSortDataInitPropsBuilder {
    this.featureSortDataInitProps.sorts = sorts
    return this
  }

  build(): FeatureSortDataInitProps {
    return this.featureSortDataInitProps
  }
}

export interface FeatureSortDataModifyProps {
  sorts: FeatureSortDataItemProps[]
}

export interface FeatureSortDataItemProps {
  columnName: string
  orderDesc: boolean
}
