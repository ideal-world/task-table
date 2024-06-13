<script setup lang="ts">
import type { Ref } from 'vue'
import { onMounted, ref } from 'vue'
import locales from '../../../locales'
import type { TableDataGroupResp, TableDataResp } from '../../../props'
import { getParentWithClass } from '../../../utils/basic'
import { AlertKind, showAlert } from '../../common/Alert'
import type { TableBasicConf, TableLayoutConf } from '../../conf'
import * as eb from '../../eventbus'
import ListComp from '../list/List.vue'
import { type GanttInfo, TIMELINE_COLUMN_WIDTH, generateTimeline, getStartAndEndDay } from './gantt'
import GanttTimelineHeaderComp from './GanttTimelineHeader.vue'

const props = defineProps<
  {
    layout: TableLayoutConf
    basic: TableBasicConf
  }
>()

const { t } = locales.global

const listRef: Ref<HTMLElement | null> = ref(null)
const timelineRef: Ref<HTMLElement | null> = ref(null)
const ganttInfo: Ref<GanttInfo | null> = ref(null)

function setGlobalWidth() {
  const tableEle = listRef.value!.closest('.iw-tt-table') as HTMLElement
  listRef.value!.style.width = `${tableEle.offsetWidth - props.layout.ganttTimelineWidth}px`
  timelineRef.value!.style.width = `${props.layout.ganttTimelineWidth}px`
}

async function generateGanttInfo(data: TableDataResp | TableDataGroupResp[]) {
  if ((props.layout.ganttPlanStartTimeColumnName === undefined || props.layout.ganttPlanEndTimeColumnName === undefined)
    && (props.layout.ganttRealStartTimeColumnName === undefined || props.layout.ganttRealEndTimeColumnName === undefined)) {
    showAlert(t('gantt.error.timeColumnNotExist'), 2, AlertKind.WARNING, getParentWithClass(timelineRef.value, 'iw-tt')!)
    return
  }

  let timelineStartDate: Date | null = null
  let timelineEndDate: Date | null = null
  // 根据返回的数据确定时间线的开始、结束时间
  if (Array.isArray(data)) {
    data.forEach((groupData) => {
      groupData.records.forEach((d) => {
        const { startDate, endDate } = getStartAndEndDay(d.records, props.layout.ganttPlanStartTimeColumnName, props.layout.ganttPlanEndTimeColumnName, props.layout.ganttRealStartTimeColumnName, props.layout.ganttRealEndTimeColumnName)
        if (timelineStartDate === null || startDate < timelineStartDate) {
          timelineStartDate = startDate
        }
        if (timelineEndDate === null || endDate > timelineEndDate) {
          timelineEndDate = endDate
        }
      })
    })
  }
  else {
    const { startDate, endDate } = getStartAndEndDay(data.records, props.layout.ganttPlanStartTimeColumnName, props.layout.ganttPlanEndTimeColumnName, props.layout.ganttRealStartTimeColumnName, props.layout.ganttRealEndTimeColumnName)
    timelineStartDate = startDate
    timelineEndDate = endDate
  }
  // 组装时间线信息
  const holidays = await eb.loadHolidays(timelineStartDate as Date, timelineEndDate as Date)
  const timeline = generateTimeline(props.layout.ganttShowKind, timelineStartDate as Date, timelineEndDate as Date, holidays)
  ganttInfo.value = {
    timeline,
    ganttShowKind: props.layout.ganttShowKind,
  }
}

function getTimelineRealWidth() {
  const styles: any = {}
  styles.width = `${ganttInfo.value!.timeline.length * TIMELINE_COLUMN_WIDTH}px`
  return styles
}

onMounted(() => {
  // Remove aggregation & action bar functions in this layout
  props.layout.aggs = undefined
  props.layout.actionColumnRender = undefined
  props.layout.columns.map((col) => {
    col.categoryTitle = 'xx'
    return col
  })
  setGlobalWidth()
})

eb.registerLoadDataAfterEvent(async (data: TableDataResp | TableDataGroupResp[], layoutId: string) => {
  if (props.layout.id !== layoutId) {
    return
  }
  await generateGanttInfo(data)
})
</script>

<template>
  <div
    class="iw-gantt flex h-full"
  >
    <div ref="listRef" class="overflow-auto">
      <ListComp :layout="props.layout" :basic="props.basic" />
    </div>
    <div ref="timelineRef" class="overflow-auto border-l border-l-base-300">
      <div
        v-if="ganttInfo"
        :class="`iw-gantt-timeline relative iw-gantt-timeline--size${props.basic.styles.size}`"
        :style="getTimelineRealWidth()"
      >
        <GanttTimelineHeaderComp :gantt-info="ganttInfo" :layout-id="props.layout.id" :styles="props.basic.styles" />
      </div>
    </div>
  </div>
</template>

<style lang="css">
.iw-gantt-timeline--size-xs {
  @apply text-xs;

  .iw-gantt-timeline-cell {
    @apply p-0
  }
}

.iw-gantt-timeline-size-sm {
  @apply text-sm;

  .iw-gantt-timeline-cell {
    @apply p-[1px]
  }
}

.iw-gantt-timeline--size {
  @apply text-base;

  .iw-gantt-timeline-cell {
    @apply p-[2px] pl-[4px]
  }
}

.iw-gantt-timeline--size-lg {
  @apply text-lg;

  .iw-gantt-timeline-cell {
    @apply p-1.5
  }
}
</style>
