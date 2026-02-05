<script setup lang="ts">
import type { Ref } from 'vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import dayjs from 'dayjs'
import ScrollableComp from './components/common/Scrollable.vue'
import type { ColumnConf, LayoutConf, TableConf } from './components/conf'
import { init } from './components/conf'
import * as eb from './components/eventbus'
import FilterSettingComp from './components/function/FilterSetting.vue'
import PaginationComp from './components/function/Pagination.vue'
import QuickSearchComp from './components/function/QuickSearch.vue'
import RowSortSettingComp from './components/function/RowSortSetting.vue'
import GanttComp from './components/layout/gantt/Gantt.vue'
import GanttCompNew from './components/layout/gantt/GanttNew.vue'
import ListComp from './components/layout/list/List.vue'
import type { SimpleTableProps } from './props'
import { LayoutKind, ModeKind } from './props/enumProps'
import { debounce, delegateEvent } from './utils/basic'
import ContextMenuComp from './components/function/ContextMenu.vue'
import TableHeaderItem from './components/function/TableHeaderItem.vue'
import TableLayoutSettingComp from './components/function/TableLayoutSetting.vue'
import * as iconSvg from './assets/icon'
import { MenuOffsetKind } from './components/common/Menu'

const _props = defineProps<SimpleTableProps>()

const { tableConf, layoutsConf, currentLayoutId }: {
  // 表格配置
  // Table configuration
  tableConf: TableConf
  // 布局配置
  // Layout configuration
  layoutsConf: LayoutConf[]
  // 当前布局ID
  // Current layout ID
  currentLayoutId: Ref<string>
} = init(_props)

// 是否为简单模式
// Is simple mode
const isSimpleMode = computed(() => tableConf.mode === ModeKind.SIMPLE)
// 是否为迷你模式
// Is mini mode
const isMiniMode = computed(() => tableConf.mode === ModeKind.MINI)
// 已展示的布局
// Shown layout
const layoutShown = ref<{ [key: string]: boolean }>({ [currentLayoutId.value]: true })
// 是否显示表格
// Is show table
const isShowTable = ref(true)
// 是否显示表格
// Is show layout tab
const isShowLayoutTab = ref(true)
// 是否显示表格的pagination
// Is show table pagination
const isShowTablePagination = ref(true)
/**
 * 是否显示主键列
 * Whether the primary key column is show
 */
const showPkColumn = computed(() => tableConf.pkColumnShowName !== 'hidden')

/**
 * 获取当前布局配置
 *
 * Get current layout configuration
 */
function getCurrentLayoutConf(): LayoutConf {
  layoutShown.value[currentLayoutId.value] = true
  return layoutsConf.find(conf => conf.id === currentLayoutId.value)!
}

/**
 * 获取当前布局列配置
 *
 * Get current layout column configuration
 */
function getCurrentLayoutColumnConf(): ColumnConf[] {
  if (!currentLayoutId.value)
    return {} as ColumnConf[]
  // 过滤掉隐藏的列和主键列（如果主键列不显示）
  // Filter out hidden columns and primary key columns (if primary key column is not shown)
  return getCurrentLayoutConf().columns.filter(column => !column.innerHide).filter(column => !column.hide && (showPkColumn.value ? true : column.name !== tableConf.pkColumnName)).map((column) => {
    return {
      ...tableConf.columns.find(col => col.name === column.name)!,
      ...column,
    }
  })
}
/**
 * 获取可排序的列配置
 *
 * Get sortable column configuration
 */
function getSortableColumnsConf(): ColumnConf[] {
  return tableConf.columns.filter(column => !getCurrentLayoutConf().columns.find(layoutColumn => layoutColumn.name === column.name)?.hide)
}

/**
 * 设置高度
 *
 * Set height
 */
