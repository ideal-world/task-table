<script setup lang="ts">
import { inject } from 'vue';
import * as iconSvg from '../../../assets/icon';
import { getRandomString } from '../../../utils/basic';
import { FUN_CLOSE_CONTEXT_MENU_TYPE } from '../../common/Menu.vue';
import { CachedColumnConf, TableColumnConf, TableLayoutColumnConf } from '../../conf';
import { FUN_NEW_COLUMN_TYPE } from '../../events';

const props = defineProps<{
  curColumnName: string
  columnsConf: CachedColumnConf[]
}>()
const newColumnFun = inject(FUN_NEW_COLUMN_TYPE)!
const closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!

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
  await newColumnFun(newColumnConf, newLayoutColumnConf, columnConf.name)
  closeContextMenuFun()
}
</script>

<template>
  <div class="iw-contextmenu__item cursor-pointer" @click="copyColumn">
    <i :class="iconSvg.COPY"></i>
    {{ $t('list.columnCopy.title') }}
  </div>
</template>

