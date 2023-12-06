<script setup lang="ts">
import { computed, inject } from 'vue'
import * as iconSvg from '../../../assets/icon'
import { FUN_CLOSE_CONTEXT_MENU_TYPE } from '../../common/Menu.vue'
import type { CachedColumnConf } from '../../conf'
import { FUN_MODIFY_COLUMN_TYPE } from '../../events'

const props = defineProps<{
  curColumnConf: CachedColumnConf | undefined
  columnsConf: CachedColumnConf[]
  pkColumnName: string
}>()

const modifyColumnFun = inject(FUN_MODIFY_COLUMN_TYPE)!
const closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!

async function setWrapColumn() {
  if (props.curColumnConf) {
    await modifyColumnFun(undefined, {
      name: props.curColumnConf.name,
      wrap: !props.curColumnConf.wrap,
      fixed: props.curColumnConf.fixed,
      width: props.curColumnConf.width,
      hide: props.curColumnConf.hide,
      dateStart: props.curColumnConf.dateStart,
      dateEnd: props.curColumnConf.dateEnd,
    })
  }
  closeContextMenuFun()
}
</script>

<template>
  <div v-if="props.curColumnConf?.name !== props.pkColumnName" class="flex justify-between items-center w-full  ml-2">
    <span>
      <i :class="iconSvg.WRAP" />
      <span> {{ $t('list.cellWrap.title') }}</span>
    </span>
    <input
      type="checkbox" class="toggle toggle-xs"
      :checked="props.curColumnConf?.wrap" @click="setWrapColumn"
    >
  </div>
</template>
