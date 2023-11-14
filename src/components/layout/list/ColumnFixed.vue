<script setup lang="ts">
import { inject, ref } from 'vue'
import { FN_CLOSE_CONTEXT_MENU } from '../../../constant'
import { TableLayoutConf } from '../../conf'
import { ListColumnConf } from './conf'

const props = defineProps<{
  curColumnName: string
  columnsConf: ListColumnConf[]
  layout: TableLayoutConf
}>()


let closeContextMenuFun = inject(FN_CLOSE_CONTEXT_MENU)

const setFixedColumn = () => {
  const colIdx = props.columnsConf.findIndex((col) => col.name == props.curColumnName)
  if (colIdx == props.layout.fixedColumnIdx) {
    props.layout.fixedColumnIdx = -1
  } else {
    props.layout.fixedColumnIdx = colIdx
  }
  // @ts-ignore
  closeContextMenuFun()
}
</script>

<script lang="ts">
export function setFixedColumnStyles(styles: any, colIdx: number, fixedColumnIdx: number, columnsConf: ListColumnConf[]) {
  if (fixedColumnIdx >= colIdx) {
    styles.position = 'sticky'
    styles.zIndex = 1099
    // TODO 判断left要小于视口宽度
    styles.left = columnsConf.slice(0, colIdx).reduce((count, col) => count + col.width, 0) + 'px'
    if (fixedColumnIdx == colIdx) {
      // class: base-300
      styles.borderRight = '3px solid hsl(var(--b3))'
    }
  } else {
    styles.position = 'static'
  }
}
</script>

<template>
  <div class="iw-contextmenu__item flex justify-between content-center w-full">
    {{ $t('list.columnFixed.title') }}
    <input type="checkbox" class="toggle toggle-sm"
      :checked="props.columnsConf.findIndex((col) => col.name == props.curColumnName) == layout.fixedColumnIdx"
      @click="setFixedColumn" />
  </div>
</template>

