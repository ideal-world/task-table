<script setup lang="ts">
import type { InjectionKey } from 'vue';
import { onMounted, provide, ref } from 'vue';
import { IwUtils } from '../../utils';

const contextmenuRef = ref<HTMLElement | null>(null)

function showContextMenu(attachObj: HTMLElement | MouseEvent, offset: MenuOffsetKind = MenuOffsetKind.LEFT_BOTTOM, size: MenuSizeKind = MenuSizeKind.MEDIUM, force: boolean = false) {
  if (!force && attachObj instanceof HTMLElement && IwUtils.hasParentWithClass(attachObj, 'iw-contextmenu')) {
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
  }
  else {
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
    case MenuOffsetKind.LEFT_TOP: {
      break
    }
    case MenuOffsetKind.MEDIUM_TOP: {
      left = left + attachObjWidth - minWidth / 2
      break
    }
    case MenuOffsetKind.RIGHT_TOP: {
      left = left + attachObjWidth - minWidth
      break
    }
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
  contextMenuEle.style.minHeight = `${minHeight}px`
  contextMenuEle.style.minWidth = `${minWidth}px`
  contextMenuEle.style.left = `${left}px`
  contextMenuEle.style.top = `${top}px`
  contextMenuEle.querySelectorAll('.iw-contextmenu__item').forEach((node) => {
    const nodeEle = node as HTMLElement
    nodeEle.style.padding = `${padding}px`
  })
  contextMenuEle.style.display = `block`
  if (attachObj instanceof HTMLElement || attachObj.target instanceof HTMLElement) {
    const parentMenuEle = IwUtils.getParentWithClass(attachObj instanceof HTMLElement ? attachObj as HTMLElement : attachObj.target as HTMLElement, 'iw-contextmenu')
    if (parentMenuEle)
      contextMenuEle.dataset.level = `${Number.parseInt(parentMenuEle.dataset.level!) + 1}`
    else
      contextMenuEle.dataset.level = '0'
  }
  else {
    contextMenuEle.dataset.level = '0'
  }
}

function hideUnActiveContextMenus(event: MouseEvent) {
  const contextmenuEles = Array.from(document.querySelectorAll('.iw-contextmenu'))
    .filter(ele => ele instanceof HTMLElement && (ele as HTMLElement).style.display !== 'none')
    .sort((a, b) => Number.parseInt((b as HTMLElement).dataset.level!) - Number.parseInt((a as HTMLElement).dataset.level!))
  for (const i in contextmenuEles) {
    const contextMenuEle = contextmenuEles[i] as HTMLElement
    const contextMenuRect = contextMenuEle.getBoundingClientRect()
    if (
      event.x < contextMenuRect.left
      || event.y < contextMenuRect.top
      || event.x > contextMenuRect.left + contextMenuRect.width
      || event.y > contextMenuRect.top + contextMenuRect.height
    ) {
      if (i === '0' || (contextmenuEles[Number(i) - 1] as HTMLElement).style.display === 'none')
        contextMenuEle.style.display = `none`
    }
  }
}

function hideCurrentContextMenu() {
  const contextMenuEle = contextmenuRef.value as HTMLElement
  contextMenuEle.style.display = `none`
}

onMounted(() => {
  document.addEventListener('pointerdown', (event: MouseEvent) => {
    if (event.target == null)
      return
    hideUnActiveContextMenus(event)
  })
  window.addEventListener('scroll', () => {
    const contextmenuEles = document.querySelectorAll('.iw-contextmenu')
    for (const i in contextmenuEles) {
      if (!(contextmenuEles[i] instanceof HTMLElement) || (contextmenuEles[i] as HTMLElement).style.display === 'none')
        continue
      const contextMenuEle = contextmenuEles[i] as HTMLElement
      contextMenuEle.style.display = `none`
    }
  })
})

defineExpose({
  show: showContextMenu,
  close: hideCurrentContextMenu,
})

// eslint-disable-next-line ts/no-use-before-define
provide(FUN_CLOSE_CONTEXT_MENU_TYPE, hideCurrentContextMenu)
</script>

<script lang="ts">
export enum MenuOffsetKind {
  LEFT_TOP,
  MEDIUM_TOP,
  RIGHT_TOP,
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

export const FUN_CLOSE_CONTEXT_MENU_TYPE = Symbol('FUN_CLOSE_CONTEXT_MENU_TYPE') as InjectionKey<() => void>
</script>

<template>
  <div
    ref="contextmenuRef" class="iw-contextmenu flex flex-col items-start fixed z-[3000] bg-base-100 p-1 rounded-md border border-base-300"
    style="display: none;"
  >
    <slot />
  </div>
</template>

<style lang="css">
.iw-contextmenu {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}
</style>