function setHeight() {
  nextTick(() => {
    // Set table height
    Array.prototype.forEach.call(document.getElementsByClassName('iw-tt'), (ttEle) => {
      const outHeight = ttEle.parentElement?.clientHeight
      const headerEle = ttEle.getElementsByClassName('iw-tt-header')
      const headerHeight = headerEle.length > 0 ? headerEle[0].offsetHeight : 0
      Array.prototype.forEach.call(ttEle.getElementsByClassName('iw-tt-layout'), (layoutEle) => {
        if (layoutEle.id !== `iw-tt-layout-${currentLayoutId.value}`) {
          return
        }
        const toolbarEle = layoutEle.getElementsByClassName('iw-tt-toolbar')
        const toolbarHeight = toolbarEle.length > 0 ? toolbarEle[0].offsetHeight : 0
        const layoutStyleHeight = layoutEle.getElementsByClassName('iw-tt-footer')[0]?.style.height
        const footerHeight = (layoutStyleHeight && layoutStyleHeight.split('px')[0]) || layoutEle.getElementsByClassName('iw-tt-footer')[0]?.offsetHeight
        if (!layoutStyleHeight && layoutEle.getElementsByClassName('iw-tt-footer').length > 0) {
          layoutEle.getElementsByClassName('iw-tt-footer')[0].style.height = `${footerHeight}px`
        }
        layoutEle.getElementsByClassName('iw-tt-table')[0].style.height = `${outHeight - headerHeight - toolbarHeight - (footerHeight || 0)}px`
      })
    })
  })
}

const onResize = debounce(() => setHeight(), 800)

function onTerminalResize() {
  window.addEventListener('resize', onResize)
}
function removeResizeListener() {
  window.removeEventListener('resize', onResize)
}

watch(
  () => layoutsConf.length,
  () => {
    const idx = layoutsConf.findIndex(ele => ele.id === currentLayoutId.value)
    if (idx !== -1) {
      currentLayoutId.value = layoutsConf[idx].id
    }
    else {
      currentLayoutId.value = layoutsConf[0]?.id
    }
    setHeight()
  },
)

onMounted(async () => {
  delegateEvent(`#iw-tt-${tableConf.id}`, 'click', '.iw-tt-header__item', async (e: Event) => {
    const target = (e.target as HTMLElement).closest('.iw-tt-header__item') as HTMLElement
    const layoutId = target.dataset.layoutId
    if (layoutId && (currentLayoutId.value !== layoutId)) {
      currentLayoutId.value = layoutId
      await eb.watch(currentLayoutId.value)
      setHeight()
    }
  })
  await eb.watch(currentLayoutId.value)
  setHeight()
  onTerminalResize()
})

onBeforeUnmount(() => {
  removeResizeListener()
})

/**
 * 通过columnName获取上下文菜单
 *
 * Gets the context menu by column name
 *
 * @param e 鼠标事件 / Mouse event
 */
function getContextMenu(e: MouseEvent) {
  const target = (e.target as HTMLElement)?.closest('.iw-data-cell') as HTMLElement
  const columnName = target.dataset?.columnName as string
  const currentLayout = layoutsConf.find(l => l.id === currentLayoutId.value)
  if (!currentLayout || !currentLayout.contextMenu || !currentLayout.contextMenu.items[columnName]) {
    return []
  }
  return (currentLayout.contextMenu.items[columnName])
}

//
/**
 * 菜单额外参数
 *
 * ContextMenu extra argument
 *
 * @param e 鼠标事件 / Mouse event
 */
function exContextMenuArg(e: MouseEvent) {
  const target = (e.target as HTMLElement)?.closest('.iw-data-cell') as HTMLElement
  return target.dataset.rowPk
}

// 布局头部tab容器
// Layout head tab container
const TableHeaderItemRef = ref<InstanceType<typeof TableHeaderItem>>()
// 布局设置组件
// Layout setting component
const tableLayoutSettingCompRef = ref<InstanceType<typeof TableLayoutSettingComp>>()

