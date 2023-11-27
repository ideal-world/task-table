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

async function setHidedColumn() {
  if (props.curColumnConf) {
    props.curColumnConf.hide = !props.curColumnConf.fixed
    await modifyColumnFun(undefined, props.curColumnConf)
  }
  closeContextMenuFun()
}
</script>

<template>
  <div class="iw-contextmenu__item cursor-pointer" @click="setHidedColumn">
    <i :class="iconSvg.HIDE" />
    {{ $t('list.columnHide.title') }}
  </div>
</template>
