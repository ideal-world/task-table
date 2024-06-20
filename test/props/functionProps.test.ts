import { describe, expect, it } from 'vitest'
import type { AggDataProps, EditDataProps, FilterDataProps, GanttLayoutProps, GroupDataProps, SimpleAggDataProps, SimpleDataSliceProps, SimpleEditDataProps, SimpleFilterDataProps, SimpleGanttLayoutProps, SimpleGroupDataProps, SimpleSortDataProps, SortDataProps } from '../../src/props'
import { AggregateKind, GanttShowKind, OperatorKind, generateAggDataProps, generateDataSliceProps, generateEditDataProps, generateFilterDataProps, generateGanttLayoutProps, generateGroupDataProps, generateSortDataProps } from '../../src/props'

describe('generateDataSliceProps', () => {
  it('should generate data slice props with default values', () => {
    const result = generateDataSliceProps()

    expect(result).toEqual({
      offsetNumber: 0,
      fetchNumber: 10,
      fetchNumbers: [5, 10, 20, 30, 50, 100],
    })
  })

  it('should generate data slice props with table level simple data slice props', () => {
    const tableSimple: SimpleDataSliceProps = {
      offsetNumber: 1,
      fetchNumber: 20,
      fetchNumbers: [10, 20, 30, 40, 50, 60],
    }

    const result = generateDataSliceProps(tableSimple)

    expect(result).toEqual({
      offsetNumber: 1,
      fetchNumber: 20,
      fetchNumbers: [10, 20, 30, 40, 50, 60],
    })
  })

  it('should generate data slice props with layout level simple data slice props', () => {
    const layoutSimple: SimpleDataSliceProps = {
      offsetNumber: 2,
      fetchNumber: 30,
      fetchNumbers: [15, 30, 45, 60, 75, 90],
    }

    const result = generateDataSliceProps(undefined, layoutSimple)

    expect(result).toEqual({
      offsetNumber: 2,
      fetchNumber: 30,
      fetchNumbers: [15, 30, 45, 60, 75, 90],
    })
  })

  it('should generate data slice props with both table and layout level simple data slice props', () => {
    const tableSimple: SimpleDataSliceProps = {
      offsetNumber: 1,
      fetchNumber: 20,
      fetchNumbers: [10, 20, 30, 40, 50, 60],
    }

    const layoutSimple: SimpleDataSliceProps = {
      offsetNumber: 2,
      fetchNumber: 30,
      fetchNumbers: [15, 30, 45, 60, 75, 90],
    }

    const result = generateDataSliceProps(tableSimple, layoutSimple)

    expect(result).toEqual({
      offsetNumber: 2,
      fetchNumber: 30,
      fetchNumbers: [15, 30, 45, 60, 75, 90],
    })
  })
})

describe('generateAggDataProps', () => {
  it('should return tableSimple values when only tableSimple is defined', () => {
    const tableSimple: SimpleAggDataProps = { enabledColumnNames: ['column1'], items: [{
      columnName: 'column1',
      aggKind: AggregateKind.AVG,
    }] }
    const result: AggDataProps = generateAggDataProps(tableSimple)
    expect(result).toEqual(tableSimple)
  })

  it('should return layoutSimple values when only layoutSimple is defined', () => {
    const layoutSimple: SimpleAggDataProps = { enabledColumnNames: ['column2'], items: [{
      columnName: 'column1',
      aggKind: AggregateKind.AVG,
    }] }
    const result: AggDataProps = generateAggDataProps(undefined, layoutSimple)
    expect(result).toEqual(layoutSimple)
  })

  it('should return layoutSimple values when both tableSimple and layoutSimple are defined', () => {
    const tableSimple: SimpleAggDataProps = { enabledColumnNames: ['column1'], items: [{
      columnName: 'column1',
      aggKind: AggregateKind.AVG,
    }] }
    const layoutSimple: SimpleAggDataProps = { enabledColumnNames: ['column2'] }
    const result: AggDataProps = generateAggDataProps(tableSimple, layoutSimple)
    expect(result).toEqual({
      enabledColumnNames: ['column2'],
      items: [{
        columnName: 'column1',
        aggKind: AggregateKind.AVG,
      }],
    })
  })
})

