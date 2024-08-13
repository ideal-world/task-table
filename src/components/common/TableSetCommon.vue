<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{
  title: string
  isShow?: boolean
}>()

const isShow = ref(props.isShow || false)


</script>

<template>
  <div class="w-full">
    <div
      class="w-full cursor-pointer iw-table-setting-title flex justify-between px-3 border-b border-b-gray-200 py-2"
      @click="isShow = !isShow"
    >
      <div class="title font-medium pointer-events-none">
        {{ title }}
      </div>
      <i
        class="octicon-triangle-down-16 pointer-events-none duration-200"
        :style="{ transform: isShow ? 'rotate(-180deg)': 'rotate(0deg)'}"
      />
    </div>
    <div class="w-full p-3" :style="{ display: isShow ? 'block':'none' }">
      <slot />
    </div>
  </div>
</template>
