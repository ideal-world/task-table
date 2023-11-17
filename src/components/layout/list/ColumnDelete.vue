<script setup lang="ts">
import { inject } from 'vue';
import * as iconSvg from '../../../assets/icon';
import { FN_CLOSE_CONTEXT_MENU, FN_DELETE_COLUMN } from '../../../constant';
import { CachedColumnConf } from '../../conf';

const props = defineProps<{
  curColumnName: string
  pkColumnName: string
  columnsConf: CachedColumnConf[]
}>()
let deleteColumnFun = inject(FN_DELETE_COLUMN)
let closeContextMenuFun = inject(FN_CLOSE_CONTEXT_MENU)

const deleteColumn = async () => {
  // @ts-ignore
  await deleteColumnFun(props.curColumnName)
  // @ts-ignore
  closeContextMenuFun()
}
</script>

<template>
  <div class="iw-contextmenu__item cursor-pointer" @click="deleteColumn"
    v-show="props.curColumnName != props.pkColumnName">
    <i :class="iconSvg.DELETE"></i>
    {{ $t('list.columnDelete.title') }}
  </div>
</template>

