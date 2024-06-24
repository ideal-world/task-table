<script setup lang="ts">
import { ref, toRaw } from 'vue'
import * as iconSvg from '../../assets/icon'
import type { DataSliceProps, GroupDataProps, LayoutModifyProps } from '../../props'
import { MenuOffsetKind, MenuSizeKind } from '../common/Menu'
import MenuComp from '../common/Menu.vue'
import * as eb from '../eventbus'

const props = defineProps<{
  // 数据分片配置
  // Data slice configuration
  slice: DataSliceProps
  // 总数
  // Total number
  totalNumber: number
  // 分组配置
  groupProps?: GroupDataProps
  // 分组值
  groupValue?: string
}>()
const fetchNumberSelectCompRef = ref<InstanceType<typeof MenuComp>>()

/**
 * 获取实际分片，如果存在分组则获取分组的分片，否则获取默认分片
 *
 * Get the actual slice, if there is a group, get the group's slice, otherwise get the default slice
 */
function getActualSlice(): DataSliceProps {
  return props.groupValue && props.groupProps?.slices && props.groupProps?.slices[props.groupValue]
    ? props.groupProps?.slices[props.groupValue]
    : props.slice
}

/**
 * 获取总页数
 *
 * Get total number of pages
 */
function getTotalPage() {
  return Math.ceil(props.totalNumber / getActualSlice().fetchNumber)
}

/**
 * 获取当前页
 *
 * Get current page
 */
function getCurrentPage() {
  return Math.ceil(getActualSlice().offsetNumber / getActualSlice().fetchNumber) + 1
}

/**
 * 获取显示候选页码
 *
 * Get the displayed candidate page number
 */
function getShowPages(): number[] {
  const totalPages = getTotalPage()
  const currentPage = getCurrentPage()
  const startPage = Math.max(currentPage - 2, 1)
  const endPage = Math.min(currentPage + 2, totalPages)
  const pages = []
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  return pages
}

/**
 * 设置当前页
 *
 * Set current page
 *
 * @param newPage 新页码 / New page number
 */
async function setCurrentPage(newPage: number) {
  await setSlice(newPage, undefined)
}

/**
 * 设置每页数量
 *
 * Set the number of items per page
 *
 * @param fetchNumber 每页数量 / Number of items per page
 */
async function setFetchNumber(fetchNumber: number) {
  await setSlice(undefined, fetchNumber)
  fetchNumberSelectCompRef.value?.close()
}

/**
 * 设置分片
 *
 * Set slice
 *
 * @param newPage 新页码 / New page number
 * @param newFetchNumber 新每页数量 / New number of items per page
 */
async function setSlice(newPage?: number, newFetchNumber?: number) {
  if (!props.groupValue) {
    const newSlice = {
      offsetNumber: newPage ? (newPage - 1) * (newFetchNumber ?? props.slice.fetchNumber) : props.slice.offsetNumber,
      fetchNumber: newFetchNumber ?? props.slice.fetchNumber,
      fetchNumbers: props.slice.fetchNumbers,
    }
    const changedLayoutReq: LayoutModifyProps = {
      slice: newSlice,
    }
    await eb.modifyLayout(changedLayoutReq)
  }
  else {
    let newSlice
    if (props.groupProps?.slices && props.groupProps?.slices[props.groupValue]) {
      newSlice = {
        offsetNumber: newPage ? (newPage - 1) * (newFetchNumber ?? props.groupProps?.slices[props.groupValue].fetchNumber) : 0,
        fetchNumber: newFetchNumber ?? props.groupProps?.slices[props.groupValue].fetchNumber,
        fetchNumbers: props.groupProps?.slices[props.groupValue].fetchNumbers,
      }
    }
    else if (props.groupProps?.slices) {
      newSlice = {
        offsetNumber: newPage ? (newPage - 1) * (newFetchNumber ?? props.slice.fetchNumber) : 0,
        fetchNumber: newFetchNumber ?? props.slice.fetchNumber,
        fetchNumbers: props.slice.fetchNumbers,
      }
    }
    else {
      newSlice = {
        offsetNumber: newPage ? (newPage - 1) * (newFetchNumber ?? props.slice.fetchNumber) : 0,
        fetchNumber: newFetchNumber ?? props.slice.fetchNumber,
        fetchNumbers: props.slice.fetchNumbers,
      }
    }
    const groupSlices = toRaw(props.groupProps?.slices) ?? {}
    groupSlices![props.groupValue!] = newSlice
    const changedLayoutReq: LayoutModifyProps = {
      group: {
        enabledColumnNames: props.groupProps!.enabledColumnNames,
        item: props.groupProps!.item,
        slices: groupSlices,
      },
    }
    await eb.modifyLayout(changedLayoutReq, props.groupValue)
  }
}
</script>

<template>
  <div style="position: sticky; right: 0; " class="z-[3000]">
    <button v-if="getCurrentPage() > 2" class="iw-btn iw-btn-ghost px-1 iw-btn-xs" @click="setCurrentPage(1)">
      <i :class="iconSvg.FIRST" />
    </button>
    <button v-if="getCurrentPage() > 1" class="iw-btn iw-btn-ghost px-1 ml-1 iw-btn-xs" @click="setCurrentPage(getCurrentPage() - 1)">
      <i :class="iconSvg.PREVIOUS" />
    </button>
    <button
      v-for="page in getShowPages()"
      :key="page"
      :class="`iw-btn iw-btn-ghost pl-3 pr-3 ml-1 iw-btn-xs ${page === getCurrentPage() ? 'iw-btn-active' : ''}`"
      :disabled="page === getCurrentPage()"
      @click="setCurrentPage(page)"
    >
      {{ page }}
    </button>
    <button v-if="getCurrentPage() < getTotalPage()" class="iw-btn iw-btn-ghost px-1 ml-1 iw-btn-xs" @click="setCurrentPage(getCurrentPage() + 1)">
      <i :class="iconSvg.NEXT" />
    </button>
    <button v-if="getCurrentPage() < getTotalPage() - 1" class="iw-btn iw-btn-ghost px-1 ml-1 iw-btn-xs" @click="setCurrentPage(getTotalPage())">
      <i :class="iconSvg.LAST" />
    </button>
    <button class="iw-btn ml-1 mr-1 iw-btn-xs" @click="(e) => { fetchNumberSelectCompRef?.show(e.target as HTMLElement, MenuOffsetKind.MEDIUM_BOTTOM, MenuSizeKind.MINI) }">
      {{ getActualSlice().fetchNumber }}
    </button>
    <MenuComp ref="fetchNumberSelectCompRef">
      <div
        v-for="number in getActualSlice().fetchNumbers" :key="number"
        class="p-2 hover:cursor-pointer text-xs"
        @click="setFetchNumber(number)"
      >
        {{ number }}
      </div>
    </MenuComp>
    <span class="text-sm">{{ $t('function.pagination.total', { number: props.totalNumber }) }}</span>
  </div>
</template>
