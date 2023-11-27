<script setup lang="ts">
import { inject } from 'vue'
import * as iconSvg from '../../../assets/icon'
import { getRandomString } from '../../../utils/basic'
import { FUN_CLOSE_CONTEXT_MENU_TYPE } from '../../common/Menu.vue'
import type { CachedColumnConf, TableColumnConf, TableLayoutColumnConf } from '../../conf'
import { FUN_NEW_COLUMN_TYPE } from '../../events'

const props = defineProps<{
  curColumnConf: CachedColumnConf | undefined
  columnsConf: CachedColumnConf[]
}>()
const newColumnFun = inject(FUN_NEW_COLUMN_TYPE)!
const closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!

async function copyColumn() {
  const curColumnConf = props.curColumnConf!
  const newColumnName: string = `${curColumnConf.name}_${getRandomString(5)}`
  const newColumnConf: TableColumnConf = {
    name: newColumnName,
    title: `${curColumnConf.title}_copy`,
    icon: curColumnConf.icon,
    dataKind: curColumnConf.dataKind,
    dataEditable: curColumnConf.dataEditable,
    useDict: curColumnConf.useDict,
    dictEditable: curColumnConf.dictEditable,
    multiValue: curColumnConf.multiValue,
  }
  const newLayoutColumnConf: TableLayoutColumnConf = {
    ...curColumnConf,
    name: newColumnName,
  }
  await newColumnFun(newColumnConf, newLayoutColumnConf, curColumnConf.name)
  closeContextMenuFun()
}
</script>

<template>
  <div class="iw-contextmenu__item cursor-pointer" @click="copyColumn">
    <i :class="iconSvg.COPY" />
    {{ $t('list.columnCopy.title') }}
  </div>
</template>
