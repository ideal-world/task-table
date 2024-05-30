<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { TableCellDictItemProps, TableCellDictItemsResp, TableColumnProps, TableDataFilterProps, TableDataGroupProps, TableDataGroupResp, TableDataResp, TableDataSliceProps, TableDataSortProps, TableEventProps, TableLayoutColumnProps, TableLayoutKernelProps, TableLayoutModifyProps, TableLayoutProps, TableProps, TableStyleProps } from '../src/components/props'
import { AggregateKind, DATA_DICT_POSTFIX, DataKind, LayoutKind } from '../src/components/props'

const nameDict = [{ title: '星航', value: 'xh', avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg' }, { title: '星杨', value: 'xy', avatar: 'https://pic1.zhimg.com/v2-770e9580d5febfb49cbb23c409cea85d_r.jpg?source=1def8aca' }, { title: '星辰', value: 'xc' }]
const statsDict = [{ title: '初始化', value: 'init', color: '#43ad7f7f' }, { title: '进行中', value: 'progress' }, { title: '有风险', value: 'risk', color: '#be14807f' }, { title: '已完成', value: 'finish' }, { title: '已关闭', value: 'close' }]

const data = [
  { no: 1, pno: null, name: 'xh', stats: ['init'], phone: 'Phone1', addr: 'Addr1 Addr1 Addr1 Addr1 Addr1 Addr1', time: Date.now() },
  { no: 2, pno: null, name: 'xh', stats: ['init'], phone: 'Phone2', addr: 'Addr2', time: '2023-10-24' },
  { no: 3, pno: 1, name: 'xh', stats: ['progress', 'risk'], phone: 'Phone3', addr: 'Addr3', time: '2023-10-25' },
  { no: 4, pno: 1, name: 'xh', stats: ['init'], phone: 'Phone4', addr: 'Addr4', time: '2023-10-26' },
  { no: 5, pno: 1, name: 'xh', stats: ['init'], phone: 'Phone5', addr: 'Addr5', time: '2023-10-27' },
  { no: 6, pno: null, name: 'xh', stats: ['init'], phone: 'Phone6', addr: 'Addr6', time: '2023-10-28' },
  { no: 7, pno: null, name: 'xh', stats: ['init'], phone: 'Phone7', addr: 'Addr7', time: '2023-10-29' },
  { no: 8, pno: 4, name: 'xh', stats: ['init'], phone: 'Phone8', addr: 'Addr8', time: '2023-10-30' },
  { no: 9, pno: 4, name: 'xh', stats: ['init'], phone: 'Phone9', addr: 'Addr9', time: '2023-10-31' },
  { no: 10, pno: 8, name: 'xh', stats: ['close'], phone: 'Phone10', addr: 'Addr10', time: '2023-11-1' },
  { no: 11, pno: null, name: 'xh', stats: ['close'], phone: 'Phone11', addr: 'Addr11', time: '2023-11-2' },
  { no: 12, pno: null, name: 'xh', stats: ['close'], phone: 'Phone12', addr: 'Addr12', time: '2023-11-3' },
  { no: 13, pno: null, name: 'xh', stats: ['close'], phone: 'Phone13', addr: 'Addr13', time: '2023-11-4' },
  { no: 14, pno: null, name: 'xh', stats: ['close'], phone: 'Phone14', addr: 'Addr14', time: '2023-11-5' },
  { no: 15, pno: null, name: 'xh', stats: ['close'], phone: 'Phone15', addr: 'Addr15', time: '2023-11-6' },
  { no: 16, pno: 8, name: 'xh', stats: ['close'], phone: 'Phone16', addr: 'Addr16', time: '2023-11-7' },
  { no: 17, pno: null, name: 'xh', stats: ['finish'], phone: 'Phone17', addr: 'Addr17', time: '2023-11-8' },
  { no: 18, pno: null, name: 'xh', stats: ['finish'], phone: 'Phone18', addr: 'Addr18', time: '2023-11-9' },
  { no: 19, pno: null, name: 'xh', stats: ['finish'], phone: 'Phone19', addr: 'Addr19', time: '2023-11-10' },
  { no: 20, pno: null, name: 'xh', stats: ['finish'], phone: 'Phone20', addr: 'Addr20', time: '2023-11-11' },
  { no: 21, pno: null, name: 'xh', stats: ['finish'], phone: 'Phone21', addr: 'Addr21', time: '2023-11-12' },
  { no: 22, pno: 1, name: 'xh', stats: ['finish'], phone: 'Phone22', addr: 'Addr22', time: '2023-11-13' },
  { no: 23, pno: null, name: 'xh', stats: ['finish'], phone: 'Phone23', addr: 'Addr23', time: '2023-11-14' },
  { no: 24, pno: null, name: 'xh', stats: ['progress', 'risk'], phone: 'Phone24', addr: 'Addr24', time: '2023-11-15' },
  { no: 25, pno: null, name: 'xh', stats: ['close'], phone: 'Phone25', addr: 'Addr25', time: '2023-11-16' },
  { no: 26, pno: null, name: 'xh', stats: ['close'], phone: 'Phone26', addr: 'Addr26', time: '2023-11-17' },
  { no: 27, pno: null, name: 'xh', stats: ['close'], phone: 'Phone27', addr: 'Addr27', time: '2023-11-18' },
  { no: 28, pno: null, name: 'xh', stats: ['close'], phone: 'Phone28', addr: 'Addr28', time: '2023-11-19' },
  { no: 29, pno: null, name: 'xh', stats: ['close'], phone: 'Phone29', addr: 'Addr29', time: '2023-11-20' },
]


const tableId = ref<string>('')
const columns = [{ name: 'no', dataKind: DataKind.NUMBER, dataEditable: false }, { name: 'pno', dataKind: DataKind.NUMBER, dataEditable: false }, { name: 'name', useDict: true, dictEditable: true }, { name: 'phone' }, { name: 'stats', useDict: true, dictEditable: true, multiValue: true }, { name: 'addr' }, { name: 'time', dataKind: DataKind.DATETIME }]
const layouts = [{
  id: 'hi',
  title: 'HI',
  layoutKind: LayoutKind.LIST,
  columns: [{
    name: 'name',
  }, {
    name: 'stats',
  }, {
    name: 'no',
    width: 80,
  }, {
    name: 'addr',
  }, {
    name: 'time',
  }],
  aggs: { name: AggregateKind.MIN },
}]
// const group = ref<TableDataGroupProps>({
//   columnName: 'name',
//   groupOrderDesc: true,
//   useDict: false,
//   hideEmptyRecord: false,
// })

const styles = {}

function attachDict(data: { [key: string]: any }[]) {
  return data.map((d) => {
    d[`name${DATA_DICT_POSTFIX}`] = [nameDict.find(dict => dict.value === d.name)!]
    d[`stats${DATA_DICT_POSTFIX}`] = d.stats.map((s) => { return statsDict.find(dict => dict.value === s)! })
    return d
  })
}

const events: TableEventProps = {
  loadData: async (filters?: TableDataFilterProps[], sorts?: TableDataSortProps[], group?: TableDataGroupProps, aggs?: { [key: string]: AggregateKind }, byGroupValue?: any, slice?: TableDataSliceProps): Promise<TableDataResp | TableDataGroupResp[]> => {
    // const params: { [k: string]: any } = {
    //   table_id: tableId.value,
    // }
    // if (filters)
    //   params.filters = filters
    // if (sorts)
    //   params.sorts = sorts
    // if (group)
    //   params.group = group
    // if (aggs)
    //   params.aggs = aggs
    // if (byGroupValue)
    //   params.byGroupValue = byGroupValue
    // if (slice)
    //   params.slice = slice
    // return await ws.reqOk<TableDataResp | TableDataGroupResp[]>('LoadData', {}, params)

    return {
      records: attachDict(data),
      totalNumber: data.length,
      aggs: { name: 'name' },
      // groupValue: 'xh',
    }
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
  <div style="height: 600px">
    <iw-task-table
      pk-column-name="no" parent-pk-column-name="pno" :columns="columns" :events="events" :layouts="layouts"
     :styles="styles"
    />
  </div>
</template>
