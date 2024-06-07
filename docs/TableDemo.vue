<script setup lang="ts">
import type { Ref } from 'vue'
import { onMounted, ref } from 'vue'
import { IwEvents } from '../src'
import type { TableCellDictItemProps, TableCellDictItemsResp, TableColumnProps, TableDataFilterProps, TableDataGroupProps, TableDataGroupResp, TableDataQuerySliceProps, TableDataResp, TableDataSliceProps, TableDataSortProps, TableEventProps, TableLayoutKernelProps, TableLayoutModifyProps, TableLayoutProps, TableStyleProps } from '../src/props'
import { AggregateKind, DATA_DICT_POSTFIX, DataKind, LayoutKind, OperatorKind } from '../src/props'
import { IwUtils } from '../src/utils'

const selectedRecordPks: Ref<any[]> = ref([])

const NAME_DICT = [{ title: '星航', value: 'xh', avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg' }, { title: '星杨', value: 'xy', avatar: 'https://pic1.zhimg.com/v2-770e9580d5febfb49cbb23c409cea85d_r.jpg?source=1def8aca' }, { title: '星辰', value: 'xc' }]
const STATS_DICT = [{ title: '初始化', value: 'init', color: '#43ad7f7f' }, { title: '进行中', value: 'progress' }, { title: '有风险', value: 'risk', color: '#be14807f' }, { title: '已完成', value: 'finish' }, { title: '已关闭', value: 'close' }]

const DATA: { [key: string]: any }[] = [
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
  { no: 18, pno: null, name: 'xy', stats: ['finish'], phone: 'Phone18', addr: 'Addr18', time: '2023-11-9' },
  { no: 19, pno: null, name: 'xy', stats: ['finish'], phone: 'Phone19', addr: 'Addr19', time: '2023-11-10' },
  { no: 20, pno: null, name: 'xh', stats: ['finish'], phone: 'Phone20', addr: 'Addr20', time: '2023-11-11' },
  { no: 21, pno: null, name: 'xh', stats: ['finish'], phone: 'Phone21', addr: 'Addr21', time: '2023-11-12' },
  { no: 22, pno: 1, name: 'xh', stats: ['finish'], phone: 'Phone22', addr: 'Addr22', time: '2023-11-13' },
  { no: 23, pno: null, name: 'xh', stats: ['finish'], phone: 'Phone23', addr: 'Addr23', time: '2023-11-14' },
  { no: 24, pno: null, name: 'xh', stats: ['progress', 'risk'], phone: 'Phone24', addr: 'Addr24', time: '2023-11-15' },
  { no: 25, pno: null, name: 'xh', stats: ['close'], phone: 'Phone25', addr: 'Addr25', time: '2023-11-16' },
  { no: 26, pno: null, name: 'xy', stats: ['close'], phone: 'Phone26', addr: 'Addr26', time: '2023-11-17' },
  { no: 27, pno: null, name: 'xy', stats: ['close'], phone: 'Phone27', addr: 'Addr27', time: '2023-11-18' },
  { no: 28, pno: null, name: 'xh', stats: ['close'], phone: 'Phone28', addr: 'Addr28', time: '2023-11-19' },
  { no: 29, pno: null, name: 'xh', stats: ['close'], phone: 'Phone29', addr: 'Addr29', time: '2023-11-20' },
]

const COLUMNS: Ref<TableColumnProps[]> = ref([
  { name: 'no', title: '序号', dataKind: DataKind.NUMBER, dataEditable: false, sortable: true },
  { name: 'pno', title: '父序号', dataKind: DataKind.NUMBER, dataEditable: false },
  { name: 'name', title: '姓名', useDict: true, dictEditable: true, sortable: true, groupable: true },
  { name: 'phone', title: '手机', sortable: true, render: (record: { [key: string]: any }, columnName: string) => {
    return `<strong>+86</strong> ${record[columnName]}`
  } },
  { name: 'stats', title: '状态', useDict: true, dictEditable: true, multiValue: true, sortable: true, groupable: true },
  { name: 'addr', title: '地址' },
  { name: 'time', title: '时间', dataKind: DataKind.DATETIME, sortable: true },
])

const LAYOUTS: Ref<TableLayoutProps[]> = ref([{
  id: 'hi',
  title: 'HI',
  layoutKind: LayoutKind.LIST,
  showSelectColumn: true,
  actionColumnRender: (record: { [key: string]: any }) => {
    return `<button class="btn-row-delete" data-id='${record.no}'>删除</button>`
  },
  columns: [{
    name: 'name',
  }, {
    name: 'stats',
  }, {
    name: 'no',
    width: 80,
    styles: { cursor: 'pointer' },
  }, {
    name: 'addr',
  }, {
    name: 'phone',
  }, {
    name: 'time',
  }],
  aggs: { name: AggregateKind.MIN },
  defaultSlice: {
    offsetNumber: 0,
    fetchNumber: 10,
    fetchNumbers: [5, 10, 20, 30, 50],
  },
}])

const STYLES: Ref<TableStyleProps> = ref({})

function getDictValue(columnName: string, dataValue: any) {
  if (columnName === 'name') {
    return NAME_DICT.find(dict => dict.value === dataValue)!.title
  }
  else if (columnName === 'stats') {
    return dataValue.split(',').map(val => STATS_DICT.find(dict => dict.value === val)!.title).join(',')
  }
  else {
    return dataValue
  }
}

function attachDict(data: { [key: string]: any }[]) {
  return data.map((d) => {
    if (d.name) {
      d[`name${DATA_DICT_POSTFIX}`] = [NAME_DICT.find(dict => dict.value === d.name)!]
    }
    if (d.stats) {
      d[`stats${DATA_DICT_POSTFIX}`] = d.stats.map((s) => { return STATS_DICT.find(dict => dict.value === s)! })
    }
    return d
  })
}

const events: TableEventProps = {
  loadData: async (columns?: string[], filters?: TableDataFilterProps[], sorts?: TableDataSortProps[], group?: TableDataGroupProps, aggs?: { [key: string]: AggregateKind }, hideSubData?: boolean, byGroupValue?: any, slices?: TableDataQuerySliceProps): Promise<TableDataResp | TableDataGroupResp[]> => {
    let data: { [key: string]: any }[] = JSON.parse(JSON.stringify(DATA))
    if (filters) {
      // TODO 支持多组
      filters.forEach((filter) => {
        data = data.filter((d) => {
          return filter.items.every((item) => {
            switch (item.operator) {
              case OperatorKind.EQ:
                return d[item.columnName] === item.value
              case OperatorKind.NE:
                return d[item.columnName] !== item.value
              case OperatorKind.LT:
                return d[item.columnName] < item.value
              case OperatorKind.LE:
                return d[item.columnName] <= item.value
              case OperatorKind.GT:
                return d[item.columnName] > item.value
              case OperatorKind.GE:
                return d[item.columnName] >= item.value
              case OperatorKind.IN:
                return d[item.columnName].includes(item.value)
              case OperatorKind.NOT_IN:
                return !d[item.columnName].includes(item.value)
              case OperatorKind.CONTAINS:
                return d[item.columnName].includes(item.value)
              case OperatorKind.NOT_CONTAINS:
                return !d[item.columnName].includes(item.value)
              case OperatorKind.STARTWITH:
                return d[item.columnName].startsWith(item.value)
              case OperatorKind.NOT_STARTWITH:
                return !d[item.columnName].startsWith(item.value)
              case OperatorKind.ENDWITH:
                return d[item.columnName].endsWith(item.value)
              case OperatorKind.NOT_ENDWITH:
                return !d[item.columnName].endsWith(item.value)
              case OperatorKind.IS_EMPTY:
                return d[item.columnName] === ''
              case OperatorKind.NOT_EMPTY:
                return d[item.columnName] !== ''
              default:
                return false
            }
          })
        })
      })
    }
    if (sorts) {
      sorts.forEach((sort) => {
        data = data.sort((a, b) => {
          if (sort.orderDesc) {
            return a[sort.columnName] - b[sort.columnName]
          }
          else {
            return b[sort.columnName] - a[sort.columnName]
          }
        })
      })
    }
    if (hideSubData) {
      data = data.filter((d) => {
        return d.pno === null
      })
    }
    if (byGroupValue && group) {
      // 只获取当前分组的数据
      data = data.filter(d => d[group.columnName] === byGroupValue)
    }
    if (group && !byGroupValue) {
      let dataGroup: { [key: string]: any[] } = IwUtils.groupBy(data, (d) => { return d[group.columnName] })
      if (group.hideEmptyRecord) {
        dataGroup = Object.fromEntries(Object.entries(dataGroup).filter(([_, value]) => value.length > 0))
      }
      const groupTotalNumber = Object.fromEntries(Object.entries(dataGroup).map(([key, value]) => {
        return [key, value.length]
      }),
      )
      if (slices) {
        dataGroup = Object.fromEntries(Object.entries(dataGroup).map(([key, value]) => {
          return [key, value.slice(slices.offsetNumber, slices.offsetNumber + slices.fetchNumber)]
        }),
        )
      }
      if (group.groupOrderDesc) {
        dataGroup = Object.fromEntries(
          Object.entries(dataGroup).sort((a, b) => b[0].localeCompare(a[0])),
        )
      }
      else {
        dataGroup = Object.fromEntries(
          Object.entries(dataGroup).sort((a, b) => a[0].localeCompare(b[0])),
        )
      }
      return Object.entries(dataGroup).map(([groupKey, data]) => {
        const aggsResult = {}
        if (aggs) {
          Object.keys(aggs).forEach((aggKey) => {
            const agg = aggs[aggKey]
            switch (agg) {
              case AggregateKind.COUNT:
                return aggsResult[aggKey] = data.filter(d => d[aggKey] !== undefined).length
              case AggregateKind.SUM:
                return aggsResult[aggKey] = data.reduce((acc, cur) => acc + cur[aggKey], 0)
              case AggregateKind.AVG:
                return aggsResult[aggKey] = data.reduce((acc, cur) => acc + cur[aggKey], 0) / data.length
              case AggregateKind.MAX:
                if (typeof data[0][aggKey] === 'string') {
                  return aggsResult[aggKey] = data.reduce((acc, cur) => acc[aggKey] > cur[aggKey] ? acc : cur)[aggKey]
                }
                else {
                  return aggsResult[aggKey] = Math.max(...data.map(d => d[aggKey]))
                }
              case AggregateKind.MIN:
                if (typeof data[0][aggKey] === 'string') {
                  return aggsResult[aggKey] = data.reduce((acc, cur) => acc[aggKey] < cur[aggKey] ? acc : cur)[aggKey]
                }
                else {
                  return aggsResult[aggKey] = Math.min(...data.map(d => d[aggKey]))
                }
              default:
                return aggsResult[aggKey] = data.filter(d => d[aggKey] !== undefined).length
            }
          })
        }
        if (columns) {
          data = data.map((d) => {
            return columns.reduce((acc, cur) => {
              acc[cur] = d[cur]
              return acc
            }, {})
          })
        }
        return {
          records: attachDict(data),
          totalNumber: groupTotalNumber[groupKey],
          aggs: aggsResult,
          groupValue: groupKey,
          groupShowTitle: getDictValue(group.columnName, groupKey),
        }
      })
    }
    else {
      const aggsResult = {}
      if (aggs) {
        Object.keys(aggs).forEach((aggKey) => {
          const agg = aggs[aggKey]
          switch (agg) {
            case AggregateKind.COUNT:
              return aggsResult[aggKey] = data.filter(d => d[aggKey] !== undefined).length
            case AggregateKind.SUM:
              return aggsResult[aggKey] = data.reduce((acc, cur) => acc + cur[aggKey], 0)
            case AggregateKind.AVG:
              return aggsResult[aggKey] = data.reduce((acc, cur) => acc + cur[aggKey], 0) / data.length
            case AggregateKind.MAX:
              if (typeof data[0][aggKey] === 'string') {
                return aggsResult[aggKey] = data.reduce((acc, cur) => acc[aggKey] > cur[aggKey] ? acc : cur)[aggKey]
              }
              else {
                return aggsResult[aggKey] = Math.max(...data.map(d => d[aggKey]))
              }
            case AggregateKind.MIN:
              if (typeof data[0][aggKey] === 'string') {
                return aggsResult[aggKey] = data.reduce((acc, cur) => acc[aggKey] < cur[aggKey] ? acc : cur)[aggKey]
              }
              else {
                return aggsResult[aggKey] = Math.min(...data.map(d => d[aggKey]))
              }
            default:
              return aggsResult[aggKey] = data.filter(d => d[aggKey] !== undefined).length
          }
        })
      }
      let records
      if (slices) {
        records = data.slice(slices.offsetNumber, slices.offsetNumber + slices.fetchNumber)
      }
      else {
        records = data
      }
      if (columns) {
        records = records.map((d) => {
          return columns.reduce((acc, cur) => {
            acc[cur] = d[cur]
            return acc
          }, {})
        })
      }
      return {
        records: attachDict(records),
        totalNumber: data.length,
        aggs: aggsResult,
      }
    }
  },

  newData: async (newRecords: { [key: string]: any }[]): Promise<{ [key: string]: any }[]> => {
    // TODO targetSortValue
    DATA.push(...newRecords)
    return JSON.parse(JSON.stringify(DATA))
  },

  copyData: async (targetRecordPks: any[]): Promise<{ [key: string]: any }[]> => {
    const newRecords = targetRecordPks.map((pk) => {
      const record = DATA.find(d => d.no === pk)
      return JSON.parse(JSON.stringify(record))
    })
    newRecords.forEach((record) => {
      record.no = Date.now().toString()
    })
    DATA.push(...newRecords)
    return JSON.parse(JSON.stringify(DATA))
  },

  modifyData: async (changedRecords: { [key: string]: any }[]): Promise<{ [key: string]: any }[]> => {
    changedRecords.forEach((changedRecord) => {
      // 不区别类型
    // eslint-disable-next-line eqeqeq
      const record = DATA.find(d => d.no == changedRecord.no)!
      Object.assign(record, changedRecord)
    })
    return JSON.parse(JSON.stringify(DATA))
  },

  deleteData: async (deletedRecordPks: any[]): Promise<boolean> => {
    // 不区别类型
    // eslint-disable-next-line eqeqeq
    DATA.splice(DATA.findIndex(d => d.no == deletedRecordPks[0]), 1)
    return true
  },

  selectData: async (_selectedRecordPks: any[]): Promise<boolean> => {
    selectedRecordPks.value = _selectedRecordPks
    return true
  },

  clickCell: async (clickedRecordPk: any, clickedColumnName: string): Promise<boolean> => {
    if (clickedColumnName === 'no') {
      // eslint-disable-next-line no-alert
      alert(`点击了序号${clickedRecordPk}`)
    }
    return true
  },

  modifyStyles: async (changedStyleProps: TableStyleProps): Promise<boolean> => {
    STYLES.value = changedStyleProps
    return true
  },

  newLayout: async (newLayoutProps: TableLayoutKernelProps): Promise<string> => {
    const id = Date.now().toString()
    LAYOUTS.value.push({
      id,
      ...newLayoutProps,
    })
    return id
  },

  modifyLayout: async (changedLayoutId: string, changedLayoutProps: TableLayoutModifyProps): Promise<boolean> => {
    const currLayout = LAYOUTS.value.find((layout) => { return layout.id === changedLayoutId })!
    if (changedLayoutProps.title) {
      currLayout.title = changedLayoutProps.title
    }
    if (changedLayoutProps.icon) {
      currLayout.icon = changedLayoutProps.icon
    }
    if (changedLayoutProps.filters) {
      currLayout.filters = changedLayoutProps.filters
    }
    if (changedLayoutProps.sorts) {
      currLayout.sorts = changedLayoutProps.sorts
    }
    if (changedLayoutProps.group) {
      currLayout.group = changedLayoutProps.group
    }
    if (changedLayoutProps.aggs) {
      currLayout.aggs = changedLayoutProps.aggs
    }
    if (changedLayoutProps.defaultSlice) {
      currLayout.defaultSlice = changedLayoutProps.defaultSlice
    }
    if (changedLayoutProps.groupSlices) {
      currLayout.groupSlices = changedLayoutProps.groupSlices
    }
    if (changedLayoutProps.subDataShowKind) {
      currLayout.subDataShowKind = changedLayoutProps.subDataShowKind
    }
    if (changedLayoutProps.columnSortedNames) {
      const leftColumnName = changedLayoutProps.columnSortedNames[0]
      const rightColumnName = changedLayoutProps.columnSortedNames[1]
      const leftIndex = currLayout.columns.findIndex((col) => { return col.name === leftColumnName })
      const rightIndex = currLayout.columns.findIndex((col) => { return col.name === rightColumnName })
      currLayout.columns.splice(rightIndex, 0, currLayout.columns.splice(leftIndex, 1)[0])
    }
    if (changedLayoutProps.newColumn) {
      currLayout.columns.push(changedLayoutProps.newColumn)
    }
    if (changedLayoutProps.changedColumn) {
      const col = currLayout.columns.find((col) => { return col.name === changedLayoutProps.changedColumn!.name })!
      Object.assign(col, changedLayoutProps.changedColumn)
    }
    if (changedLayoutProps.deletedColumnName) {
      currLayout.columns.splice(currLayout.columns.findIndex((col) => { return col.name === changedLayoutProps.deletedColumnName }), 1)
    }
    return true
  },

  deleteLayout: async (deletedLayoutId: string): Promise<boolean> => {
    LAYOUTS.value.splice(LAYOUTS.value.findIndex((layout) => { return layout.id === deletedLayoutId }), 1)
    return true
  },

  loadCellDictItems: async (columnName: string, filterValue?: any, slice?: TableDataQuerySliceProps): Promise<TableCellDictItemsResp> => {
    if (columnName === 'name') {
      let nameDict: TableCellDictItemProps[] = JSON.parse(JSON.stringify(NAME_DICT))
      if (filterValue) {
        nameDict = nameDict.filter((dict) => { return dict.title.includes(filterValue) })
      }
      const totalNumber = nameDict.length
      if (slice) {
        nameDict = nameDict.slice(slice.offsetNumber, slice.offsetNumber + slice.fetchNumber)
      }
      return {
        records: nameDict,
        totalNumber,
      }
    }
    else {
      let statsDict: TableCellDictItemProps[] = JSON.parse(JSON.stringify(STATS_DICT))
      if (filterValue) {
        statsDict = statsDict.filter((dict) => { return dict.title.includes(filterValue) })
      }
      const totalNumber = statsDict.length
      if (slice) {
        statsDict = statsDict.slice(slice.offsetNumber, slice.offsetNumber + slice.fetchNumber)
      }
      return {
        records: statsDict,
        totalNumber,
      }
    }
  },
}

onMounted(() => {
  IwUtils.delegateEvent('.iw-tt-table', 'click', '.btn-row-delete', (e) => {
    IwEvents.deleteData([(e.target as HTMLElement).dataset.id])
  })
},
)
</script>

<template>
  <div>选择中的行Id: {{ selectedRecordPks }}</div>
  <div style="height: 600px">
    <iw-task-table
      pk-column-name="no" parent-pk-column-name="pno" :columns="COLUMNS" :events="events" :layouts="LAYOUTS"
      :styles="STYLES"
    />
  </div>
</template>
