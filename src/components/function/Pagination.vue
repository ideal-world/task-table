<script setup lang="ts">
import { ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import type { DataSliceProps, TableLayoutModifyProps } from '../../props'
import MenuComp, { MenuOffsetKind, MenuSizeKind } from '../common/Menu.vue'
import * as eb from '../eventbus'

const props = defineProps<{
  defaultSlice: DataSliceProps
  groupSlices?: { [key: string]: DataSliceProps }
  groupValue?: string
  totalNumber: number
}>()
const fetchNumberSelectCompRef = ref<InstanceType<typeof MenuComp>>()

function getActualSlice(): DataSliceProps {
  return props.groupValue && props.groupSlices && props.groupSlices[props.groupValue]
    ? props.groupSlices[props.groupValue]
    : props.defaultSlice
}

function getTotalPage() {
  return Math.ceil(props.totalNumber / getActualSlice().fetchNumber)
}

function getCurrentPage() {
  return Math.ceil(getActualSlice().offsetNumber / getActualSlice().fetchNumber) + 1
}

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

async function setCurrentPage(newPage: number) {
  await setSlice(newPage, undefined)
}

async function setFetchNumber(fetchNumber: number) {
  await setSlice(undefined, fetchNumber)
  fetchNumberSelectCompRef.value?.close()
}

async function setSlice(newPage?: number, newFetchNumber?: number) {
  if (!props.groupValue) {
    const newSlice = {
      offsetNumber: newPage ? (newPage - 1) * (newFetchNumber ?? props.defaultSlice.fetchNumber) : props.defaultSlice.offsetNumber,
      fetchNumber: newFetchNumber ?? props.defaultSlice.fetchNumber,
      fetchNumbers: props.defaultSlice.fetchNumbers,
    }
    const changedLayoutReq: TableLayoutModifyProps = {
      defaultSlice: newSlice,
    }
    await eb.modifyLayout(changedLayoutReq)
  }
  else {
    let newSlice
    if (props.groupSlices && props.groupSlices[props.groupValue]) {
      newSlice = {
        ...props.groupSlices,
        [props.groupValue]: {
          offsetNumber: newPage ? (newPage - 1) * (newFetchNumber ?? props.groupSlices[props.groupValue].fetchNumber) : 0,
          fetchNumber: newFetchNumber ?? props.groupSlices[props.groupValue].fetchNumber,
          fetchNumbers: props.groupSlices[props.groupValue].fetchNumbers,
        },
      }
    }
    else if (props.groupSlices) {
      newSlice = {
        ...props.groupSlices,
        [props.groupValue]: {
          offsetNumber: newPage ? (newPage - 1) * (newFetchNumber ?? props.defaultSlice.fetchNumber) : 0,
          fetchNumber: newFetchNumber ?? props.defaultSlice.fetchNumber,
          fetchNumbers: props.defaultSlice.fetchNumbers,
        },
      }
    }
    else {
      newSlice = {
        [props.groupValue]: {
          offsetNumber: newPage ? (newPage - 1) * (newFetchNumber ?? props.defaultSlice.fetchNumber) : 0,
          fetchNumber: newFetchNumber ?? props.defaultSlice.fetchNumber,
          fetchNumbers: props.defaultSlice.fetchNumbers,
        },
      }
    }
    const changedLayoutReq: TableLayoutModifyProps = {
      groupSlices: newSlice,
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
