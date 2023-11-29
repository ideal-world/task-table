<script setup lang="ts">
import { inject } from 'vue'
import { FUN_ADD_DATA_TYPE } from '../../events'
import * as iconSvg from '../../../assets/icon'

const props = defineProps<{
  groupValue: any | undefined
}>()

const addDataFun = inject(FUN_ADD_DATA_TYPE)!

async function addRow() {
  await addDataFun([{

  }], undefined, props.groupValue)
}
</script>

<template>
  <div class="border-solid border-b border-l border-r border-base-300 cursor-pointer text-base-300 hover:text-base-content pl-1" @click="addRow">
    <i :class="iconSvg.ADD" />
    <span>{{ $t('list.rowAdd.new') }}</span>
  </div>
</template>