describe('generateFilterDataProps', () => {
  it('should return tableSimple values when only tableSimple argument is provided', () => {
    const tableSimple: SimpleFilterDataProps = { enabledColumnNames: ['column1'], groups: [{ items: [{ columnName: 'column1', operator: OperatorKind.EQ, value: 'test' }] }] }
    const result: FilterDataProps = generateFilterDataProps(tableSimple)
    expect(result).toEqual(tableSimple)
  })

  it('should return layoutSimple values when only layoutSimple argument is provided', () => {
    const layoutSimple: SimpleFilterDataProps = { enabledColumnNames: ['column2'], groups: [{ items: [{ columnName: 'column2', operator: OperatorKind.EQ, value: 'test2' }] }] }
    const result: FilterDataProps = generateFilterDataProps(undefined, layoutSimple)
    expect(result).toEqual(layoutSimple)
  })

  it('should return layoutSimple values when both arguments are provided', () => {
    const tableSimple: SimpleFilterDataProps = { enabledColumnNames: ['column1'], groups: [{ items: [{ columnName: 'column1', operator: OperatorKind.EQ, value: 'test' }] }] }
    const layoutSimple: SimpleFilterDataProps = { enabledColumnNames: ['column2'] }
    const result: FilterDataProps = generateFilterDataProps(tableSimple, layoutSimple)
    expect(result).toEqual({
      enabledColumnNames: ['column2'],
      groups: [{ items: [{ columnName: 'column1', operator: OperatorKind.EQ, value: 'test' }] }],
    })
  })
})

describe('generateGroupDataProps', () => {
  it('should return tableSimple values when only tableSimple argument is provided', () => {
    const tableSimple: SimpleGroupDataProps = {
      enabledColumnNames: ['tableColumn1', 'tableColumn2'],
      item: {
        columnName: 'tableColumn1',
        orderDesc: false,
        hideEmptyRecord: true,
      },
      slices: {
        tableColumn1: {
          offsetNumber: 2,
          fetchNumber: 30,
          fetchNumbers: [15, 30, 45, 60, 75, 90],
        },
      },
    }
    const result: GroupDataProps = generateGroupDataProps(tableSimple)
    expect(result).toEqual(tableSimple)
  })

  it('should return layoutSimple values when only layoutSimple argument is provided', () => {
    const layoutSimple: SimpleGroupDataProps = {
      enabledColumnNames: ['tableColumn3', 'tableColumn4'],
      item: {
        columnName: 'tableColumn3',
        orderDesc: false,
        hideEmptyRecord: true,
      },
      slices: {
        tableColumn3: {
          offsetNumber: 2,
          fetchNumber: 30,
          fetchNumbers: [15, 30, 45, 60, 75, 90],
        },
      },
    }
    const result: GroupDataProps = generateGroupDataProps(undefined, layoutSimple)
    expect(result).toEqual(layoutSimple)
  })

  it('should return layoutSimple values when both arguments are provided', () => {
    const tableSimple: SimpleGroupDataProps = {
      enabledColumnNames: ['tableColumn1', 'tableColumn2'],
      item: {
        columnName: 'tableColumn1',
        orderDesc: false,
        hideEmptyRecord: true,
      },
    }
    const layoutSimple: SimpleGroupDataProps = {
      enabledColumnNames: ['tableColumn3', 'tableColumn4'],
      slices: {
        tableColumn3: {
          offsetNumber: 2,
          fetchNumber: 30,
          fetchNumbers: [15, 30, 45, 60, 75, 90],
        },
      },
    }
    const result: GroupDataProps = generateGroupDataProps(tableSimple, layoutSimple)
    expect(result).toEqual({
      enabledColumnNames: ['tableColumn3', 'tableColumn4'],
      item: {
        columnName: 'tableColumn1',
        orderDesc: false,
        hideEmptyRecord: true,
      },
      slices: {
        tableColumn3: {
          offsetNumber: 2,
          fetchNumber: 30,
          fetchNumbers: [15, 30, 45, 60, 75, 90],
        },
      },
    })
  })
})

