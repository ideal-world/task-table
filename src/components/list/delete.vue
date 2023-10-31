<script setup lang="ts">
import { inject } from 'vue'
import * as iconSvg from '../../assets/icon'
import { closeContextMenu } from './list.vue'
import { FN_DELETE_DATA } from '../../constant'

const props = defineProps<{
  selectPks: string[] | number[]
}>()

let deleteDataFun = inject(FN_DELETE_DATA)

const deleteData = (event: MouseEvent) => {
  closeContextMenu(event)
  // @ts-ignore
  deleteDataFun(props.selectPks)
}
</script>

<template>
  <p className="iw-contextmenu__item" @click="deleteData"><svg v-html="iconSvg.DELETE"></svg> {{ $t('list.delete.title') }}</p>
</template>
