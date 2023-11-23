<script setup lang="ts">
import { inject } from 'vue'
import * as iconSvg from '../../../assets/icon'
import { FUN_CLOSE_CONTEXT_MENU_TYPE } from '../../common/Menu.vue'
import { FUN_DELETE_COLUMN_TYPE } from '../../events'

const props = defineProps<{
  curColumnName: string
  pkColumnName: string
}>()
const deleteColumnFun = inject(FUN_DELETE_COLUMN_TYPE)!
const closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!

async function deleteColumn() {
  await deleteColumnFun(props.curColumnName)
  closeContextMenuFun()
}
</script>

<template>
  <div
    v-show="props.curColumnName !== props.pkColumnName" class="iw-contextmenu__item cursor-pointer"
    @click="deleteColumn"
  >
    <i :class="iconSvg.DELETE" />
    {{ $t('list.columnDelete.title') }}
  </div>
</template>