describe('generateSortDataProps', () => {
  it('should return tableSimple values when only tableSimple argument is provided', () => {
    const tableSimple: SimpleSortDataProps = {
      enabledColumnNames: ['column1', 'column2'],
      items: [
        {
          columnName: 'column1',
          orderDesc: false,
        },
      ],
    }
    const result: SortDataProps = generateSortDataProps(tableSimple)
    expect(result).toEqual(tableSimple)
  })

  it('should return layoutSimple values when only layoutSimple argument is provided', () => {
    const layoutSimple: SimpleSortDataProps = {
      enabledColumnNames: ['column3', 'column4'],
      items: [
        {
          columnName: 'column3',
          orderDesc: false,
        },
      ],
    }
    const result: SortDataProps = generateSortDataProps(undefined, layoutSimple)
    expect(result).toEqual(layoutSimple)
  })

  it('should return layoutSimple values when both arguments are provided', () => {
    const tableSimple: SimpleSortDataProps = {
      enabledColumnNames: ['column1', 'column2'],
      items: [
        {
          columnName: 'column1',
          orderDesc: false,
        },
      ],
    }
    const layoutSimple: SimpleSortDataProps = {
      enabledColumnNames: ['column3', 'column4'],
    }
    const result: SortDataProps = generateSortDataProps(tableSimple, layoutSimple)
    expect(result).toEqual({
      enabledColumnNames: ['column3', 'column4'],
      items: [
        {
          columnName: 'column1',
          orderDesc: false,
        },
      ],
    })
  })
})

describe('generateGanttLayoutProps', () => {
  it('should return tableSimple values when only tableSimple argument is provided', () => {
    const tableSimple: SimpleGanttLayoutProps = {
      timelineWidth: 100,
      showKind: GanttShowKind.DAY,
      planStartTimeColumnName: 'start',
      planEndTimeColumnName: 'end',
    }
    const result: GanttLayoutProps = generateGanttLayoutProps(tableSimple)
    expect(result).toEqual(tableSimple)
  })

  it('should return layoutSimple values when only layoutSimple argument is provided', () => {
    const layoutSimple: SimpleGanttLayoutProps = {
      timelineWidth: 200,
      showKind: GanttShowKind.WEEK,
      planStartTimeColumnName: 'planStart',
      planEndTimeColumnName: 'planEnd',
      actualStartTimeColumnName: 'actualStart',
      actualEndTimeColumnName: 'actualEnd',
    }
    const result: GanttLayoutProps = generateGanttLayoutProps(undefined, layoutSimple)
    expect(result).toEqual(layoutSimple)
  })

  it('should return layoutSimple values when both arguments are provided', () => {
    const tableSimple: SimpleGanttLayoutProps = {
      timelineWidth: 100,
      showKind: GanttShowKind.DAY,
      planStartTimeColumnName: 'start',
      planEndTimeColumnName: 'end',
    }
    const layoutSimple: SimpleGanttLayoutProps = {
      showKind: GanttShowKind.WEEK,
      planStartTimeColumnName: 'planStart',
      planEndTimeColumnName: 'planEnd',
      actualEndTimeColumnName: 'actualEnd',
    }
    const result: GanttLayoutProps = generateGanttLayoutProps(tableSimple, layoutSimple)
    expect(result).toEqual({
      timelineWidth: 100,
      showKind: GanttShowKind.WEEK,
      planStartTimeColumnName: 'planStart',
      planEndTimeColumnName: 'planEnd',
      actualEndTimeColumnName: 'actualEnd',
    })
  })
})

describe('generateEditDataProps', () => {
  it('should return tableSimple values when only tableSimple argument is provided', () => {
    const tableSimple: SimpleEditDataProps = {
      enabledColumnNames: ['column1', 'column2'],
      markEditable: true,
    }
    const result: EditDataProps = generateEditDataProps(tableSimple)
    expect(result).toEqual(tableSimple)
  })

  it('should return layoutSimple values when only layoutSimple argument is provided', () => {
    const layoutSimple: SimpleEditDataProps = {
      enabledColumnNames: ['column3', 'column4'],
      markEditable: true,
    }
    const result: EditDataProps = generateEditDataProps(undefined, layoutSimple)
    expect(result).toEqual(layoutSimple)
  })

  it('should return layoutSimple values when both arguments are provided', () => {
    const tableSimple: SimpleEditDataProps = {
      enabledColumnNames: ['column1', 'column2'],
      markEditable: true,
    }
    const layoutSimple: SimpleEditDataProps = {
      enabledColumnNames: ['column3', 'column4'],
    }
    const result: EditDataProps = generateEditDataProps(tableSimple, layoutSimple)
    expect(result).toEqual({
      enabledColumnNames: ['column3', 'column4'],
      markEditable: true,
    })
  })
})
