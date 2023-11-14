<script setup lang="ts">
import { inject } from 'vue'
import { FN_CLOSE_CONTEXT_MENU } from '../../../constant'
import { ListColumnConf } from './conf'

const props = defineProps<{
  columnConf: ListColumnConf
}>()

let closeContextMenuFun = inject(FN_CLOSE_CONTEXT_MENU)

const setWrapColumn = () => {
  // @ts-ignore
  closeContextMenuFun()
}
</script>

<template>
  <div class="iw-contextmenu__item flex justify-between content-center w-full">
    <span>{{ props.columnConf.wrap ? $t('list.cellWrap.unWrap') : $t('list.cellWrap.wrap') }}</span>
    <input type="checkbox" class="toggle toggle-sm " v-model="props.columnConf.wrap" @click="setWrapColumn" />
  </div>
</template>

