<script setup lang="ts">
import dayjs from 'dayjs'
import type { Ref } from 'vue'
import { onMounted, ref, watch } from 'vue'
import * as iconSvg from '../../../assets/icon'
import type { DataGroupResp, DataResp, GanttLayoutProps, LayoutModifyProps } from '../../../props'
import { AlertKind, GanttShowKind, translateGanttShowKind } from '../../../props/enumProps'
import { getParentWithClass } from '../../../utils/basic'
import { AlertLevel } from '../../common/Alert'
import { MenuOffsetKind, MenuSizeKind } from '../../common/Menu'
import MenuComp from '../../common/Menu.vue'
import type { ColumnConf, LayoutConf, TableConf } from '../../conf'
import * as eb from '../../eventbus'
import ColumnResizeComp from '../../function/ColumnResize.vue'
import ListComp from '../list/List.vue'
import ContextMenuComp from '../../function/ContextMenu.vue'
import type { ContextMenuItemProps } from '../../../props/functionProps'
import { type GanttInfo, generateTimeline, getStartAndEndDay, getTimelineColumnWidth } from './gantt'
import GanttTimelineHeaderComp from './GanttTimelineHeader.vue'
import GanttTimelineRowComp from './GanttTimelineRows.vue'

const props = defineProps<
  {
    // 布局配置
    // Layout configuration
    layoutConf: LayoutConf
    // 甘特图配置
    // Gantt chart configuration
    ganttProps: GanttLayoutProps
    // 表格配置
    // Table configuration
    tableConf: TableConf
    // 列配置
    // Column configuration
    columnsConf: ColumnConf[]
  }
>()

// 甘特图整体容器的引用
// Reference to the overall container of the Gantt chart
const ganttRef: Ref<HTMLElement | null> = ref(null)
// 甘特图列表引用
// Gantt chart list reference
const ganttListRef: Ref<HTMLElement | null> = ref(null)
// 甘特图时间线引用
// Gantt chart timeline reference
const ganttTimelineRef: Ref<HTMLElement | null> = ref(null)
// 甘特图宽度
// Gantt chart width
const ganttWith: Ref<number> = ref(0)
// 甘特图信息
// Gantt chart information
const ganttInfo: Ref<GanttInfo | null> = ref(null)

// 显示类型菜单引用
// Show type menu reference
const showKindCompRef = ref<InstanceType<typeof MenuComp>>()

// 当前单元格行主键
// Current cell row pk
const curCellRowPk = ref()

/**
 * 生成甘特图信息
 *
 * Generate Gantt information
 *
 * @param data 数据 / Data
 */
async function generateGanttInfo(data: DataResp | DataGroupResp[]) {
  let timelineStartDate: Date | null = null
  let timelineEndDate: Date | null = null
  let hasError = false
  // Determine the start and end time of the timeline based on the returned data
  if (Array.isArray(data)) {
    data.forEach((groupData) => {
      try {
        const { startDate, endDate } = getStartAndEndDay(groupData.records, props.ganttProps.planStartTimeColumnName, props.ganttProps.planEndTimeColumnName, props.ganttProps.actualStartTimeColumnName, props.ganttProps.actualEndTimeColumnName)
        if (timelineStartDate === null || startDate < timelineStartDate) {
          timelineStartDate = startDate
        }
        if (timelineEndDate === null || endDate > timelineEndDate) {
          timelineEndDate = endDate
        }
      }
      catch (e: any) {
        eb.handleAlert(AlertKind.DATA_ERROR, e.message, AlertLevel.WARNING, 4, getParentWithClass(ganttRef.value, 'iw-tt')!)
        hasError = true
      }
    })
  }
  else {
    try {
      const { startDate, endDate } = getStartAndEndDay(data.records, props.ganttProps.planStartTimeColumnName, props.ganttProps.planEndTimeColumnName, props.ganttProps.actualStartTimeColumnName, props.ganttProps.actualEndTimeColumnName)
      timelineStartDate = startDate
      timelineEndDate = endDate
    }
    catch (e: any) {
      eb.handleAlert(AlertKind.DATA_ERROR, e.message, AlertLevel.WARNING, 4, getParentWithClass(ganttRef.value, 'iw-tt')!)
      hasError = true
      return
    }
  }
  if (hasError) {
    return
  }
  // Package timeline information
  const holidays = (await eb.loadHolidays(timelineStartDate as Date, timelineEndDate as Date)).map(holiday => dayjs(holiday))
  const timeline = generateTimeline(props.ganttProps.showKind, timelineStartDate as Date, timelineEndDate as Date, holidays)
  ganttInfo.value = {
    timeline,
    ganttShowKind: props.ganttProps.showKind,
    holidays,
  }
}

/**
 * 获取时间线实际宽度
 *
 * Get the actual width of the timeline
 */
