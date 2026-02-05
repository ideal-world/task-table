<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
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
  isMiniMode: boolean
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
    columns: props.tableConf.columns.filter(column => !column.innerHide),
  }
  await eb.newLayout(newLayout)
}
// 观察器
const selectedObserver = ref()
onMounted(() => {
  dragFn()
  selectedObserver.value = new ResizeObserver(() => {
    dropSplitStartIndex.value = Math.floor(layoutContentRef.value?.offsetWidth as number / 155)
    if (Number.isInteger(dropSplitStartIndex.value) && dropSplitStartIndex.value > 2) {
      dropSplitStartIndex.value = dropSplitStartIndex.value - 1
    }
    else {
      dropSplitStartIndex.value = Math.floor(dropSplitStartIndex.value)
    }
  })
  selectedObserver.value.observe(layoutContentRef.value as HTMLElement)
})
onBeforeUnmount(() => {
  selectedObserver.value?.unobserve(layoutContentRef.value)
})

const layouts = ref(props.layoutsConf)
const list = ref<Element | null>(null)
const startIndex = ref()
const endIndex = ref()
const sourceNode = ref<HTMLElement>()
function dragFn() {
  list.value = document.querySelector('.tablist')
  list.value?.addEventListener('dragstart', dragstartFn)
  list.value?.addEventListener('dragenter', dragenterFn)
  list.value?.addEventListener('dragend', dragendFn)
}
function dragstartFn(e: Event) {
  // console.log('start', e.target)
  const target = e.target as HTMLElement
  // e.dataTransfer.effectAllowed = 'copyMove'
  setTimeout(() => {
    target.classList.add('item-moving')
  })
  sourceNode.value = target
  startIndex.value = getElementIndex(target)
}
function dragenterFn(e: Event) {
  e.preventDefault()
  const target = (e.target as HTMLElement).closest('.iw-tt-header__item') as HTMLElement

  if (!target?.getAttribute('draggable') || !sourceNode.value || target === sourceNode.value)
    return
  const parentNode = target.parentNode
  // console.log('enter', e.target)
  const sourceIndex = getElementIndex(sourceNode.value) || 0
  const targetIndex = getElementIndex(target) || 0
  if (sourceIndex < targetIndex) {
    // console.log('下方')
    parentNode?.insertBefore(sourceNode.value, target.nextElementSibling)
  }
  else {
    // console.log('上方')
    parentNode?.insertBefore(sourceNode.value, target)
  }
}
async function dragendFn(e: Event) {
  // console.log('end', e.target)
  const target = e.target as HTMLElement
  if (!sourceNode.value)
    return
  target.classList.remove('item-moving')
  endIndex.value = getElementIndex(target)
  if (startIndex.value === endIndex.value)
    return

  const preTarget = target.previousElementSibling
  const curId = target.dataset.layoutId
  const preId = (preTarget as HTMLElement)?.dataset.layoutId || undefined
  if (curId) {
    layouts.value = await eb.sortLayout({
      id: curId,
      preId,
    }) as LayoutConf[]
  }
}
function getElementIndex(child: HTMLElement) {
  const parentNode = child.parentNode
  if (!parentNode)
    return 0
  const childNodes = parentNode.childNodes
  const childIndex = Array.prototype.indexOf.call(childNodes, child)
  return childIndex
  // const id = child.dataset.layoutId
  // return props.layouts.findIndex(layout => layout.id === id)
}
</script>

<template>
  <div
    v-if="!isMiniMode"
    ref="layoutContentRef"
    class=" flex items-center"
  >
    <div
      class="tablist iw-tabs iw-tabs-sm iw-tabs-boxed flex iw-tabs-layouts z-[2000]"
    >
      <div
        class="flex flex-1"
      >
        <a
          v-for="(layout, index) in layouts"
          v-show="dropSplitStartIndex ? index < dropSplitStartIndex : true"
          :key="layout.id"
          draggable="true"
          :data-sort="layout.index"
          :data-layout-id="layout.id"
          role="tab"
          class="iw-tt-header__item iw-tab flex flex-nowrap mr-2 bg-white"
          :class="currentLayoutId === layout.id ? 'iw-tab-active' : ''"
          :title="layout.title"
        >
          <i :class="`${layout.icon}`" class="mr-1" />
          <div class="h-full flex items-center w-[90px]">
            <p class="overflow-hidden text-ellipsis whitespace-nowrap leading-5">{{ layout.title }}</p>
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
          v-if="layouts.length - dropSplitStartIndex > 0"
          tabindex="0" role="button" class=" bg-white iw-tt-header__item iw-tab flex flex-nowrap mr-2 w-[90px]"
        >
          其他{{ layouts.length - dropSplitStartIndex }}个
        </div>
        <div
          v-if="layouts.length - dropSplitStartIndex > 0"
          tabindex="0" class="iw-dropdown-content iw-menu bg-base-100 rounded-box z-[1] shadow content-drop"
        >
          <a
            v-for="layout in layouts.slice(dropSplitStartIndex, layouts.length)"
            :key="layout.id"
            draggable="true"
            :data-sort="layout.index"
            :data-layout-id="layout.id"
            role="tab"
            class="iw-tt-header__item iw-tab flex flex-nowrap mr-2 bg-white  justify-start"
            :class="currentLayoutId === layout.id ? 'iw-tab-active' : ''"
            :title="layout.title"
          >
            <i :class="`${layout.icon}`" class="mr-1" />
            <div class="h-full flex items-center w-[90px]">
              <p class="overflow-hidden text-ellipsis whitespace-nowrap leading-5">{{ layout.title }}</p>
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
      <div v-if="tableConf.enabledCreateLayoutKind && tableConf.enabledCreateLayoutKind?.length" class="iw-dropdown">
        <div
          tabindex="0" role="button"
          class="bg-white iw-tt-header__item iw-tab iw_tt_add_layout flex flex-nowrap border-none "
        >
          <i :class="`${iconSvg.NEW}`" class="text-lg" />
        </div>
        <div tabindex="0" class="iw-dropdown-content iw-menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
          <div class="flex p-1">
            <button
              v-if="tableConf.enabledCreateLayoutKind?.includes(LayoutKind.LIST)"
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
              v-if="tableConf.enabledCreateLayoutKind?.includes(LayoutKind.GANTT)"
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
              v-if="tableConf.enabledCreateLayoutKind?.includes(LayoutKind.GANTT_NEW)"
              class="iw-btn m-0.5 p-1"
              :title="$t('layout.new.ganttNote')"
              @click="e => { createNewLayout(LayoutKind.GANTT_NEW) }"
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
      v-if="currentLayoutId === currentLayoutId && !isMiniMode"
      ref="tableLayoutSettingCompRef"
      :table-conf="tableConf"
      :layout-conf="getCurrentLayoutConf()"
      :columns-conf="getCurrentLayoutColumnConf()"
      :layout-length="layouts.length"
    />
  </div>
</template>

<style lang="css">
/* .content-drop{
  visibility: visible !important;
  opacity: 1 !important;
} */
.item-moving {
  background-color: transparent !important;
  color: transparent !important;
  border: 1px dashed grey;
}
</style>
