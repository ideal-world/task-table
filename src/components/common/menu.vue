<script setup lang="ts">
import { provide, ref } from 'vue'
import { FN_CLOSE_CONTEXT_MENU } from '../../constant'

const contextmenu = ref<HTMLElement | null>(null)
const isShow = ref<boolean>(false)

function showContextMenu(attachObj: HTMLElement | MouseEvent) {
  if (attachObj instanceof HTMLElement && attachObj.classList.contains('iw-contextmenu__item')) {
    // Prevent accidental triggering from items
    return
  }
  const contextMenuEle = contextmenu.value as HTMLElement
  contextMenuEle.classList.add('iw-contextmenu')
  if (attachObj instanceof HTMLElement) {
    const targetOffset = attachObj.getBoundingClientRect()
    contextMenuEle.style.left = targetOffset.left + 'px'
    contextMenuEle.style.top = targetOffset.top + targetOffset.height + 5 + 'px'
  } else {
    contextMenuEle.style.left = attachObj.x + 'px'
    contextMenuEle.style.top = attachObj.y + 'px'
  }
  isShow.value = true
  document.addEventListener('pointerdown', (event: MouseEvent) => {
    if (event.target == null) {
      isShow.value = false
    } else {
      const contextMenuRect = contextMenuEle.getBoundingClientRect()
      if (
        event.x < contextMenuRect.left ||
        event.y < contextMenuRect.top ||
        event.x > contextMenuRect.left + contextMenuRect.width ||
        event.y > contextMenuRect.top + contextMenuRect.height
      ) {
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

provide(FN_CLOSE_CONTEXT_MENU, hideContextMenu)
</script>

<template>
  <div ref="contextmenu" className="iw-contextmenu" v-show="isShow">
    <slot :close="close"></slot>
  </div>
</template>

<style lang="scss">
@import '../../assets/main.scss';

@include b('contextmenu') {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: fixed;
  min-width: 180px;
  min-height: 80px;
  z-index: 3000;
  border-radius: 3px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  box-shadow: 0 0 5px var(--el-border-color);

  @include e('item') {
    display: flex;
    align-items: center;
    padding: 6px;
    margin: 0;
    cursor: pointer;

    & svg {
      width: 1em;
      height: 1em;
      margin-right: 3px;
    }
  }
}
</style>
