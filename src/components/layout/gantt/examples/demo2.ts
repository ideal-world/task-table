import type { GanttData, Task } from 'gantt-canvas-chart'

export function getDemo2Data(): GanttData {
  return [
    {
      id: 'user1',
      name: '张三',
      tasks: [
        {
          id: 'u1_leave',
          name: '年假',
          type: 'leave',
          actualStart: '2025-11-03',
          actualEnd: '2025-11-05',
          styleClass: 'demo2-leave',
        },
        {
          id: 'u1_task_p1',
          name: '任务A (计划)',
          type: 'task',
          planStart: '2025-11-06',
          planEnd: '2025-11-12',
          styleClass: 'demo2-plan',
        },
        {
          id: 'u1_task_d1',
          name: '任务B (完成)',
          type: 'task',
          actualStart: '2025-11-13',
          actualEnd: '2025-11-15',
          styleClass: 'demo2-completed',
          planStart: '2025-11-13',
          planEnd: '2025-11-16',
        },
      ],
    },
    {
      id: 'user2',
      name: '李四',
      tasks: [
        {
          id: 'u2_task_d1',
          name: '任务C (完成)',
          type: 'task',
          actualStart: '2025-11-01',
          actualEnd: '2025-11-06',
          styleClass: 'demo2-completed',
          planStart: '2025-11-01',
          planEnd: '2025-11-06',
        },
        {
          id: 'u2_task_p1',
          name: '任务D (计划)',
          type: 'task',
          planStart: '2025-11-07',
          planEnd: '2025-11-10',
          styleClass: 'demo2-plan',
        },
        {
          id: 'u2_task_p2',
          name: '任务E (计划)',
          type: 'task',
          planStart: '2025-11-07',
          planEnd: '2025-11-14',
          styleClass: 'demo2-plan',
        },
        {
          id: 'u2_leave',
          name: '事假',
          type: 'leave',
          actualStart: '2025-11-13',
          actualEnd: '2025-11-13',
          styleClass: 'demo2-leave',
        },
      ],
    },
    {
      id: 'user3',
      name: '王五',
      tasks: [
        {
          id: 'u3_task_p1',
          name: '架构设计 (计划)',
          type: 'task',
          planStart: '2025-11-10',
          planEnd: '2025-11-18',
          styleClass: 'demo2-plan',
        },
        {
          id: 'u3_leave',
          name: '病假',
          type: 'leave',
          actualStart: '2025-11-19',
          actualEnd: '2025-11-20',
          styleClass: 'demo2-leave',
        },
      ],
    },
    ...Array.from({ length: 500 }, (_, i) => ({
      id: `user_virt_${i}`,
      name: `员工 ${i + 4}`,
      tasks: [
        {
          id: `uvt_${i}_1`,
          name: `常规任务 ${i}`,
          type: 'task',
          planStart: '2025-11-01',
          planEnd: '2025-11-30',
          styleClass: 'demo2-plan',
        },
        {
          id: `uvt_${i}_2`,
          name: `休假 ${i}`,
          centerRemark: '请假',
          type: 'leave',
          actualStart: '2025-12-05',
          actualEnd: '2025-12-08',
          actualBgColor: '#fceeb7',
          styleClass: 'demo2-leave',
        },
      ],
    })) as GanttData,
  ]
};
