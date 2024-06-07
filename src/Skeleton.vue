<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import type { TableBasicConf, TableLayoutConf } from './components/conf'
import { initConf } from './components/conf'
import * as Event from './components/eventbus'
import FilterSettingComp from './components/function/FilterSetting.vue'
import LayoutSettingComp from './components/function/LayoutSetting.vue'
import PaginationComp from './components/function/Pagination.vue'
import RowSortSettingComp from './components/function/RowSortSetting.vue'
import TableSettingComp from './components/function/TableSetting.vue'
import ListComp from './components/layout/list/List.vue'
import type { TableProps } from './props'
import { LayoutKind } from './props'

const props = defineProps<TableProps>()
const [_tableBasicConf, _tableLayoutsConf] = initConf(props)

const tableBasicConf = reactive<TableBasicConf>(_tableBasicConf)
const tableLayoutsConf = reactive<TableLayoutConf[]>(_tableLayoutsConf)
const currentLayoutId = ref<string>(tableLayoutsConf[0].id)

Event.init(tableBasicConf, tableLayoutsConf, currentLayoutId, props.events)

onMounted(async () => {
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
    :id="tableBasicConf.id"
    :class="`${tableBasicConf.styles.tableClass} iw-tt w-full text-sm text-base-content bg-base-100 relative`"
  >
    <div
      :class="`${tableBasicConf.styles.headerClass} iw-tt-header iw-navbar p-0 min-h-0`"
    >
      <div class="flex-1">
        <template v-for="layout in tableLayoutsConf" :key="layout.id">
          <a
            :class="`iw-tt-header__item iw-tab iw-tab-bordered ${currentLayoutId === layout.id ? 'iw-tab-active' : ''} flex flex-col text-base`"
          >
            <i :class="`${layout.icon}`" class="mr-1" /> {{ layout.title }}
          </a>
        </template>
      </div>
      <div class="flex-none">
        <TableSettingComp
          :basic-conf="tableBasicConf"
          :layout-conf="tableLayoutsConf.find(layout => layout.id === currentLayoutId)!"
          :layout-length="tableLayoutsConf.length"
        />
      </div>
    </div>
    <div class="iw-tt-layout">
      <template v-for="layout in tableLayoutsConf" :key="layout.id">
        <div v-if="currentLayoutId === layout.id" :id="`iw-tt-layout-${layout.id}`" class="iw-tt-toolbar flex h-8 p-0.5">
          <div class="flex">
            <RowSortSettingComp :sorts="layout.sorts" :columns-conf="tableBasicConf.columns" />
            <div class="iw-divider iw-divider-horizontal m-0.5" />
            <FilterSettingComp :filters="layout.filters" :columns-conf="tableBasicConf.columns" />
          </div>
        </div>
        <div v-if="currentLayoutId === layout.id" class="iw-tt-table overflow-auto w-full">
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
      </template>
    </div>
  </div>
</template>
