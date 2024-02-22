<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { TableCellDictItemProps, TableCellDictItemsResp, TableColumnProps, TableDataFilterProps, TableDataGroupProps, TableDataGroupResp, TableDataResp, TableDataSliceProps, TableDataSortProps, TableEventProps, TableLayoutColumnProps, TableLayoutKernelProps, TableLayoutModifyProps, TableLayoutProps, TableProps, TableStyleProps } from '../src/components/props'
import { AggregateKind, DataKind, LayoutKind } from '../src/components/props'
import { DefaultWebSocketP } from '../src/utils/wsp'

let ws: DefaultWebSocketP
// 定义是否已初始化变量
const isInit = ref<boolean>(false)

const tableId = ref<string>('')
const layoutId = ref<string>('')
const columns = ref<TableColumnProps[]>([])
const layouts = ref<TableLayoutProps[]>([])
const styles = ref<TableStyleProps | undefined>(undefined)

onMounted(async () => {
  await init()
  isInit.value = true
})

async function init() {
  ws = await DefaultWebSocketP.initDefault('wss://127.0.0.1:8089/ws', (_) => {
  })

  // Create dict
  ws.reqOk('NewOrModifyDictItem', {
    title: '星航',
    value: 'xh',
    avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg',
  }, {
    dict_code: 'name',
  })
  ws.reqOk('NewOrModifyDictItem', {
    title: '星杨',
    value: 'xy',
    avatar: 'https://pic1.zhimg.com/v2-770e9580d5febfb49cbb23c409cea85d_r.jpg?source=1def8aca',
  }, {
    dict_code: 'name',
  })
  ws.reqOk('NewOrModifyDictItem', {
    title: '星辰',
    value: 'xc',
  }, {
    dict_code: 'name',
  })
  ws.reqOk('NewOrModifyDictItem', {
    title: '初始化',
    value: 'init',
    color: '#43ad7f7f',
  }, {
    dict_code: 'stats',
  })
  ws.reqOk('NewOrModifyDictItem', {
    title: '进行中',
    value: 'progress',
  }, {
    dict_code: 'stats',
  })
  ws.reqOk('NewOrModifyDictItem', {
    title: '有风险',
    value: 'risk',
    color: '#be14807f',
  }, {
    dict_code: 'stats',
  })
  ws.reqOk('NewOrModifyDictItem', {
    title: '已完成',
    value: 'finish',
  }, {
    dict_code: 'stats',
  })
  ws.reqOk('NewOrModifyDictItem', {
    title: '已关闭',
    value: 'close',
  }, {
    dict_code: 'stats',
  })

  // Create table
  tableId.value = await ws.reqOk<string>('NewTable', {
    pkColumnName: 'no',
    parentPkColumnName: 'pno',
    columns: [
      {
        name: 'name',
        useDict: true,
        dataEditable: true,
        dictEditable: true,
      },
      {
        name: 'phone',
        dataEditable: true,
      },
      {
        name: 'stats',
        useDict: true,
        dataEditable: true,
        dictEditable: true,
        multiValue: true,
      },
      {
        name: 'addr',
        dataEditable: true,
      },
      {
        name: 'time',
        dataEditable: true,
        dataKind: DataKind.DATETIME,
      },
    ] as TableColumnProps[],
  }, {})

  // Create layout
  layoutId.value = await ws.reqOk<string>('NewLayout', {
    title: 'HI',
    layoutKind: LayoutKind.LIST,
    columns: [
      {
        name: 'no',
      },
      {
        name: 'name',
      },
      {
        name: 'stats',
      },
      {
        name: 'addr',
      },
      {
        name: 'time',
      },
    ],
    aggs: { pno: AggregateKind.MIN },
  }, {
    table_id: tableId.value,
  })

  // Get Table
  const tableProps = await ws.reqOk<TableProps>('GetTable', {}, {
    table_id: tableId.value,
  })
  columns.value = tableProps.columns as TableColumnProps[]
  layouts.value = tableProps.layouts as TableLayoutProps[]
  styles.value = tableProps.styles as TableStyleProps

  // Init Data
  await ws.reqOk('NewData', [
    {
      name: 'xy',
      stats: ['progress', 'risk'],
      phone: '18600000',
      addr: '浙江杭州xxx',
      time: new Date(),
    },
  ], {
    table_id: tableId.value,
  })

  await ws.reqOk('NewData', [
    {
      name: 'xh',
      stats: ['progress'],
      phone: '18600001',
      addr: '浙江杭州xxx',
      time: new Date(),
      pno: 1,
    },
  ], {
    table_id: tableId.value,
  })
}

