<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as iconSvg from '../../assets/icon'

const scrollableRef = ref<HTMLElement | null>(null)
const scrollableMainRef = ref<HTMLElement | null>(null)
const scrollableContentRef = ref<HTMLElement | null>(null)
const controllerButtonRef = ref<HTMLElement | null>(null)
const showLeftButton = ref<boolean>(false)
const showRightButton = ref<boolean>(false)

onMounted(() => {
  const scrollableEle = scrollableRef.value!
  const mainEle = scrollableMainRef.value!
  mainEle.style.width = `${scrollableEle.offsetWidth - controllerButtonRef.value!.offsetWidth * 2}px`
  const contentEle = scrollableContentRef.value!
  const observer = new ResizeObserver((_) => {
    if (scrollableEle.offsetWidth === 0) {
      // 当前元素不可见，直接返回
      // Current element is not visible, return directly
      return
    }
    if (mainEle.offsetWidth === 0) {
      // 从不可见变为可见时，重新设置宽度
      // When it changes from invisible to visible, reset the width
      mainEle.style.width = `${scrollableEle.offsetWidth - controllerButtonRef.value!.offsetWidth * 2}px`
    }
    if (mainEle.offsetWidth <= contentEle.offsetWidth) {
      showLeftButton.value = true
      showRightButton.value = true
    }
    else {
      showLeftButton.value = false
      showRightButton.value = false
    }
  })
  observer.observe(contentEle)
})

function offsetLeft() {
  const mainEle = scrollableMainRef.value!
  mainEle.scrollLeft = Math.max(mainEle.scrollLeft - 200, 0)
}

function offsetRight() {
  const mainEle = scrollableMainRef.value!
  mainEle.scrollLeft = Math.min(mainEle.scrollLeft + 200, mainEle.offsetWidth)
}
</script>

<template>
  <div
    ref="scrollableRef"
    class="iw-scrollable flex justify-between items-center overflow-hidden"
  >
    <button v-show="showLeftButton" class="iw-btn iw-btn-ghost pl-1 pr-1 ml-1 iw-btn-xs" @click="offsetLeft">
      <i :class="iconSvg.PREVIOUS" />
    </button>
    <div ref="scrollableMainRef" class="flex overflow-hidden">
      <div ref="scrollableContentRef" class="text-nowrap">
        <slot />
      </div>
    </div>
    <button ref="controllerButtonRef" :style="{ visibility: showRightButton ? 'visible' : 'hidden' }" class="iw-btn iw-btn-ghost pl-1 pr-1 ml-1 iw-btn-xs" @click="offsetRight">
      <i :class="iconSvg.NEXT" />
    </button>
  </div>
</template>
