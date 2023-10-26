<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { TableBasicConf, TableColumnConf } from './conf'
const { t } = useI18n()
import * as iconSvg from '../../assets/icon'

const props = defineProps<{
  currentColIdx: number
  basicConf: TableBasicConf
}>()

const basicConf = reactive<TableBasicConf>(props.basicConf)

const setFixedColumn = (event: MouseEvent) => {
  const targetEle = event.target as HTMLElement
  const contextmenuEle = targetEle.closest('.iw-table-header-contextmenu') as HTMLElement
  contextmenuEle.style.display = 'none'
  basicConf.fixedColumnIdx = props.currentColIdx
}
</script>

<script lang="ts">
export function setFixedColumnStyles(styles: any, colIdx: number, basicConf: TableBasicConf, columnsConf: TableColumnConf[]) {
  if (basicConf.fixedColumnIdx >= colIdx) {
    styles.position = 'sticky'
    styles.zIndex = 99
    // TODO 判断left要小于视口宽度
    styles.left = columnsConf.slice(0, colIdx).reduce((count, col) => count + col.width, 0) + 'px'
    if (basicConf.fixedColumnIdx == colIdx) {
      styles.borderRight = '3px solid var(--el-border-color)'
    }
  }
}
</script>

<template>
  <p className="iw-table-header-contextmenu__item" @click="setFixedColumn"><svg v-html="iconSvg.LOCK"></svg> {{ $t('table.fixed.title') }}</p>
</template>
