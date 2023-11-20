<script setup lang="ts">
import { inject } from 'vue'
import * as iconSvg from '../../../assets/icon'
import { FUN_CLOSE_CONTEXT_MENU_TYPE } from '../../common/Menu.vue'
import { FUN_DELETE_DATA_TYPE } from '../../events'

const props = defineProps<{
  selectedPks: string[] | number[]
}>()

let deleteDataFun = inject(FUN_DELETE_DATA_TYPE)!
let closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!

const deleteData = () => {
  closeContextMenuFun()
  deleteDataFun(props.selectedPks)
}
</script>

<template>
  <div class="iw-contextmenu__item" @click="deleteData" style="cursor: pointer">
    <i :class="iconSvg.DELETE"></i> {{ $t('list.rowDelete.title') }}
  </div>
</template>
