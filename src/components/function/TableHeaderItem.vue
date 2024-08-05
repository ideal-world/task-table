<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import locales from '../../locales'
import * as eb from '../../components/eventbus'
import type { LayoutConf, TableConf } from '../../components/conf'
import * as iconSvg from '../../assets/icon'
import TableLayoutSettingComp from '../../components/function/TableLayoutSetting.vue'
import { MenuOffsetKind } from '../../components/common/Menu'
import { LayoutKind, type SimpleLayoutProps } from '../../props'

const props = defineProps<{
  // 表格配置
  // Table configuration
  tableConf: TableConf
  layoutsConf: LayoutConf[]
  currentLayoutId: string
  getCurrentLayoutConf: Function
  getCurrentLayoutColumnConf: Function
}>()

const { t } = locales.global

// 布局内容容器
// Layout content container
const layoutContentRef = ref<HTMLElement>()

// 下拉开始列索引
// Dropdown start column index
const dropSplitStartIndex = ref(0)

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

/**
 * 创建新布局
 *
 * Create new layout
 *
 * @param layoutKind
 */
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

onMounted(() => {
  const observer = new ResizeObserver(() => {
    dropSplitStartIndex.value = Math.floor(layoutContentRef.value?.offsetWidth as number / 155)
    if (Number.isInteger(dropSplitStartIndex.value) && dropSplitStartIndex.value > 2) {
      dropSplitStartIndex.value = dropSplitStartIndex.value - 1
    }
    else {
      dropSplitStartIndex.value = Math.floor(dropSplitStartIndex.value)
    }
  })
  observer.observe(layoutContentRef.value as HTMLElement)
})
</script>

<template>
  <div
    v-if="!tableConf.mini"
    ref="layoutContentRef"
    class="flex-grow flex items-center"
  >
    <div
      class="tablist iw-tabs iw-tabs-sm iw-tabs-boxed flex iw-tabs-layouts z-[2000]"
    >
      <div
        class="flex flex-1"
      >
        <a
          v-for="(layout, index) in layoutsConf"
          v-show="dropSplitStartIndex ? index < dropSplitStartIndex : true"
          :key="layout.id"
          :data-layout-id="layout.id"
          role="tab"
          class="iw-tt-header__item iw-tab flex flex-nowrap mr-2 bg-white transition-all"
          :class="currentLayoutId === layout.id ? 'iw-tab-active' : ''"
          :title="layout.title"
        >
          <i :class="`${layout.icon}`" class="mr-1" />
          <div class="h-full flex items-center w-[90px]">
            <p class="overflow-hidden text-ellipsis whitespace-nowrap">{{ layout.title }}</p>
          </div>
          <div class="w-[16px]">
            <i
              v-if="currentLayoutId === layout.id"
              :class="iconSvg.SETTING"
              class="text-base ml-2"
              @click="(e) => showLayoutTableSetting(e)"
            />
          </div>
        </a>
      </div>
      <div class="iw-dropdown">
        <div
          v-if="layoutsConf.length - dropSplitStartIndex > 0"
          tabindex="0" role="button" class=" bg-white iw-tt-header__item iw-tab flex flex-nowrap mr-2 w-[80px]"
        >
          其他{{ layoutsConf.length - dropSplitStartIndex }}个
        </div>
        <div
          v-if="layoutsConf.length - dropSplitStartIndex > 0"
          tabindex="0" class="iw-dropdown-content iw-menu bg-base-100 rounded-box z-[1] shadow"
        >
          <a
            v-for="layout in layoutsConf.slice(dropSplitStartIndex, layoutsConf.length)"
            :key="layout.id"
            :data-layout-id="layout.id"
            role="tab"
            class="iw-tt-header__item iw-tab flex flex-nowrap mr-2 bg-white transition-all justify-start"
            :class="currentLayoutId === layout.id ? 'iw-tab-active' : ''"
            :title="layout.title"
          >
            <i :class="`${layout.icon}`" class="mr-1" />
            <div class="h-full flex items-center w-[90px]">
              <p class="overflow-hidden text-ellipsis whitespace-nowrap">{{ layout.title }}</p>
            </div>
            <i
              v-if="currentLayoutId === layout.id"
              :class="iconSvg.SETTING"
              class="text-base ml-2"
              @click="(e) => showLayoutTableSetting(e)"
            />
          </a>
        </div>
      </div>
      <div class="iw-dropdown">
        <div
          tabindex="0" role="button"
          class="bg-white iw-tt-header__item iw-tab flex flex-nowrap border-none hover:bg-neutral-400 hover:text-white transition-all"
        >
          <i :class="`${iconSvg.NEW}`" class="text-lg" />
        </div>
        <div tabindex="0" class="iw-dropdown-content iw-menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
          <div class="flex p-1">
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
          </div>
        </div>
      </div>
    </div>
    <TableLayoutSettingComp
      v-if="currentLayoutId === currentLayoutId && !tableConf.mini"
      ref="tableLayoutSettingCompRef"
      :table-conf="tableConf"
      :layout-conf="getCurrentLayoutConf()"
      :columns-conf="getCurrentLayoutColumnConf()"
      :layout-length="layoutsConf.length"
    />
  </div>
</template>

<style lang=""></style>
