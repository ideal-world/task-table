<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { TableCellDictItem, TableCellDictItemResp, TableColumnProps, TableDataFilterReq, TableDataGroupReq, TableDataGroupResp, TableDataResp, TableDataSliceReq, TableDataSortReq, TableEventProps, TableLayoutColumnProps, TableLayoutKernelProps, TableLayoutModifyReq, TableLayoutProps, TableProps, TableStyleProps } from '../src/components/props'
import { AggregateKind, DATA_DICT_POSTFIX, DataKind, LayoutKind } from '../src/components/props'
import { DefaultWebSocketP, DefaultWsResp } from '../src/utils/wsp'

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
  ws.reqOk('AddDict', {
    title: '星航',
    value: 'xh',
    avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg',
  }, {
    dict_code: 'name',
  })
  ws.reqOk('AddDict', {
    title: '星杨',
    value: 'xy',
    avatar: 'https://pic1.zhimg.com/v2-770e9580d5febfb49cbb23c409cea85d_r.jpg?source=1def8aca',
  }, {
    dict_code: 'name',
  })
  ws.reqOk('AddDict', {
    title: '星辰',
    value: 'xc',
  }, {
    dict_code: 'name',
  })
  ws.reqOk('AddDict', {
    title: '初始化',
    value: 'init',
    color: '#43ad7f7f',
  }, {
    dict_code: 'stats',
  })
  ws.reqOk('AddDict', {
    title: '进行中',
    value: 'progress',
  }, {
    dict_code: 'stats',
  })
  ws.reqOk('AddDict', {
    title: '有风险',
    value: 'risk',
    color: '#be14807f',
  }, {
    dict_code: 'stats',
  })
  ws.reqOk('AddDict', {
    title: '已完成',
    value: 'finish',
  }, {
    dict_code: 'stats',
  })
  ws.reqOk('AddDict', {
    title: '已关闭',
    value: 'close',
  }, {
    dict_code: 'stats',
  })

  // Create table
  tableId.value = await ws.reqOk<string>('AddTable', {
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
  layoutId.value = await ws.reqOk<string>('AddLayout', {
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
  await ws.reqOk('AddOrModifyData', [
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

  await ws.reqOk('AddOrModifyData', [
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
  loadData: async (filters?: TableDataFilterReq[], sorts?: TableDataSortReq[], group?: TableDataGroupReq, aggs?: { [key: string]: AggregateKind }, slice?: TableDataSliceReq): Promise<TableDataResp | TableDataGroupResp[]> => {
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
    if (slice)
      params.slice = slice
    return await ws.reqOk<TableDataResp | TableDataGroupResp[]>('LoadData', {}, params)
  },

  saveData: async (changedRecords: { [key: string]: any }[]): Promise<{ [key: string]: any }[]> => {
    return await ws.reqOk<{ [key: string]: any }[]>('AddOrModifyData', changedRecords, {
      table_id: tableId.value,
    })
  },

  deleteData: async (deletedPks: any[]): Promise<boolean> => {
    return await ws.reqOk<boolean>('DeleteData', deletedPks, {
      table_id: tableId.value,
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
    return await ws.reqOk<string>('AddLayout', newLayoutProps, {
      table_id: tableId.value,
    })
  },

  modifyLayout: async (changedLayoutId: string, changedLayoutProps: TableLayoutModifyReq): Promise<boolean> => {
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

  loadCellDictItems: async (columnName: string, filterValue?: any, slice?: TableDataSliceReq): Promise<TableCellDictItemResp> => {
    const params: { [k: string]: any } = {
      dict_code: columnName,
    }
    if (filterValue)
      params.value = filterValue
    if (slice) {
      params.page_size = slice.fetchNumber
      params.page_number = slice.offsetNumber / slice.fetchNumber + 1
    }

    return await ws.reqOk<(TableCellDictItemResp)>('PaginateDicts', {
    }, params)
  },

  saveCellDictItem: async (columnName: string, changedItem: TableCellDictItem): Promise<boolean> => {
    return await ws.reqOk<boolean>('AddDict', changedItem, {
      dict_code: columnName,
    })
  },
  deleteCellDictItem: async (columnName: string, value: any): Promise<boolean> => {
    return await ws.reqOk<boolean>('DeleteDict', {
    }, {
      dict_code: columnName,
      value,
    })
  },

}

// const group = {
//   columnName: 'name',
//   groupOrderDesc: true,
//   useDict: false,
//   hideEmptyRecord: false,
// }

// const events = {
//   sortCellDictItem: async (columnName: string, leftItemValue: any, rightItemValue: any) => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve(true)
//       }, 100)
//     })
//   },
//   sortLayouts: async (leftLayoutId: string, rightLayoutId: string) => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve(true)
//       }, 100)
//     })
//   },
// }

// const data1 = [
//   { no: 1, name: 'xy', stats: ['progress', 'risk'], phone: 'Phone1', addr: 'Addr1 Addr1 Addr1 Addr1 Addr1 Addr1', time: '2023-10-23' },
//   { no: 2, name: 'xy', stats: ['init'], phone: 'Phone2', addr: 'Addr2', time: '2023-10-24' },
//   { no: 3, name: 'xy', stats: ['close'], phone: 'Phone3', addr: 'Addr3', time: '2023-10-25' },
//   { no: 4, name: 'xy', stats: ['finish'], phone: 'Phone4', addr: 'Addr4', time: '2023-10-26' },
//   { no: 5, name: 'xy', stats: ['init'], phone: 'Phone5', addr: 'Addr5', time: '2023-10-27' },
//   { no: 6, name: 'xh', stats: ['init'], phone: 'Phone6', addr: 'Addr6', time: '2023-10-28' },
//   { no: 7, name: 'xh', stats: ['init'], phone: 'Phone7', addr: 'Addr7', time: '2023-10-29' },
//   { no: 8, name: 'xy', stats: ['init'], phone: 'Phone8', addr: 'Addr8', time: '2023-10-30' },
//   { no: 9, name: 'xh', stats: ['init'], phone: 'Phone9', addr: 'Addr9', time: '2023-10-31' },
//   { no: 10, name: 'xh', stats: ['init'], phone: 'Phone10', addr: 'Addr10', time: '2023-11-1' },
//   { no: 11, name: 'xy', stats: ['init'], phone: 'Phone11', addr: 'Addr11', time: '2023-11-2' },
//   { no: 12, name: 'xh', stats: ['init'], phone: 'Phone12', addr: 'Addr12', time: '2023-11-3' },
//   { no: 13, name: 'xh', stats: ['init'], phone: 'Phone13', addr: 'Addr13', time: '2023-11-4' },
//   { no: 14, name: 'xh', stats: ['init'], phone: 'Phone14', addr: 'Addr14', time: '2023-11-5' },
//   { no: 15, name: 'xy', stats: ['init'], phone: 'Phone15', addr: 'Addr15', time: '2023-11-6' },
//   { no: 16, name: 'xh', stats: ['init'], phone: 'Phone16', addr: 'Addr16', time: '2023-11-7' },
//   { no: 17, name: 'xh', stats: ['init'], phone: 'Phone17', addr: 'Addr17', time: '2023-11-8' },
//   { no: 18, name: 'xh', stats: ['init'], phone: 'Phone18', addr: 'Addr18', time: '2023-11-9' },
//   { no: 19, name: 'xh', stats: ['init'], phone: 'Phone19', addr: 'Addr19', time: '2023-11-10' },
//   { no: 20, name: 'xh', stats: ['init'], phone: 'Phone20', addr: 'Addr20', time: '2023-11-11' },
//   { no: 21, name: 'xh', stats: ['init'], phone: 'Phone21', addr: 'Addr21', time: '2023-11-12' },
//   { no: 22, name: 'xh', stats: ['init'], phone: 'Phone22', addr: 'Addr22', time: '2023-11-13' },
//   { no: 23, name: 'xh', stats: ['init'], phone: 'Phone23', addr: 'Addr23', time: '2023-11-14' },
//   { no: 24, name: 'xc', stats: ['init'], phone: 'Phone24', addr: 'Addr24', time: '2023-11-15' },
//   { no: 25, name: 'xc', stats: ['init'], phone: 'Phone25', addr: 'Addr25', time: '2023-11-16' },
//   { no: 26, name: 'xc', stats: ['init'], phone: 'Phone26', addr: 'Addr26', time: '2023-11-17' },
//   { no: 27, name: 'xc', stats: ['init'], phone: 'Phone27', addr: 'Addr27', time: '2023-11-18' },
//   { no: 28, name: 'xc', stats: ['init'], phone: 'Phone28', addr: 'Addr28', time: '2023-11-19' },
//   { no: 29, name: 'xc', stats: ['init'], phone: 'Phone29', addr: 'Addr29', time: '2023-11-20' },
// ]

// const resp1 = {
//   records: attachDict(data1),
//   totalNumber: data1.length,
// }

// const data2 = [
//   { no: 1, name: 'xh', stats: ['init'], phone: 'Phone1', addr: 'Addr1 Addr1 Addr1 Addr1 Addr1 Addr1', time: Date.now() },
//   { no: 2, name: 'xh', stats: ['init'], phone: 'Phone2', addr: 'Addr2', time: '2023-10-24' },
//   { no: 3, pno: 1, name: 'xh', stats: ['progress', 'risk'], phone: 'Phone3', addr: 'Addr3', time: '2023-10-25' },
//   { no: 4, pno: 1, name: 'xh', stats: ['init'], phone: 'Phone4', addr: 'Addr4', time: '2023-10-26' },
//   { no: 5, pno: 1, name: 'xh', stats: ['init'], phone: 'Phone5', addr: 'Addr5', time: '2023-10-27' },
//   { no: 6, name: 'xh', stats: ['init'], phone: 'Phone6', addr: 'Addr6', time: '2023-10-28' },
//   { no: 7, name: 'xh', stats: ['init'], phone: 'Phone7', addr: 'Addr7', time: '2023-10-29' },
//   { no: 8, pno: 4, name: 'xh', stats: ['init'], phone: 'Phone8', addr: 'Addr8', time: '2023-10-30' },
//   { no: 9, pno: 4, name: 'xh', stats: ['init'], phone: 'Phone9', addr: 'Addr9', time: '2023-10-31' },
//   { no: 10, pno: 8, name: 'xh', stats: ['close'], phone: 'Phone10', addr: 'Addr10', time: '2023-11-1' },
//   { no: 11, name: 'xh', stats: ['close'], phone: 'Phone11', addr: 'Addr11', time: '2023-11-2' },
//   { no: 12, name: 'xh', stats: ['close'], phone: 'Phone12', addr: 'Addr12', time: '2023-11-3' },
//   { no: 13, name: 'xh', stats: ['close'], phone: 'Phone13', addr: 'Addr13', time: '2023-11-4' },
//   { no: 14, name: 'xh', stats: ['close'], phone: 'Phone14', addr: 'Addr14', time: '2023-11-5' },
//   { no: 15, name: 'xh', stats: ['close'], phone: 'Phone15', addr: 'Addr15', time: '2023-11-6' },
//   { no: 16, pno: 8, name: 'xh', stats: ['close'], phone: 'Phone16', addr: 'Addr16', time: '2023-11-7' },
//   { no: 17, name: 'xh', stats: ['finish'], phone: 'Phone17', addr: 'Addr17', time: '2023-11-8' },
//   { no: 18, name: 'xh', stats: ['finish'], phone: 'Phone18', addr: 'Addr18', time: '2023-11-9' },
//   { no: 19, name: 'xh', stats: ['finish'], phone: 'Phone19', addr: 'Addr19', time: '2023-11-10' },
//   { no: 20, name: 'xh', stats: ['finish'], phone: 'Phone20', addr: 'Addr20', time: '2023-11-11' },
//   { no: 21, name: 'xh', stats: ['finish'], phone: 'Phone21', addr: 'Addr21', time: '2023-11-12' },
//   { no: 22, pno: 1, name: 'xh', stats: ['finish'], phone: 'Phone22', addr: 'Addr22', time: '2023-11-13' },
//   { no: 23, name: 'xh', stats: ['finish'], phone: 'Phone23', addr: 'Addr23', time: '2023-11-14' },
//   { no: 24, name: 'xh', stats: ['progress', 'risk'], phone: 'Phone24', addr: 'Addr24', time: '2023-11-15' },
//   { no: 25, name: 'xh', stats: ['close'], phone: 'Phone25', addr: 'Addr25', time: '2023-11-16' },
//   { no: 26, name: 'xh', stats: ['close'], phone: 'Phone26', addr: 'Addr26', time: '2023-11-17' },
//   { no: 27, name: 'xh', stats: ['close'], phone: 'Phone27', addr: 'Addr27', time: '2023-11-18' },
//   { no: 28, name: 'xh', stats: ['close'], phone: 'Phone28', addr: 'Addr28', time: '2023-11-19' },
//   { no: 29, name: 'xh', stats: ['close'], phone: 'Phone29', addr: 'Addr29', time: '2023-11-20' },
// ]

// const data3 = [
//   { no: 110, name: 'xy', stats: ['init'], phone: 'Phone10', addr: 'Addr10', time: '2023-11-1' },
//   { no: 111, name: 'xy', stats: ['init'], phone: 'Phone11', addr: 'Addr11', time: '2023-11-2' },
//   { no: 112, name: 'xy', stats: ['init'], phone: 'Phone12', addr: 'Addr12', time: '2023-11-3' },
//   { no: 113, name: 'xy', stats: ['init'], phone: 'Phone13', addr: 'Addr13', time: '2023-11-4' },
//   { no: 114, name: 'xy', stats: ['init'], phone: 'Phone14', addr: 'Addr14', time: '2023-11-5' },
//   { no: 115, name: 'xy', stats: ['init'], phone: 'Phone15', addr: 'Addr15', time: '2023-11-6' },
//   { no: 116, name: 'xy', stats: ['init'], phone: 'Phone16', addr: 'Addr16', time: '2023-11-7' },
//   { no: 117, pno: 210, name: 'xy', stats: ['init'], phone: 'Phone17', addr: 'Addr17', time: '2023-11-8' },
//   { no: 118, name: 'xy', stats: ['init'], phone: 'Phone18', addr: 'Addr18', time: '2023-11-9' },
//   { no: 119, name: 'xy', stats: ['init'], phone: 'Phone19', addr: 'Addr19', time: '2023-11-10' },
//   { no: 210, name: 'xy', stats: ['init'], phone: 'Phone20', addr: 'Addr20', time: '2023-11-11' },
//   { no: 211, name: 'xy', stats: ['finish'], phone: 'Phone21', addr: 'Addr21', time: '2023-11-12' },
//   { no: 212, name: 'xy', stats: ['finish'], phone: 'Phone22', addr: 'Addr22', time: '2023-11-13' },
//   { no: 213, name: 'xy', stats: ['finish'], phone: 'Phone23', addr: 'Addr23', time: '2023-11-14' },
//   { no: 214, name: 'xy', stats: ['finish'], phone: 'Phone24', addr: 'Addr24', time: '2023-11-15' },
//   { no: 215, name: 'xy', stats: ['finish'], phone: 'Phone25', addr: 'Addr25', time: '2023-11-16' },
//   { no: 216, name: 'xy', stats: ['finish'], phone: 'Phone26', addr: 'Addr26', time: '2023-11-17' },
//   { no: 217, name: 'xy', stats: ['finish'], phone: 'Phone27', addr: 'Addr27', time: '2023-11-18' },
//   { no: 218, name: 'xy', stats: ['finish'], phone: 'Phone28', addr: 'Addr28', time: '2023-11-19' },
//   { no: 219, name: 'xy', stats: ['finish'], phone: 'Phone29', addr: 'Addr29', time: '2023-11-20' },
// ]

// const data4 = [
//   { no: 318, name: 'xc', stats: ['finish'], phone: 'Phone18', addr: 'Addr18', time: '2023-11-9' },
//   { no: 319, name: 'xc', stats: ['finish'], phone: 'Phone19', addr: 'Addr19', time: '2023-11-10' },
//   { no: 320, name: 'xc', stats: ['finish'], phone: 'Phone20', addr: 'Addr20', time: '2023-11-11' },
//   { no: 321, name: 'xc', stats: ['finish'], phone: 'Phone21', addr: 'Addr21', time: '2023-11-12' },
//   { no: 322, name: 'xc', stats: ['finish'], phone: 'Phone22', addr: 'Addr22', time: '2023-11-13' },
//   { no: 323, name: 'xc', stats: ['finish'], phone: 'Phone23', addr: 'Addr23', time: '2023-11-14' },
//   { no: 324, name: 'xc', stats: ['finish'], phone: 'Phone24', addr: 'Addr24', time: '2023-11-15' },
//   { no: 325, name: 'xc', stats: ['init'], phone: 'Phone25', addr: 'Addr25', time: '2023-11-16' },
//   { no: 326, name: 'xc', stats: ['init'], phone: 'Phone26', addr: 'Addr26', time: '2023-11-17' },
//   { no: 327, name: 'xc', stats: ['init'], phone: 'Phone27', addr: 'Addr27', time: '2023-11-18' },
//   { no: 328, name: 'xc', stats: ['init'], phone: 'Phone28', addr: 'Addr28', time: '2023-11-19' },
//   { no: 329, name: 'xc', stats: ['init'], phone: 'Phone29', addr: 'Addr29', time: '2023-11-20' },
// ]

// const resp2 = [
//   {
//     records: attachDict(data2),
//     totalNumber: data2.length,
//     aggs: { name: 'name' },
//     groupValue: 'xh',
//     offsetNumber: 0,
//     fetchNumber: 10,
//   },
//   {
//     records: attachDict(data3),
//     totalNumber: data3.length + 100,
//     aggs: { name: 'name' },
//     groupValue: 'xy',
//     offsetNumber: 0,
//     fetchNumber: 10,
//   },
//   {
//     records: attachDict(data4),
//     totalNumber: data4.length,
//     aggs: { name: 'name' },
//     groupValue: 'xc',
//     offsetNumber: 0,
//     fetchNumber: 10,
//   },
// ]
</script>

<template>
  <div style="height: 300px">
    <iw-task-table
      v-if="isInit"
      pk-column-name="no" parent-pk-column-name="pno" :columns="columns" :events="events" :layouts="layouts"
    />
  </div>
</template>
