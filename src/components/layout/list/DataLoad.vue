<script setup lang="ts">
import { inject, ref } from 'vue'
import * as iconSvg from '../../../assets/icon'
import { FUN_LOAD_DATA_TYPE } from '../../events'

const props = defineProps<{
  totalNumber: number
  loadedNumber: number
  groupValue: any | undefined
}>()

const loadDataFun = inject(FUN_LOAD_DATA_TYPE)!

const loading = ref<boolean>(false)

async function loadData() {
  loading.value = true
  await loadDataFun(undefined, props.groupValue)
  loading.value = false
}
</script>

<template>
  <div v-if="props.totalNumber > props.loadedNumber" class="flex justify-center border-solid border-b border-l border-r border-base-300 cursor-pointer text-xs text-base-300 hover:text-base-content pt-1 pb-1" @click="loadData">
    <i :class="iconSvg.LOAD" class="mr-1" />
    <span>{{ loading ? $t('list.dataLoad.loadingTitle') : $t('list.dataLoad.loadTitle') }}</span>
  </div>
</template>
