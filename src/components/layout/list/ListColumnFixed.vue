<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue'
import * as iconSvg from '../../../assets/icon'
import type { LayoutModifyProps } from '../../../props'
import { FUN_CLOSE_CONTEXT_MENU_TYPE } from '../../common/Menu.vue'
import type { ColumnConf } from '../../conf'
import * as eb from '../../eventbus'

const props = defineProps<{
  // 当前列配置
  // Current column configuration
  currentColumnConf: ColumnConf
  // 可能涉及的列配置
  // Possible column configuration
  columnsConf: ColumnConf[]
}>()
const closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!

const fixedInputRef = ref<HTMLInputElement>()

onMounted(() => {
  fixedInputRef.value!.checked = props.currentColumnConf.fixed
})

watch(props, () => {
  fixedInputRef.value!.checked = props.currentColumnConf.fixed
})

async function setFixedColumn() {
  const oldFixedColumnConf = props.columnsConf.find(col => col.fixed)
  if (oldFixedColumnConf && oldFixedColumnConf.name !== props.currentColumnConf.name) {
    const changedLayoutReq: LayoutModifyProps = {
      changedColumn: {
        ...oldFixedColumnConf,
        fixed: false,
      },
    }
    await eb.modifyLayout(changedLayoutReq)
  }
  const changedLayoutReq: LayoutModifyProps = {
    changedColumn: {
      ...props.currentColumnConf,
      fixed: !props.currentColumnConf.fixed,
    },
  }
  await eb.modifyLayout(changedLayoutReq)
  closeContextMenuFun()
}
</script>

<script lang="ts">
/**
 * 设置固定列样式
 *
 * Set fixed column styles
 *
 * @param styles 已存在的样式 / Existing styles
 * @param currColIdx 当前列索引 / Current column index
 * @param columnsConf 列配置 / Column configuration
 * @param selectColumnWidth 选择列宽度 / Select column width
 */
export function setFixedColumnStyles(styles: any, currColIdx: number, columnsConf: ColumnConf[], selectColumnWidth: number) {
  // 获取固定列索引
  // Get the fixed column index
  const fixedColumnIdx = columnsConf.findIndex(col => col.fixed)
  if (currColIdx === -1 && fixedColumnIdx === -1) {
    // 当前是选择列且无固定列
    // Current is the select column and there is no fixed column

    // non-fixed column
    styles.position = 'relative'
    styles.zIndex = 1000
  }
  else if (currColIdx === -1) {
    // 当前是选择列，存在固定列
    // Current is the select column, and there is a fixed column

    // fixed select column
    styles.position = 'sticky'
    styles.zIndex = 1099
    styles.left = `0px`
  }
  else if (currColIdx === -2) {
    // 当前是操作列
    // Current is the action column

    // fixed action column
    styles.position = 'sticky'
    styles.zIndex = 1099
    styles.right = `0px`
    // class: base-300
    styles.borderLeft = '3px solid oklch(var(--b3))'
  }
  else if (fixedColumnIdx >= currColIdx) {
    // 存在固定列，且当前列在固定列之前
    // There is a fixed column, and the current column is before the fixed column

    // fixed columns
    styles.position = 'sticky'
    styles.zIndex = 1099
    styles.left = `${columnsConf.slice(0, currColIdx).reduce((count, col) => count + col.width, selectColumnWidth)}px`
    if (fixedColumnIdx === currColIdx) {
      // class: base-300
      styles.borderRight = '3px solid oklch(var(--b3))'
    }
  }
  else {
    // 其它情况
    // Other cases

    styles.position = 'relative'
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
