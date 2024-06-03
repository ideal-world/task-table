<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import * as iconSvg from './assets/icon'
import MenuComp, { MenuOffsetKind } from './components/common/Menu.vue'
import type { TableBasicConf, TableLayoutConf } from './components/conf'
import { initConf } from './components/conf'
import * as Event from './components/eventbus'
import FilterComp from './components/function/Filter.vue'
import GroupComp from './components/function/Group.vue'
import ColumnComp from './components/function/Column.vue'
import ResizeComp from './components/function/Resize.vue'
import ThemeComp from './components/function/Theme.vue'
import ListComp from './components/layout/list/List.vue'
import type { TableProps } from './props'

const props = defineProps<TableProps>()
const [_tableBasicConf, _tableLayoutsConf] = initConf(props)

const menuLayoutCompRef = ref<InstanceType<typeof MenuComp>>()
const menuMoreCompRef = ref<InstanceType<typeof MenuComp>>()
const headerColumnCompRef = ref<InstanceType<typeof MenuComp>>()

const tableBasicConf = reactive<TableBasicConf>(_tableBasicConf)
const tableLayoutsConf = reactive<TableLayoutConf[]>(_tableLayoutsConf)
const currentLayoutId = ref<string>(tableLayoutsConf[0].id)

Event.init(tableBasicConf, tableLayoutsConf, currentLayoutId, props.events)

onMounted(async () => {
  // Set table height
  Array.prototype.forEach.call(document.getElementsByClassName('iw-tt'), (ttEle) => {
    const outHeight = ttEle.parentElement?.clientHeight
    const headerHeight = ttEle.getElementsByClassName('iw-tt-header')[0].offsetHeight
    Array.prototype.forEach.call(ttEle.getElementsByClassName('iw-tt-main'), (layoutEle) => {
      const toolbarHeight = layoutEle.getElementsByClassName('iw-tt-toolbar')[0].offsetHeight
      layoutEle.getElementsByClassName('iw-tt-table')[0].style.height = `${outHeight - headerHeight - toolbarHeight}px`
    })
  })
  await Event.watch()
})

// ------------- Layout Process -------------
function showLayoutMenu(event: MouseEvent) {
  const targetEle = event.target as HTMLElement
  const selectedLayoutEle = targetEle.parentElement as HTMLElement
  menuLayoutCompRef.value?.show(selectedLayoutEle)
}

function showMoreMenu(event: MouseEvent) {
  const targetEle = event.target as HTMLElement
  menuMoreCompRef.value?.show(targetEle, MenuOffsetKind.RIGHT_BOTTOM)
}

async function showColumnContextMenu(event: MouseEvent) {
  const targetEle = event.target as HTMLElement
  await headerColumnCompRef.value?.show(targetEle)
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
| |iw-tt-main                           | |
| |  +-------------------+              | |
| |  |iw-tt-toolbar      |              | |
| |  +-------------------+              | |
| |  |iw-tt-table        |              | |
| |  |           +-------+-----------+  | |
| |  |           |iw-tt-toolbar      |  | |
| |  |           +-------------------+  | |
| |  |           |iw-tt-table        |  | |
| |  |           |       |           |  | |
| |  +-----------+-------+           |  | |
| |              +-------------------+  | |
| +-------------------------------------+ |
+-----------------------------------------+
-->
<template>
  <div
    :id="tableBasicConf.id"
    :class="`${tableBasicConf.styles.tableClass} iw-tt w-full text-sm text-base-content bg-base-100 relative`"
  >
    <div class=" iw-tt-header iw-navbar p-0 min-h-0">
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
        <a class="cursor-pointer" @click="showMoreMenu"><i :class="iconSvg.MORE" /></a>
        <MenuComp ref="menuMoreCompRef">
          <ResizeComp :size="tableBasicConf.styles.size" :styles="tableBasicConf.styles" />
          <ThemeComp :styles="tableBasicConf.styles" />
        </MenuComp>
      </div>
    </div>
    <div class="iw-tt-main">
      <template v-for="layout in tableLayoutsConf" :key="layout.id">
        <div v-if="currentLayoutId === layout.id" :id="`iw-tt-layout-${layout.id}`" class="iw-tt-toolbar flex items-center h-8 p-0.5">
          <GroupComp :group="layout.group" :columns-conf="tableBasicConf.columns" />
          <div class="iw-divider iw-divider-horizontal m-0.5" />
          <FilterComp :filters="layout.filters" :columns-conf="tableBasicConf.columns" />
          <ColumnComp
    ref="headerColumnCompRef" :basic-columns-conf="tableBasicConf.columns"
    :layout-columns-conf="layout"
  />
          <div
      :class="`${props.basic.styles.cellClass} iw-list-cell flex justify-end items-center bg-base-100 border-solid border-b border-b-base-300 border-l border-l-base-300 hover:cursor-pointer hover:bg-base-200`"
      :style="props.setColumnStyles(-1)"
    >
      <i :class="iconSvg.MORE" @click="showColumnContextMenu" />
    </div>
        </div>
        <div v-if="currentLayoutId === layout.id" class="iw-tt-table overflow-auto w-full">
          <ListComp :key="layout.id" :layout="layout" :basic="tableBasicConf" />
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
