<script setup lang="ts">
import { inject } from 'vue'
import { FUN_CLOSE_CONTEXT_MENU_TYPE } from '../../common/Menu.vue'
import { CachedColumnConf } from '../../conf'
import { FUN_MODIFY_COLUMN_TYPE } from '../../events'
import * as iconSvg from '../../../assets/icon'

const props = defineProps<{
  curColumnName: string
  columnsConf: CachedColumnConf[]
}>()
const modifyColumnFun = inject(FUN_MODIFY_COLUMN_TYPE)!
const closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!

const setHidedColumn = async () => {
  const curColumnConf = props.columnsConf.find((col) => col.name == props.curColumnName)
  if (curColumnConf) {
    curColumnConf.hide = !curColumnConf.fixed
    await modifyColumnFun(undefined, curColumnConf)
  }
  closeContextMenuFun()
}
</script>

<template>
  <div class="iw-contextmenu__item cursor-pointer" @click="setHidedColumn">
    <i :class="iconSvg.HIDE"></i>
    {{ $t('list.columnHide.title') }}
  </div>
</template>

