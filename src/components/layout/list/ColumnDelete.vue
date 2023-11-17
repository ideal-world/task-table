<script setup lang="ts">
import { inject } from 'vue';
import * as iconSvg from '../../../assets/icon';
import { FUN_CLOSE_CONTEXT_MENU_TYPE } from '../../common/Menu.vue';
import { CachedColumnConf } from '../../conf';
import { FUN_DELETE_COLUMN_TYPE } from '../../events';

const props = defineProps<{
  curColumnName: string
  pkColumnName: string
  columnsConf: CachedColumnConf[]
}>()
let deleteColumnFun = inject(FUN_DELETE_COLUMN_TYPE)!
let closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!

const deleteColumn = async () => {
  await deleteColumnFun(props.curColumnName)
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

