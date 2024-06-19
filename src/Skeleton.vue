<script setup lang="ts">
import type { Ref } from 'vue'
import { computed, onMounted, ref, watch } from 'vue'
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
import { IwUtils } from './utils'

const _props = defineProps<SimpleTableProps>()
const { tableConf, layoutsConf, currentLayoutId }: {
  tableConf: TableConf
  layoutsConf: LayoutConf[]
  currentLayoutId: Ref<string>
} = init(_props)

const currentLayoutConf = computed<LayoutConf>(() => {
  return layoutsConf.find(conf => conf.id === currentLayoutId.value)!
})

const currentLayoutColumnsConf = computed<ColumnConf[]>(() => {
  return currentLayoutConf.value.columns.filter(column => !column.hide).map((column) => {
    return {
      ...tableConf.columns.find(col => col.name === column.name)!,
      ...column,
    }
  })
})

const scrollableCompRefs = ref()

watch(
  () => layoutsConf.length,
  (_newVal, oldVal) => {
    if (oldVal) {
      currentLayoutId.value = layoutsConf[layoutsConf.length - 1].id
    }
    else {
      currentLayoutId.value = layoutsConf[0].id
    }
    setTimeout(() => {
      setHeight()
    })
  },
)

function setHeight() {
  // Set table height
  Array.prototype.forEach.call(document.getElementsByClassName('iw-tt'), (ttEle) => {
    const outHeight = ttEle.parentElement?.clientHeight
    const headerHeight = ttEle.getElementsByClassName('iw-tt-header')[0].offsetHeight
    Array.prototype.forEach.call(ttEle.getElementsByClassName('iw-tt-layout'), (layoutEle) => {
      if (layoutEle.id !== `iw-tt-layout-${currentLayoutId.value}`)
        return
      const toolbarHeight = layoutEle.getElementsByClassName('iw-tt-toolbar').length > 0 ? layoutEle.getElementsByClassName('iw-tt-toolbar')[0].offsetHeight : 0
      const layoutStyleHeight = layoutEle.getElementsByClassName('iw-tt-footer')[0].style.height
      const footerHeight = layoutStyleHeight || layoutEle.getElementsByClassName('iw-tt-footer')[0].offsetHeight
      if (!layoutStyleHeight) {
        layoutEle.getElementsByClassName('iw-tt-footer')[0].style.height = `${footerHeight}px`
      }
      layoutEle.getElementsByClassName('iw-tt-table')[0].style.height = `${outHeight - headerHeight - toolbarHeight - footerHeight}px`
    })
  })
}

function reSetScrollableWidth(layoutId: string) {
  const curScrollComp = scrollableCompRefs.value.find((ele: { $el: { dataset: { layoutId: string } } }) => ele.$el.dataset.layoutId === layoutId)
  setTimeout(() => {
    if (curScrollComp.$el.children[1].style.width && curScrollComp.$el.children[1].style.width === '0px') {
      curScrollComp.reSetMainWidth(true)
    }
    setHeight()
  })
}

onMounted(async () => {
  IwUtils.delegateEvent(`#iw-tt-${tableConf.id}`, 'click', '.iw-tt-header__item', (e: Event) => {
    const target = e.target as HTMLElement
    const layoutId = target.dataset.layoutId
    if (layoutId) {
      currentLayoutId.value = layoutId
      reSetScrollableWidth(layoutId)
    }
  })
  await eb.watch()
  setTimeout(() => {
    setHeight()
  })
})
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
      :class="`${tableConf.styles.headerClass} iw-tt-header flex justify-between p-0 min-h-0`"
    >
      <ScrollableComp
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
      <div class="flex items-center">
        <QuickSearchComp
          v-if="tableConf.quickSearch"
          class="mx-2"
          :quick-search="tableConf.quickSearch"
        />
        <TableSettingComp
          :table-conf="tableConf"
          :layout-conf="currentLayoutConf"
          :layout-columns-conf="currentLayoutColumnsConf"
          :layout-length="layoutsConf.length"
        />
      </div>
    </div>
    <template v-for="layout in layoutsConf" :key="layout.id">
      <div v-show="currentLayoutId === layout.id" :id="`iw-tt-layout-${layout.id}`" class="iw-tt-layout">
        <div
          v-if="layout.sort || layout.filter"
          class="iw-tt-toolbar flex items-center h-8 p-0.5"
        >
          <RowSortSettingComp v-if="layout.sort" :layout-id="layout.id" :sort="layout.sort" :layout-columns-conf="currentLayoutColumnsConf" />
          <div class="iw-divider iw-divider-horizontal m-0.5" />
          <ScrollableComp v-if="layout.filter" ref="scrollableCompRefs" class="flex-1" :data-layout-id="layout.id">
            <FilterSettingComp :layout-id="layout.id" :filter="layout.filter" :layout-columns-conf="currentLayoutColumnsConf" />
          </ScrollableComp>
        </div>
        <div class="iw-tt-table overflow-auto w-full border border-base-300">
          <ListComp v-if="layout.layoutKind === LayoutKind.LIST" :layout-conf="layout" :table-conf="tableConf" :layout-columns-conf="currentLayoutColumnsConf" />
          <GanttComp v-else-if="layout.layoutKind === LayoutKind.GANTT && layout.gantt" :gantt-props="layout.gantt" :layout-conf="layout" :table-conf="tableConf" :layout-columns-conf="currentLayoutColumnsConf" />
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
