export interface DataResp {
  records: { [key: string]: any }[]
  aggs: { [key: string]: any }
  totalNumber: number
  // 优先
  nonEditablePks?: any[]
  editablePks?: any[]
}

export interface DataGroupResp extends DataResp {
  groupValue: string
  groupShowTitle?: string
}

export interface AggDataResp {
  aggs: { [key: string]: any }
}

export interface AggDataGroupResp extends AggDataResp {
  groupValue: string
}

export interface DictItemProps {
  title: string
  value: any
  color?: string
  avatar?: string
}

export interface DictItemsResp {
  records: DictItemProps[]
  totalNumber: number
}
