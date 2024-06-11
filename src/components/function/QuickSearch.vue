<script setup lang="ts">
import * as eb from '../eventbus';

const props = defineProps<{
  placeholder: string
  searchContent?: string
}>()

async function setQuickSearchContent(e: Event) {
  const target = e.target as HTMLInputElement
  await eb.modifyLayout({
    quickSearchContent: target.value,
  })
}
</script>

<template>
  <input
    class="iw-input iw-input-bordered iw-input-xs"
    :value="props.searchContent || ''"
    :placeholder="props.placeholder"
    @change="setQuickSearchContent"
  >
</template>