const events: TableEventProps = {
  loadData: async (filters?: TableDataFilterProps[], sorts?: TableDataSortProps[], group?: TableDataGroupProps, aggs?: { [key: string]: AggregateKind }, byGroupValue?: any, slice?: TableDataSliceProps): Promise<TableDataResp | TableDataGroupResp[]> => {
    const params: { [k: string]: any } = {
      table_id: tableId.value,
    }
    if (filters)
      params.filters = filters
    if (sorts)
      params.sorts = sorts
    if (group)
      params.group = group
    if (aggs)
      params.aggs = aggs
    if (byGroupValue)
      params.byGroupValue = byGroupValue
    if (slice)
      params.slice = slice
    return await ws.reqOk<TableDataResp | TableDataGroupResp[]>('LoadData', {}, params)
  },

  newData: async (newRecords: { [key: string]: any }[], targetSortValue?: any): Promise<{ [key: string]: any }[]> => {
    return await ws.reqOk<{ [key: string]: any }[]>('NewData', newRecords, {
      table_id: tableId.value,
      target_sort_value: targetSortValue,
    })
  },

  copyData: async (targetRecordPks: any[]): Promise<{ [key: string]: any }[]> => {
    return await ws.reqOk<{ [key: string]: any }[]>('CopyData', targetRecordPks, {
      table_id: tableId.value,
    })
  },

  modifyData: async (changedRecords: { [key: string]: any }[]): Promise<{ [key: string]: any }[]> => {
    return await ws.reqOk<{ [key: string]: any }[]>('ModifyData', changedRecords, {
      table_id: tableId.value,
    })
  },

  deleteData: async (deletedRecordPks: any[]): Promise<boolean> => {
    return await ws.reqOk<boolean>('DeleteData', deletedRecordPks, {
      table_id: tableId.value,
    })
  },

  sortData: async (formRecordPk: any[], targetSortValue: string): Promise<boolean> => {
    return await ws.reqOk<boolean>('SortData', formRecordPk, {
      table_id: tableId.value,
      target_sort_value: targetSortValue,
    })
  },

  modifyStyles: async (changedStyleProps: TableStyleProps): Promise<boolean> => {
    return await ws.reqOk<boolean>('ModifyTable', {
      styles: changedStyleProps,
    }, {
      table_id: tableId.value,
    })
  },

  newColumn: async (newColumnProps: TableColumnProps, fromColumnName?: string): Promise<boolean> => {
    return await ws.reqOk<boolean>('ModifyTable', {
      newColumn: {
        ...newColumnProps,
        fromColumnName,
      },
    }, {
      table_id: tableId.value,
    })
  },

  modifyColumn: async (changedColumnProps: TableColumnProps): Promise<boolean> => {
    return await ws.reqOk<boolean>('ModifyTable', {
      changedColumn: changedColumnProps,
    }, {
      table_id: tableId.value,
    })
  },

  deleteColumn: async (deletedColumnName: string): Promise<boolean> => {
    return await ws.reqOk<boolean>('ModifyTable', {
      deletedColumnName,
    }, {
      table_id: tableId.value,
    })
  },

  newLayout: async (newLayoutProps: TableLayoutKernelProps): Promise<string> => {
    return await ws.reqOk<string>('NewLayout', newLayoutProps, {
      table_id: tableId.value,
    })
  },

  modifyLayout: async (changedLayoutId: string, changedLayoutProps: TableLayoutModifyProps): Promise<boolean> => {
    return await ws.reqOk<boolean>('ModifyLayout', changedLayoutProps, {
      table_id: tableId.value,
      layout_id: changedLayoutId,
    })
  },

  deleteLayout: async (deletedLayoutId: string): Promise<boolean> => {
    return await ws.reqOk<boolean>('DeleteLayout', {
    }, {
      table_id: tableId.value,
      layout_id: deletedLayoutId,
    })
  },

  sortLayouts: async (leftLayoutId: string, rightLayoutId: string): Promise<boolean> => {
    return await ws.reqOk<boolean>('SortLayouts', {
    }, {
      table_id: tableId.value,
      left_layout_id: leftLayoutId,
      right_layout_id: rightLayoutId,
    })
  },

  loadCellDictItems: async (columnName: string, filterValue?: any, slice?: TableDataSliceProps): Promise<TableCellDictItemsResp> => {
    const params: { [k: string]: any } = {
      dict_code: columnName,
    }
    if (filterValue)
      params.value = filterValue
    if (slice) {
      params.page_size = slice.fetchNumber
      params.page_number = slice.offsetNumber / slice.fetchNumber + 1
    }

    return await ws.reqOk<(TableCellDictItemsResp)>('PaginateDictItems', {
    }, params)
  },

  newOrModifyCellDictItem: async (columnName: string, changedItem: TableCellDictItemProps): Promise<boolean> => {
    return await ws.reqOk<boolean>('NewOrModifyDictItem', changedItem, {
      dict_code: columnName,
    })
  },

  deleteCellDictItem: async (columnName: string, value: any): Promise<boolean> => {
    return await ws.reqOk<boolean>('DeleteDictItem', {
    }, {
      dict_code: columnName,
      value,
    })
  },

  sortCellDictItems: async (columnName: string, leftItemValue: any, rightItemValue: any): Promise<boolean> => {
    return await ws.reqOk<boolean>('SortDictItem', {
    }, {
      dict_code: columnName,
      left_item_value: leftItemValue,
      right_item_value: rightItemValue,
    })
  },

}
</script>

<template>
  <div style="height: 300px">
    <iw-task-table
      v-if="isInit"
      pk-column-name="no" parent-pk-column-name="pno" :columns="columns" :events="events" :layouts="layouts"
    />
  </div>
</template>
