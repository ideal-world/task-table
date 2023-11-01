<script setup lang="ts">
import { inject } from 'vue'
import * as iconSvg from '../../assets/icon'
import { FN_CLOSE_CONTEXT_MENU, FN_DELETE_DATA } from '../../constant'

const props = defineProps<{
  selectPks: string[] | number[] | undefined
}>()

let closeContextMenuFun = inject(FN_CLOSE_CONTEXT_MENU)
let deleteDataFun = inject(FN_DELETE_DATA)

const deleteData = (event: MouseEvent) => {
  // @ts-ignore
  closeContextMenuFun()
  // @ts-ignore
  deleteDataFun(props.selectPks)
}
</script>

<template>
  <p className="iw-contextmenu__item" @click="deleteData" style="cursor: pointer"><svg v-html="iconSvg.DELETE"></svg> {{ $t('list.delete.title') }}</p>
</template>