function getTimelineActualWidth() {
  const styles: any = {}
  styles.width = `${ganttInfo.value!.timeline.length * getTimelineColumnWidth(ganttInfo.value!.ganttShowKind)}px`
  return styles
}

onMounted(() => {
  // Remove aggregation & action bar functions in this layout
  props.layoutConf.actionColumn = undefined
  props.layoutConf.columns.map((col) => {
    col.categoryTitle = ''
    col.wrap = false
    return col
  })
  ganttWith.value = ganttRef.value!.offsetWidth

  // 监听甘特图的滚动条事件，同步列表视图的滚动条
  // Listen for scroll events on the Gantt chart and synchronize the scroll bar of the list view
  ganttTimelineRef.value!.addEventListener('scroll', () => {
    ganttListRef.value!.scrollTo({
      top: ganttTimelineRef.value!.scrollTop,
    })
  })
  // 监听甘特图的鼠标滚轮事件，同步列表视图的鼠标滚轮事件
  // Listen for mouse wheel events on the Gantt chart and synchronize the mouse wheel events of the list view
  ganttTimelineRef.value!.addEventListener('wheel', (e) => {
    e.preventDefault()
    // 水平滚动
    // Horizontal scrolling
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      ganttTimelineRef.value!.scrollTo({
        left: ganttTimelineRef.value!.scrollLeft + e.deltaX,
      })
    }
    // 垂直滚动
    // Vertical scrolling
    else {
      ganttTimelineRef.value!.scrollTo({
        left: ganttTimelineRef.value!.scrollLeft + e.deltaY,
      })
    }
  })
  // 监听列表视图的鼠标滚轮事件，同步甘特图的鼠标滚轮事件
  // Listen for mouse wheel events on the list view and synchronize the mouse wheel events of the Gantt chart
  ganttListRef.value!.addEventListener('wheel', (e) => {
    e.preventDefault()
    // 水平滚动
    // Horizontal scrolling
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      ganttListRef.value!.scrollTo({
        left: ganttListRef.value!.scrollLeft + e.deltaX,
      })
    }
    // 垂直滚动
    // Vertical scrolling
    else {
      ganttListRef.value!.scrollTo({
        left: ganttListRef.value!.scrollLeft + e.deltaY,
      })
    }
  })
})

// 监听布局配置变化
// Listen for layout configuration changes
watch(props.layoutConf, async () => {
  if (!props.layoutConf.data) {
    return
  }
  // 生成甘特图信息
  // Generate Gantt information
  await generateGanttInfo(props.layoutConf.data)
})

/**
 * 设置新的宽度
 *
 * Set new width
 *
 * @param timelineWidth 时间线宽度 / Timeline width
 * @param _itemId 项ID，此处不需要 / Item ID,not needed here
 */
async function setNewWidth(timelineWidth: number, _itemId?: string) {
  const changedLayoutReq: LayoutModifyProps = {
    gantt: {
      showKind: props.ganttProps.showKind,
      timelineWidth,
      planStartTimeColumnName: props.ganttProps.planStartTimeColumnName,
      planEndTimeColumnName: props.ganttProps.planEndTimeColumnName,
      actualStartTimeColumnName: props.ganttProps.actualStartTimeColumnName,
      actualEndTimeColumnName: props.ganttProps.actualEndTimeColumnName,
    },
  }
  await eb.modifyLayout(changedLayoutReq)
}

/**
 * 修改显示类型
 *
 * Change the display type
 *
 * @param showKind 显示类型 / Display type
 */
async function changeShowKind(showKind: GanttShowKind) {
  const changedLayoutReq: LayoutModifyProps = {
    gantt: {
      showKind,
      timelineWidth: props.ganttProps.timelineWidth,
      planStartTimeColumnName: props.ganttProps.planStartTimeColumnName,
      planEndTimeColumnName: props.ganttProps.planEndTimeColumnName,
      actualStartTimeColumnName: props.ganttProps.actualStartTimeColumnName,
      actualEndTimeColumnName: props.ganttProps.actualEndTimeColumnName,
    },
  }
  await eb.modifyLayout(changedLayoutReq)
  showKindCompRef.value?.close()
}

/**
 * 获取上下文菜单
 *
 * Get context menu
 *
 * @return ContextMenuProps[]
 *
 */
function getContextMenu() {
  // eslint-disable-next-line eqeqeq
  const row = (props.layoutConf.data as DataResp).records?.find(ele => ele[props.tableConf.pkColumnName] == curCellRowPk.value)
  const contextMenu: ContextMenuItemProps[] = []

  if (!row || !props.ganttProps.actualStartTimeColumnName || !props.ganttProps.actualEndTimeColumnName)
    return

  if (!row[props.ganttProps.actualStartTimeColumnName] && !row[props.ganttProps.actualEndTimeColumnName]) {
    contextMenu.push({
      id: 'actualData',
      label: '实际周期',
    })
  }
  if (!row[props.ganttProps.planStartTimeColumnName] && !row[props.ganttProps.planEndTimeColumnName]) {
    contextMenu.push({
      id: 'planData',
      label: '计划周期',
    })
  }

  return contextMenu
}

