<script setup lang="ts">
import { ref } from 'vue'
import type { TableDataSliceProps, TableLayoutModifyProps } from '../../props'
import * as eb from '../eventbus'

const props = defineProps<{
  slice: TableDataSliceProps
  totalNumber: number
}>()
</script>

<template>
  <div class="iw-join">
    <button class="iw-join-item iw-btn iw-btn-sm">
      1
    </button>
    <button class="iw-join-item iw-btn iw-btn-sm iw-btn-active">2</button>
    <button class="iw-join-item iw-btn iw-btn-sm">
      2
    </button>
    <button class="iw-join-item iw-btn iw-btn-sm">
      ...
    </button>
    <button class="iw-join-item iw-btn iw-btn-sm">
      99
    </button>
    <button class="iw-join-item iw-btn iw-btn-sm">
      100
    </button>
  </div>
</template>
