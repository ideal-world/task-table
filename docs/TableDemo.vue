<script setup lang="ts">
import type { Ref } from 'vue';
import { onMounted, ref, toRaw } from 'vue';
import { IwEvents, IwProps } from '../src';
import { IwUtils } from '../src/utils';

const selectedRecordPks: Ref<any[]> = ref([])

const NAME_DICT = [{ title: '星航', value: 'xh', avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg' }, { title: '星杨', value: 'xy', avatar: 'https://pic1.zhimg.com/v2-770e9580d5febfb49cbb23c409cea85d_r.jpg?source=1def8aca' }, { title: '星辰', value: 'xc' }]
const STATS_DICT = [{ title: '初始化', value: 'init', color: '#43ad7f7f' }, { title: '进行中', value: 'progress' }, { title: '有风险', value: 'risk', color: '#be14807f' }, { title: '已完成', value: 'finish' }, { title: '已关闭', value: 'close' }]

const DATA: { [key: string]: any }[] = [
  { no: 1, pno: null, name: 'v1.0优化任务集合', creator: 'xh', stats: ['init'], planStartTime: '2023-10-22', planEndTime: '2023-12-01' },
  { no: 2, pno: null, name: '测试报告导出', creator: 'xh', stats: ['init'], planStartTime: '2023-10-14', planEndTime: '2024-01-01', actualStartTime: '2023-10-15', actualEndTime: '2023-11-24' },
  { no: 3, pno: 1, name: '平台支持修改工程下默认分支', creator: 'xh', stats: ['progress', 'risk'], planStartTime: '2023-10-25', planEndTime: '2023-11-29' },
  { no: 4, pno: 1, name: '工作项优化', creator: 'xh', stats: ['init'], planStartTime: '2023-10-26', planEndTime: '2023-11-25' },
  { no: 5, pno: 1, name: '作业执行日志实时获取并增加搜索和支持定位', creator: 'xh', stats: ['init'], planStartTime: '2023-10-27', planEndTime: '2023-11-30' },
  { no: 6, pno: null, name: '制品文件支持下载和删除', creator: 'xh', stats: ['init'], planStartTime: '2023-10-28', planEndTime: '2023-11-28' },
  { no: 7, pno: null, name: '测试报告模板增加模板内容', creator: 'xh', stats: ['init'], planStartTime: '2023-10-29', planEndTime: '2023-11-25' },
  { no: 8, pno: 4, name: '工作项报表导出', creator: 'xh', stats: ['init'], planStartTime: '2023-10-30', planEndTime: '2023-11-24' },
  { no: 9, pno: 4, name: '工作项列表中显示关联的工作项数量', creator: 'xh', stats: ['init'], planStartTime: '2023-10-31', planEndTime: '2023-11-24' },
  { no: 10, pno: 8, name: '报表导出组件支持动态字段', creator: 'xh', stats: ['close'], planStartTime: '2023-11-1', planEndTime: '2023-11-24' },
  { no: 11, pno: null, name: '项目新增字段项目类型', creator: 'xh', stats: ['close'], planStartTime: '2023-11-2' },
  { no: 12, pno: null, name: '账号新增用工性质字段', creator: 'xh', stats: ['close'], planStartTime: '2023-11-3' },
  { no: 13, pno: null, name: '报表的纬度支持相关属性', creator: 'xh', stats: ['close'], planStartTime: '2023-11-4', planEndTime: '2023-12-24' },
  { no: 14, pno: null, name: '人员提供接口筛选', creator: 'xh', stats: ['close'], planStartTime: '2023-11-5', planEndTime: '2023-12-24' },
  { no: 15, pno: null, name: '报表支持一个主题选多次', creator: 'xh', stats: ['close'], planStartTime: '2023-11-6' },
  { no: 16, pno: 8, name: '执行用例结果页面增加创缺陷按钮', creator: 'xh', stats: ['close'], planStartTime: '2023-11-7' },
  { no: 17, pno: null, name: '资源实例根据时间添加倒序排列', creator: 'xh', stats: ['finish'], planStartTime: '2023-11-8' },
  { no: 18, pno: null, name: '新建引用已经归档的版本', creator: 'xy', stats: ['finish'], planStartTime: '2023-11-9', planEndTime: '2023-12-24' },
  { no: 19, pno: null, name: '归档镜像包依赖包合并查询', creator: 'xy', stats: ['finish'], planStartTime: '2023-11-10', planEndTime: '2023-12-24' },
  { no: 20, pno: null, name: '制品文件支持下载和删除', creator: 'xh', stats: ['finish'], planStartTime: '2023-11-11' },
  { no: 21, pno: null, name: '作业支持定时执行', creator: 'xh', stats: ['finish'], planStartTime: '2023-11-12', planEndTime: '2023-11-24' },
  { no: 22, pno: 1, name: '执行过程中打印变量', creator: 'xh', stats: ['finish'], planStartTime: '2023-11-13' },
  { no: 23, pno: null, name: 'MinIO路径按项目隔离', creator: 'xh', stats: ['finish'], planStartTime: '2023-11-14' },
  { no: 24, pno: null, name: '附件支持预览', creator: 'xh', stats: ['progress', 'risk'], planStartTime: '2023-11-15', planEndTime: '2023-12-24' },
  { no: 25, pno: null, name: '模板及工作流逻辑优化', creator: 'xh', stats: ['close'], planStartTime: '2023-11-16' },
  { no: 26, pno: null, name: '工作流支持EDA异步消息', creator: 'xy', stats: ['close'], planStartTime: '2023-11-17', planEndTime: '2024-01-24' },
  { no: 27, pno: null, name: '工程提交记录支持建立分支货标签', creator: 'xy', stats: ['close'], planStartTime: '2023-11-18', planEndTime: '2024-01-24' },
  { no: 28, pno: null, name: '报表统计增加数据跳转功能', creator: 'xh', stats: ['close'], planStartTime: '2023-11-19' },
  { no: 29, pno: null, name: '代码评审与合并', creator: 'xh', stats: ['close'], planStartTime: '2023-11-20' },
]

function getDictValue(columnName: string, dataValue: any) {
  if (columnName === 'creator') {
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
    if (d.creator) {
      d[`creator${IwProps.DATA_DICT_POSTFIX}`] = [NAME_DICT.find(dict => dict.value === d.creator)!]
    }
    if (d.stats) {
      d[`stats${IwProps.DATA_DICT_POSTFIX}`] = d.stats.map((s) => { return STATS_DICT.find(dict => dict.value === s)! })
    }
    return d
  })
}

const events: IwProps.TableEventProps = {
  loadData: async (columns?: string[], quickSearchContent?: string, filters?: IwProps.FeatureFilterDataGroupProps[], sorts?: IwProps.FeatureSortDataItemProps[], group?: IwProps.FeatureGroupDataItemProps, aggs?: IwProps.FeatureAggDataItemProps[], hideSubData?: boolean, byGroupValue?: any, slices?: IwProps.DataQuerySliceReq, _returnOnlyAggs?: boolean): Promise<IwProps.DataResp | IwProps.FeatureGroupDataResp[]> => {
    let data: { [key: string]: any }[] = toRaw(DATA)
    if (quickSearchContent) {
      data = data.filter((d) => {
        return d.name.includes(quickSearchContent)
      })
    }

    if (filters) {
      // TODO 支持多组
      filters.forEach((filter) => {
        data = data.filter((d) => {
          return filter.items.every((item) => {
            switch (item.operator) {
              case IwProps.OperatorKind.EQ:
                // eslint-disable-next-line eqeqeq
                return d[item.columnName] == item.value
              case IwProps.OperatorKind.NE:
                // eslint-disable-next-line eqeqeq
                return d[item.columnName] != item.value
              case IwProps.OperatorKind.LT:
                return d[item.columnName] < item.value
              case IwProps.OperatorKind.LE:
                return d[item.columnName] <= item.value
              case IwProps.OperatorKind.GT:
                return d[item.columnName] > item.value
              case IwProps.OperatorKind.GE:
                return d[item.columnName] >= item.value
              case IwProps.OperatorKind.IN:
                return d[item.columnName].includes(item.value)
              case IwProps.OperatorKind.NOT_IN:
                return !d[item.columnName].includes(item.value)
              case IwProps.OperatorKind.CONTAINS:
                return d[item.columnName].includes(item.value)
              case IwProps.OperatorKind.NOT_CONTAINS:
                return !d[item.columnName].includes(item.value)
              case IwProps.OperatorKind.STARTWITH:
                return d[item.columnName].startsWith(item.value)
              case IwProps.OperatorKind.NOT_STARTWITH:
                return !d[item.columnName].startsWith(item.value)
              case IwProps.OperatorKind.ENDWITH:
                return d[item.columnName].endsWith(item.value)
              case IwProps.OperatorKind.NOT_ENDWITH:
                return !d[item.columnName].endsWith(item.value)
              case IwProps.OperatorKind.IS_EMPTY:
                return d[item.columnName] === ''
              case IwProps.OperatorKind.NOT_EMPTY:
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
          aggs.forEach((agg) => {
            switch (agg.aggKind) {
              case IwProps.FeatureAggDataKind.COUNT:
                return aggsResult[agg.columnName] = data.filter(d => d[agg.columnName] !== undefined).length
              case IwProps.FeatureAggDataKind.SUM:
                return aggsResult[agg.columnName] = data.reduce((acc, cur) => acc + cur[agg.columnName], 0)
              case IwProps.FeatureAggDataKind.AVG:
                return aggsResult[agg.columnName] = data.reduce((acc, cur) => acc + cur[agg.columnName], 0) / data.length
              case IwProps.FeatureAggDataKind.MAX:
                if (data.length === 0) {
                  return aggsResult[agg.columnName] = ''
                }
                else if (typeof data[0][agg.columnName] === 'string') {
                  return aggsResult[agg.columnName] = data.reduce((acc, cur) => acc[agg.columnName] > cur[agg.columnName] ? acc : cur)[agg.columnName]
                }
                else {
                  return aggsResult[agg.columnName] = Math.max(...data.map(d => d[agg.columnName]))
                }
              case IwProps.FeatureAggDataKind.MIN:
                if (data.length === 0) {
                  return aggsResult[agg.columnName] = ''
                }
                else if (typeof data[0][agg.columnName] === 'string') {
                  return aggsResult[agg.columnName] = data.reduce((acc, cur) => acc[agg.columnName] < cur[agg.columnName] ? acc : cur)[agg.columnName]
                }
                else {
                  return aggsResult[agg.columnName] = Math.min(...data.map(d => d[agg.columnName]))
                }
              default:
                return aggsResult[agg.columnName] = data.filter(d => d[agg.columnName] !== undefined).length
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
        aggs.forEach((agg) => {
          switch (agg.aggKind) {
            case IwProps.FeatureAggDataKind.COUNT:
              return aggsResult[agg.columnName] = data.filter(d => d[agg.columnName] !== undefined).length
            case IwProps.FeatureAggDataKind.SUM:
              return aggsResult[agg.columnName] = data.reduce((acc, cur) => acc + cur[agg.columnName], 0)
            case IwProps.FeatureAggDataKind.AVG:
              return aggsResult[agg.columnName] = data.reduce((acc, cur) => acc + cur[agg.columnName], 0) / data.length
            case IwProps.FeatureAggDataKind.MAX:
              if (data.length === 0) {
                return aggsResult[agg.columnName] = ''
              }
              else if (typeof data[0][agg.columnName] === 'string') {
                return aggsResult[agg.columnName] = data.reduce((acc, cur) => acc[agg.columnName] > cur[agg.columnName] ? acc : cur)[agg.columnName]
              }
              else {
                return aggsResult[agg.columnName] = Math.max(...data.map(d => d[agg.columnName]))
              }
            case IwProps.FeatureAggDataKind.MIN:
              if (data.length === 0) {
                return aggsResult[agg.columnName] = ''
              }
              else if (typeof data[0][agg.columnName] === 'string') {
                return aggsResult[agg.columnName] = data.reduce((acc, cur) => acc[agg.columnName] < cur[agg.columnName] ? acc : cur)[agg.columnName]
              }
              else {
                return aggsResult[agg.columnName] = Math.min(...data.map(d => d[agg.columnName]))
              }
            default:
              return aggsResult[agg.columnName] = data.filter(d => d[agg.columnName] !== undefined).length
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
      // 不区别类型
    // eslint-disable-next-line eqeqeq
      const record = DATA.find(d => d.no == pk)
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

  clickCell: async (clickedRecordPk: any, clickedColumnName: string, _byLayoutId: string, _byLayoutKind: IwProps.LayoutKind): Promise<boolean> => {
    if (clickedColumnName === 'no') {
      // eslint-disable-next-line no-alert
      alert(`点击了序号${clickedRecordPk}`)
    }
    return true
  },

  modifyStyles: async (changedStyleProps: IwProps.TableStyleProps): Promise<boolean> => {
    // eslint-disable-next-line ts/no-use-before-define
    tableProps.value.styles = changedStyleProps
    return true
  },

  newLayout: async (newLayoutProps: IwProps.LayoutProps): Promise<string> => {
    const id = Date.now().toString()
    // eslint-disable-next-line ts/no-use-before-define
    tableProps.value.layouts.push({
      id,
      ...newLayoutProps,
    })
    return id
  },

  modifyLayout: async (changedLayoutId: string, changedLayoutProps: IwProps.LayoutModifyProps): Promise<boolean> => {
    // eslint-disable-next-line ts/no-use-before-define
    const currLayout = tableProps.value.layouts.find((layout) => { return layout.id === changedLayoutId })!
    if (changedLayoutProps.title) {
      currLayout.title = changedLayoutProps.title
    }
    if (changedLayoutProps.icon) {
      currLayout.icon = changedLayoutProps.icon
    }
    if (changedLayoutProps.slice) {
      currLayout.slice = changedLayoutProps.slice
    }
    if (changedLayoutProps.groupSlices) {
      currLayout.groupSlices = changedLayoutProps.groupSlices
    }
    if (changedLayoutProps.subDataShowKind) {
      currLayout.subDataShowKind = changedLayoutProps.subDataShowKind
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

    if (changedLayoutProps.features.filterData?.filters) {
      currLayout.features.filterData!.filters = changedLayoutProps.features.filterData.filters
    }
    if (changedLayoutProps.features.sortData?.sorts) {
      currLayout.features.sortData!.sorts = changedLayoutProps.features.sortData.sorts
    }
    if (changedLayoutProps.features.groupData?.modify) {
      currLayout.features.groupData!.group = changedLayoutProps.features.groupData.modify
    }
    if (changedLayoutProps.features.groupData?.remove) {
      currLayout.features.groupData!.group = undefined
    }
    if (changedLayoutProps.features.aggData?.aggs) {
      currLayout.features.aggData!.aggs = changedLayoutProps.features.aggData?.aggs
    }
    if (changedLayoutProps.features.editData?.columnNames) {
      currLayout.features.editData!.columnNames = changedLayoutProps.features.editData?.columnNames
    }
    if (changedLayoutProps.features.selectData?.selectedDataPks) {
      currLayout.features.selectData!.selectedDataPks = changedLayoutProps.features.selectData?.selectedDataPks
    }
    if (changedLayoutProps.features.actionColumn?.width) {
      currLayout.features.actionColumn!.width = changedLayoutProps.features.actionColumn?.width
    }
    if (changedLayoutProps.features.ganttLayout?.showKind) {
      currLayout.features.ganttLayout!.showKind = changedLayoutProps.features.ganttLayout?.showKind
    }
    if (changedLayoutProps.features.ganttLayout?.timelineWidth) {
      currLayout.features.ganttLayout!.timelineWidth = changedLayoutProps.features.ganttLayout?.timelineWidth
    }
    return true
  },

  deleteLayout: async (deletedLayoutId: string): Promise<boolean> => {
    // eslint-disable-next-line ts/no-use-before-define
    tableProps.value.layouts.splice(tableProps.value.layouts.findIndex((layout) => { return layout.id === deletedLayoutId }), 1)
    return true
  },

  loadHolidays: async (_startTime: Date, _endTime: Date): Promise<Date[]> => {
    return [
      new Date('2023-10-01'),
      new Date('2023-10-07'),
      new Date('2023-10-08'),
      new Date('2023-10-14'),
      new Date('2023-10-15'),
      new Date('2023-10-21'),
      new Date('2023-10-22'),
      new Date('2023-10-28'),
      new Date('2023-10-29'),
      new Date('2023-11-04'),
      new Date('2023-11-05'),
      new Date('2023-11-11'),
      new Date('2023-11-12'),
      new Date('2023-11-18'),
      new Date('2023-11-19'),
      new Date('2023-11-25'),
      new Date('2023-11-26'),
      new Date('2023-12-02'),
      new Date('2023-12-03'),
      new Date('2023-12-09'),
      new Date('2023-12-10'),
      new Date('2023-12-16'),
      new Date('2023-12-17'),
      new Date('2023-12-23'),
      new Date('2023-12-24'),
      new Date('2023-12-30'),
      new Date('2023-12-21'),
      new Date('2024-01-06'),
      new Date('2024-01-07'),
      new Date('2024-01-13'),
      new Date('2024-01-14'),
    ]
  },

  loadCellDictItems: async (columnName: string, filterValue?: any, slice?: IwProps.DataQuerySliceReq): Promise<IwProps.FeatureUseDictItemsResp> => {
    if (columnName === 'name') {
      let nameDict: IwProps.FeatureUseDictItemProps[] = JSON.parse(JSON.stringify(NAME_DICT))
      if (filterValue) {
        nameDict = nameDict.filter((dict) => { return dict.title.includes(filterValue) || dict.value.includes(filterValue) })
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
      let statsDict: IwProps.FeatureUseDictItemProps[] = JSON.parse(JSON.stringify(STATS_DICT))
      if (filterValue) {
        statsDict = statsDict.filter((dict) => { return dict.title.includes(filterValue) || dict.value.includes(filterValue) })
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

  loadCellDictItemsWithMultiConds: async (conds: { [columnName: string]: any[] }, slice?: IwProps.DataQuerySliceReq): Promise<{ [columnName: string]: IwProps.FeatureUseDictItemsResp }> => {
    const resp = {}
    Object.entries(conds).forEach(([columnName, values]) => {
      if (columnName === 'name') {
        let nameDict: IwProps.FeatureUseDictItemProps[] = JSON.parse(JSON.stringify(NAME_DICT))
        nameDict = nameDict.filter((dict) => { return values.find(val => dict.title.includes(val) || dict.value.includes(val)) })
        const totalNumber = nameDict.length
        if (slice) {
          nameDict = nameDict.slice(slice.offsetNumber, slice.offsetNumber + slice.fetchNumber)
        }
        resp[columnName] = {
          records: nameDict,
          totalNumber,
        }
      }
      else {
        let statsDict: IwProps.FeatureUseDictItemProps[] = JSON.parse(JSON.stringify(STATS_DICT))
        statsDict = statsDict.filter((dict) => { return values.find(val => dict.title.includes(val) || dict.value.includes(val)) })
        const totalNumber = statsDict.length
        if (slice) {
          statsDict = statsDict.slice(slice.offsetNumber, slice.offsetNumber + slice.fetchNumber)
        }
        resp[columnName] = {
          records: statsDict,
          totalNumber,
        }
      }
    })
    return resp
  },
}

const tableColumns = [
  IwProps.TableColumnPropsBuilder.create('no').title('ID').dataKind(IwProps.DataKind.NUMBER).width(80).styles({ cursor: 'pointer' }).features({ sortData: true }).build(),
  IwProps.TableColumnPropsBuilder.create('pno').title('父ID').dataKind(IwProps.DataKind.NUMBER).hide(true).build(),
  IwProps.TableColumnPropsBuilder.create('name').title('名称').dataKind(IwProps.DataKind.NUMBER).width(300).render((record: { [key: string]: any }, layoutKind: IwProps.LayoutKind) => {
    if (layoutKind === IwProps.LayoutKind.LIST) {
      return record.stats.includes('risk') ? `<span style='color:red'>${record.name}</span>` : record.name
    }
    else {
      return record.name
    }
  }).features({ sortData: true }).build(),
  IwProps.TableColumnPropsBuilder.create('creator').title('创建人').features({ useDict: true, dictEditable: true, sortData: true, groupData: true }).build(),
  IwProps.TableColumnPropsBuilder.create('stats').title('状态').multiValue(true).features({ useDict: true, dictEditable: true, sortData: true, groupData: true }).build(),
  IwProps.TableColumnPropsBuilder.create('planStartTime').title('计划开始时间').dataKind(IwProps.DataKind.DATETIME).features({ sortData: true }).build(),
  IwProps.TableColumnPropsBuilder.create('planEndTime').title('计划结束时间').dataKind(IwProps.DataKind.DATETIME).features({ sortData: true }).build(),
  IwProps.TableColumnPropsBuilder.create('actualStartTime').title('实际开始时间').dataKind(IwProps.DataKind.DATETIME).features({ sortData: true }).build(),
  IwProps.TableColumnPropsBuilder.create('actualEndTime').title('实际结束时间').dataKind(IwProps.DataKind.DATETIME).features({ sortData: true }).build(),
]

const slice = IwProps.DataSlicePropsBuilder.create().fetchNumbers([5, 10, 20, 30, 50]).build()

const tableFeatures = {
  multiLayouts: IwProps.FeatureMultiLayoutsInitPropsBuilder.create().build(),
  quickSearch: IwProps.FeatureQuickSearchInitPropsBuilder.create('请输入姓名').build(),
  settingTable: IwProps.FeatureSettingTableInitPropsBuilder.create().build(),
  useDict: IwProps.FeatureUseDictInitPropsBuilder.create().build(),
  ganttLayout: IwProps.FeatureGanttLayoutInitPropsBuilder.create('planStartTime', 'planEndTime').actualStartTimeColumnName('actualStartTime').actualEndTimeColumnName('actualEndTime').timelineWidth(500).build(),
  actionColumn: IwProps.FeatureActionColumnInitPropsBuilder.create((record: { [key: string]: any }, _layoutKind: IwProps.LayoutKind) => {
    return `<button class="btn-row-delete" style="margin-right:2px" data-id='${record.no}'>删除</button> <button class="btn-row-copy" data-id='${record.no}'>复制</button>`
  }).width(100).build(),
  selectData: IwProps.FeatureSelectDataInitPropsBuilder.create().build(),
  aggData: IwProps.FeatureAggDataInitPropsBuilder.create().build(),
  filterData: IwProps.FeatureFilterDataInitPropsBuilder.create().build(),
  sortData: IwProps.FeatureSortDataInitPropsBuilder.create().build(),
  groupData: IwProps.FeatureGroupDataInitPropsBuilder.create().build(),
  editData: IwProps.FeatureEditDataInitPropsBuilder.create().build(),
}

const layouts = [
  IwProps.LayoutPropsBuilder.extend('gantt demo', IwProps.LayoutKind.GANTT, 'no', tableColumns, slice, tableFeatures).columns([
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'name')!).build(),
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'creator')!).build(),
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'no')!).build(),
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'planStartTime')!).build(),
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'planEndTime')!).build(),
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'actualStartTime')!).build(),
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'actualEndTime')!).build(),
  ]).build(),
  IwProps.LayoutPropsBuilder.extend('list demo', IwProps.LayoutKind.LIST, 'no', tableColumns, slice, tableFeatures).columns([
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'name')!).build(),
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'stats')!).build(),
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'creator')!).build(),
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'no')!).build(),
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'planStartTime')!).build(),
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'planEndTime')!).build(),
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'actualStartTime')!).build(),
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'actualEndTime')!).build(),
  ]).features({
    aggData: IwProps.FeatureAggDataInitPropsBuilder.create().aggs([
      {
        columnName: 'name',
        aggKind: IwProps.FeatureAggDataKind.MIN,
      },
    ]).build(),
  }).build(),
  IwProps.LayoutPropsBuilder.extend('multiple header demo', IwProps.LayoutKind.LIST, 'no', tableColumns, slice, tableFeatures).columns([
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'name')!).build(),
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'creator')!).build(),
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'stats')!).build(),
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'no')!).build(),
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'planStartTime')!).categoryTitle('Time').build(),
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'planEndTime')!).categoryTitle('Time').build(),
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'actualStartTime')!).build(),
    IwProps.LayoutColumnPropsBuilder.extend(tableColumns.find(col => col.name === 'actualEndTime')!).build(),
  ]).features({
    aggData: IwProps.FeatureAggDataInitPropsBuilder.create().aggs([
      {
        columnName: 'name',
        aggKind: IwProps.FeatureAggDataKind.MIN,
      },
    ]).build(),
  }).build(),
]

const tableProps: Ref<IwProps.TableProps> = ref(IwProps.TablePropsBuilder.create('no', tableColumns, layouts, events).parentPkColumnName('pno').features(tableFeatures).slice(slice).build())

onMounted(() => {
  IwUtils.delegateEvent('.iw-tt', 'click', '.btn-row-delete', (e) => {
    IwEvents.deleteData([(e.target as HTMLElement).dataset.id])
  })
  IwUtils.delegateEvent('.iw-tt', 'click', '.btn-row-copy', (e) => {
    IwEvents.copyData([(e.target as HTMLElement).dataset.id])
  })
})
</script>

<template>
  <div>选择中的行Id: {{ selectedRecordPks }}</div>
  <div style="height: 600px">
    <iw-task-table v-bind="tableProps" />
  </div>
</template>
