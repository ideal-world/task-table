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

/**
 *
 * @param e 鼠标事件
 */
function showMenu(e: MouseEvent) {
  if (!e.target.closest('.iw-data-cell'))
    return
  e.preventDefault()
  e.stopPropagation()
  // 获取菜单数据
  const list = props.getContextMenu((e.target as HTMLElement).closest('.iw-data-cell').dataset.columnName)
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
  eb.selectContextMenu(item)
}

onMounted(() => {
  contextMenuRef.value!.addEventListener('contextmenu', showMenu)
  window.addEventListener('click', closeMenu, true)
  window.addEventListener('contextmenu', closeMenu, true)
})

onUnmounted(() => {
  contextMenuRef.value!.removeEventListener('contextmenu', showMenu)
})
</script>

<template>
  <div ref="contextMenuRef" class="context-container">
    <slot />
    <teleport to="body">
      <div
        v-if="visible"
        class="context-menu bg-info"
        :style="{ left: `${x}px`, top: `${y}px` }"
      >
        <div
          v-for="item in menuData"
          :key="item.id"
          @click="selectMenu(item)"
        >
          {{ item.label }}
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.context-menu {
  position: fixed;
  padding:4px 4px 0;
  border-radius: 5px;
  font-size: 14px;
  color:#fff;
  div{
    padding-bottom: 4px;
    cursor: pointer;
  }
}
</style>
