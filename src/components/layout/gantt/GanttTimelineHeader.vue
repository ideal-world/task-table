<script setup lang="ts">
import type { GanttInfo } from './gantt'

const props = defineProps<{
  info: GanttInfo
}>()
</script>

<template>
  {{ $t('layout.action.title') }}
</template>
