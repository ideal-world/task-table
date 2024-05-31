<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue'
import * as iconSvg from '../../../assets/icon'
import { FUN_CLOSE_CONTEXT_MENU_TYPE } from '../../common/Menu.vue'
import type { CachedColumnConf } from '../../conf'
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
    oldFixedColumnConf.fixed = false
    await eb.modifyColumn(oldFixedColumnConf)
  }
  await eb.modifyColumn({
    name: props.curColumnConf.name,
    wrap: props.curColumnConf.wrap,
    fixed: !props.curColumnConf.fixed,
    width: props.curColumnConf.width,
    hide: props.curColumnConf.hide,
    dateStart: props.curColumnConf.dateStart,
    dateEnd: props.curColumnConf.dateEnd,
  })
  closeContextMenuFun()
}
</script>

<script lang="ts">
export function setFixedColumnStyles(styles: any, colIdx: number, columnsConf: CachedColumnConf[]) {
  const fixedColumnIdx = columnsConf.findIndex(col => col.fixed)
  if (fixedColumnIdx >= colIdx) {
    styles.position = 'sticky'
    styles.zIndex = 1099
    // TODO 判断left要小于视口宽度
    styles.left = `${columnsConf.slice(0, colIdx).reduce((count, col) => count + col.width, 0)}px`
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
  <div class="flex justify-between items-center w-full mr-2">
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
