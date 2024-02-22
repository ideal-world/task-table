<script setup lang="ts">
import { inject } from 'vue'
import * as iconSvg from '../../../assets/icon'
import { FUN_CLOSE_CONTEXT_MENU_TYPE } from '../../common/Menu.vue'
import { FUN_DELETE_DATA_TYPE } from '../../events'

const props = defineProps<{
  selectedPks: string[] | number[]
}>()

const deleteDataFun = inject(FUN_DELETE_DATA_TYPE)!
const closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!

async function deleteRow() {
  await deleteDataFun(props.selectedPks.slice())
  closeContextMenuFun()
}
</script>

<template>
  <div class="iw-contextmenu__item cursor-pointer text-sm" @click="deleteRow">
    <i :class="iconSvg.DELETE" /> {{ $t('list.rowDelete.title') }}
  </div>
</template>
