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

const showInput = ref(false)

async function setQuickSearchContent(e: Event) {
  const target = e.target as HTMLInputElement
  await eb.setQuickSearchContent(target.value)
}

function handleQuickShow() {
  showInput.value = !showInput.value
}
</script>

<template>
  <label class="iw-input iw-input-xs flex items-center" :class="`${showInput && 'iw-input-bordered'}`">
    <input
      type="text"
      class="iw-grow border-none"
      :class="`${showInput ? 'w-[150px]' : 'w-0'}`"
      :value="props.quickSearch.searchContent || ''"
      :placeholder="props.quickSearch.placeholder"
      style="transition: all 0.2s ease-in-out"
      @change="setQuickSearchContent"
    >
    <i :class="iconSvg.SEARCH" class="text-base" @click="handleQuickShow" />
  </label>
</template>
