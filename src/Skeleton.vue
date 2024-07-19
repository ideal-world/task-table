<script setup lang="ts">
import type { Ref } from 'vue'
import { nextTick, onMounted, watch } from 'vue'
import ScrollableComp from './components/common/Scrollable.vue'
import type { ColumnConf, LayoutConf, TableConf } from './components/conf'
import { init } from './components/conf'
import * as eb from './components/eventbus'
import FilterSettingComp from './components/function/FilterSetting.vue'
import PaginationComp from './components/function/Pagination.vue'
import QuickSearchComp from './components/function/QuickSearch.vue'
import RowSortSettingComp from './components/function/RowSortSetting.vue'
import TableSettingComp from './components/function/TableSetting.vue'
import GanttComp from './components/layout/gantt/Gantt.vue'
import ListComp from './components/layout/list/List.vue'
import type { SimpleTableProps } from './props'
import { LayoutKind } from './props/enumProps'
import { delegateEvent } from './utils/basic'
import ContextMenuComp from './components/function/ContextMenu.vue'

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

/**
 * 获取当前布局配置
 *
 * Get current layout configuration
 */
function getCurrentLayoutConf(): LayoutConf {
  return layoutsConf.find(conf => conf.id === currentLayoutId.value)!
}

/**
 * 获取当前布局列配置
 *
 * Get current layout column configuration
 */
function getCurrentLayoutColumnConf(): ColumnConf[] {
  return getCurrentLayoutConf().columns.filter(column => !column.hide).map((column) => {
    return {
      ...tableConf.columns.find(col => col.name === column.name)!,
      ...column,
    }
  })
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
        const layoutStyleHeight = layoutEle.getElementsByClassName('iw-tt-footer')[0].style.height
        const footerHeight = layoutStyleHeight || layoutEle.getElementsByClassName('iw-tt-footer')[0].offsetHeight
        if (!layoutStyleHeight) {
          layoutEle.getElementsByClassName('iw-tt-footer')[0].style.height = `${footerHeight}px`
        }
        layoutEle.getElementsByClassName('iw-tt-table')[0].style.height = `${outHeight - headerHeight - toolbarHeight - footerHeight}px`
      })
    })
  })
}

watch(
  () => layoutsConf.length,
  (_newVal, oldVal) => {
    if (oldVal) {
      currentLayoutId.value = layoutsConf[layoutsConf.length - 1].id
    }
    else {
      currentLayoutId.value = layoutsConf[0].id
    }
    setHeight()
  },
)

onMounted(async () => {
  delegateEvent(`#iw-tt-${tableConf.id}`, 'click', '.iw-tt-header__item', (e: Event) => {
    const target = e.target as HTMLElement
    const layoutId = target.dataset.layoutId
    if (layoutId) {
      currentLayoutId.value = layoutId
      setHeight()
    }
  })
  await eb.watch()
  setHeight()
})

/**
 * 获取上下文菜单
 * @param columnName 列名 / Column name
 */
function getContextMenu(columnName: string) {
  const currentLayout = layoutsConf.find(l => l.id === currentLayoutId.value)
  if (!currentLayout || !currentLayout.contextMenu || !currentLayout.contextMenu.items[columnName]) {
    return []
  }
  return (currentLayout.contextMenu.items[columnName])
}
</script>

<!--
+-----------------------------------------+
| iw-tt                                   |
| +-------------------------------------+ |
| |w-tt-header                          | |
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
      v-if="!tableConf.mini || tableConf.quickSearch"
      :class="`${tableConf.styles.headerClass} iw-tt-header flex justify-between p-0 min-h-0`"
    >
      <ScrollableComp
        v-if="!tableConf.mini"
        class="flex-1"
      >
        <div class="tablist iw-tabs iw-tabs-sm iw-tabs-boxed">
          <a
            v-for="layout in layoutsConf"
            :key="layout.id"
            :data-layout-id="layout.id"
            role="tab"
            class="iw-tt-header__item iw-tab flex flex-nowrap"
            :class="currentLayoutId === layout.id ? 'iw-tab-active' : ''"
          >
            <i :class="`${layout.icon}`" class="mr-1" /> {{ layout.title }}
          </a>
        </div>
      </ScrollableComp>
      <div v-else class="flex-1">
        &nbsp;
      </div>
      <div class="flex items-center">
        <QuickSearchComp
          v-if="tableConf.quickSearch"
          class="mx-2"
          :quick-search="tableConf.quickSearch"
        />
        <TableSettingComp
          v-if="!tableConf.mini"
          :table-conf="tableConf"
          :layout-conf="getCurrentLayoutConf()"
          :columns-conf="getCurrentLayoutColumnConf()"
          :layout-length="layoutsConf.length"
        />
      </div>
    </div>
    <template v-for="layout in layoutsConf" :key="layout.id">
      <div v-show="currentLayoutId === layout.id" :id="`iw-tt-layout-${layout.id}`" class="iw-tt-layout">
        <div
          v-if="!tableConf.mini && (layout.sort || layout.filter)"
          class="iw-tt-toolbar flex items-center h-8 p-0.5"
        >
          <RowSortSettingComp v-if="layout.sort" :layout-id="layout.id" :sort="layout.sort" :columns-conf="getCurrentLayoutColumnConf()" />
          <div class="iw-divider iw-divider-horizontal m-0.5" />
          <ScrollableComp v-if="layout.filter" class="flex-1" :data-layout-id="layout.id">
            <FilterSettingComp :layout-id="layout.id" :filter="layout.filter" :columns-conf="getCurrentLayoutColumnConf()" />
          </ScrollableComp>
        </div>
        <div class="iw-tt-table overflow-auto w-full border border-base-300">
          <ContextMenuComp class="h-full" :get-context-menu="getContextMenu">
            <ListComp v-if="layout.layoutKind === LayoutKind.LIST" :layout-conf="layout" :table-conf="tableConf" :columns-conf="getCurrentLayoutColumnConf()" />
            <GanttComp v-else-if="layout.layoutKind === LayoutKind.GANTT && layout.gantt" :gantt-props="layout.gantt" :layout-conf="layout" :table-conf="tableConf" :columns-conf="getCurrentLayoutColumnConf()" />
          </ContextMenuComp>
        </div>
        <div
          :class="`${tableConf.styles.footerClass} iw-tt-footer flex justify-between p-1 min-h-0`"
        >
          <div>
            <slot name="customActionBar" />
          </div>
          <template v-if="(layout.layoutKind === LayoutKind.LIST || layout.layoutKind === LayoutKind.GANTT) && layout.data && !Array.isArray(layout.data)">
            <PaginationComp :slice="layout.slice" :total-number="layout.data.totalNumber" />
          </template>
        </div>
      </div>
    </template>
  </div>
</template>
