<script setup lang="ts">
import { ref } from 'vue'
import * as iconSvg from '../../../assets/icon'
import * as eb from '../../eventbus'

const props = defineProps<{
  totalNumber: number
  loadedNumber: number
  groupValue: any | undefined
}>()

const loading = ref<boolean>(false)

async function loadData() {
  loading.value = true
  await eb.loadData(props.groupValue)
  loading.value = false
}
</script>

<template>
  <div v-if="props.totalNumber > props.loadedNumber" class="flex justify-center border-solid border-b border-l border-r border-base-300 cursor-pointer text-xs text-base-300 hover:text-base-content pt-1 pb-1" @click="loadData">
    <i :class="iconSvg.LOAD" class="mr-1" />
    <span>{{ loading ? $t('list.dataLoad.loadingTitle') : $t('list.dataLoad.loadTitle') }}</span>
  </div>
</template>
