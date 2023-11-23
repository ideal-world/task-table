<script setup lang="ts">
import { onMounted, provide, reactive, ref } from 'vue'
import * as iconSvg from '../assets/icon'
import MenuComp, { MenuOffsetKind } from './common/Menu.vue'
import type { TableBasicConf, TableLayoutConf } from './conf'
import { initConf } from './conf'
import * as Event from './events'
import FilterComp from './function/Filter.vue'
import ResizeComp from './function/Resize.vue'
import RowSortComp from './function/RowSort.vue'
import ThemeComp from './function/Theme.vue'
import ListComp from './layout/list/List.vue'
import type { TableProps } from './props'

const props = defineProps<TableProps>()
const [_tableBasicConf, _tableLayoutsConf] = initConf(props)
const menuLayoutCompRef = ref()
const menuMoreCompRef = ref()

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

Event.init(tableBasicConf, tableLayoutsConf, currentLayoutId, props.events)
provide(Event.FUN_LOAD_DATA_TYPE, Event.loadData)
provide(Event.FUN_ADD_DATA_TYPE, Event.addData)
provide(Event.FUN_UPDATE_DATA_TYPE, Event.updateData)
provide(Event.FUN_DELETE_DATA_TYPE, Event.deleteData)
provide(Event.FUN_LOAD_CELL_OPTIONS_TYPE, Event.loadCellDictValues)
provide(Event.FUN_MODIFY_STYLES_TYPE, Event.modifyStyles)
provide(Event.FUN_NEW_COLUMN_TYPE, Event.newColumn)
provide(Event.FUN_DELETE_COLUMN_TYPE, Event.deleteColumn)
provide(Event.FUN_MODIFY_COLUMN_TYPE, Event.modifyColumn)
provide(Event.FUN_NEW_LAYOUT_TYPE, Event.newLayout)
provide(Event.FUN_MODIFY_LAYOUT_TYPE, Event.modifyLayout)
provide(Event.FUN_DELETE_LAYOUT_TYPE, Event.deleteLayout)
provide(Event.FUN_SORT_LAYOUTS_TYPE, Event.sortLayouts)

// ------------- Layout Process -------------
function showLayoutMenu(event: MouseEvent) {
  const targetEle = event.target as HTMLElement
  const selectedLayoutEle = targetEle.parentElement as HTMLElement
  menuLayoutCompRef.value.show(selectedLayoutEle)
}

function showMoreMenu(event: MouseEvent) {
  const targetEle = event.target as HTMLElement
  menuMoreCompRef.value.show(targetEle, MenuOffsetKind.RIGHT_BOTTOM)
}
</script>

<template>
  <div
    :id="tableBasicConf.tableId"
    :class="`${tableBasicConf.styles.tableClass} iw-tt w-full text-sm text-base-content bg-base-100 relative`"
  >
    <div class=" iw-tt-header navbar p-0 min-h-0">
      <div class="flex-1">
        <template v-for="layout in tableLayoutsConf" :key="layout.id">
          <a
            :class="`iw-tt-header__item tab tab-bordered ${currentLayoutId === layout.id ? 'tab-active' : ''} flex flex-col`"
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
        <div v-if="currentLayoutId === layout.id" class="iw-tt-toolbar flex items-center h-8 p-0.5">
          <RowSortComp :sorts="layout.sorts" :columns-conf="tableBasicConf.columns" />
          <div class="divider divider-horizontal m-0.5" />
          <FilterComp :filters="layout.filters" :columns-conf="tableBasicConf.columns" :events="props.events" />
        </div>
        <div v-if="currentLayoutId === layout.id" class="iw-tt-table overflow-auto w-full">
          <ListComp :key="layout.id" :layout="layout" :basic="tableBasicConf" />
        </div>
      </template>
    </div>
  </div>
  <MenuComp ref="menuLayoutCompRef">
    <div class="iw-contextmenu__item">
      <!-- TODO 抽取 -->
      <!-- <i :class="iconSvg.RENAME"></i>
                                                                              <input class="input input-bordered input-sm" type="text"
                                                                                v-model="tableLayoutsConf.find(layout => layout.id == currentLayoutId)?.title" /> -->
    </div>
  </MenuComp>
</template>
