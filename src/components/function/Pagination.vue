<script setup lang="ts">
import { ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import type { TableDataSliceProps, TableLayoutModifyProps } from '../../props'
import MenuComp, { MenuOffsetKind, MenuSizeKind } from '../common/Menu.vue'
import * as eb from '../eventbus'

const props = defineProps<{
  slice: TableDataSliceProps
  totalNumber: number
}>()
const fetchNumberSelectCompRef = ref<InstanceType<typeof MenuComp>>()

function getTotalPage() {
  return Math.ceil(props.totalNumber / props.slice.fetchNumber)
}

function getCurrentPage() {
  return Math.ceil(props.slice.offsetNumber / props.slice.fetchNumber) + 1
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
  const changedLayoutReq: TableLayoutModifyProps = {
    slice: {
      offsetNumber: (newPage - 1) * props.slice.fetchNumber,
      fetchNumber: props.slice.fetchNumber,
    },
  }
  await eb.modifyLayout(changedLayoutReq)
}

async function setFetchNumber(fetchNumber: number) {
  const changedLayoutReq: TableLayoutModifyProps = {
    slice: {
      offsetNumber: 0,
      fetchNumber,
    },
  }
  await eb.modifyLayout(changedLayoutReq)
  fetchNumberSelectCompRef.value?.close()
}
</script>

<template>
  <button v-if="getCurrentPage() > 2" class="iw-btn iw-btn-ghost pl-1 pr-1 iw-btn-sm" @click="setCurrentPage(1)">
    <i :class="iconSvg.FIRST" />
  </button>
  <button v-if="getCurrentPage() > 1" class="iw-btn iw-btn-ghost pl-1 pr-1 ml-1 iw-btn-sm" @click="setCurrentPage(getCurrentPage() - 1)">
    <i :class="iconSvg.PREVIOUS" />
  </button>
  <button
    v-for="page in getShowPages()"
    :key="page"
    :class="`iw-btn iw-btn-ghost pl-3 pr-3 ml-1 iw-btn-sm ${page === getCurrentPage() ? 'iw-btn-active' : ''}`"
    @click="setCurrentPage(page)"
  >
    {{ page }}
  </button>
  <button v-if="getCurrentPage() < getTotalPage()" class="iw-btn iw-btn-ghost pl-1 pr-1 ml-1 iw-btn-sm" @click="setCurrentPage(getCurrentPage() + 1)">
    <i :class="iconSvg.NEXT" />
  </button>
  <button v-if="getCurrentPage() < getTotalPage() - 1" class="iw-btn iw-btn-ghost pl-1 pr-1 ml-1 iw-btn-sm" @click="setCurrentPage(getTotalPage())">
    <i :class="iconSvg.LAST" />
  </button>
  <button class="iw-btn ml-1 mr-1 iw-btn-sm" @click="(e) => { fetchNumberSelectCompRef?.show(e.target as HTMLElement, MenuOffsetKind.MEDIUM_BOTTOM, MenuSizeKind.MINI) }">
    {{ props.slice.fetchNumber }}
  </button>
  <MenuComp ref="fetchNumberSelectCompRef">
    <div
      v-for="number in props.slice.fetchNumbers ?? [5, 20, 30, 50, 100]" :key="number"
      class="p-2 hover:cursor-pointer"
      @click="setFetchNumber(number)"
    >
      {{ number }}
    </div>
  </MenuComp>
  {{ $t('function.pagination.total', { number: props.totalNumber }) }}
</template>
