<script setup lang="ts">
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'
import * as iconSvg from '../../assets/icon'
import { FN_CLOSE_CONTEXT_MENU } from '../../constant'
import { TableShowConf } from '../conf'
import { ListBasicConf, ListColumnConf } from './conf'
const { t } = useI18n()

const props = defineProps<{
  currentColIdx: number
  show: TableShowConf
  basicConf: ListBasicConf
}>()

let closeContextMenuFun = inject(FN_CLOSE_CONTEXT_MENU)

const setFixedColumn = (event: MouseEvent) => {
  if (props.currentColIdx == props.show.fixedColumnIdx) {
    props.show.fixedColumnIdx = -1
  } else {
    props.show.fixedColumnIdx = props.currentColIdx
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
      styles.borderRight = '3px solid var(--el-border-color)'
    }
  } else {
    styles.position = 'static'
  }
}
</script>

<template>
  <p className="iw-contextmenu__item" @click="setFixedColumn">
    <svg v-html="iconSvg.LOCK"></svg> {{ props.currentColIdx == props.show.fixedColumnIdx ? $t('list.fixed.unFixedTitle') : $t('list.fixed.fixedTitle') }}
  </p>
</template>
