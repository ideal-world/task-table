<script setup lang="ts">
import { inject } from 'vue'
import { FN_CLOSE_CONTEXT_MENU, FN_MODIFY_COLUMN } from '../../../constant'
import { ListColumnConf } from './conf'
import { TableColumnProps } from '../../props';

const props = defineProps<{
  curColumnName: string
  columnsConf: ListColumnConf[]
}>()
let modifyColumnFun = inject(FN_MODIFY_COLUMN)

let closeContextMenuFun = inject(FN_CLOSE_CONTEXT_MENU)

const setWrapColumn = async () => {
  let curColumnConf = props.columnsConf.find((col) => col.name == props.curColumnName)
  if (curColumnConf) {
    let columnProps: TableColumnProps = {
      name: curColumnConf.name,
      wrap: !curColumnConf.wrap
    }
    // @ts-ignore
    if (await modifyColumnFun(columnProps)) {
      curColumnConf.wrap = !curColumnConf.wrap
    }
  }
  // @ts-ignore
  closeContextMenuFun()
}
</script>

<template>
  <div class="iw-contextmenu__item flex justify-between content-center w-full">
    <span> {{ $t('list.cellWrap.title') }}</span>
    <input type="checkbox" class="toggle toggle-sm"
      :checked="props.columnsConf.find((col) => col.name == props.curColumnName)?.wrap" @click="setWrapColumn" />
  </div>
</template>

