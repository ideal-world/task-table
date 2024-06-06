<script setup lang="ts">
import { ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import type { TableDataSliceProps, TableLayoutModifyProps } from '../../props'
import MenuComp, { MenuOffsetKind, MenuSizeKind } from '../common/Menu.vue'
import * as eb from '../eventbus'

const props = defineProps<{
  slices: TableDataSliceProps | { [key: string]: TableDataSliceProps }
  groupValue?: string
  totalNumber: number
}>()
const fetchNumberSelectCompRef = ref<InstanceType<typeof MenuComp>>()

function getRealSlice(): TableDataSliceProps {
  return props.groupValue
    ? (props.slices as { [key: string]: TableDataSliceProps })[props.groupValue]
        ? (props.slices as { [key: string]: TableDataSliceProps })[props.groupValue]
        : props.slices as TableDataSliceProps
    : props.slices as TableDataSliceProps
}

function getTotalPage() {
  return Math.ceil(props.totalNumber / getRealSlice().fetchNumber)
}

function getCurrentPage() {
  return Math.ceil(getRealSlice().offsetNumber / getRealSlice().fetchNumber) + 1
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
  if (props.groupValue) {
    const slices = props.slices as { [key: string]: TableDataSliceProps }
    if(slices[props.groupValue]){
      slices[props.groupValue].offsetNumber = (newPage - 1) * slices[props.groupValue].fetchNumber
    }else{
      slices[props.groupValue] = {
        offsetNumber : (newPage - 1) * slices[props.groupValue].fetchNumber
        fetchNumber: 0
      }
    }
    const changedLayoutReq: TableLayoutModifyProps = {
      slices,
    }
    await eb.modifyLayout(changedLayoutReq)
  }
  else {
    const slices = props.slices as TableDataSliceProps
    slices.offsetNumber = (newPage - 1) * slices.fetchNumber
    const changedLayoutReq: TableLayoutModifyProps = {
      slices,
    }
    await eb.modifyLayout(changedLayoutReq)
  }
}

async function setFetchNumber(fetchNumber: number) {
  if (props.groupValue) {
    const slices = props.slices as { [key: string]: TableDataSliceProps }
    slices[props.groupValue].fetchNumber = fetchNumber
    const changedLayoutReq: TableLayoutModifyProps = {
      slices,
    }
    await eb.modifyLayout(changedLayoutReq)
  }
  else {
    const slices = props.slices as TableDataSliceProps
    slices.fetchNumber = fetchNumber
    const changedLayoutReq: TableLayoutModifyProps = {
      slices,
    }
    await eb.modifyLayout(changedLayoutReq)
  }
  fetchNumberSelectCompRef.value?.close()
}
</script>

<template>
  <div style="position: sticky; right: 0; ">
    <button v-if="getCurrentPage() > 2" class="iw-btn iw-btn-ghost pl-1 pr-1 iw-btn-xs" @click="setCurrentPage(1)">
      <i :class="iconSvg.FIRST" />
    </button>
    <button v-if="getCurrentPage() > 1" class="iw-btn iw-btn-ghost pl-1 pr-1 ml-1 iw-btn-xs" @click="setCurrentPage(getCurrentPage() - 1)">
      <i :class="iconSvg.PREVIOUS" />
    </button>
    <button
      v-for="page in getShowPages()"
      :key="page"
      :class="`iw-btn iw-btn-ghost pl-3 pr-3 ml-1 iw-btn-xs ${page === getCurrentPage() ? 'iw-btn-active' : ''}`"
      @click="setCurrentPage(page)"
    >
      {{ page }}
    </button>
    <button v-if="getCurrentPage() < getTotalPage()" class="iw-btn iw-btn-ghost pl-1 pr-1 ml-1 iw-btn-xs" @click="setCurrentPage(getCurrentPage() + 1)">
      <i :class="iconSvg.NEXT" />
    </button>
    <button v-if="getCurrentPage() < getTotalPage() - 1" class="iw-btn iw-btn-ghost pl-1 pr-1 ml-1 iw-btn-xs" @click="setCurrentPage(getTotalPage())">
      <i :class="iconSvg.LAST" />
    </button>
    <button class="iw-btn ml-1 mr-1 iw-btn-xs" @click="(e) => { fetchNumberSelectCompRef?.show(e.target as HTMLElement, MenuOffsetKind.MEDIUM_BOTTOM, MenuSizeKind.MINI) }">
      {{ getRealSlice().fetchNumber }}
    </button>
    <MenuComp ref="fetchNumberSelectCompRef">
      <div
        v-for="number in getRealSlice().fetchNumbers ?? [5, 20, 30, 50, 100]" :key="number"
        class="p-2 hover:cursor-pointer text-xs"
        @click="setFetchNumber(number)"
      >
        {{ number }}
      </div>
    </MenuComp>
    <span class="text-sm">{{ $t('function.pagination.total', { number: props.totalNumber }) }}</span>
  </div>
</template>
