<script setup lang="ts">
import { inject } from 'vue'
import * as iconSvg from '../../../assets/icon'
import { getRandomString } from '../../../utils/basic'
import { FUN_CLOSE_CONTEXT_MENU_TYPE } from '../../common/Menu.vue'
import type { CachedColumnConf, TableColumnConf, TableLayoutColumnConf } from '../../conf'
import { FUN_NEW_COLUMN_TYPE } from '../../events'

const props = defineProps<{
  curColumnConf: CachedColumnConf
  columnsConf: CachedColumnConf[]
}>()
const newColumnFun = inject(FUN_NEW_COLUMN_TYPE)!
const closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!

async function copyColumn() {
  const newColumnName: string = `${props.curColumnConf.name}_${getRandomString(5, 'abcdefghijklmnopqrstuvwxyz0123456789')}`
  const newColumnConf: TableColumnConf = {
    name: newColumnName,
    title: `${props.curColumnConf.title}_copy`,
    icon: props.curColumnConf.icon,
    dataKind: props.curColumnConf.dataKind,
    dataEditable: props.curColumnConf.dataEditable,
    useDict: props.curColumnConf.useDict,
    dictEditable: props.curColumnConf.dictEditable,
    multiValue: props.curColumnConf.multiValue,
  }
  const newLayoutColumnConf: TableLayoutColumnConf = {
    ...props.curColumnConf,
    name: newColumnName,
  }
  await newColumnFun(newColumnConf, newLayoutColumnConf, props.curColumnConf.name)
  closeContextMenuFun()
}
</script>

<template>
  <div class="cursor-pointer" @click="copyColumn">
    <i :class="iconSvg.COPY" />
    {{ $t('list.columnCopy.title') }}
  </div>
</template>
