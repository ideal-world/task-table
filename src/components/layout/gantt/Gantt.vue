<script setup lang="ts">
import dayjs from 'dayjs'
import type { Ref } from 'vue'
import { onMounted, ref, watch } from 'vue'
import * as iconSvg from '../../../assets/icon'
import locales from '../../../locales'
import { type DataGroupResp, type DataResp, GanttShowKind, type TableLayoutModifyProps, translateGanttShowKind } from '../../../props'
import { getParentWithClass } from '../../../utils/basic'
import { AlertKind, showAlert } from '../../common/Alert'
import MenuComp, { MenuOffsetKind, MenuSizeKind } from '../../common/Menu.vue'
import type { TableBasicConf, TableLayoutConf } from '../../Initializer'
import * as eb from '../../eventbus'
import ColumnResizeComp from '../../function/ColumnResize.vue'
import ListComp from '../list/List.vue'
import { type GanttInfo, generateTimeline, getStartAndEndDay, getTimelineColumnWidth } from './gantt'
import GanttTimelineHeaderComp from './GanttTimelineHeader.vue'
import GanttTimelineRowComp from './GanttTimelineRows.vue'

const props = defineProps<
  {
    layout: TableLayoutConf
    basic: TableBasicConf
  }
>()

const { t } = locales.global

const ganttRef: Ref<HTMLElement | null> = ref(null)
const ganttListRef: Ref<HTMLElement | null> = ref(null)
const ganttTimelineRef: Ref<HTMLElement | null> = ref(null)
const ganttWith: Ref<number> = ref(0)
const ganttInfo: Ref<GanttInfo | null> = ref(null)

const showKindCompRef = ref<InstanceType<typeof MenuComp>>()

async function generateGanttInfo(data: DataResp | DataGroupResp[]) {
  if ((props.layout.ganttPlanStartTimeColumnName === undefined || props.layout.ganttPlanEndTimeColumnName === undefined)
    && (props.layout.ganttActualStartTimeColumnName === undefined || props.layout.ganttActualEndTimeColumnName === undefined)) {
    showAlert(t('gantt.error.timeColumnNotExist'), 2, AlertKind.WARNING, getParentWithClass(ganttRef.value, 'iw-tt')!)
    return
  }

  let timelineStartDate: Date | null = null
  let timelineEndDate: Date | null = null
  let hasError = false
  // Determine the start and end time of the timeline based on the returned data
  if (Array.isArray(data)) {
    data.forEach((groupData) => {
      try {
        const { startDate, endDate } = getStartAndEndDay(groupData.records, props.layout.ganttPlanStartTimeColumnName, props.layout.ganttPlanEndTimeColumnName, props.layout.ganttActualStartTimeColumnName, props.layout.ganttActualEndTimeColumnName)
        if (timelineStartDate === null || startDate < timelineStartDate) {
          timelineStartDate = startDate
        }
        if (timelineEndDate === null || endDate > timelineEndDate) {
          timelineEndDate = endDate
        }
      }
      catch (e: any) {
        showAlert(e.message, 2, AlertKind.WARNING, getParentWithClass(ganttRef.value, 'iw-tt')!)
        hasError = true
      }
    })
  }
  else {
    try {
      const { startDate, endDate } = getStartAndEndDay(data.records, props.layout.ganttPlanStartTimeColumnName, props.layout.ganttPlanEndTimeColumnName, props.layout.ganttActualStartTimeColumnName, props.layout.ganttActualEndTimeColumnName)
      timelineStartDate = startDate
      timelineEndDate = endDate
    }
    catch (e: any) {
      showAlert(e.message, 2, AlertKind.WARNING, getParentWithClass(ganttRef.value, 'iw-tt')!)
      hasError = true
      return
    }
  }
  if (hasError) {
    return
  }
  // Package timeline information
  const holidays = (await eb.loadHolidays(timelineStartDate as Date, timelineEndDate as Date)).map(holiday => dayjs(holiday))
  const timeline = generateTimeline(props.layout.ganttShowKind, timelineStartDate as Date, timelineEndDate as Date, holidays)
  ganttInfo.value = {
    timeline,
    ganttShowKind: props.layout.ganttShowKind,
    holidays,
  }
}

function getTimelineActualWidth() {
  const styles: any = {}
  styles.width = `${ganttInfo.value!.timeline.length * getTimelineColumnWidth(ganttInfo.value!.ganttShowKind)}px`
  return styles
}

onMounted(() => {
  // Remove aggregation & action bar functions in this layout
  props.layout.actionColumnRender = undefined
  props.layout.columns.map((col) => {
    col.categoryTitle = ''
    col.wrap = false
    return col
  })
  ganttWith.value = ganttRef.value!.offsetWidth

  ganttTimelineRef.value!.addEventListener('scroll', () => {
    ganttListRef.value!.scrollTo({
      top: ganttTimelineRef.value!.scrollTop,
    })
  })
  ganttTimelineRef.value!.addEventListener('wheel', (e) => {
    e.preventDefault()
    ganttTimelineRef.value!.scrollTo({
      left: ganttTimelineRef.value!.scrollLeft + e.deltaY,
    })
  })
  ganttListRef.value!.addEventListener('wheel', (e) => {
    e.preventDefault()
    ganttListRef.value!.scrollTo({
      left: ganttListRef.value!.scrollLeft + e.deltaY,
    })
  })
})

