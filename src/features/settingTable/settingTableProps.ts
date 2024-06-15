export interface FeatureSettingTableInitProps {
  switchTheme?: boolean
  switchSize?: boolean
}

export class FeatureSettingTableInitPropsBuilder {
  private featureSettingTableInitProps: FeatureSettingTableInitProps

  static create(): FeatureSettingTableInitPropsBuilder {
    return new FeatureSettingTableInitPropsBuilder({
    })
  }

  private constructor(featureSettingTableInitProps: FeatureSettingTableInitProps) {
    this.featureSettingTableInitProps = featureSettingTableInitProps
  }

  switchTheme(switchTheme: boolean): FeatureSettingTableInitPropsBuilder {
    this.featureSettingTableInitProps.switchTheme = switchTheme
    return this
  }

  switchSize(switchSize: boolean): FeatureSettingTableInitPropsBuilder {
    this.featureSettingTableInitProps.switchSize = switchSize
    return this
  }

  build(): FeatureSettingTableInitProps {
    return this.featureSettingTableInitProps
  }
}
