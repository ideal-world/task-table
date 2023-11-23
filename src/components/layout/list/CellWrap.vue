<script setup lang="ts">
import { inject } from 'vue'
import { FUN_CLOSE_CONTEXT_MENU_TYPE } from '../../common/Menu.vue'
import type { CachedColumnConf } from '../../conf'
import { FUN_MODIFY_COLUMN_TYPE } from '../../events'
import * as iconSvg from '../../../assets/icon'

const props = defineProps<{
  curColumnName: string
  columnsConf: CachedColumnConf[]
}>()
const modifyColumnFun = inject(FUN_MODIFY_COLUMN_TYPE)!
const closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!

async function setWrapColumn() {
  const curColumnConf = props.columnsConf.find(col => col.name === props.curColumnName)
  if (curColumnConf) {
    curColumnConf.wrap = !curColumnConf.wrap
    await modifyColumnFun(undefined, curColumnConf)
  }
  closeContextMenuFun()
}
</script>

<template>
  <div class="iw-contextmenu__item flex justify-between content-center w-full">
    <span>
      <i :class="iconSvg.WRAP" />
      <span> {{ $t('list.cellWrap.title') }}</span>
    </span>
    <input
      type="checkbox" class="toggle toggle-sm"
      :checked="props.columnsConf.find((col) => col.name === props.curColumnName)?.wrap" @click="setWrapColumn"
    >
  </div>
</template>
