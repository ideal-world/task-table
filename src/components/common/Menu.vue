<script setup lang="ts">
import { InjectionKey, provide, ref } from 'vue';
import { IwUtils } from '../../utils';

const contextmenuRef = ref<HTMLElement | null>(null)
const isShow = ref<boolean>(false)

function showContextMenu(attachObj: HTMLElement | MouseEvent, offset: MenuOffsetKind = MenuOffsetKind.LEFT_BOTTOM, size: MenuSizeKind = MenuSizeKind.MEDIUM) {
  if (attachObj instanceof HTMLElement && IwUtils.hasParentWithClass(attachObj, 'iw-contextmenu__item')) {
    // Prevent accidental triggering from items
    return
  }
  let left
  let top
  let attachObjHeight
  let attachObjWidth
  let minHeight
  let minWidth
  let padding = 0
  if (attachObj instanceof HTMLElement) {
    const targetOffset = attachObj.getBoundingClientRect()
    left = targetOffset.left
    top = targetOffset.top
    attachObjHeight = targetOffset.height + 5
    attachObjWidth = targetOffset.width
  } else {
    left = attachObj.x
    top = attachObj.y
    attachObjHeight = 0
    attachObjWidth = 0
  }
  switch (size) {
    case MenuSizeKind.MINI: {
      minHeight = 20
      minWidth = 40
      padding = 1
      break
    }
    case MenuSizeKind.SMALL: {
      minHeight = 40
      minWidth = 80
      padding = 2
      break
    }
    case MenuSizeKind.MEDIUM: {
      minHeight = 80
      minWidth = 160
      padding = 3
      break
    }
    case MenuSizeKind.LARGE: {
      minHeight = 100
      minWidth = 220
      padding = 4
      break
    }
  }
  switch (offset) {
    case MenuOffsetKind.LEFT_BOTTOM: {
      top = top + attachObjHeight
      break
    }
    case MenuOffsetKind.MEDIUM_BOTTOM: {
      left = left + attachObjWidth - minWidth / 2
      top = top + attachObjHeight
      break
    }
    case MenuOffsetKind.RIGHT_BOTTOM: {
      left = left + attachObjWidth - minWidth
      top = top + attachObjHeight
      break
    }
  }
  const contextMenuEle = contextmenuRef.value as HTMLElement
  contextMenuEle.style.minHeight = minHeight + 'px'
  contextMenuEle.style.minWidth = minWidth + 'px'
  contextMenuEle.style.left = left + 'px'
  contextMenuEle.style.top = top + 'px'
  contextMenuEle.querySelectorAll('.iw-contextmenu__item').forEach((node) => {
    const nodeEle = node as HTMLElement
    nodeEle.style.padding = padding + 'px'
  })

  isShow.value = true
  document.addEventListener('pointerdown', (event: MouseEvent) => {
    if (event.target == null) {
      isShow.value = false
    } else {
      let optInMenu = false
      let contextmenuEles = document.querySelectorAll('.iw-contextmenu')
      for (let i in contextmenuEles) {
        if (!(contextmenuEles[i] instanceof HTMLElement) || (contextmenuEles[i] as HTMLElement).style.display == 'none') {
          continue
        }
        const contextMenuRect = contextmenuEles[i].getBoundingClientRect()
        if (
          event.x >= contextMenuRect.left &&
          event.y >= contextMenuRect.top &&
          event.x <= contextMenuRect.left + contextMenuRect.width &&
          event.y <= contextMenuRect.top + contextMenuRect.height
        ) {
          optInMenu = true
          break
        }
      }
      if (!optInMenu) {
        isShow.value = false
      }
    }
  })
}

function hideContextMenu() {
  isShow.value = false
}

defineExpose({
  show: showContextMenu,
  close: hideContextMenu,
})

provide(FUN_CLOSE_CONTEXT_MENU_TYPE, hideContextMenu)
</script>

<script lang="ts">
export enum MenuOffsetKind {
  LEFT_BOTTOM,
  MEDIUM_BOTTOM,
  RIGHT_BOTTOM,
}

export enum MenuSizeKind {
  MINI,
  SMALL,
  MEDIUM,
  LARGE,
}

export const FUN_CLOSE_CONTEXT_MENU_TYPE = Symbol() as InjectionKey<() => void>
</script>

<template>
  <div ref="contextmenuRef"
    class="iw-contextmenu flex flex-col items-start fixed z-[3000] shadow bg-base-100 p-1 rounded-md" v-show="isShow">
    <slot></slot>
  </div>
</template>
