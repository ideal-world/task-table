<script setup lang="ts">
import { inject } from 'vue'
import * as iconSvg from '../../../assets/icon'
import { FN_CLOSE_CONTEXT_MENU } from '../../../constant'
import { TableLayoutConf } from '../../conf'
import { ListBasicConf, ListColumnConf } from './conf'

const props = defineProps<{
  currentColIdx: number
  layout: TableLayoutConf
  basicConf: ListBasicConf
}>()

let closeContextMenuFun = inject(FN_CLOSE_CONTEXT_MENU)

const setFixedColumn = () => {
  if (props.currentColIdx == props.layout.fixedColumnIdx) {
    props.layout.fixedColumnIdx = -1
  } else {
    props.layout.fixedColumnIdx = props.currentColIdx
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
  <div class="iw-contextmenu__item cursor-pointer" @click="setFixedColumn">
    <i :class="iconSvg.LOCK"></i>
    {{ props.currentColIdx == props.layout.fixedColumnIdx ? $t('list.columnFixed.unFixedTitle') : $t('list.columnFixed.fixedTitle') }}
  </div>
</template>

