<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue'
import * as iconSvg from '../../../assets/icon'
import { FUN_CLOSE_CONTEXT_MENU_TYPE } from '../../common/Menu.vue'
import type { CachedColumnConf } from '../../conf'
import { FUN_MODIFY_COLUMN_TYPE } from '../../events'

const props = defineProps<{
  curColumnConf: CachedColumnConf
  columnsConf: CachedColumnConf[]
  pkColumnName: string
}>()

const modifyColumnFun = inject(FUN_MODIFY_COLUMN_TYPE)!
const closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!

const wrapInputRef = ref()

onMounted(() => {
  wrapInputRef.value && (wrapInputRef.value.checked = props.curColumnConf.wrap)
})

watch(props, () => {
  wrapInputRef.value && (wrapInputRef.value.checked = props.curColumnConf.wrap)
})

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
  <div v-if="props.curColumnConf.name !== props.pkColumnName" class="flex justify-between items-center w-full  ml-2">
    <span>
      <i :class="iconSvg.WRAP" />
      <span> {{ $t('list.columnWrap.title') }}</span>
    </span>
    <input
      ref="wrapInputRef"
      type="checkbox" class="iw-toggle iw-toggle-xs"
      @click="setWrapColumn"
    >
  </div>
</template>