/**
 *
 * 上下文菜单额外传参
 *
 * ContextMenu extra args
 *
 * @param e 鼠标事件 / Mouse event
 * @returns 当前行的主键值 / current row pk , 修改的值 / change value
 *
 */
function exContextMenuArg(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (Array.from(target.classList).includes('iw-gantt-timeline-bar')) {
    const rowTarget = target.closest('.iw-gantt-timeline-row') as HTMLElement
    curCellRowPk.value = rowTarget.dataset.pk
    const cellTargetWidth = (rowTarget.children[0] as HTMLElement).offsetWidth
    const rowClientX = e.offsetX + Number.parseFloat(target.style.left)
    const curCellTarget = rowTarget.children[Math.floor(rowClientX / cellTargetWidth)] as HTMLElement
    return {
      pk: curCellRowPk.value,
      value: `${curCellTarget.dataset.groupValue}-${curCellTarget.dataset.value}`,
    }
  }
  else {
    curCellRowPk.value = ((e.target as HTMLElement)?.closest('.iw-gantt-timeline-row') as HTMLElement).dataset.pk
    return {
      pk: curCellRowPk.value,
      value: `${target.dataset.groupValue}-${target.dataset.value}`,
    }
  }
}
</script>

<template>
  <div
    ref="ganttRef"
    class="iw-gantt flex h-full relative"
  >
    <div ref="ganttListRef" class="overflow-y-hidden overflow-x-auto" :style="`width: ${ganttWith - props.ganttProps.timelineWidth}px`">
      <!-- 甘特图列表，直接引用列表视图 -->
      <!-- Gantt chart list, directly reference the list view -->
      <ListComp :layout-conf="props.layoutConf" :table-conf="props.tableConf" :columns-conf="props.columnsConf" />
    </div>
    <div
      ref="ganttTimelineRef"
      class="iw-gantt-timeline-container overflow-auto border-l-2 border-l-base-300"
      :style="`width: ${props.ganttProps.timelineWidth}px`"
    >
      <div
        v-if="ganttInfo"
        :class="`iw-gantt-timeline relative iw-gantt-timeline--size${props.tableConf.styles.size}`"
        :style="getTimelineActualWidth()"
      >
        <GanttTimelineHeaderComp :gantt-info="ganttInfo" :layout-id="props.layoutConf.id" :style-props="props.tableConf.styles" />
        <!-- 与列表视图保持一致，不分组模式的处理 -->
        <!-- Consistent with the list view, the processing of non-grouping mode -->
        <template v-if="props.layoutConf.data && !Array.isArray(props.layoutConf.data)">
          <ContextMenuComp class="h-full" :get-context-menu="getContextMenu" :ex-context-menu-arg="exContextMenuArg">
            <GanttTimelineRowComp
              :layout-id="props.layoutConf.id"
              :gantt-props="props.ganttProps"
              :records="props.layoutConf.data.records"
              :pk-column-name="props.tableConf.pkColumnName"
              :parent-pk-column-name="props.tableConf.parentPkColumnName"
              :sub-data-show-kind="props.layoutConf.subDataShowKind"
              :style-props="props.tableConf.styles"
              :gantt-info="ganttInfo"
            />
          </ContextMenuComp>
        </template>
        <!-- 与列表视图保持一致，分组模式的处理 -->
        <!-- Consistent with the list view, the processing of grouping mode -->
        <template v-else-if="props.layoutConf.data && Array.isArray(props.layoutConf.data)">
          <template v-for="groupData in props.layoutConf.data" :key="`${props.layoutConf.id}-${groupData.groupValue}`">
            <div
              v-if="layoutConf.agg"
              :class="`${props.tableConf.styles.rowClass} iw-gantt-timeline-row flex bg-base-100 border-y border-y-base-300 border-r border-r-base-300 text-sm`"
            >
              <!-- 模拟聚合功能的占位 -->
              <!-- Placeholder for simulating aggregation function -->
              <div class="iw-gantt-timeline-cell">
                &nbsp;
              </div>
            </div>
            <GanttTimelineRowComp
              :layout-id="props.layoutConf.id"
              :gantt-props="props.ganttProps"
              :records="groupData.records"
              :pk-column-name="props.tableConf.pkColumnName"
              :parent-pk-column-name="props.tableConf.parentPkColumnName"
              :sub-data-show-kind="props.layoutConf.subDataShowKind"
              :style-props="props.tableConf.styles"
              :gantt-info="ganttInfo"
            />
            <div
              class="flex justify-end p-2 min-h-0"
            >
              <!-- 模拟分页功能的占位 -->
              <!-- Placeholder for simulating pagination function -->
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
      <span class="mr-0.5">{{ translateGanttShowKind(props.ganttProps.showKind) }}</span>
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
