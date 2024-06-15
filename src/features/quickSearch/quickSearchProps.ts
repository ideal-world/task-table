export interface FeatureQuickSearchInitProps {
  placeholder: string
  quickSearchContent?: string
}

export class FeatureQuickSearchInitPropsBuilder {
  private featureQuickSearchInitProps: FeatureQuickSearchInitProps

  static create(placeholder: string): FeatureQuickSearchInitPropsBuilder {
    return new FeatureQuickSearchInitPropsBuilder({
      placeholder,
    })
  }

  private constructor(featureQuickSearchInitProps: FeatureQuickSearchInitProps) {
    this.featureQuickSearchInitProps = featureQuickSearchInitProps
  }

  quickSearchContent(quickSearchContent: string): FeatureQuickSearchInitPropsBuilder {
    this.featureQuickSearchInitProps.quickSearchContent = quickSearchContent
    return this
  }

  build(): FeatureQuickSearchInitProps {
    return this.featureQuickSearchInitProps
  }
}
