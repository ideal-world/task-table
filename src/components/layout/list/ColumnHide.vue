<script setup lang="ts">
import { inject } from 'vue'
import * as iconSvg from '../../../assets/icon'
import { FUN_CLOSE_CONTEXT_MENU_TYPE } from '../../common/Menu.vue'
import type { CachedColumnConf } from '../../conf'
import { FUN_MODIFY_COLUMN_TYPE } from '../../events'

const props = defineProps<{
  curColumnConf: CachedColumnConf
  columnsConf: CachedColumnConf[]
  pkColumnName: string
}>()
const modifyColumnFun = inject(FUN_MODIFY_COLUMN_TYPE)!
const closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!

async function setHidedColumn() {
  await modifyColumnFun({
    name: props.curColumnConf.name,
    wrap: props.curColumnConf.wrap,
    fixed: props.curColumnConf.fixed,
    width: props.curColumnConf.width,
    hide: !props.curColumnConf.hide,
    dateStart: props.curColumnConf.dateStart,
    dateEnd: props.curColumnConf.dateEnd,
  })
  closeContextMenuFun()
}
</script>

<template>
  <div v-if="props.curColumnConf.name !== props.pkColumnName" class="cursor-pointer ml-1 mr-1" @click="setHidedColumn">
    <i :class="iconSvg.HIDE" />
    {{ $t('list.columnHide.title') }}
  </div>
</template>
