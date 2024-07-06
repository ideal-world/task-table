<script setup lang="ts">
import type { Ref } from 'vue';
import { onMounted, ref, toRaw } from 'vue';
import { IwEvents, IwProps, IwUtils } from '../src';
import type { EditableDataResp } from '../src/props';

const selectedRecordPks: Ref<any[]> = ref([])

const NAME_DICT = [{ title: '星航', value: 'xh', avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg' }, { title: '星杨', value: 'xy', avatar: 'https://pic1.zhimg.com/v2-770e9580d5febfb49cbb23c409cea85d_r.jpg' }, { title: '星辰', value: 'xc' }]
const STATS_DICT = [{ title: '初始化', value: 'init', color: '#43ad7f7f' }, { title: '进行中', value: 'progress' }, { title: '有风险', value: 'risk', color: '#be14807f' }, { title: '已完成', value: 'finish' }, { title: '已关闭', value: 'close' }]

const DATA: { [columnName: string]: any }[] = [
  { no: 1, pno: null, name: 'v1.0优化任务集合', creator: 'xh', stats: ['init'], planStartTime: '2023-10-22', planEndTime: '2023-12-01', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: 'https://idealworld.group/img/home-bg.jpg' },
  { no: 2, pno: null, name: '测试报告导出', creator: 'xh', stats: ['init'], planStartTime: '2023-10-14', planEndTime: '2024-01-01', actualStartTime: '2023-10-15', actualEndTime: '2023-11-24', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: 'https://idealworld.group/img/home-bg.jpg' },
  { no: 3, pno: 1, name: '平台支持修改工程下默认分支', creator: 'xh', stats: ['progress', 'risk'], planStartTime: '2023-10-25', planEndTime: '2023-11-29', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: '' },
  { no: 4, pno: 1, name: '工作项优化', creator: 'xh', stats: ['init'], planStartTime: '2023-10-26', planEndTime: '2023-11-25', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: 'https://idealworld.group/img/home-bg.jpg' },
  { no: 5, pno: 1, name: '作业执行日志实时获取并增加搜索和支持定位', creator: 'xh', stats: ['init'], planStartTime: '2023-10-27', planEndTime: '2023-11-30', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: '' },
  { no: 6, pno: null, name: '制品文件支持下载和删除', creator: 'xh', stats: ['init'], planStartTime: '2023-10-28', planEndTime: '2023-11-28', disabled: true, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: '' },
  { no: 7, pno: null, name: '测试报告模板增加模板内容', creator: 'xh', stats: ['init'], planStartTime: '2023-10-29', planEndTime: '2023-11-25', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: '' },
  { no: 8, pno: 4, name: '工作项报表导出', creator: 'xh', stats: ['init'], planStartTime: '2023-10-30', planEndTime: '2023-11-24', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: '' },
  { no: 9, pno: 4, name: '工作项列表中显示关联的工作项数量', creator: 'xh', stats: ['init'], planStartTime: '2023-10-31', planEndTime: '2023-11-24', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: '' },
  { no: 10, pno: 8, name: '报表导出组件支持动态字段', creator: 'xh', stats: ['close'], planStartTime: '2023-11-1', planEndTime: '2023-11-24', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: '' },
  { no: 11, pno: null, name: '项目新增字段项目类型', creator: 'xh', stats: ['close'], planStartTime: '2023-11-2', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: '' },
  { no: 12, pno: null, name: '账号新增用工性质字段', creator: 'xh', stats: ['close'], planStartTime: '2023-11-3', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: '' },
  { no: 13, pno: null, name: '报表的纬度支持相关属性', creator: 'xh', stats: ['close'], planStartTime: '2023-11-4', planEndTime: '2023-12-24', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: '' },
  { no: 14, pno: null, name: '人员提供接口筛选', creator: 'xh', stats: ['close'], planStartTime: '2023-11-5', planEndTime: '2023-12-24', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: '' },
  { no: 15, pno: null, name: '报表支持一个主题选多次', creator: 'xh', stats: ['close'], planStartTime: '2023-11-6', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: '' },
  { no: 16, pno: 8, name: '执行用例结果页面增加创缺陷按钮', creator: 'xh', stats: ['close'], planStartTime: '2023-11-7', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: '' },
  { no: 17, pno: null, name: '资源实例根据时间添加倒序排列', creator: 'xh', stats: ['finish'], planStartTime: '2023-11-8', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: '' },
  { no: 18, pno: null, name: '新建引用已经归档的版本', creator: 'xy', stats: ['finish'], planStartTime: '2023-11-9', planEndTime: '2023-12-24', disabled: false, avatar: 'https://pic1.zhimg.com/v2-770e9580d5febfb49cbb23c409cea85d_r.jpg', attachment: '' },
  { no: 19, pno: null, name: '归档镜像包依赖包合并查询', creator: 'xy', stats: ['finish'], planStartTime: '2023-11-10', planEndTime: '2023-12-24', disabled: false, avatar: 'https://pic1.zhimg.com/v2-770e9580d5febfb49cbb23c409cea85d_r.jpg', attachment: '' },
  { no: 20, pno: null, name: '制品文件支持下载和删除', creator: 'xh', stats: ['finish'], planStartTime: '2023-11-11', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: '' },
  { no: 21, pno: null, name: '作业支持定时执行', creator: 'xh', stats: ['finish'], planStartTime: '2023-11-12', planEndTime: '2023-11-24', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: '' },
  { no: 22, pno: 1, name: '执行过程中打印变量', creator: 'xh', stats: ['finish'], planStartTime: '2023-11-13', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: '' },
  { no: 23, pno: null, name: 'MinIO路径按项目隔离', creator: 'xh', stats: ['finish'], planStartTime: '2023-11-14', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: '' },
  { no: 24, pno: null, name: '附件支持预览', creator: 'xh', stats: ['progress', 'risk'], planStartTime: '2023-11-15', planEndTime: '2023-12-24', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: '' },
  { no: 25, pno: null, name: '模板及工作流逻辑优化', creator: 'xh', stats: ['close'], planStartTime: '2023-11-16', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: '' },
  { no: 26, pno: null, name: '工作流支持EDA异步消息', creator: 'xy', stats: ['close'], planStartTime: '2023-11-17', planEndTime: '2024-01-24', disabled: false, avatar: 'https://pic1.zhimg.com/v2-770e9580d5febfb49cbb23c409cea85d_r.jpg', attachment: '' },
  { no: 27, pno: null, name: '工程提交记录支持建立分支货标签', creator: 'xy', stats: ['close'], planStartTime: '2023-11-18', planEndTime: '2024-01-24', disabled: false, avatar: 'https://pic1.zhimg.com/v2-770e9580d5febfb49cbb23c409cea85d_r.jpg', attachment: '' },
  { no: 28, pno: null, name: '报表统计增加数据跳转功能', creator: 'xh', stats: ['close'], planStartTime: '2023-11-19', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: '' },
  { no: 29, pno: null, name: '代码评审与合并', creator: 'xh', stats: ['close'], planStartTime: '2023-11-20', disabled: false, avatar: 'https://pic1.zhimg.com/v2-0d812d532b66d581fd9e0c7ca2541680_r.jpg', attachment: '' },
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

function attachDict(data: { [columnName: string]: any }[]) {
  return data.map((d) => {
    if (d.creator) {
      d[`creator${IwProps.DATA_DICT_POSTFIX}`] = [NAME_DICT.find(dict => dict.value === d.creator)!]
    }
    if (d.stats) {
      d[`stats${IwProps.DATA_DICT_POSTFIX}`] = d.stats.map((s) => {
        return STATS_DICT.find(dict => dict.value === s)!
      })
    }
    return d
  })
}

const events: IwProps.TableEventProps = {
  loadData: async (quickSearchContent?: string, filter?: IwProps.FilterDataProps, sort?: IwProps.SortDataProps, group?: IwProps.GroupDataProps, agg?: IwProps.AggDataProps, hideSubData?: boolean, byGroupValue?: any, slice?: IwProps.DataQuerySliceReq, returnColumnNames?: string[], _returnOnlyAgg?: boolean): Promise<IwProps.DataResp | IwProps.DataGroupResp[]> => {
    let data: { [columnName: string]: any }[] = toRaw(DATA)
    if (quickSearchContent) {
      data = data.filter((d) => {
        return d.name.includes(quickSearchContent)
      })
    }

    if (filter) {
      // TODO 支持多组
      filter.groups.forEach((filter) => {
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
              case IwProps.OperatorKind.IN:{
                // eslint-disable-next-line ts/no-use-before-define
                if (columns.find(col => col.name === item.columnName)!.multiValue) {
                  return d[item.columnName].some((v: any) => item.value.includes(v))
                }
                else {
                  return d[item.columnName].includes(item.value)
                }
              }
              case IwProps.OperatorKind.NOT_IN:{
                // eslint-disable-next-line ts/no-use-before-define
                if (columns.find(col => col.name === item.columnName)!.multiValue) {
                  return !d[item.columnName].some((v: any) => item.value.includes(v))
                }
                else {
                  return !d[item.columnName].includes(item.value)
                }
              }
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
    if (sort) {
      sort.items.forEach((sort) => {
        data.sort((a, b) => {
          if (sort.orderDesc) {
            return typeof a[sort.columnName] === 'number' ? b[sort.columnName] - a[sort.columnName] : b[sort.columnName].localeCompare(a[sort.columnName])
          }
          else {
            return typeof a[sort.columnName] === 'number' ? a[sort.columnName] - b[sort.columnName] : a[sort.columnName].localeCompare(b[sort.columnName])
          }
        })
      })
    }
    if (hideSubData) {
      data = data.filter((d) => {
        return d.pno === null
      })
    }
    if (byGroupValue && group && group.item) {
      // 只获取当前分组的数据
      data = data.filter((d) => {
        // eslint-disable-next-line ts/no-use-before-define
        if (columns.find(col => col.name === group.item!.columnName)?.multiValue) {
          return d[group.item!.columnName].includes(byGroupValue)
        }
        else {
          return d[group.item!.columnName] === byGroupValue
        }
      })
    }
    if (group && group.item && !byGroupValue) {
      let dataGroup: { [key: string]: any[] } = IwUtils.basic.groupBy(data, (d) => {
        return d[group.item!.columnName]
      })
      if (group.item.hideEmptyRecord) {
        dataGroup = Object.fromEntries(Object.entries(dataGroup).filter(([_, value]) => value.length > 0))
      }
      const groupTotalNumber = Object.fromEntries(Object.entries(dataGroup).map(([key, value]) => {
        return [key, value.length]
      }),
      )
      if (slice) {
        dataGroup = Object.fromEntries(Object.entries(dataGroup).map(([key, value]) => {
          return [key, value.slice(slice.offsetNumber, slice.offsetNumber + slice.fetchNumber)]
        }),
        )
      }
      if (group.item.orderDesc) {
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
        const aggResult = {}
        if (agg) {
          agg.items.forEach((agg) => {
            switch (agg.aggKind) {
              case IwProps.AggregateKind.COUNT:
                return aggResult[agg.columnName] = data.filter(d => d[agg.columnName] !== undefined).length
              case IwProps.AggregateKind.SUM:
                return aggResult[agg.columnName] = data.reduce((acc, cur) => acc + cur[agg.columnName], 0)
              case IwProps.AggregateKind.AVG:
                return aggResult[agg.columnName] = data.reduce((acc, cur) => acc + cur[agg.columnName], 0) / data.length
              case IwProps.AggregateKind.MAX:
                if (data.length === 0) {
                  return aggResult[agg.columnName] = ''
                }
                else if (typeof data[0][agg.columnName] === 'string') {
                  return aggResult[agg.columnName] = data.reduce((acc, cur) => acc[agg.columnName] > cur[agg.columnName] ? acc : cur)[agg.columnName]
                }
                else {
                  return aggResult[agg.columnName] = Math.max(...data.map(d => d[agg.columnName]))
                }
              case IwProps.AggregateKind.MIN:
                if (data.length === 0) {
                  return aggResult[agg.columnName] = ''
                }
                else if (typeof data[0][agg.columnName] === 'string') {
                  return aggResult[agg.columnName] = data.reduce((acc, cur) => acc[agg.columnName] < cur[agg.columnName] ? acc : cur)[agg.columnName]
                }
                else {
                  return aggResult[agg.columnName] = Math.min(...data.map(d => d[agg.columnName]))
                }
              default:
                return aggResult[agg.columnName] = data.filter(d => d[agg.columnName] !== undefined).length
            }
          })
        }
        if (returnColumnNames) {
          data = data.map((d) => {
            return returnColumnNames.reduce((acc, cur) => {
              acc[cur] = d[cur]
              return acc
            }, {})
          })
        }
        return {
          records: attachDict(data),
          totalNumber: groupTotalNumber[groupKey],
          aggs: aggResult,
          groupValue: groupKey,
          groupShowTitle: getDictValue(group.item!.columnName, groupKey),
        }
      })
    }
    else {
      const aggResult = {}
      if (agg) {
        agg.items.forEach((agg) => {
          switch (agg.aggKind) {
            case IwProps.AggregateKind.COUNT:
              return aggResult[agg.columnName] = data.filter(d => d[agg.columnName] !== undefined).length
            case IwProps.AggregateKind.SUM:
              return aggResult[agg.columnName] = data.reduce((acc, cur) => acc + cur[agg.columnName], 0)
            case IwProps.AggregateKind.AVG:
              return aggResult[agg.columnName] = data.reduce((acc, cur) => acc + cur[agg.columnName], 0) / data.length
            case IwProps.AggregateKind.MAX:
              if (data.length === 0) {
                return aggResult[agg.columnName] = ''
              }
              else if (typeof data[0][agg.columnName] === 'string') {
                return aggResult[agg.columnName] = data.reduce((acc, cur) => acc[agg.columnName] > cur[agg.columnName] ? acc : cur)[agg.columnName]
              }
              else {
                return aggResult[agg.columnName] = Math.max(...data.map(d => d[agg.columnName]))
              }
            case IwProps.AggregateKind.MIN:
              if (data.length === 0) {
                return aggResult[agg.columnName] = ''
              }
              else if (typeof data[0][agg.columnName] === 'string') {
                return aggResult[agg.columnName] = data.reduce((acc, cur) => acc[agg.columnName] < cur[agg.columnName] ? acc : cur)[agg.columnName]
              }
              else {
                return aggResult[agg.columnName] = Math.min(...data.map(d => d[agg.columnName]))
              }
            default:
              return aggResult[agg.columnName] = data.filter(d => d[agg.columnName] !== undefined).length
          }
        })
      }
      let records
      if (slice) {
        records = data.slice(slice.offsetNumber, slice.offsetNumber + slice.fetchNumber)
      }
      else {
        records = data
      }
      if (returnColumnNames) {
        records = records.map((d) => {
          return returnColumnNames.reduce((acc, cur) => {
            acc[cur] = d[cur]
            return acc
          }, {})
        })
      }
      return {
        records: attachDict(records),
        totalNumber: data.length,
        aggs: aggResult,
      }
    }
  },

  loadEditableData: async (_checkRecordPks: any): Promise<EditableDataResp> => {
    return {
      whiteListMode: true,
      cells: {
        1: ['name', 'creator', 'stats', 'planStartTime', 'planEndTime', 'actualStartTime', 'actualEndTime', 'disabled', 'attachment'],
        11: ['name'],
        17: ['name'],
      },
    }
  },

  newData: async (newRecords: { [columnName: string]: any }[]): Promise<void> => {
    // TODO targetSortValue
    DATA.push(...newRecords)
  },

  copyData: async (targetRecordPks: any[]): Promise<void> => {
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
  },

  modifyData: async (changedRecords: { [columnName: string]: any }[]): Promise<void> => {
    changedRecords.forEach((changedRecord) => {
      // 不区别类型
    // eslint-disable-next-line eqeqeq
      const record = DATA.find(d => d.no == changedRecord.no)!
      Object.assign(record, changedRecord)
    })
  },

  deleteData: async (deletedRecordPks: any[]): Promise<void> => {
    // 不区别类型
    // eslint-disable-next-line eqeqeq
    DATA.splice(DATA.findIndex(d => d.no == deletedRecordPks[0]), 1)
  },

  selectData: async (_selectedRecordPks: any[]): Promise<void> => {
    selectedRecordPks.value = _selectedRecordPks
  },

  clickCell: async (clickedRecordPk: any, clickedColumnName: string, _byLayoutId: string, _byLayoutKind: IwProps.LayoutKind): Promise<void> => {
    if (clickedColumnName === 'no') {
      // eslint-disable-next-line no-alert
      alert(`点击了序号${clickedRecordPk}`)
    }
  },

  modifyStyles: async (changedStyleProps: IwProps.TableStyleModifyProps): Promise<void> => {
    // eslint-disable-next-line ts/no-use-before-define
    tableProps.value.styles = {
      // eslint-disable-next-line ts/no-use-before-define
      ...tableProps.value.styles,
      ...changedStyleProps,
    }
  },

  newLayout: async (newLayoutProps: IwProps.LayoutProps): Promise<string> => {
    const id = Date.now().toString()
    // eslint-disable-next-line ts/no-use-before-define
    tableProps.value.layouts.push({
      ...newLayoutProps,
      id,
    })
    return id
  },

  modifyLayout: async (changedLayoutId: string, changedLayoutProps: IwProps.LayoutModifyProps): Promise<void> => {
    // eslint-disable-next-line ts/no-use-before-define
    const currLayout = tableProps.value.layouts.find((layout) => {
      return layout.id === changedLayoutId
    })!
    if (changedLayoutProps.title) {
      currLayout.title = changedLayoutProps.title
    }
    if (changedLayoutProps.icon) {
      currLayout.icon = changedLayoutProps.icon
    }
    if (changedLayoutProps.slice) {
      currLayout.slice = changedLayoutProps.slice
    }
    if (changedLayoutProps.subDataShowKind) {
      currLayout.subDataShowKind = changedLayoutProps.subDataShowKind
    }
    if (changedLayoutProps.actionColumn) {
      currLayout.actionColumn = changedLayoutProps.actionColumn
    }
    if (changedLayoutProps.gantt) {
      currLayout.gantt = changedLayoutProps.gantt
    }

    if (changedLayoutProps.filter) {
      currLayout.filter = changedLayoutProps.filter
    }
    if (changedLayoutProps.sort) {
      currLayout.sort = changedLayoutProps.sort
    }
    if (changedLayoutProps.group) {
      currLayout.group = changedLayoutProps.group
    }
    if (changedLayoutProps.agg) {
      currLayout.agg = changedLayoutProps.agg
    }
    if (changedLayoutProps.changedColumn) {
      const col = currLayout.columns!.find((col) => {
        return col.name === changedLayoutProps.changedColumn!.name
      })!
      Object.assign(col, changedLayoutProps.changedColumn)
    }
  },

  deleteLayout: async (deletedLayoutId: string): Promise<void> => {
    // eslint-disable-next-line ts/no-use-before-define
    tableProps.value.layouts.splice(tableProps.value.layouts.findIndex((layout) => {
      return layout.id === deletedLayoutId
    }), 1)
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

  loadDictItems: async (dictName: string, filterValue?: any, slice?: IwProps.DataQuerySliceReq): Promise<IwProps.DictItemsResp> => {
    if (dictName === 'creator') {
      let nameDict: IwProps.DictItemProps[] = JSON.parse(JSON.stringify(NAME_DICT))
      if (filterValue) {
        nameDict = nameDict.filter((dict) => {
          return dict.title.includes(filterValue) || dict.value.includes(filterValue)
        })
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
      let statsDict: IwProps.DictItemProps[] = JSON.parse(JSON.stringify(STATS_DICT))
      if (filterValue) {
        statsDict = statsDict.filter((dict) => {
          return dict.title.includes(filterValue) || dict.value.includes(filterValue)
        })
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

  loadDictItemsWithMultiConds: async (conds: { [dictName: string]: any[] }, slice?: IwProps.DataQuerySliceReq): Promise<{ [dictName: string]: IwProps.DictItemsResp }> => {
    const resp = {}
    Object.entries(conds).forEach(([columnName, values]) => {
      if (columnName === 'creator') {
        let nameDict: IwProps.DictItemProps[] = JSON.parse(JSON.stringify(NAME_DICT))
        nameDict = nameDict.filter((dict) => {
          return values.find(val => dict.title.includes(val) || dict.value.includes(val))
        })
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
        let statsDict: IwProps.DictItemProps[] = JSON.parse(JSON.stringify(STATS_DICT))
        statsDict = statsDict.filter((dict) => {
          return values.find(val => dict.title.includes(val) || dict.value.includes(val))
        })
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

const columns: IwProps.SimpleTableColumnProps[] = [
  { name: 'no', title: 'ID', dataKind: IwProps.DataKind.NUMBER, width: 80, styles: { cursor: 'pointer' } },
  { name: 'pno', title: '父ID', dataKind: IwProps.DataKind.NUMBER, hide: true },
  { name: 'name', title: '名称', width: 300, render: (record: { [columnName: string]: any }, layoutKind: IwProps.LayoutKind) => {
    if (layoutKind === IwProps.LayoutKind.LIST) {
      return record.stats.includes('risk') ? `<span style='color:red'>${record.name}</span>` : record.name
    }
    else {
      return record.name
    }
  } },
  { name: 'creator', title: '创建人', useDict: true },
  { name: 'stats', title: '状态', useDict: true, multiValue: true },
  { name: 'avatar', title: '头像', dataKind: IwProps.DataKind.IMAGE },
  { name: 'attachment', title: '附件', dataKind: IwProps.DataKind.FILE },
  { name: 'planStartTime', title: '计划开始时间', dataKind: IwProps.DataKind.DATETIME },
  { name: 'planEndTime', title: '计划结束时间', dataKind: IwProps.DataKind.DATETIME },
  { name: 'actualStartTime', title: '实际开始时间', dataKind: IwProps.DataKind.DATETIME },
  { name: 'actualEndTime', title: '实际结束时间', dataKind: IwProps.DataKind.DATETIME },
  { name: 'disabled', title: '是否禁用', dataKind: IwProps.DataKind.BOOLEAN },
]

const layouts: IwProps.SimpleLayoutProps[] = [
  {
    id: 'hi1',
    title: 'gantt demo',
    layoutKind: IwProps.LayoutKind.GANTT,
    columns: [{
      name: 'name',
    }, {
      name: 'creator',
    }, {
      name: 'no',
    }, {
      name: 'planStartTime',
    }, {
      name: 'planEndTime',
    }, {
      name: 'actualStartTime',
    }, {
      name: 'actualEndTime',
    }],
  },
  {
    id: 'hi2',
    title: 'list demo',
    layoutKind: IwProps.LayoutKind.LIST,
    columns: [{
      name: 'name',
    }, {
      name: 'stats',
    }, {
      name: 'creator',
    }, {
      name: 'avatar',
    }, {
      name: 'attachment',
    }, {
      name: 'no',
    }, {
      name: 'planStartTime',
    }, {
      name: 'actualStartTime',
    }, {
      name: 'actualEndTime',
    }, {
      name: 'disabled',
    }],
    agg: {
      enabledColumnNames: ['name', 'creator', 'stats', 'planStartTime', 'planEndTime'],
      items: [
        { columnName: 'name', aggKind: IwProps.AggregateKind.MIN },
      ],
    },
    edit: {
      enabledColumnNames: ['name', 'creator', 'stats', 'planStartTime', 'planEndTime', 'disabled'],
      markEditable: true,
    },
  },
  {
    id: 'hi3',
    title: 'multiple header demo',
    layoutKind: IwProps.LayoutKind.LIST,
    columns: [{
      name: 'name',
    }, {
      name: 'creator',
    }, {
      name: 'stats',
    }, {
      name: 'no',
    }, {
      name: 'planStartTime',
      categoryTitle: 'Time',
    }, {
      name: 'planEndTime',
      categoryTitle: 'Time',
    }, {
      name: 'actualStartTime',
    }, {
      name: 'actualEndTime',
    }],
    agg: {
      enabledColumnNames: ['name', 'creator', 'stats', 'planStartTime', 'planEndTime'],
      items: [
        { columnName: 'name', aggKind: IwProps.AggregateKind.MAX },
      ],
    },
  },
]

const _tableProps: IwProps.SimpleTableProps = {
  // mini: true,
  pkColumnName: 'no',
  parentPkColumnName: 'pno',
  columns,
  layouts,
  events,
  quickSearch: {
    placeholder: '请输入姓名',
  },
  slice: {
    fetchNumber: 10,
    fetchNumbers: [5, 10, 20, 30, 50],
  },
  showSelectColumn: true,
  actionColumn: {
    render: (record: { [columnName: string]: any }, _layoutKind: IwProps.LayoutKind) => {
      return `<button class="btn-row-delete" style="margin-right:2px" data-id='${record.no}'>删除</button> <button class="btn-row-copy" data-id='${record.no}'>复制</button>`
    },
    width: 100,
  },
  gantt: {
    timelineWidth: 500,
    planStartTimeColumnName: 'planStartTime',
    planEndTimeColumnName: 'planEndTime',
    actualStartTimeColumnName: 'actualStartTime',
    actualEndTimeColumnName: 'actualEndTime',
  },
  filter: {
    enabledColumnNames: ['no', 'name', 'creator', 'stats', 'planStartTime', 'planEndTime', 'actualStartTime', 'actualEndTime', 'disabled'],
    groups: [
      {
        items: [{
          columnName: 'creator',
          operator: IwProps.OperatorKind.EQ,
          value: 'xh',
        }],
      },
    ],
  },
  sort: {
    enabledColumnNames: ['no', 'name', 'creator', 'stats', 'planStartTime', 'planEndTime', 'actualStartTime', 'actualEndTime', 'disabled'],
  },
  group: {
    enabledColumnNames: ['creator', 'stats', 'disabled'],
  },
  agg: {
    enabledColumnNames: ['name', 'creator', 'stats', 'planStartTime', 'planEndTime'],
    items: [
      { columnName: 'name', aggKind: IwProps.AggregateKind.MIN },
      { columnName: 'stats', aggKind: IwProps.AggregateKind.MIN },
    ],
  },
  edit: {
    enabledColumnNames: ['name', 'creator', 'stats', 'planStartTime', 'disabled'],
    markEditable: true,
  },
}

const tableProps: Ref<IwProps.SimpleTableProps> = ref(_tableProps)

onMounted(() => {
  IwUtils.basic.delegateEvent('.iw-tt', 'click', '.btn-row-delete', (e) => {
    IwEvents.deleteData([(e.target as HTMLElement).dataset.id])
  })
  IwUtils.basic.delegateEvent('.iw-tt', 'click', '.btn-row-copy', (e) => {
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
