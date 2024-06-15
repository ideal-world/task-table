export interface FeatureMultiLayoutsInitProps {

}

export class FeatureMultiLayoutsInitPropsBuilder {
  private featureMultiLayoutsInitProps: FeatureMultiLayoutsInitProps

  static create(): FeatureMultiLayoutsInitPropsBuilder {
    return new FeatureMultiLayoutsInitPropsBuilder({
    })
  }

  private constructor(featureMultiLayoutsInitProps: FeatureMultiLayoutsInitProps) {
    this.featureMultiLayoutsInitProps = featureMultiLayoutsInitProps
  }

  build(): FeatureMultiLayoutsInitProps {
    return this.featureMultiLayoutsInitProps
  }
}
