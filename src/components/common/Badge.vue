<script setup lang="ts">
import * as iconSvg from '../../assets/icon'

defineProps<{
    dictItemOrRawValue: any,
}>()
const emits = defineEmits<{
    (e: 'delete'): void
}>()
</script>
<template>
    <div class="iw-badge flex" :style="`background-color: ${dictItemOrRawValue.color ?? ''}`">
        <span v-if="dictItemOrRawValue.avatar !== undefined" class="avatar">
            <img :src="dictItemOrRawValue.avatar" class="w-4 rounded-full">
        </span>
        <span class="ml-1 whitespace-nowrap flex-1 truncate">{{ dictItemOrRawValue.title ?? dictItemOrRawValue }}</span>
        <i :class="`${iconSvg.DELETE} ml-0.5 cursor-pointer`" @click="emits('delete')" />
    </div>
</template>