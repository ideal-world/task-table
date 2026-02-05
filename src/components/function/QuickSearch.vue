<script setup lang="ts">
import { ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import type { QuickSearchProps } from '../../props'
import * as eb from '../eventbus'

const props = defineProps<{
  // 快速搜索配置
  // Quick search configuration
  quickSearch: QuickSearchProps
}>()

// const showInput = ref(false)
const inputVal = ref(props.quickSearch.searchContent || '')

async function setQuickSearchContent() {
  await eb.setQuickSearchContent(inputVal.value)
}

// function handleQuickShow() {
//   showInput.value = !showInput.value
// }
</script>

<template>
  <form class="iw-input iw-input-xs flex items-center iw-input-bordered" @submit.prevent="setQuickSearchContent">
    <input
      v-model="inputVal"
      type="text"
      class="iw-grow border-none w-[150px]"
      :placeholder="props.quickSearch.placeholder"
      style="transition: width 0.2s ease-in-out"
    >
    <i :class="iconSvg.SEARCH" class="text-base cursor-pointer" @click="setQuickSearchContent" />
  </form>
</template>
