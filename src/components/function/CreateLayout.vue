<script lang="ts" setup>
import { ref } from 'vue'
import locales from '../../locales'
import * as iconSvg from '../../assets/icon'
import * as eb from '../../components/eventbus'
import type { TableConf } from '../../components/conf'
import { LayoutKind, type SimpleLayoutProps } from '../../props'
import MenuComp from '../../components/common/Menu.vue'

const props = defineProps<{
  // 表格配置
  // Table configuration
  tableConf: TableConf
}>()

const { t } = locales.global

// 新建布局容器
// Create new layout container
const showNewLayoutContainer = ref<boolean>(false)
// 布局容器
// Layout container
const layoutContainerRef = ref<InstanceType<typeof MenuComp>>()

// 创建新布局
// Create new layout
async function createNewLayout(layoutKind: LayoutKind) {
  const newLayout: SimpleLayoutProps = {
    title: t('layout.title.default'),
    layoutKind,
    columns: props.tableConf.columns.filter(column => !column.hide).map((column) => {
      return column
    }),
  }
  await eb.newLayout(newLayout)
  closeLayoutsContainer()
}

// 打开布局容器
// Open layout container
function openLayoutsContainer(e: MouseEvent) {
  showNewLayoutContainer.value = !showNewLayoutContainer.value
  layoutContainerRef.value?.show(e)
}

// 关闭布局容器
// Close layout container
function closeLayoutsContainer() {
  layoutContainerRef.value?.close()
}
</script>

<template>
  <div
    class="bg-[#fff] iw-tt-header__item iw-tab flex flex-nowrap"
    :class="showNewLayoutContainer && 'iw-btn-active'"
    @click="(e) => openLayoutsContainer(e)"
  >
    <i :class="`${iconSvg.NEW}`" class="text-lg" />
  </div>
  <MenuComp ref="layoutContainerRef">
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
  </MenuComp>
</template>

<style lang=""></style>
