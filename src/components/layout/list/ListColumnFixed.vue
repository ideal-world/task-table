<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue'
import * as iconSvg from '../../../assets/icon'
import type { TableLayoutModifyProps } from '../../../props'
import { FUN_CLOSE_CONTEXT_MENU_TYPE } from '../../common/Menu.vue'
import { type CachedColumnConf, convertLayoutColumnConfToLayoutColumnProps } from '../../Initializer'
import * as eb from '../../eventbus'

const props = defineProps<{
  curColumnConf: CachedColumnConf
  columnsConf: CachedColumnConf[]
}>()
const closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!

const fixedInputRef = ref<HTMLInputElement>()

onMounted(() => {
  fixedInputRef.value!.checked = props.curColumnConf.fixed
})

watch(props, () => {
  fixedInputRef.value!.checked = props.curColumnConf.fixed
})

async function setFixedColumn() {
  const oldFixedColumnConf = props.columnsConf.find(col => col.fixed)
  if (oldFixedColumnConf && oldFixedColumnConf.name !== props.curColumnConf.name) {
    const changedLayoutReq: TableLayoutModifyProps = {
      changedColumn: {
        ...convertLayoutColumnConfToLayoutColumnProps(oldFixedColumnConf),
        fixed: false,
      },
    }
    await eb.modifyLayout(changedLayoutReq)
  }
  const changedLayoutReq: TableLayoutModifyProps = {
    changedColumn: {
      ...convertLayoutColumnConfToLayoutColumnProps(props.curColumnConf),
      fixed: !props.curColumnConf.fixed,
    },
  }
  await eb.modifyLayout(changedLayoutReq)
  closeContextMenuFun()
}
</script>

<script lang="ts">
export function setFixedColumnStyles(styles: any, colIdx: number, columnsConf: CachedColumnConf[], selectColumnWidth: number) {
  const fixedColumnIdx = columnsConf.findIndex(col => col.fixed)
  if (colIdx === -1 && fixedColumnIdx === -1) {
    // non-fixed column
    styles.position = 'static'
    styles.zIndex = 1000
  }
  else if (colIdx === -1) {
    // fixed select column
    styles.position = 'sticky'
    styles.zIndex = 1099
    styles.left = `0px`
  }
  else if (colIdx === -2) {
    // fixed action column
    styles.position = 'sticky'
    styles.zIndex = 1099
    styles.right = `0px`
    // class: base-300
    styles.borderLeft = '3px solid oklch(var(--b3))'
  }
  else if (fixedColumnIdx >= colIdx) {
    // fixed columns
    styles.position = 'sticky'
    styles.zIndex = 1099
    styles.left = `${columnsConf.slice(0, colIdx).reduce((count, col) => count + col.width, selectColumnWidth)}px`
    if (fixedColumnIdx === colIdx) {
      // class: base-300
      styles.borderRight = '3px solid oklch(var(--b3))'
    }
  }
  else {
    styles.position = 'static'
  }
}
</script>

<template>
  <div class="flex justify-between items-center w-full">
    <span>
      <i :class="iconSvg.PIN" />
      {{ $t('list.columnFixed.title') }}
    </span>
    <input
      ref="fixedInputRef"
      type="checkbox" class="iw-toggle iw-toggle-xs"
      @click="setFixedColumn"
    >
  </div>
</template>
