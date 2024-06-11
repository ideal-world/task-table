<script setup lang="ts">
import { ref } from 'vue'
import * as eb from '../eventbus'

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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 opacity-70 cursor-pointer" @click="handleQuickShow"><path fill-rule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clip-rule="evenodd" /></svg>
  </label>
</template>
