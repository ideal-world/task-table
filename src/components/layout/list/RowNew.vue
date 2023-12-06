<script setup lang="ts">
import { inject } from 'vue'
import * as iconSvg from '../../../assets/icon'
import { FUN_CLOSE_CONTEXT_MENU_TYPE } from '../../common/Menu.vue'
import { FUN_ADD_DATA_TYPE } from '../../events'

const props = defineProps<{
  selectedPks: string[] | number[]
}>()

const addDataFun = inject(FUN_ADD_DATA_TYPE)!
const closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!

async function newRow() {
  await addDataFun([{

  }], props.selectedPks[props.selectedPks.length - 1])
  closeContextMenuFun()
}
</script>

<template>
  <div class="iw-contextmenu__item cursor-pointer text-sm" @click="newRow">
    <i :class="iconSvg.ADD" /> {{ $t('list.rowNew.newTitle') }}
  </div>
</template>
