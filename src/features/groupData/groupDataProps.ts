import type { DataResp } from '../../props/basicProps'

export interface FeatureGroupDataInitProps {
  group?: FeatureGroupDataItemProps
}

export class FeatureGroupDataInitPropsBuilder {
  private featureGroupDataInitProps: FeatureGroupDataInitProps

  static create(): FeatureGroupDataInitPropsBuilder {
    return new FeatureGroupDataInitPropsBuilder({
    })
  }

  private constructor(featureGroupDataInitProps: FeatureGroupDataInitProps) {
    this.featureGroupDataInitProps = featureGroupDataInitProps
  }

  group(group: FeatureGroupDataItemProps): FeatureGroupDataInitPropsBuilder {
    this.featureGroupDataInitProps.group = group
    return this
  }

  build(): FeatureGroupDataInitProps {
    return this.featureGroupDataInitProps
  }
}

export interface FeatureGroupDataModifyProps {
  modify: FeatureGroupDataItemProps
  remove: boolean
}

export interface FeatureGroupDataItemProps {
  columnName: string
  groupOrderDesc: boolean
  // useDict: boolean
  hideEmptyRecord: boolean
}

export interface FeatureGroupDataResp extends DataResp {
  groupValue: string
  groupShowTitle?: string
}
