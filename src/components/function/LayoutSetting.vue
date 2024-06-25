<script setup lang="ts">
import { ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import locales from '../../locales'
import { LayoutKind, type LayoutModifyProps, type SimpleLayoutProps, SubDataShowKind, generateDataSliceProps } from '../../props'

import { deepToRaw } from '../../utils/vueHelper'
import { MenuOffsetKind, MenuSizeKind } from '../common/Menu'
import MenuComp from '../common/Menu.vue'
import type { LayoutConf, TableConf } from '../conf'
import * as eb from '../eventbus'

const props = defineProps<{
  // 表格配置
  // Table configuration
  tableConf: TableConf
  // 布局配置
  // Layout configuration
  layoutConf: LayoutConf
  // 布局数量
  // Layout quantity
  layoutLength: number
}>()

const { t } = locales.global

const confirmDeleteLayoutCompRef = ref<InstanceType<typeof MenuComp>>()
const confirmResetLayoutCompRef = ref<InstanceType<typeof MenuComp>>()
const showNewLayoutContainer = ref<boolean>(false)

async function deleteLayout() {
  await eb.deleteLayout(props.layoutConf.id)
  confirmDeleteLayoutCompRef.value?.close()
}

async function resetLayout() {
  const layout: LayoutModifyProps = {
    slice: generateDataSliceProps(),
    subDataShowKind: SubDataShowKind.FOLD_SUB_DATA,
  }
  props.layoutConf.filter && (layout.filter = { enabledColumnNames: props.layoutConf.filter.enabledColumnNames, groups: [] })
  props.layoutConf.group && (layout.group = { enabledColumnNames: props.layoutConf.group.enabledColumnNames })
  props.layoutConf.sort && (layout.sort = { enabledColumnNames: props.layoutConf.sort.enabledColumnNames, items: [] })
  props.layoutConf.agg && (layout.agg = { enabledColumnNames: props.layoutConf.agg.enabledColumnNames, items: [] })
  await eb.modifyLayout(layout)
  confirmResetLayoutCompRef.value?.close()
}

async function copyLayout() {
  const newLayout = deepToRaw(props.layoutConf)
  delete newLayout.data
  newLayout.selectedDataPks = []
  newLayout.title = `${props.layoutConf.title} - Copy`
  await eb.newLayout(newLayout)
}

async function createNewLayout(layoutKind: LayoutKind) {
  const newLayout: SimpleLayoutProps = {
    title: t('layout.title.default'),
    layoutKind,
    columns: props.tableConf.columns.filter(column => !column.hide).map((column) => {
      return column
    }),
  }
  await eb.newLayout(newLayout)
}
</script>

<template>
  <div class="iw-divider cursor-pointer iw-table-setting-title">
    {{ $t('layout.settingTitle') }}
  </div>
  <div class="w-full">
    <div class="flex justify-between">
      <button
        class="iw-btn m-0.5 px-3 flex-1"
        :title="$t('layout.reset.note')"
        @click="e => { confirmResetLayoutCompRef?.show(e, MenuOffsetKind.RIGHT_TOP, MenuSizeKind.MINI, true) }"
      >
        <div class="flex items-center flex-col pb-1">
          <i :class="`${iconSvg.RESET}`" class="text-lg" />
          <span class="text-xs font-normal">{{ $t('layout.reset.title') }}</span>
        </div>
      </button>
      <MenuComp ref="confirmResetLayoutCompRef">
        <div class="iw-contextmenu__item flex items-center justify-between w-full text-error">
          {{ $t('layout.reset.confirm', { title: props.layoutConf.title }) }}
        </div>
        <div class="iw-contextmenu__item flex items-center justify-between w-full pl-2 pr-2">
          <button
            class="iw-btn iw-btn-secondary iw-btn-xs"
            @click="resetLayout"
          >
            <i :class="`${iconSvg.CONFIRM}`" />
          </button>
          <button
            class="iw-btn iw-btn-xs"
            @click="e => { confirmResetLayoutCompRef?.close() }"
          >
            <i :class="`${iconSvg.CANCEL}`" />
          </button>
        </div>
      </MenuComp>
      <button
        class="iw-btn m-0.5 px-3 flex-1"
        :title="$t('layout.copy.note')"
        @click="copyLayout"
      >
        <div class="flex items-center flex-col pb-1">
          <i :class="`${iconSvg.COPY}`" class="text-lg" />
          <span class="text-xs font-normal">{{ $t('layout.copy.title') }}</span>
        </div>
      </button>
      <!-- 仅当布局大于1时可以删除 -->
      <!-- Only delete when the layout is greater than 1 -->
      <button
        v-if="props.layoutLength > 1"
        class="iw-btn m-0.5 px-3 flex-1"
        :title="$t('layout.delete.note')"
        @click="e => { confirmDeleteLayoutCompRef?.show(e, MenuOffsetKind.RIGHT_TOP, MenuSizeKind.MINI, true) }"
      >
        <div class="flex items-center flex-col pb-1">
          <i :class="`${iconSvg.TRASH}`" class="text-lg" />
          <span class="text-xs font-normal">{{ $t('layout.delete.title') }}</span>
        </div>
      </button>
      <MenuComp ref="confirmDeleteLayoutCompRef">
        <div class="iw-contextmenu__item flex items-center justify-between w-full text-error">
          {{ $t('layout.delete.confirm', { title: props.layoutConf.title }) }}
        </div>
        <div class="iw-contextmenu__item flex items-center justify-between w-full pl-2 pr-2">
          <button
            class="iw-btn iw-btn-secondary iw-btn-xs"
            @click="deleteLayout"
          >
            <i :class="`${iconSvg.CONFIRM}`" />
          </button>
          <button
            class="iw-btn iw-btn-xs"
            @click="e => { confirmDeleteLayoutCompRef?.close() }"
          >
            <i :class="`${iconSvg.CANCEL}`" />
          </button>
        </div>
      </MenuComp>
      <button
        class="iw-btn m-0.5 px-3 flex-1"
        :class="showNewLayoutContainer && 'iw-btn-active'"
        :title="$t('layout.new.note')"
        @click="_ => { showNewLayoutContainer = !showNewLayoutContainer }"
      >
        <div class="flex items-center flex-col pb-1">
          <i :class="`${iconSvg.NEW}`" class="text-lg" />
          <span class="text-xs font-normal">{{ $t('layout.new.title') }}</span>
        </div>
      </button>
    </div>
    <div v-show="showNewLayoutContainer" class="flex justify-between p-1 border border-base-300 rounded-lg">
      <button
        class="iw-btn m-0.5 p-1"
        :title="$t('layout.new.listNote')"
        @click="e => { createNewLayout(LayoutKind.LIST) }"
      >
        <div class="flex items-center flex-col pb-0.5">
          <i :class="`${iconSvg.LIST}`" class="text-sm" />
          <span class="text-xs font-normal">{{ $t('layout.kind.listTitle') }}</span>
        </div>
      </button>
      <button
        class="iw-btn m-0.5 p-1"
        :title="$t('layout.new.ganttNote')"
        @click="e => { createNewLayout(LayoutKind.GANTT) }"
      >
        <div class="flex items-center flex-col pb-0.5">
          <i :class="`${iconSvg.GANTT}`" class="text-sm" />
          <span class="text-xs font-normal">{{ $t('layout.kind.ganttTitle') }}</span>
        </div>
      </button>
      <button
        class="iw-btn m-0.5 p-1"
        :title="$t('layout.new.chartNote')"
        @click="e => { createNewLayout(LayoutKind.CHART) }"
      >
        <div class="flex items-center flex-col pb-0.5">
          <i :class="`${iconSvg.CHART}`" class="text-sm" />
          <span class="text-xs font-normal">{{ $t('layout.kind.chartTitle') }}</span>
        </div>
      </button>
      <button
        class="iw-btn m-0.5 p-1"
        :title="$t('layout.new.calendarNote')"
        @click="e => { createNewLayout(LayoutKind.CALENDAR) }"
      >
        <div class="flex items-center flex-col pb-0.5">
          <i :class="`${iconSvg.CALENDAR}`" class="text-sm" />
          <span class="text-xs font-normal">{{ $t('layout.kind.calendarTitle') }}</span>
        </div>
      </button>
      <button
        class="iw-btn m-0.5 p-1"
        :title="$t('layout.new.kanbanNote')"
        @click="e => { createNewLayout(LayoutKind.KANBAN) }"
      >
        <div class="flex items-center flex-col pb-0.5">
          <i :class="`${iconSvg.KANBAN}`" class="text-sm" />
          <span class="text-xs font-normal">{{ $t('layout.kind.kanbanTitle') }}</span>
        </div>
      </button>
    </div>
  </div>
</template>
