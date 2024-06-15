<script setup lang="ts">
import { ref, toRaw } from 'vue'
import * as iconSvg from '../../assets/icon'
import { type LayoutKernelProps, LayoutKind, SubDataShowKind, type TableLayoutModifyProps } from '../../props'

import MenuComp, { MenuOffsetKind, MenuSizeKind } from '../common/Menu.vue'
import type { TableBasicConf, TableLayoutConf } from '../Initializer'
import { convertLayoutColumnConfToLayoutColumnProps, getDefaultLayoutColumnProps } from '../Initializer'

import locales from '../../locales'
import * as eb from '../eventbus'

const props = defineProps<{
  basicConf: TableBasicConf
  layoutConf: TableLayoutConf
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
  const layout: TableLayoutModifyProps = {
    filters: [],
    sorts: [],
    removeGroup: true,
    aggs: {},
    groupSlices: {},
    subDataShowKind: SubDataShowKind.FOLD_SUB_DATA,
    defaultSlice: {
      offsetNumber: 0,
      fetchNumber: props.layoutConf.defaultSlice.fetchNumber,
      fetchNumbers: props.layoutConf.defaultSlice.fetchNumbers,
    },
  }
  await eb.modifyLayout(layout)
  confirmResetLayoutCompRef.value?.close()
}

async function copyLayout() {
  await eb.newLayout({
    title: `${props.layoutConf.title} - Copy`,
    layoutKind: props.layoutConf.layoutKind,
    icon: props.layoutConf.icon,
    columns: props.layoutConf.columns.map((column) => {
      return convertLayoutColumnConfToLayoutColumnProps(toRaw(column))
    }),
    filters: props.layoutConf.filters,
    sorts: props.layoutConf.sorts,
    group: props.layoutConf.group,
    aggs: props.layoutConf.aggs,
    groupSlices: props.layoutConf.groupSlices,
    defaultSlice: props.layoutConf.defaultSlice,
    subDataShowKind: props.layoutConf.subDataShowKind,
    showSelectColumn: props.layoutConf.showSelectColumn,
    actionColumnRender: props.layoutConf.actionColumnRender,
    actionColumnWidth: props.layoutConf.actionColumnWidth,
  })
}

async function createNewLayout(layoutKind: LayoutKind) {
  const newLayout: LayoutKernelProps = {
    title: t('layout.title.default'),
    layoutKind,
    icon: iconSvg.TEXT,
    columns: props.basicConf.columns.filter(column => !column.hide).map((column) => {
      return getDefaultLayoutColumnProps(toRaw(column))
    }),
    defaultSlice: props.basicConf.defaultSlice,
    subDataShowKind: SubDataShowKind.FOLD_SUB_DATA,
    showSelectColumn: props.basicConf.defaultShowSelectColumn,
    actionColumnRender: props.basicConf.defaultActionColumnRender,
    actionColumnWidth: props.basicConf.defaultActionColumnWidth,
  }
  await eb.newLayout(newLayout)
}
</script>

<template>
  <div class="iw-divider cursor-pointer iw-table-setting-title">
    {{ $t('layout.settingTitle') }}
  </div>
  <div>
    <div class="flex justify-between">
      <button
        class="iw-btn m-1 flex-1"
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
        class="iw-btn m-1 flex-1"
        :title="$t('layout.copy.note')"
        @click="copyLayout"
      >
        <div class="flex items-center flex-col pb-1">
          <i :class="`${iconSvg.COPY}`" class="text-lg" />
          <span class="text-xs font-normal">{{ $t('layout.copy.title') }}</span>
        </div>
      </button>
      <button
        v-if="props.layoutLength > 1"
        class="iw-btn m-1 flex-1"
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
        class="iw-btn m-1 flex-1"
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
