<script setup lang="ts">
import type { InjectionKey } from 'vue'
import { computed, nextTick, onMounted, provide, ref } from 'vue'
import { getRandomString } from '../../utils/basic'
import type { MenuCustomSize } from './Menu'
import { EVENTS, MenuOffsetKind, MenuSizeKind, doCloseContextMenu, getInitOffset, getInitSize, setContextmenuLevel } from './Menu'

const contextmenuRef = ref<HTMLElement | null>(null)
const isInit = ref<boolean>(false)

const contextmenuMathRandom = computed(() =>
  getRandomString(12),
)

/**
 * 显示上下文菜单
 *
 * Show context menu
 *
 * NOTE: 当参数 ``force`` 为 ``false`` 或未定义 时，如果菜单附着对象是菜单本身或菜单的子元素，则不会显示菜单，即不支持在菜单中再次显示菜单。
 *
 * NOTE: When the parameter ``force`` is ``false`` or undefined,
 * if the menu attachment object is the menu itself or a child element of the menu, the menu will not be displayed, that is,
 * it does not support displaying the menu again in the menu.
 *
 * @param attachObj 菜单附着对象，可以是 MouseEvent 或 HTMLElement / Menu attachment object, can be MouseEvent or HTMLElement
 * @param offset 菜单显示位置 / Menu display position
 * @param size 菜单大小 / Menu size
 * @param force 是否强制显示 / Whether to force display
 * @param boundaryEle 边界元素，菜单不会超出边界元素 / Boundary element, the menu will not exceed the boundary element
 */
async function showContextMenu(attachObj: HTMLElement | MouseEvent, offset: MenuOffsetKind = MenuOffsetKind.MEDIUM_TOP, size: MenuSizeKind | MenuCustomSize = MenuSizeKind.MEDIUM, force: boolean = false, boundaryEle?: HTMLElement,
) {
  const contextmenuEle = contextmenuRef.value!
  if (!isInit.value && EVENTS.init[contextmenuEle.id]) {
    EVENTS.init[contextmenuEle.id].callback(contextmenuEle)
  }

  // 菜单已初始化
  isInit.value = true

  if (
    !force
    && (
      (attachObj instanceof HTMLElement && contextmenuRef.value!.contains(attachObj)) || (attachObj instanceof MouseEvent && attachObj.target instanceof HTMLElement && contextmenuRef.value!.contains(attachObj.target))
    )
  ) {
    return
  }

  // 设置菜单初始大小
  // Set the initial size of the menu
  const { minHeight, minWidth, padding } = getInitSize(size)

  const contextMenuEle = contextmenuRef.value as HTMLElement
  contextMenuEle.style.minHeight = `${minHeight}px`
  contextMenuEle.style.minWidth = `${minWidth}px`
  // 隐藏菜单但保持占位，可用于计算菜单的实际大小
  // Hide the menu but keep the placeholder, which can be used to calculate the actual size of the menu
  contextMenuEle.style.visibility = 'hidden'
  contextMenuEle.style.display = `block`

  nextTick().then(() => {
    const observer = new ResizeObserver((_) => {
      const { left, top } = getInitOffset(attachObj, offset, contextMenuEle, boundaryEle)

      contextMenuEle.style.left = `${left}px`
      contextMenuEle.dataset.left = `${left + window.scrollX}`
      contextMenuEle.style.top = `${top}px`
      contextMenuEle.dataset.top = `${top + window.scrollY}`
    })
    observer.observe(contextMenuEle)
    // 计算完成，显示菜单
    // Calculation completed, display the menu
    contextMenuEle.style.visibility = 'visible'

    // 设置菜单项的 padding
    // Set the padding of the menu item
    contextMenuEle.querySelectorAll('.iw-contextmenu__item').forEach((node) => {
      const nodeEle = node as HTMLElement
      nodeEle.style.padding = `${padding}px`
    })

    // 设置菜单的显示级别，用于控制有多个菜单时隐藏方式
    // Set the display level of the menu, used to control the hiding method when there are multiple menus
    setContextmenuLevel(attachObj, contextMenuEle)
  })
}

/**
 * 关闭当前上下文菜单
 *
 * Close the current context menu
 */
function closeCurrentContextMenu() {
  const contextMenuEle = contextmenuRef.value as HTMLElement
  doCloseContextMenu(contextMenuEle)
}

onMounted(() => {

})

/**
 * 注册菜单初始化时的监听器
 *
 * Register a listener when the menu is initialized
 *
 * @param callback 回调函数 / Callback function
 */
function registerOnInitListener(callback: (menuEle: HTMLElement) => Promise<void>) {
  const contextMenuEle = contextmenuRef.value as HTMLElement
  EVENTS.init[contextMenuEle.id] = {
    callback,
  }
}

/**
 * 注册菜单关闭时的监听器
 *
 * Register a listener when the menu is closed
 *
 * @param callback 回调函数 / Callback function
 * @param once 是否只执行一次 / Whether to execute only once
 */
function registerOnCloseListener(callback: (menuEle: HTMLElement) => Promise<void>, once?: boolean) {
  const contextMenuEle = contextmenuRef.value as HTMLElement
  EVENTS.close[contextMenuEle.id] = {
    callback,
    once: once ?? false,
  }
}

defineExpose({
  /**
   * 显示上下文菜单
   *
   * Show context menu
   */
  show: showContextMenu,
  /**
   * 关闭当前上下文菜单
   *
   * Close the current context menu
   */
  close: closeCurrentContextMenu,
  /**
   * 注册菜单初始化时的监听器，必须在显示前注册
   *
   * Register a listener when the menu is initialized, must be registered before `show`
   */
  onInit: registerOnInitListener,
  /**
   * 注册菜单关闭时的监听器
   */
  onClose: registerOnCloseListener,
  /**
   * 菜单DOM
   *
   * menu DOM
   */
  menuDom: contextmenuRef,
})

// eslint-disable-next-line ts/no-use-before-define
provide(FUN_CLOSE_CONTEXT_MENU_TYPE, closeCurrentContextMenu)
</script>

<script lang="ts">
export const FUN_CLOSE_CONTEXT_MENU_TYPE = Symbol('FUN_CLOSE_CONTEXT_MENU_TYPE') as InjectionKey<() => void>
</script>

<template>
  <div
    v-show="isInit"
    :id="'iw-contextmenu-' + `${contextmenuMathRandom}`"
    ref="contextmenuRef"
    class="iw-contextmenu overflow-auto flex flex-col items-start fixed z-[3100] bg-base-100 p-1 rounded-md border border-base-300"
    :style="{'maxHeight': '600px'}"
  >
    <!-- 仅在初始化后渲染插槽信息 -->
    <!-- Only render slot information after initialization -->
    <slot v-if="isInit" />
  </div>
</template>

<style lang="css">
.iw-contextmenu {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}
</style>
