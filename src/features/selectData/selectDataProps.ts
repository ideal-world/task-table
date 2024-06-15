export interface FeatureSelectDataEnableProps {
  selectedDataPks: any[]
}

export class FeatureSelectDataInitPropsBuilder {
  private featureSelectDataEnableProps: FeatureSelectDataEnableProps

  static create(): FeatureSelectDataInitPropsBuilder {
    return new FeatureSelectDataInitPropsBuilder({
      selectedDataPks: [],
    })
  }

  private constructor(featureSelectDataEnableProps: FeatureSelectDataEnableProps) {
    this.featureSelectDataEnableProps = featureSelectDataEnableProps
  }

  build(): FeatureSelectDataEnableProps {
    return this.featureSelectDataEnableProps
  }
}

export interface FeatureSelectDataModifyProps {
  selectedDataPks: any[]
}
