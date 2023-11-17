<script setup lang="ts">
import { inject } from 'vue';
import { FN_CLOSE_CONTEXT_MENU, FN_MODIFY_COLUMN } from '../../../constant';
import { CachedColumnConf } from '../../conf';

const props = defineProps<{
  curColumnName: string
  columnsConf: CachedColumnConf[]
}>()
const modifyColumnFun = inject(FN_MODIFY_COLUMN)
const closeContextMenuFun = inject(FN_CLOSE_CONTEXT_MENU)

const setWrapColumn = async () => {
  const curColumnConf = props.columnsConf.find((col) => col.name == props.curColumnName)
  if (curColumnConf) {
    curColumnConf.wrap = !curColumnConf.wrap
    // @ts-ignore
    await modifyColumnFun(null, curColumnConf)
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

