<script setup lang="ts">
import * as iconSvg from '../../assets/icon'
import type { TableDataSliceProps, TableLayoutModifyProps } from '../../props'
import * as eb from '../eventbus'

const props = defineProps<{
  slice: TableDataSliceProps
  totalNumber: number
}>()

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
  <div class="iw-dropdown iw-dropdown-top">
    <div
      tabindex="0" role="button"
      class="iw-btn ml-1 mr-1 iw-btn-sm"
    >
      {{ props.slice.fetchNumber }}
    </div>
    <ul tabindex="0" class="iw-dropdown-content z-[1] iw-menu shadow bg-base-100 rounded-box">
      <li
        v-for="number in props.slice.fetchNumbers ?? [5, 20, 30, 50, 100]" :key="number"
        class="h-8"
      >
        <a @click="setFetchNumber(number)">{{ number }}</a>
      </li>
    </ul>
  </div>
  {{ $t('function.pagination.total', { number: props.totalNumber }) }}
</template>
