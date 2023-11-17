<script setup lang="ts">
import { inject } from 'vue'
import * as iconSvg from '../../../assets/icon'
import { FN_CLOSE_CONTEXT_MENU, FN_NEW_COLUMN } from '../../../constant'
import { getRandomString } from '../../../utils/basic'
import { CachedColumnConf, TableColumnConf, TableLayoutColumnConf } from '../../conf'

const props = defineProps<{
  curColumnName: string
  columnsConf: CachedColumnConf[]
}>()
const newColumnFun = inject(FN_NEW_COLUMN)
const closeContextMenuFun = inject(FN_CLOSE_CONTEXT_MENU)

const copyColumn = async () => {
  const columnIdx = props.columnsConf.findIndex((item) => item.name == props.curColumnName)
  const columnConf = props.columnsConf[columnIdx]
  const newColumnName: string = columnConf.name + '_' + getRandomString(5)
  const newColumnConf: TableColumnConf = {
    name: newColumnName,
    title: columnConf.title + '_copy',
    icon: columnConf.icon,
    dataKind: columnConf.dataKind,
    dataEditable: columnConf.dataEditable
  }
  const newLayoutColumnConf: TableLayoutColumnConf = {
    ...columnConf,
    name: newColumnName,
  }
  // @ts-ignore
  await newColumnFun(newColumnConf, newLayoutColumnConf, columnConf.name)
  // @ts-ignore
  closeContextMenuFun()
}
</script>

<template>
  <div class="iw-contextmenu__item cursor-pointer" @click="copyColumn">
    <i :class="iconSvg.COPY"></i>
    {{ $t('list.columnCopy.title') }}
  </div>
</template>

