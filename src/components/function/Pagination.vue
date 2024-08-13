<script setup lang="ts">
import { ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import type { DataSliceProps, GroupDataProps, LayoutModifyProps } from '../../props'
import { deepToRaw } from '../../utils/vueHelper'
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
  let startCount = 1
  let endCount = 2
  if (totalPages - currentPage === 0) {
    startCount = 3
  }
  else if (totalPages - currentPage === 1) {
    startCount = 2
  }
  else if (totalPages - currentPage === 2 || totalPages - currentPage === 3) {
    startCount = 1
    endCount = 3
  }
  if (currentPage === 1) {
    endCount = 3
  }
  const startPage = Math.max(currentPage - startCount, 1)
  const endPage = Math.min(currentPage + endCount, totalPages)

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
    const groupSlices = deepToRaw(props.groupProps?.slices) ?? {}
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

/**
 * 改变每页数量样式
 *
 * Change page size style
 *
 * @param e 事件 / Event
 */
function changePageSizeStyle(e: Event) {
  const target = e.target as HTMLElement
  const arrowEl = target.children[0] as HTMLElement
  if (arrowEl.style.transform === 'rotate(180deg)') {
    arrowEl.style.transform = 'rotate(0deg)'
    target.style.borderColor = ''
  }
  else {
    target.style.borderColor = 'oklch(var(--in))'
    arrowEl.style.transform = 'rotate(180deg)'
  }
}

function handleJump(e: Event) {
  const value = Number((e.target as HTMLInputElement).value)
  const total = getTotalPage()
  if(!value) return
  let jumpVal = 1
  if(value>0 &&value<total) {
    jumpVal=value
  }
  else if(value>=total){
    jumpVal = total
  }
  else if(value<1){
    jumpVal = 1
  }
  setCurrentPage(jumpVal)
}
</script>

<template>
  <div style="position: sticky; right: 0; " class="z-[3000] flex items-center">
    <span class="text-sm">{{ $t('function.pagination.total', { number: props.totalNumber }) }}</span>
    <button class="border border-neutral-400 rounded ml-4 mr-2 py-1 px-3 cursor-pointer transition-all flex items-center" @blur="(e) => changePageSizeStyle(e)" @focus="(e) => changePageSizeStyle(e)" @click="(e) => { fetchNumberSelectCompRef?.show(e.target as HTMLElement, MenuOffsetKind.MEDIUM_BOTTOM, MenuSizeKind.MINI) }">
      {{ $t('function.pagination.pageSize', { number: getActualSlice().fetchNumber }) }}
      <i class="block transition-all" :class="iconSvg.SHRINK" />
    </button>
    <button v-if="getCurrentPage() > 2" class="iw-btn iw-btn-ghost px-1 iw-btn-xs" @click="setCurrentPage(1)">
      <i :class="iconSvg.FIRST" />
    </button>
    <button v-if="getCurrentPage() > 1" class="iw-btn iw-btn-ghost px-1 ml-1 iw-btn-xs" @click="setCurrentPage(getCurrentPage() - 1)">
      <i :class="iconSvg.PREVIOUS" />
    </button>
    <button
      v-for="page in getShowPages()"
      :key="page"
      :class="`flex justify-center px-3 ml-2 py-1 w-[30px] h-[30px] rounded transition-all border-none ${page === getCurrentPage() ? 'text-[oklch(var(--in))]' : ''}`"
      :disabled="page === getCurrentPage()"
      @click="setCurrentPage(page)"
    >
      {{ page }}
    </button>
    <div v-if="getTotalPage() - getCurrentPage() > 3" class="flex items-center">
      <div v-if="getTotalPage() - getCurrentPage() !== 4">
        ...
      </div>
      <button
        :class="`flex justify-center px-3 ml-2 py-1 w-[30px] h-[30px] rounded transition-all border-none ${getTotalPage() === getCurrentPage() ? 'text-[oklch(var(--in))]' : ''}`"
        @click="setCurrentPage(getTotalPage())"
      >
        {{ getTotalPage() }}
      </button>
    </div>
    <button v-if="getCurrentPage() < getTotalPage()" class="iw-btn iw-btn-ghost px-1 ml-1 iw-btn-xs" @click="setCurrentPage(getCurrentPage() + 1)">
      <i :class="iconSvg.NEXT" />
    </button>
    <button v-if="getCurrentPage() < getTotalPage() - 1" class="iw-btn iw-btn-ghost px-1 ml-1 iw-btn-xs" @click="setCurrentPage(getTotalPage())">
      <i :class="iconSvg.LAST" />
    </button>
    <span class="mx-2">{{ $t('function.pagination.jump')}}</span>
    <input type="number" class="iw-input iw-input-bordered iw-input-xs rounded-sm w-10" :value="getCurrentPage()" @keyup.enter="handleJump" @blur="handleJump"  />
    <MenuComp ref="fetchNumberSelectCompRef">
      <div
        v-for="number in getActualSlice().fetchNumbers" :key="number"
        class="p-2 text-center transition-all cursor-pointer rounded hover:bg-gray-100"
        :class="`${number === getActualSlice().fetchNumber ? 'text-[oklch(var(--in))]' : ''}`"
        @click="setFetchNumber(number)"
      >
        {{ $t('function.pagination.pageSize', { number }) }}
      </div>
    </MenuComp>
  </div>
</template>
