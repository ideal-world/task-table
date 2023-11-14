<script setup lang="ts">
import { inject } from 'vue'
import * as iconSvg from '../../../assets/icon'
import { FN_CLOSE_CONTEXT_MENU, FN_DELETE_DATA } from '../../../constant'

const props = defineProps<{
  selectedPks: string[] | number[]
}>()

let closeContextMenuFun = inject(FN_CLOSE_CONTEXT_MENU)
let deleteDataFun = inject(FN_DELETE_DATA)

const deleteData = () => {
  // @ts-ignore
  closeContextMenuFun()
  // @ts-ignore
  deleteDataFun(props.selectedPks)
}
</script>

<template>
  <div class="iw-contextmenu__item" @click="deleteData" style="cursor: pointer">
    <i :class="iconSvg.DELETE"></i> {{ $t('list.rowDelete.title') }}
  </div>
</template>
