<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import * as iconSvg from './assets/icon'
import MenuComp from './components/common/Menu.vue'
import type { TableBasicConf, TableLayoutConf } from './components/conf'
import { initConf } from './components/conf'
import * as Event from './components/eventbus'
import FilterComp from './components/function/Filter.vue'
import GroupComp from './components/function/Group.vue'
import LayoutSettingComp from './components/function/LayoutSetting.vue'
import PaginationComp from './components/function/Pagination.vue'
import ResizeComp from './components/function/Resize.vue'
import RowSortComp from './components/function/RowSort.vue'
import ThemeComp from './components/function/Theme.vue'
import ListComp from './components/layout/list/List.vue'
import type { TableProps } from './props'
import { LayoutKind } from './props'

const props = defineProps<TableProps>()
const [_tableBasicConf, _tableLayoutsConf] = initConf(props)

const menuLayoutCompRef = ref<InstanceType<typeof MenuComp>>()
const menuMoreCompRef = ref<InstanceType<typeof MenuComp>>()

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

// ------------- Layout Process -------------
function showLayoutMenu(event: MouseEvent) {
  const targetEle = event.target as HTMLElement
  menuLayoutCompRef.value?.show(targetEle)
}

function showMoreMenu(event: MouseEvent) {
  const targetEle = event.target as HTMLElement
  menuMoreCompRef.value?.show(targetEle)
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
    :id="tableBasicConf.id"
    :class="`${tableBasicConf.styles.tableClass} iw-tt w-full text-sm text-base-content bg-base-100 relative`"
  >
    <div
      :class="`${tableBasicConf.styles.headerClass} iw-tt-header iw-navbar p-0 min-h-0`"
    >
      <div class="flex-1">
        <template v-for="layout in tableLayoutsConf" :key="layout.id">
          <a
            :class="`iw-tt-header__item iw-tab iw-tab-bordered ${currentLayoutId === layout.id ? 'iw-tab-active' : ''} flex flex-col`"
            @contextmenu.prevent="showLayoutMenu"
          >
            <i :class="`${layout.icon}`" /> {{ layout.title }}
          </a>
        </template>
      </div>
      <div class="flex-none">
        <a class="cursor-pointer"><i :class="iconSvg.MORE" @click="showMoreMenu" /></a>
        <MenuComp ref="menuMoreCompRef">
          <ResizeComp :size="tableBasicConf.styles.size" :styles="tableBasicConf.styles" />
          <ThemeComp :styles="tableBasicConf.styles" />
        </MenuComp>
      </div>
    </div>
    <div class="iw-tt-layout">
      <template v-for="layout in tableLayoutsConf" :key="layout.id">
        <div v-if="currentLayoutId === layout.id" :id="`iw-tt-layout-${layout.id}`" class="iw-tt-toolbar flex justify-between h-8 p-0.5">
          <div class="flex">
            <GroupComp :group="layout.group" :columns-conf="tableBasicConf.columns" />
            <div class="iw-divider iw-divider-horizontal m-0.5" />
            <RowSortComp :sorts="layout.sorts" :columns-conf="tableBasicConf.columns" />
            <div class="iw-divider iw-divider-horizontal m-0.5" />
            <FilterComp :filters="layout.filters" :columns-conf="tableBasicConf.columns" />
          </div>
          <div>
            <LayoutSettingComp
              :basic-conf="tableBasicConf"
              :layout-conf="layout"
            />
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
          <div v-if="layout.layoutKind === LayoutKind.LIST && layout.data && !Array.isArray(layout.data)">
            <PaginationComp :slice="layout.slice" :total-number="layout.data.totalNumber" />
          </div>
        </div>
      </template>
    </div>
  </div>

  <MenuComp ref="menuLayoutCompRef">
    <div class="iw-contextmenu__item">
      <!-- TODO 抽取 重命名layout -->
    </div>
  </MenuComp>
</template>
