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

async function setFixedColumn() {
  const oldFixedColumnConf = props.columnsConf.find(col => col.fixed)
  if (oldFixedColumnConf && oldFixedColumnConf.name !== props.curColumnConf?.name) {
    oldFixedColumnConf.fixed = false
    await modifyColumnFun(undefined, oldFixedColumnConf)
  }
  if (props.curColumnConf) {
    props.curColumnConf.fixed = !props.curColumnConf.fixed
    await modifyColumnFun(undefined, props.curColumnConf)
  }
  closeContextMenuFun()
}
</script>

<script lang="ts">
export function setFixedColumnStyles(styles: any, colIdx: number, columnsConf: CachedColumnConf[]) {
  const fixedColumnIdx = columnsConf.findIndex(col => col.fixed)
  if (fixedColumnIdx >= colIdx) {
    styles.position = 'sticky'
    styles.zIndex = 1099
    // TODO 判断left要小于视口宽度
    styles.left = `${columnsConf.slice(0, colIdx).reduce((count, col) => count + col.width, 0)}px`
    if (fixedColumnIdx === colIdx) {
      // class: base-300
      styles.borderRight = '3px solid oklch(var(--b3))'
    }
  }
  else {
    styles.position = 'static'
  }
}
</script>

<template>
  <div class="flex justify-between items-center w-full mr-2">
    <span>
      <i :class="iconSvg.PIN" />
      {{ $t('list.columnFixed.title') }}
    </span>
    <input
      type="checkbox" class="toggle toggle-xs"
      :checked="props.curColumnConf?.fixed" @click="setFixedColumn"
    >
  </div>
</template>
