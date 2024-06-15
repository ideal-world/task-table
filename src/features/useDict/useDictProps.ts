export interface FeatureUseDictInitProps {
}

export class FeatureUseDictInitPropsBuilder {
  private featureUseDictInitProps: FeatureUseDictInitProps

  static create(): FeatureUseDictInitPropsBuilder {
    return new FeatureUseDictInitPropsBuilder({
    })
  }

  private constructor(featureUseDictInitProps: FeatureUseDictInitProps) {
    this.featureUseDictInitProps = featureUseDictInitProps
  }

  build(): FeatureUseDictInitProps {
    return this.featureUseDictInitProps
  }
}

export interface FeatureUseDictItemProps {
  title: string
  value: any
  color?: string
  avatar?: string
}

export interface FeatureUseDictItemsResp {
  records: FeatureUseDictItemProps[]
  totalNumber: number
}
