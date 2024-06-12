<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue'
import * as iconSvg from '../../../assets/icon'
import type { TableLayoutModifyProps } from '../../../props'
import { FUN_CLOSE_CONTEXT_MENU_TYPE } from '../../common/Menu.vue'
import { type CachedColumnConf, convertLayoutColumnConfToLayoutColumnProps } from '../../conf'
import * as eb from '../../eventbus'

const props = defineProps<{
  curColumnConf: CachedColumnConf
  columnsConf: CachedColumnConf[]
  pkColumnName: string
}>()

const closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!

const wrapInputRef = ref<HTMLInputElement>()

onMounted(() => {
  wrapInputRef.value && (wrapInputRef.value.checked = props.curColumnConf.wrap)
})

watch(props, () => {
  wrapInputRef.value && (wrapInputRef.value.checked = props.curColumnConf.wrap)
})

async function setWrapColumn() {
  if (props.curColumnConf) {
    const changedLayoutReq: TableLayoutModifyProps = {
      changedColumn: {
        ...convertLayoutColumnConfToLayoutColumnProps(props.curColumnConf),
        wrap: !props.curColumnConf.wrap,
      },
    }
    await eb.modifyLayout(changedLayoutReq)
  }
  closeContextMenuFun()
}
</script>

<template>
  <div v-if="props.curColumnConf.name !== props.pkColumnName" class="flex justify-between items-center w-full">
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
