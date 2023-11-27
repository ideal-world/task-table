<script setup lang="ts">
import { inject } from 'vue'
import { FUN_CLOSE_CONTEXT_MENU_TYPE } from '../../common/Menu.vue'
import type { CachedColumnConf } from '../../conf'
import { FUN_MODIFY_COLUMN_TYPE } from '../../events'
import * as iconSvg from '../../../assets/icon'

const props = defineProps<{
  curColumnConf: CachedColumnConf | undefined
  columnsConf: CachedColumnConf[]
}>()
const modifyColumnFun = inject(FUN_MODIFY_COLUMN_TYPE)!
const closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!

async function setWrapColumn() {
  if (props.curColumnConf) {
    props.curColumnConf.wrap = !props.curColumnConf.wrap
    await modifyColumnFun(undefined, props.curColumnConf)
  }
  closeContextMenuFun()
}
</script>

<template>
  <div class="flex justify-between items-center w-full  ml-2">
    <span>
      <i :class="iconSvg.WRAP" />
      <span> {{ $t('list.cellWrap.title') }}</span>
    </span>
    <input
      type="checkbox" class="toggle toggle-xs"
      :checked="props.curColumnConf?.wrap" @click="setWrapColumn"
    >
  </div>
</template>
