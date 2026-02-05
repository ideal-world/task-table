<script setup lang="ts">
import * as iconSvg from '../../assets/icon'

defineProps<{
  option: any
  readonly?: boolean
}>()
const emits = defineEmits<{
  (e: 'delete'): void
}>()
</script>

<template>
  <div class="iw-badge px-1 inline-flex rounded-md border-none mr-1" :style="`background-color: ${option.color ?? ''};color: ${option.color ? '#fff' : ''}`">
    <!-- <span v-if="option.avatar" class="avatar mr-1">
      <img :src="option.avatar" class="w-4 rounded-full">
    </span> -->
    <span class="whitespace-nowrap flex-1 truncate">{{ option.title ?? option }}</span>
    <i v-if="!readonly" :class="`${iconSvg.DELETE} ml-0.5 cursor-pointer text-base iw-badge-delete`" @click="emits('delete')" />
  </div>
</template>