watch(props.layout, async () => {
  if (!props.layout.data) {
    return
  }
  await generateGanttInfo(props.layout.data)
})

async function setNewWidth(newWidth: number, _itemId?: string) {
  const changedLayoutReq: TableLayoutModifyProps = {
    ganttTimelineWidth: newWidth,
  }
  await eb.modifyLayout(changedLayoutReq)
}

async function changeShowKind(showKind: GanttShowKind) {
  const changedLayoutReq: TableLayoutModifyProps = {
    ganttShowKind: showKind,
  }
  await eb.modifyLayout(changedLayoutReq)
  showKindCompRef.value?.close()
}
</script>

<template>
  <div
    ref="ganttRef"
    class="iw-gantt flex h-full relative"
  >
    <div ref="ganttListRef" class="overflow-y-hidden overflow-x-auto" :style="`width: ${ganttWith - props.layout.ganttTimelineWidth}px`">
      <ListComp :layout="props.layout" :basic="props.basic" />
    </div>
    <div
      ref="ganttTimelineRef"
      class="iw-gantt-timeline-container overflow-auto border-l-2 border-l-base-300"
      :style="`width: ${props.layout.ganttTimelineWidth}px`"
    >
      <div
        v-if="ganttInfo"
        :class="`iw-gantt-timeline relative iw-gantt-timeline--size${props.basic.styles.size}`"
        :style="getTimelineActualWidth()"
      >
        <GanttTimelineHeaderComp :gantt-info="ganttInfo" :layout-id="props.layout.id" :style-conf="props.basic.styles" />
        <template v-if="props.layout.data && !Array.isArray(props.layout.data)">
          <GanttTimelineRowComp
            :records="props.layout.data.records"
            :pk-column-name="props.basic.pkColumnName"
            :parent-pk-column-name="props.basic.parentPkColumnName"
            :sub-data-show-kind="props.layout.subDataShowKind"
            :layout="props.layout"
            :style-conf="props.basic.styles"
            :gantt-info="ganttInfo"
          />
        </template>
        <template v-else-if="props.layout.data && Array.isArray(props.layout.data)">
          <template v-for="groupData in props.layout.data" :key="`${props.layout.id}-${groupData.groupValue}`">
            <div
              :class="`${props.basic.styles.rowClass} iw-gantt-timeline-row flex bg-base-100 border-y border-y-base-300 border-r border-r-base-300 text-sm`"
            >
              <div class="iw-gantt-timeline-cell">
                &nbsp;
              </div>
            </div>
            <GanttTimelineRowComp
              :records="groupData.records"
              :pk-column-name="props.basic.pkColumnName"
              :parent-pk-column-name="props.basic.parentPkColumnName"
              :sub-data-show-kind="props.layout.subDataShowKind"
              :layout="props.layout"
              :style-conf="props.basic.styles"
              :gantt-info="ganttInfo"
            />
            <div
              class="flex justify-end p-2 min-h-0"
            >
              <div>
                <button class="iw-btn ml-1 iw-btn-xs" style="visibility: hidden;">
                  For placeholder only, highly aligned with paging controls
                </button>
              </div>
            </div>
          </template>
        </template>
      </div>
      <ColumnResizeComp resize-item-class="iw-gantt-timeline-container" handle-left :set-size="setNewWidth" />
    </div>
    <button
      class="iw-btn iw-btn-outline iw-btn-xs bg-base-200 absolute right-1 top-1 z-[1600]"
      @click="(e) => { showKindCompRef?.show(e.target as HTMLElement, MenuOffsetKind.RIGHT_TOP, MenuSizeKind.MINI) }"
    >
      <span class="mr-0.5">{{ translateGanttShowKind(props.layout.ganttShowKind) }}</span>
      <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
    </button>
    <MenuComp ref="showKindCompRef">
      <div
        class="p-2 hover:cursor-pointer text-xs"
        @click="changeShowKind(GanttShowKind.DAY)"
      >
        {{ translateGanttShowKind(GanttShowKind.DAY) }}
      </div>
      <div
        class="p-2 hover:cursor-pointer text-xs"
        @click="changeShowKind(GanttShowKind.WEEK)"
      >
        {{ translateGanttShowKind(GanttShowKind.WEEK) }}
      </div>
      <div
        class="p-2 hover:cursor-pointer text-xs"
        @click="changeShowKind(GanttShowKind.MONTH)"
      >
        {{ translateGanttShowKind(GanttShowKind.MONTH) }}
      </div>
      <div
        class="p-2 hover:cursor-pointer text-xs"
        @click="changeShowKind(GanttShowKind.YEAR)"
      >
        {{ translateGanttShowKind(GanttShowKind.YEAR) }}
      </div>
    </MenuComp>
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
