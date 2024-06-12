<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import ScrollableComp from './components/common/Scrollable.vue'
import type { TableBasicConf, TableLayoutConf } from './components/conf'
import { initConf } from './components/conf'
import * as Event from './components/eventbus'
import FilterSettingComp from './components/function/FilterSetting.vue'
import PaginationComp from './components/function/Pagination.vue'
import QuickSearchComp from './components/function/QuickSearch.vue'
import RowSortSettingComp from './components/function/RowSortSetting.vue'
import TableSettingComp from './components/function/TableSetting.vue'
import ListComp from './components/layout/list/List.vue'
import type { TableProps } from './props'
import { LayoutKind } from './props'
import { IwUtils } from './utils'

const props = defineProps<TableProps>()
const [_tableBasicConf, _tableLayoutsConf] = initConf(props)

const tableBasicConf = reactive<TableBasicConf>(_tableBasicConf)
const tableLayoutsConf = reactive<TableLayoutConf[]>(_tableLayoutsConf)
const currentLayoutId = ref<string>(tableLayoutsConf[0].id)

watch(tableLayoutsConf, () => {
  // Reset the current layout after the layout is deleted
  currentLayoutId.value = tableLayoutsConf[tableLayoutsConf.length - 1] && tableLayoutsConf[tableLayoutsConf.length - 1].id
  setHeight()
})

Event.init(tableBasicConf, tableLayoutsConf, currentLayoutId, props.events)

function setHeight() {
  // Set table height
  Array.prototype.forEach.call(document.getElementsByClassName('iw-tt'), (ttEle) => {
    const outHeight = ttEle.parentElement?.clientHeight
    const headerHeight = ttEle.getElementsByClassName('iw-tt-header')[0].offsetHeight
    Array.prototype.forEach.call(ttEle.getElementsByClassName('iw-tt-layout'), (layoutEle) => {
      const toolbarHeight = layoutEle.getElementsByClassName('iw-tt-toolbar')[0].offsetHeight
      const footerHeight = layoutEle.getElementsByClassName('iw-tt-footer')[0].offsetHeight
      layoutEle.getElementsByClassName('iw-tt-table')[0].style.height = `${outHeight - headerHeight - toolbarHeight - footerHeight}px`
    })
  })
}

onMounted(async () => {
  setHeight()
  IwUtils.delegateEvent(`#iw-tt-${tableBasicConf.id}`, 'click', '.iw-tt-header__item', (e: Event) => {
    const target = e.target as HTMLElement
    const layoutId = target.dataset.layoutId
    if (layoutId) {
      currentLayoutId.value = layoutId
    }
  })
  await Event.watch()
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
    :id="`iw-tt-${tableBasicConf.id}`"
    :class="`${tableBasicConf.styles.tableClass} iw-tt w-full text-sm text-base-content bg-base-100 relative`"
  >
    <div
      :class="`${tableBasicConf.styles.headerClass} iw-tt-header flex justify-between p-0 min-h-0`"
    >
      <ScrollableComp class="flex-1">
        <div class="tablist iw-tabs iw-tabs-sm iw-tabs-boxed">
          <a
            v-for="layout in tableLayoutsConf"
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
          v-if="props.quickSearch"
          class="mx-2"
          :placeholder="props.quickSearch.placeholder"
          :search-content="tableBasicConf.quickSearchContent"
        />
        <TableSettingComp
          :basic-conf="tableBasicConf"
          :layout-conf="tableLayoutsConf.find(layout => layout.id === currentLayoutId)!"
          :layout-length="tableLayoutsConf.length"
        />
      </div>
    </div>
    <template v-for="layout in tableLayoutsConf" :key="layout.id">
      <div v-show="currentLayoutId === layout.id" :id="`iw-tt-layout-${layout.id}`" class="iw-tt-layout">
        <div class="iw-tt-toolbar flex items-center h-8 p-0.5">
          <RowSortSettingComp :layout-id="layout.id" :sorts="layout.sorts" :columns-conf="tableBasicConf.columns" />
          <div class="iw-divider iw-divider-horizontal m-0.5" />
          <ScrollableComp class="flex-1">
            <FilterSettingComp :layout-id="layout.id" :filters="layout.filters" :columns-conf="tableBasicConf.columns" />
          </ScrollableComp>
        </div>
        <div class="iw-tt-table overflow-auto w-full">
          <ListComp :key="layout.id" :layout="layout" :basic="tableBasicConf" />
        </div>
        <div
          :class="`${tableBasicConf.styles.footerClass} iw-tt-footer flex justify-between p-1 min-h-0`"
        >
          <div>
            <slot name="customActionBar" />
          </div>
          <template v-if="layout.layoutKind === LayoutKind.LIST && layout.data && !Array.isArray(layout.data)">
            <PaginationComp :default-slice="layout.defaultSlice" :total-number="layout.data.totalNumber" />
          </template>
        </div>
      </div>
    </template>
  </div>
</template>
