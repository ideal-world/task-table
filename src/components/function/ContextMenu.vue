<script lang="ts" setup>
/**
 * 右键打开
 */
import { onMounted, onUnmounted, ref } from 'vue'
import * as eb from '../eventbus'
import type { ContextMenuItemProps } from '../../props/functionProps'

const props = defineProps<{
  // 获取右键菜单
  // Get context menu
  getContextMenu: Function
  // 菜单额外参数
  // ContextMenu extra argument
  exContextMenuArg?: Function
}>()

// 菜单x轴位置
// Menu x location
const x = ref(0)
// 菜单y轴位置
// Menu y location
const y = ref(0)
// 菜单是否可见
// Menu is visible
const visible = ref(false)
// 菜单dom
// Menu dom
const contextMenuRef = ref<HTMLElement>()
// 菜单数据
// Menu data
const menuData = ref<ContextMenuItemProps[]>([])
// 菜单额外参数
// ContextMenu extra argument
const exArg = ref()

/**
 *
 * @param e 鼠标事件
 */
function showMenu(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  if (props.exContextMenuArg) {
    exArg.value = props.exContextMenuArg(e)
  }
  // 获取菜单数据
  const list = props.getContextMenu(e)
  if (!list?.length)
    return
  menuData.value = list
  x.value = e.clientX
  y.value = e.clientY
  visible.value = true
}

/**
 * 关闭菜单
 */
function closeMenu() {
  visible.value = false
}

/**
 * 选择菜单
 * @param item 菜单项
 */
function selectMenu(item: ContextMenuItemProps) {
  if (props.exContextMenuArg) {
    eb.selectContextMenu(item, exArg.value)
  }
  else {
    eb.selectContextMenu(item)
  }
}

onMounted(() => {
  contextMenuRef.value?.addEventListener('contextmenu', showMenu)
  window.addEventListener('click', closeMenu, true)
  window.addEventListener('contextmenu', closeMenu, true)
})

onUnmounted(() => {
  contextMenuRef.value?.removeEventListener('contextmenu', showMenu)
})
</script>

<template>
  <div ref="contextMenuRef" class="context-container">
    <slot />
    <teleport to="body">
      <div
        v-if="visible"
        class="text-white text-[14px] fixed px-1 pt-1 rounded bg-[var(--sys-primary)] z-[10]"
        :style="{ left: `${x}px`, top: `${y}px` }"
      >
        <div
          v-for="item in menuData"
          :key="item.id"
          class="cursor-pointer pb-1"
          @click="selectMenu(item)"
        >
          {{ item.label }}
        </div>
      </div>
    </teleport>
  </div>
</template>
