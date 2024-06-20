import { assert, describe, expect, it } from 'vitest'
import type { DataGroupResp, DataResp } from '../../src/props'
import { AggregateKind, DataKind, GanttShowKind, LayoutKind, SizeKind, SubDataShowKind } from '../../src/props/enumProps'
import type { AggDataProps, DataQuerySliceReq, FilterDataProps, GroupDataProps, SortDataProps } from '../../src/props/functionProps'
import type { SimpleTableProps } from '../../src/props/kernelProps'
import { generateTableProps } from '../../src/props/kernelProps'

describe('generateTableProps', () => {
  it('should generate table props with default values', () => {
    const simple: SimpleTableProps = {
      pkColumnName: 'no',
      columns: [
        { name: 'no' },
        { name: 'name' },
      ],
      layouts: [
        {
          title: 'list demo',
        },
      ],
      events: {
        loadData: async (_quickSearchContent?: string, _filter?: FilterDataProps, _sort?: SortDataProps, _group?: GroupDataProps, _agg?: AggDataProps, _hideSubData?: boolean, _byGroupValue?: any, _slice?: DataQuerySliceReq, _returnColumnNames?: string[], _returnOnlyAgg?: boolean): Promise<DataResp | DataGroupResp[]> => {
          return []
        },
      },
    }

    const result = generateTableProps(simple)

    expect(result).toEqual({
      id: expect.stringContaining('iw-table-'),
      pkColumnName: 'no',
      parentPkColumnName: undefined,
      quickSearch: undefined,
      events: {
        loadData: expect.any(Function),
      },
      columns: [
        {
          title: 'no',
          icon: expect.stringContaining('octicon-'),
          dataKind: 'TEXT',
          useDict: false,
          multiValue: false,
          name: 'no',
          wrap: false,
          fixed: false,
          width: 100,
          hide: false,
          styles: {
          },
          categoryTitle: undefined,
          render: undefined,
        },
        {
          title: 'name',
          icon: expect.stringContaining('octicon-'),
          dataKind: 'TEXT',
          useDict: false,
          multiValue: false,
          name: 'name',
          wrap: false,
          fixed: false,
          width: 100,
          hide: false,
          styles: {
          },
          categoryTitle: undefined,
          render: undefined,
        },
      ],
      actionColumn: undefined,
      gantt: undefined,
      filter: undefined,
      group: undefined,
      sort: undefined,
      agg: undefined,
      edit: undefined,
      showSelectColumn: false,
      subDataShowKind: SubDataShowKind.FOLD_SUB_DATA,
      slice: {
        offsetNumber: 0,
        fetchNumber: 10,
        fetchNumbers: [5, 10, 20, 30, 50, 100],
      },
      layouts: [
        {
          id: expect.stringContaining('iw-layout-'),
          title: 'list demo',
          layoutKind: 'LIST',
          icon: expect.stringContaining('octicon-'),
          columns: [
            {
              name: 'no',
              wrap: false,
              fixed: false,
              width: 100,
              hide: false,
              styles: {
              },
              categoryTitle: undefined,
              render: undefined,
            },
            {
              name: 'name',
              wrap: false,
              fixed: false,
              width: 100,
              hide: false,
              styles: {
              },
              categoryTitle: undefined,
              render: undefined,
            },
          ],
          showSelectColumn: false,
          subDataShowKind: SubDataShowKind.FOLD_SUB_DATA,
          actionColumn: undefined,
          slice: {
            offsetNumber: 0,
            fetchNumber: 10,
            fetchNumbers: [5, 10, 20, 30, 50, 100],
          },
          gantt: undefined,
          filter: undefined,
          group: undefined,
          sort: undefined,
          agg: undefined,
          edit: undefined,
        },
      ],
      styles: {
        size: '',
        theme: '',
        tableClass: '',
        headerClass: '',
        footerClass: '',
        rowClass: '',
        cellClass: '',
        aggClass: '',
      },
      mini: false,
    })
  })

  it('should generate table props with provided values', () => {
    const simple: SimpleTableProps = {
      pkColumnName: 'no',
      parentPkColumnName: 'pno',
      columns: [
        { name: 'no', title: 'ID', dataKind: DataKind.NUMBER, width: 80, styles: { cursor: 'pointer' } },
        { name: 'pno', title: '父ID', dataKind: DataKind.NUMBER, hide: true },
        { name: 'name', title: '名称', width: 300 },
        { name: 'creator', title: '创建人', useDict: true },
        { name: 'stats', title: '状态', useDict: true, multiValue: true },
        { name: 'avatar', title: '头像', dataKind: DataKind.IMAGE },
        { name: 'attachment', title: '附件', dataKind: DataKind.FILE },
        { name: 'planStartTime', title: '计划开始时间', dataKind: DataKind.DATETIME },
        { name: 'planEndTime', title: '计划结束时间', dataKind: DataKind.DATETIME },
        { name: 'actualStartTime', title: '实际开始时间', dataKind: DataKind.DATETIME },
        { name: 'actualEndTime', title: '实际结束时间', dataKind: DataKind.DATETIME },
        { name: 'disabled', title: '是否禁用', dataKind: DataKind.BOOLEAN },
      ],
      events: {
        loadData: async (_quickSearchContent?: string, _filter?: FilterDataProps, _sort?: SortDataProps, _group?: GroupDataProps, _agg?: AggDataProps, _hideSubData?: boolean, _byGroupValue?: any, _slice?: DataQuerySliceReq, _returnColumnNames?: string[], _returnOnlyAgg?: boolean): Promise<DataResp | DataGroupResp[]> => {
          return []
        },
      },
      quickSearch: {
        placeholder: '请输入姓名',
      },
      slice: {
        fetchNumber: 10,
        fetchNumbers: [5, 10, 20, 30, 50],
      },
      showSelectColumn: true,
      actionColumn: {
        render: (_record: { [columnName: string]: any }, _layoutKind: LayoutKind) => {
          // implementation
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
        enabledColumnNames: ['no', 'name', 'creator', 'stats', 'planStartTime', 'planEndTime'],
      },
      sort: {
        enabledColumnNames: ['no', 'name', 'creator', 'stats', 'planStartTime', 'planEndTime'],
      },
      group: {
        enabledColumnNames: ['creator', 'stats', 'disabled'],
      },
      agg: {
        enabledColumnNames: ['name', 'creator', 'stats', 'planStartTime', 'planEndTime'],
        items: [
          { columnName: 'name', aggKind: AggregateKind.MIN },
          { columnName: 'stats', aggKind: AggregateKind.COUNT },
        ],
      },
      edit: {
        enabledColumnNames: ['name', 'creator', 'stats', 'planStartTime', 'disabled'],
        markEditable: true,
      },
      layouts: [
        {
          id: 'hi1',
          title: 'gantt demo',
          layoutKind: LayoutKind.GANTT,
          gantt: {
            showKind: GanttShowKind.MONTH,
            planStartTimeColumnName: 'planStartTime',
            planEndTimeColumnName: 'planEndTime',
          },
          slice: {
            fetchNumber: 30,
          },
        },
        {
          id: 'hi2',
          title: 'list demo',
          layoutKind: LayoutKind.LIST,
          subDataShowKind: SubDataShowKind.ONLY_PARENT_DATA,
          columns: [
            { name: 'name' },
            { name: 'stats' },
            { name: 'creator' },
            { name: 'avatar' },
          ],
          agg: {
            enabledColumnNames: ['name', 'creator', 'stats', 'planStartTime', 'planEndTime'],
            items: [
              { columnName: 'name', aggKind: AggregateKind.MAX },
            ],
          },
        },
      ],
      styles: {
        size: SizeKind.LARGE,
        theme: 'LIGHT',
      },
      mini: true,
    }

    const result = generateTableProps(simple)

    expect(result).toEqual({
      id: expect.stringContaining('iw-table-'),
      pkColumnName: 'no',
      parentPkColumnName: 'pno',
      quickSearch: {
        placeholder: '请输入姓名',
      },
      events: {
        loadData: expect.any(Function),
      },
      showSelectColumn: true,
      subDataShowKind: SubDataShowKind.FOLD_SUB_DATA,
      actionColumn: {
        render: expect.any(Function),
        width: 100,
      },
      slice: {
        offsetNumber: 0,
        fetchNumber: 10,
        fetchNumbers: [5, 10, 20, 30, 50],
      },
      gantt: {
        timelineWidth: 500,
        showKind: GanttShowKind.DAY,
        planStartTimeColumnName: 'planStartTime',
        planEndTimeColumnName: 'planEndTime',
        actualStartTimeColumnName: 'actualStartTime',
        actualEndTimeColumnName: 'actualEndTime',
      },
      filter: {
        enabledColumnNames: ['no', 'name', 'creator', 'stats', 'planStartTime', 'planEndTime'],
        groups: [],
      },
      group: {
        enabledColumnNames: ['creator', 'stats', 'disabled'],
        item: undefined,
        slices: undefined,
      },
      sort: {
        enabledColumnNames: ['no', 'name', 'creator', 'stats', 'planStartTime', 'planEndTime'],
        items: [],
      },
      agg: {
        enabledColumnNames: ['name', 'creator', 'stats', 'planStartTime', 'planEndTime'],
        items: [
          {
            columnName: 'name',
            aggKind: AggregateKind.MIN,
          },
          {
            columnName: 'stats',
            aggKind: AggregateKind.COUNT,
          },
        ],
      },
      edit: {
        enabledColumnNames: ['name', 'creator', 'stats', 'planStartTime', 'disabled'],
        markEditable: true,
      },
      columns: expect.arrayContaining([]),
      layouts: expect.arrayContaining([]),
      styles: {
        size: '-lg',
        theme: 'LIGHT',
        tableClass: '',
        headerClass: '',
        footerClass: '',
        rowClass: '',
        cellClass: '',
        aggClass: '',
      },
      mini: true,
    })

    expect(result.columns).toEqual([
      {
        title: 'ID',
        icon: 'octicon-list-ordered-24',
        dataKind: DataKind.NUMBER,
        useDict: false,
        multiValue: false,
        name: 'no',
        wrap: false,
        fixed: false,
        width: 80,
        hide: false,
        styles: {
          cursor: 'pointer',
        },
        categoryTitle: undefined,
        render: undefined,
      },
      {
        title: '父ID',
        icon: 'octicon-list-ordered-24',
        dataKind: DataKind.NUMBER,
        useDict: false,
        multiValue: false,
        name: 'pno',
        wrap: false,
        fixed: false,
        width: 100,
        hide: true,
        styles: {
        },
        categoryTitle: undefined,
        render: undefined,
      },
      {
        title: '名称',
        icon: 'octicon-file-24',
        dataKind: DataKind.TEXT,
        useDict: false,
        multiValue: false,
        name: 'name',
        wrap: false,
        fixed: false,
        width: 300,
        hide: false,
        styles: {
        },
        categoryTitle: undefined,
        render: undefined,
      },
      {
        title: '创建人',
        icon: 'octicon-file-24',
        dataKind: DataKind.TEXT,
        useDict: true,
        multiValue: false,
        name: 'creator',
        wrap: false,
        fixed: false,
        width: 100,
        hide: false,
        styles: {
        },
        categoryTitle: undefined,
        render: undefined,
      },
      {
        title: '状态',
        icon: 'octicon-file-24',
        dataKind: DataKind.TEXT,
        useDict: true,
        multiValue: true,
        name: 'stats',
        wrap: false,
        fixed: false,
        width: 100,
        hide: false,
        styles: {
        },
        categoryTitle: undefined,
        render: undefined,
      },
      {
        title: '头像',
        icon: 'octicon-image-24',
        dataKind: DataKind.IMAGE,
        useDict: false,
        multiValue: false,
        name: 'avatar',
        wrap: false,
        fixed: false,
        width: 100,
        hide: false,
        styles: {
        },
        categoryTitle: undefined,
        render: undefined,
      },
      {
        title: '附件',
        icon: 'octicon-file-zip-24',
        dataKind: DataKind.FILE,
        useDict: false,
        multiValue: false,
        name: 'attachment',
        wrap: false,
        fixed: false,
        width: 100,
        hide: false,
        styles: {
        },
        categoryTitle: undefined,
        render: undefined,
      },
      {
        title: '计划开始时间',
        icon: 'octicon-calendar-24',
        dataKind: DataKind.DATETIME,
        useDict: false,
        multiValue: false,
        name: 'planStartTime',
        wrap: false,
        fixed: false,
        width: 100,
        hide: false,
        styles: {
        },
        categoryTitle: undefined,
        render: undefined,
      },
      {
        title: '计划结束时间',
        icon: 'octicon-calendar-24',
        dataKind: DataKind.DATETIME,
        useDict: false,
        multiValue: false,
        name: 'planEndTime',
        wrap: false,
        fixed: false,
        width: 100,
        hide: false,
        styles: {
        },
        categoryTitle: undefined,
        render: undefined,
      },
      {
        title: '实际开始时间',
        icon: 'octicon-calendar-24',
        dataKind: DataKind.DATETIME,
        useDict: false,
        multiValue: false,
        name: 'actualStartTime',
        wrap: false,
        fixed: false,
        width: 100,
        hide: false,
        styles: {
        },
        categoryTitle: undefined,
        render: undefined,
      },
      {
        title: '实际结束时间',
        icon: 'octicon-calendar-24',
        dataKind: DataKind.DATETIME,
        useDict: false,
        multiValue: false,
        name: 'actualEndTime',
        wrap: false,
        fixed: false,
        width: 100,
        hide: false,
        styles: {
        },
        categoryTitle: undefined,
        render: undefined,
      },
      {
        title: '是否禁用',
        icon: 'octicon-checklist-24',
        dataKind: DataKind.BOOLEAN,
        useDict: false,
        multiValue: false,
        name: 'disabled',
        wrap: false,
        fixed: false,
        width: 100,
        hide: false,
        styles: {
        },
        categoryTitle: undefined,
        render: undefined,
      },
    ])

    assert(result.layouts.length === 2)

    expect(result.layouts[0]).toEqual({
      id: 'hi1',
      title: 'gantt demo',
      layoutKind: LayoutKind.GANTT,
      icon: 'octicon-workflow-24',
      columns: [
        {
          name: 'no',
          wrap: false,
          fixed: false,
          width: 80,
          hide: false,
          styles: {
            cursor: 'pointer',
          },
          categoryTitle: undefined,
          render: undefined,
        },
        {
          name: 'pno',
          wrap: false,
          fixed: false,
          width: 100,
          hide: true,
          styles: {
          },
          categoryTitle: undefined,
          render: undefined,
        },
        {
          name: 'name',
          wrap: false,
          fixed: false,
          width: 300,
          hide: false,
          styles: {
          },
          categoryTitle: undefined,
          render: undefined,
        },
        {
          name: 'creator',
          wrap: false,
          fixed: false,
          width: 100,
          hide: false,
          styles: {
          },
          categoryTitle: undefined,
          render: undefined,
        },
        {
          name: 'stats',
          wrap: false,
          fixed: false,
          width: 100,
          hide: false,
          styles: {
          },
          categoryTitle: undefined,
          render: undefined,
        },
        {
          name: 'avatar',
          wrap: false,
          fixed: false,
          width: 100,
          hide: false,
          styles: {
          },
          categoryTitle: undefined,
          render: undefined,
        },
        {
          name: 'attachment',
          wrap: false,
          fixed: false,
          width: 100,
          hide: false,
          styles: {
          },
          categoryTitle: undefined,
          render: undefined,
        },
        {
          name: 'planStartTime',
          wrap: false,
          fixed: false,
          width: 100,
          hide: false,
          styles: {
          },
          categoryTitle: undefined,
          render: undefined,
        },
        {
          name: 'planEndTime',
          wrap: false,
          fixed: false,
          width: 100,
          hide: false,
          styles: {
          },
          categoryTitle: undefined,
          render: undefined,
        },
        {
          name: 'actualStartTime',
          wrap: false,
          fixed: false,
          width: 100,
          hide: false,
          styles: {
          },
          categoryTitle: undefined,
          render: undefined,
        },
        {
          name: 'actualEndTime',
          wrap: false,
          fixed: false,
          width: 100,
          hide: false,
          styles: {
          },
          categoryTitle: undefined,
          render: undefined,
        },
        {
          name: 'disabled',
          wrap: false,
          fixed: false,
          width: 100,
          hide: false,
          styles: {
          },
          categoryTitle: undefined,
          render: undefined,
        },
      ],
      showSelectColumn: true,
      subDataShowKind: SubDataShowKind.FOLD_SUB_DATA,
      actionColumn: {
        render: expect.any(Function),
        width: 100,
      },
      slice: {
        offsetNumber: 0,
        fetchNumber: 30,
        fetchNumbers: [5, 10, 20, 30, 50],
      },
      gantt: {
        timelineWidth: 500,
        showKind: GanttShowKind.MONTH,
        planStartTimeColumnName: 'planStartTime',
        planEndTimeColumnName: 'planEndTime',
        actualStartTimeColumnName: 'actualStartTime',
        actualEndTimeColumnName: 'actualEndTime',
      },
      filter: {
        enabledColumnNames: ['no', 'name', 'creator', 'stats', 'planStartTime', 'planEndTime'],
        groups: [],
      },
      group: {
        enabledColumnNames: ['creator', 'stats', 'disabled'],
        item: undefined,
        slices: undefined,
      },
      sort: {
        enabledColumnNames: ['no', 'name', 'creator', 'stats', 'planStartTime', 'planEndTime'],
        items: [],
      },
      agg: {
        enabledColumnNames: ['name', 'creator', 'stats', 'planStartTime', 'planEndTime'],
        items: [
          {
            columnName: 'name',
            aggKind: AggregateKind.MIN,
          },
          {
            columnName: 'stats',
            aggKind: AggregateKind.COUNT,
          },
        ],
      },
      edit: {
        enabledColumnNames: ['name', 'creator', 'stats', 'planStartTime', 'disabled'],
        markEditable: true,
      },
    })

    expect(result.layouts[1]).toEqual({
      id: 'hi2',
      title: 'list demo',
      layoutKind: LayoutKind.LIST,
      icon: 'octicon-file-24',
      columns: [
        {
          name: 'name',
          wrap: false,
          fixed: false,
          width: 300,
          hide: false,
          styles: {
          },
          categoryTitle: undefined,
          render: undefined,
        },
        {
          name: 'stats',
          wrap: false,
          fixed: false,
          width: 100,
          hide: false,
          styles: {
          },
          categoryTitle: undefined,
          render: undefined,
        },
        {
          name: 'creator',
          wrap: false,
          fixed: false,
          width: 100,
          hide: false,
          styles: {
          },
          categoryTitle: undefined,
          render: undefined,
        },
        {
          name: 'avatar',
          wrap: false,
          fixed: false,
          width: 100,
          hide: false,
          styles: {
          },
          categoryTitle: undefined,
          render: undefined,
        },
      ],
      showSelectColumn: true,
      subDataShowKind: SubDataShowKind.ONLY_PARENT_DATA,
      actionColumn: {
        render: expect.any(Function),
        width: 100,
      },
      slice: {
        offsetNumber: 0,
        fetchNumber: 10,
        fetchNumbers: [5, 10, 20, 30, 50],
      },
      gantt: {
        timelineWidth: 500,
        showKind: GanttShowKind.DAY,
        planStartTimeColumnName: 'planStartTime',
        planEndTimeColumnName: 'planEndTime',
        actualStartTimeColumnName: 'actualStartTime',
        actualEndTimeColumnName: 'actualEndTime',
      },
      filter: {
        enabledColumnNames: ['no', 'name', 'creator', 'stats', 'planStartTime', 'planEndTime'],
        groups: [],
      },
      group: {
        enabledColumnNames: ['creator', 'stats', 'disabled'],
        item: undefined,
        slices: undefined,
      },
      sort: {
        enabledColumnNames: ['no', 'name', 'creator', 'stats', 'planStartTime', 'planEndTime'],
        items: [],
      },
      agg: {
        enabledColumnNames: ['name', 'creator', 'stats', 'planStartTime', 'planEndTime'],
        items: [
          {
            columnName: 'name',
            aggKind: AggregateKind.MAX,
          },
        ],
      },
      edit: {
        enabledColumnNames: ['name', 'creator', 'stats', 'planStartTime', 'disabled'],
        markEditable: true,
      },
    })
  })
})
