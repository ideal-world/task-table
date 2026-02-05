// import type { GanttData } from 'gantt-canvas-chart'

export function getDemo1Data() {
  return [
    {
      id: 'proj0',
      name: '项目总览',
      tasks: [
        {
          id: 't000',
          name: '项目需求背景编写',

          planStart: '2025-10-01',
          planEnd: '2025-10-01',
          actualStart: '2025-10-01',
          actualEnd: '2025-10-01',
          leftRemark: '刘玲',
          rightRemark: '待开始',
          // planOffsetPercent: [0.1, 0.9]
          // styleClass: 'demo1-task'
        },
        {
          id: 't0',
          name: '整体介绍草稿',

          planStart: '2025-11-01 09:00:00',
          planEnd: '2025-11-05 05:00:00',
          actualStart: '2025-11-01',
          actualEnd: '2025-11-04',
          leftRemark: '张三',
          rightRemark: '已完成',
          planOffsetPercent: [0.1, 0.9],
          // styleClass: 'demo1-task'
        },
        {
          id: 't0L',
          name: '整体介绍草稿请假',

          // planStart: '2025-11-01 09:00:00',
          // planEnd: '2025-11-05 05:00:00',
          actualStart: '2025-11-01',
          actualEnd: '2025-11-01',
          actualBgColor: '#FFEDB0',
          centerRemark: '请假',
          // leftRemark: '张三',
          // rightRemark: '已完成',
          actualOffsetPercent: [0.2, 0.5],
          // styleClass: 'demo1-task'
        },
        {
          id: 't00',
          name: '整体介绍评审总要',

          planStart: '2025-11-11 09:00:00',
          planEnd: '2025-11-15 05:00:00',
          actualStart: '2025-11-11',
          actualEnd: '2025-11-14',
          leftRemark: '张三',
          rightRemark: '已完成',
          planBorderColor: '#caeed2',
          actualBgColor: '#78c78f',
          // styleClass: 'demo1-task'
        },
      ],
    },
    {
      id: 'proj1',
      name: '项目规划',
      tasks: [
        {
          id: 't1',
          name: '需求分析',
          planStart: '2025-11-01 09:00:00',
          planEnd: '2025-11-05 05:00:00',
          actualStart: '2025-11-01',
          actualEnd: '2025-11-04',
          leftRemark: '张三',
          rightRemark: '已完成',
          styleClass: 'demo1-task',
        },
      ],
    },
    {
      id: 'proj2',
      name: '设计阶段',
      tasks: [
        {
          id: 't2',
          name: 'UI/UX 设计',
          planStart: '2025-11-06',
          planEnd: '2025-11-10',
          actualStart: '2025-11-07',
          actualEnd: '2025-11-11',
          dependencies: ['t1'],
          leftRemark: '李四',
          rightRemark: '进行中',
          styleClass: 'demo1-task',
        },
        {
          id: 't4',
          name: 'API 设计',
          planStart: '2025-11-06',
          planEnd: '2025-11-08',
          actualStart: '2025-11-06',
          actualEnd: '2025-11-07',
          // dependencies: ['t1'],
          leftRemark: '赵六',
          rightRemark: '已完成',
          styleClass: 'demo1-task',
        },
      ],
    },
    {
      id: 'proj3',
      name: '开发阶段',
      tasks: [
        {
          id: 't3',
          name: '前端开发',
          planStart: '2025-11-12',
          planEnd: '2025-11-20',
          actualStart: '2025-11-13',
          actualEnd: '2025-11-18',
          dependencies: ['t2'],
          leftRemark: '王五',
          rightRemark: '进行中',
          styleClass: 'demo1-task',
        },
        {
          id: 't5',
          name: '后端开发',
          planStart: '2025-11-09',
          planEnd: '2025-11-16',
          actualStart: '2025-11-09',
          actualEnd: '2025-11-15',
          // dependencies: ['t4'],
          // dependencies: ['t4', `vt_${1}_1`, `vt_${1}_2`, `vt_${2}_2`],
          leftRemark: '孙七',
          rightRemark: '已完成',
          styleClass: 'demo1-task',
        },
      ],
    },
    {
      id: 'proj4',
      name: '测试与集成',
      tasks: [
        {
          id: 't6',
          name: '集成测试',
          planStart: '2025-11-21',
          planEnd: '2025-11-28',
          actualStart: '2025-11-22',
          dependencies: ['t3', 't5'],
          leftRemark: '测试组',
          rightRemark: '进行中',
          actualBgColor: '#4984ec',
          styleClass: 'demo1-task',
        },
      ],
    },
    ...Array.from({ length: 500 }, (_, i) => ({
      id: `proj_virt_${i}`,
      name: `虚拟项目 ${i + 1}`,
      tasks: [
        {
          id: `vt_${i}_1`,
          name: `任务 ${i}.1`,
          planStart: '2025-12-01',
          planEnd: '2025-12-10',
          styleClass: 'demo1-task',
        },
        {
          id: `vt_${i}_2`,
          name: `任务 ${i}.2`,
          planStart: '2025-12-12',
          planEnd: '2025-12-20',
          dependencies: [i === 0 ? 't6' : `vt_${i - 1}_2`],
          styleClass: 'demo1-task',
        },
      ],
    })),
  ]
};
