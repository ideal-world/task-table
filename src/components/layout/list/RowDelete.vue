<script setup lang="ts">
import { inject } from 'vue'
import * as iconSvg from '../../../assets/icon'
import { FUN_CLOSE_CONTEXT_MENU_TYPE } from '../../common/Menu.vue'
import * as eb from '../../eventbus'

const props = defineProps<{
  selectedPks: string[] | number[]
}>()

const closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!

async function deleteRow() {
  await eb.deleteData(props.selectedPks.slice())
  closeContextMenuFun()
}
</script>

<template>
  <div class="iw-contextmenu__item cursor-pointer text-sm" @click="deleteRow">
    <i :class="iconSvg.DELETE" /> {{ $t('list.rowDelete.title') }}
  </div>
</template>
