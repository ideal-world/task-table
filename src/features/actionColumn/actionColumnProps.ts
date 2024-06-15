import type { LayoutKind } from '../../props/enumsProps'

export interface FeatureActionColumnInitProps {
  render: (record: { [key: string]: any }, layoutKind: LayoutKind) => any
  width: number
}

export class FeatureActionColumnInitPropsBuilder {
  private featureActionColumnInitProps: FeatureActionColumnInitProps

  static create(render: (record: { [key: string]: any }, layoutKind: LayoutKind) => any): FeatureActionColumnInitPropsBuilder {
    return new FeatureActionColumnInitPropsBuilder({
      render,
      width: 300,
    })
  }

  private constructor(featureActionColumnInitProps: FeatureActionColumnInitProps) {
    this.featureActionColumnInitProps = featureActionColumnInitProps
  }

  width(width: number): FeatureActionColumnInitPropsBuilder {
    this.featureActionColumnInitProps.width = width
    return this
  }

  build(): FeatureActionColumnInitProps {
    return this.featureActionColumnInitProps
  }
}

export interface FeatureActionColumnModifyProps {
  width: number
}
