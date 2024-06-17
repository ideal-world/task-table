<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue'
import * as iconSvg from '../../../assets/icon'
import type { LayoutModifyProps } from '../../../props'
import { FUN_CLOSE_CONTEXT_MENU_TYPE } from '../../common/Menu.vue'
import type { ColumnConf } from '../../conf'
import * as eb from '../../eventbus'

const props = defineProps<{
  currentColumnConf: ColumnConf
  pkColumnName: string
}>()

const closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!

const wrapInputRef = ref<HTMLInputElement>()

onMounted(() => {
  wrapInputRef.value && (wrapInputRef.value.checked = props.currentColumnConf.wrap)
})

watch(props, () => {
  wrapInputRef.value && (wrapInputRef.value.checked = props.currentColumnConf.wrap)
})

async function setWrapColumn() {
  if (props.currentColumnConf) {
    const changedLayoutReq: LayoutModifyProps = {
      changedColumn: {
        ...props.currentColumnConf,
        wrap: !props.currentColumnConf.wrap,
      },
    }
    await eb.modifyLayout(changedLayoutReq)
  }
  closeContextMenuFun()
}
</script>

<template>
  <div v-if="props.currentColumnConf.name !== props.pkColumnName" class="flex justify-between items-center w-full">
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