/**
 * 显示布局菜单
 *
 * Show layout menu
 *
 * @param e 鼠标事件 / Mouse event
 */
function showLayoutTableSetting(e: MouseEvent) {
  tableLayoutSettingCompRef.value?.tableLayoutSettingRef?.show(e, MenuOffsetKind.RIGHT_TOP, { width: 220 }, false, (e.target as HTMLElement).closest('.iw-tt') as HTMLElement)
}

defineExpose({
  currentLayoutId, // 当前布局id
  isShowTable, // 是否显示表格
  isShowLayoutTab, // 是否显示布局tab
  isShowTablePagination, // 是否显示表格pagination
  setHeight, // 重新设置高度
})
</script>

<!--
+-----------------------------------------+
| iw-tt                                   |
| +-------------------------------------+ |
| |iw-tt-header                          | |
| +------------------+------------------+ |
| |iw-tt-header__item|iw-tt-header__item| |
| +------------------+------------------+ |
| |iw-tt-layout                         | |
| |  +-------------------+              | |
| |  |iw-tt-toolbar      |              | |
| |  +-------------------+              | |
| |  |iw-tt-table        |              | |
| |  +-------------------+              | |
| |  |iw-tt-footer       |              | |
| |  |           +-------+-----------+  | |
| |  |           |iw-tt-toolbar      |  | |
| |  |           +-------------------+  | |
| |  |           |iw-tt-table        |  | |
| |  |           |       |           |  | |
| |  +-----------+-------+           |  | |
| |              +-------------------+  | |
| +------------------+------------------+ |
+-----------------------------------------+
-->
<template>
  <div
    :id="`iw-tt-${tableConf.id}`"
    :class="`${tableConf.styles.tableClass} iw-tt w-full text-sm text-base-content bg-base-100 relative`"
  >
    <div
      v-if="!isSimpleMode"
      :class="`${tableConf.styles.headerClass} iw-tt-header flex items-center justify-between p-0 min-h-0  leading-8`"
    >
      <TableHeaderItem
        v-show="isShowLayoutTab"
        v-if="!isMiniMode && !tableConf.hiddenConfig?.TAB"
        ref="TableHeaderItemRef"
        class=" flex-1"
        :table-conf="tableConf" :layouts-conf="layoutsConf"
        :current-layout-id="currentLayoutId"
        :get-current-layout-conf="getCurrentLayoutConf"
        :get-current-layout-column-conf="getCurrentLayoutColumnConf"
        :is-mini-mode="isMiniMode"
      />
      <div v-else-if="!(tableConf.hiddenConfig?.TAB && tableConf.hiddenConfig?.QUICK_SEARCH)" class="flex-1 flex h-full items-center">
        <slot name="header-prepend" />
        &nbsp;
      </div>
      <div v-show="!isShowLayoutTab" />
      <div class="flex items-center justify-end">
        <QuickSearchComp
          v-if="tableConf.quickSearch && !tableConf.hiddenConfig?.QUICK_SEARCH"
          class="mx-2"
          :quick-search="tableConf.quickSearch"
        />
        <slot name="header-extra" />
      </div>
    </div>
    <template v-for="layout in layoutsConf" :key="layout.id">
      <div v-if="layoutsConf && layoutsConf.length && layoutShown[layout.id]" v-show="currentLayoutId === layout.id" :id="`iw-tt-layout-${layout.id}`" class="iw-tt-layout">
        <div
          v-if="!isMiniMode && (layout.sort || layout.filter)"
          class="iw-tt-toolbar flex items-center px-0.5 py-[10px]"
        >
          <slot name="header-prepend" />
          <RowSortSettingComp v-if="layout.sort" :sortable-columns-conf="getSortableColumnsConf()" :layout-id="layout.id" :sort="layout.sort" />
          <div class="iw-divider iw-divider-horizontal m-0.5" />
          <ScrollableComp v-if="layout.filter" class="flex-1" :data-layout-id="layout.id">
            <FilterSettingComp :layout-id="layout.id" :filter="layout.filter" :columns-conf="getCurrentLayoutColumnConf()" />
          </ScrollableComp>
          <div v-if="isSimpleMode" class="flex items-center justify-end">
            <QuickSearchComp
              v-if="tableConf.quickSearch && !tableConf.hiddenConfig?.QUICK_SEARCH"
              class="mx-2"
              :quick-search="tableConf.quickSearch"
            />
            <slot name="header-extra" />
          </div>
          <div v-if="isSimpleMode" class="ml-auto cursor-pointer mr-2 whitespace-nowrap" @click="(e) => showLayoutTableSetting(e)">
            <i

              :class="iconSvg.SETTING"
              class="text-base ml-2"
            />
            {{ $t("_.table.settingTitle") }}
          </div>
        </div>
        <div v-show="isShowTable" class="iw-tt-table overflow-auto w-full border border-base-300">
          <ContextMenuComp class="h-full" :get-context-menu="getContextMenu" :ex-context-menu-arg="exContextMenuArg">
            <ListComp v-if="layout.layoutKind === LayoutKind.LIST" :layout-conf="layout" :table-conf="tableConf" :columns-conf="getCurrentLayoutColumnConf()" :show-pk-column="showPkColumn" />
            <GanttComp v-else-if="layout.layoutKind === LayoutKind.GANTT && layout.gantt" :gantt-props="layout.gantt" :layout-conf="layout" :table-conf="tableConf" :columns-conf="getCurrentLayoutColumnConf()" :show-pk-column="showPkColumn" />
            <GanttCompNew v-else-if="layout.layoutKind === LayoutKind.GANTT_NEW && layout.gantt" :key="layout.id" :gantt-props="layout.gantt" :layout-conf="layout" :table-conf="tableConf" :columns-conf="getCurrentLayoutColumnConf()" :show-pk-column="showPkColumn" />
          </ContextMenuComp>
        </div>
        <div
          v-show="isShowTable"
          v-if="!tableConf.hiddenConfig?.PAGINATION"
          :class="`${tableConf.styles.footerClass} iw-tt-footer flex justify-between p-1 min-h-0`"
        >
          <div class="flex-1 overflow-x-auto">
            <slot v-if="layout.layoutKind === LayoutKind.GANTT_NEW && layout.ganttConf?.kind === 'member'" name="customActionBar">
              <input :value="layout.ganttConf.queryStartDate ? dayjs(layout.ganttConf.queryStartDate).format('YYYY-MM-DD') : ''" type="date" class="iw-input iw-input-bordered iw-input-xs rounded" @change="(e:any) => layout.ganttConf!.queryStartDate = e.target!.value">
              ~ <input :value="layout.ganttConf.queryEndDate ? dayjs(layout.ganttConf.queryEndDate).format('YYYY-MM-DD') : ''" type="date" class="iw-input iw-input-bordered iw-input-xs rounded" @change="(e:any) => layout.ganttConf!.queryEndDate = e.target!.value">
            </slot>
            <slot v-else name="customActionBar" />
          </div>
          <template v-if="(layout.layoutKind === LayoutKind.LIST || layout.layoutKind === LayoutKind.GANTT || layout.layoutKind === LayoutKind.GANTT_NEW) && layout.data && !Array.isArray(layout.data)">
            <div v-show="isShowTablePagination" class="flex">
              <PaginationComp :slice="layout.slice" :total-number="layout.data.totalNumber" />
            </div>
          </template>
        </div>
      </div>
    </template>
    <TableLayoutSettingComp
      v-if="currentLayoutId === currentLayoutId && !isMiniMode"
      ref="tableLayoutSettingCompRef"
      :table-conf="tableConf"
      :layout-conf="getCurrentLayoutConf()"
      :columns-conf="getCurrentLayoutColumnConf()"
      :layout-length="layoutsConf.length"
    />
  </div>
</template>
