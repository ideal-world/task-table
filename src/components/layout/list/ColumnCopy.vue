<script setup lang="ts">
import { inject } from 'vue'
import * as iconSvg from '../../../assets/icon'
import { FN_CLOSE_CONTEXT_MENU, FN_NEW_COLUMN } from '../../../constant'
import { ListColumnConf } from './conf'
import { getRandomString } from '../../../utils/basic'
import { TableColumnProps } from '../../props'

const props = defineProps<{
  curColumnName: string
  columnsConf: ListColumnConf[]
}>()
let newColumnFun = inject(FN_NEW_COLUMN)
let closeContextMenuFun = inject(FN_CLOSE_CONTEXT_MENU)

const copyColumn = async () => {
  let columnIdx = props.columnsConf.findIndex((item) => item.name == props.curColumnName)
  let columnConf = props.columnsConf[columnIdx]
  let newColumnConf = {
    ...columnConf,
    name: columnConf.name + '_' + getRandomString(5),
    title: columnConf.title + '_copy',
  }
  let columnProps: TableColumnProps = {
    pk: false,
    name: newColumnConf.name,
    icon: newColumnConf.icon,
    title: newColumnConf.title,
    dataKind: newColumnConf.dataKind,
    editable: newColumnConf.editable,
    fillable: newColumnConf.fillable,
    wrap: newColumnConf.wrap,
    width: newColumnConf.width
  }
  // @ts-ignore
  if (await newColumnFun(columnProps, columnConf.name)) {
    props.columnsConf.splice(columnIdx + 1, 0, newColumnConf)
  }
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

