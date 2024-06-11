<script setup lang="ts">
import { ref } from 'vue'
import * as eb from '../eventbus'
import * as iconSvg from '../../assets/icon'

const props = defineProps<{
  placeholder: string
  searchContent?: string
}>()

const quickSearchRef = ref()
const showInput = ref(false)

async function setQuickSearchContent(e: Event) {
  const target = e.target as HTMLInputElement
  await eb.modifyLayout({
    quickSearchContent: target.value,
  })
}

function handleQuickShow() {
  showInput.value = !showInput.value
}
</script>

<template>
  <label class="iw-input iw-input-xs flex items-center" :class="`${showInput && 'iw-input-bordered'}`">
    <input
      ref="quickSearchRef"
      type="text"
      class="iw-grow border-none"
      :class="`${showInput ? 'w-[150px]' : 'w-0'}`"
      :value="props.searchContent || ''"
      :placeholder="props.placeholder"
      style="transition: all 0.2s ease-in-out"
      @change="setQuickSearchContent"
    >
    <i :class="iconSvg.SEARCH" class="text-sm" @click="handleQuickShow" />
  </label>
</template>
