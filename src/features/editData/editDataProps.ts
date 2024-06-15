export interface FeatureEditDataInitProps {
  columnNames: string[]
}

export class FeatureEditDataInitPropsBuilder {
  private featureEditDataInitProps: FeatureEditDataInitProps

  static create(): FeatureEditDataInitPropsBuilder {
    return new FeatureEditDataInitPropsBuilder({
      columnNames: [],
    })
  }

  private constructor(featureEditDataInitProps: FeatureEditDataInitProps) {
    this.featureEditDataInitProps = featureEditDataInitProps
  }

  columnNames(columnNames: string[]): FeatureEditDataInitPropsBuilder {
    this.featureEditDataInitProps.columnNames = columnNames
    return this
  }

  build(): FeatureEditDataInitProps {
    return this.featureEditDataInitProps
  }
}

export interface FeatureEditDataModifyProps {
  columnNames: string[]
}
