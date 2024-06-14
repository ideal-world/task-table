<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps<{
  resizeItemClass: string
  resizeItemId?: string
  resizeContainerClass?: string
  handleLeft?: boolean
  setSize: (width: number, itemId?: string) => Promise<void>
}>()

const columnResizeRef = ref<InstanceType<typeof HTMLElement>>()

let currItemEle: HTMLElement
let isDragging = false

onMounted(() => {
  const resizeEle = columnResizeRef.value!.closest(`.${props.resizeContainerClass ?? props.resizeItemClass}`) as HTMLElement
  const dragDiv = document.createElement('div')
  dragDiv.style.position = 'fixed'
  dragDiv.style.display = 'none'
  dragDiv.style.zIndex = '1600'
  dragDiv.style.width = '24px'
  dragDiv.style.padding = '2px 10px'
  dragDiv.style.cursor = 'ew-resize'
  const subDragDiv = document.createElement('div')
  subDragDiv.style.flex = '1'
  subDragDiv.classList.add('bg-info')
  dragDiv.appendChild(subDragDiv)
  resizeEle.appendChild(dragDiv)

  dragDiv.addEventListener('pointerdown', (e: PointerEvent) => {
    isDragging = true
    dragDiv.setPointerCapture(e.pointerId)
  })

  dragDiv.addEventListener('pointerup', async (e: PointerEvent) => {
    isDragging = false
    dragDiv.style.display = 'none'
    dragDiv.releasePointerCapture(e.pointerId)
    const newWidth = props.handleLeft
      ? currItemEle.offsetWidth - (e.clientX - currItemEle.getBoundingClientRect().left)
      : e.clientX - currItemEle.getBoundingClientRect().left
    const currResizeItemId = props.resizeItemId ? currItemEle.dataset[props.resizeItemId] : undefined
    await props.setSize(newWidth, currResizeItemId)
  })

  dragDiv.addEventListener('pointermove', (e) => {
    if (!isDragging)
      return
    dragDiv.style.left = `${e.clientX - 12}px`
  })

  resizeEle.addEventListener('pointermove', (e) => {
    if (isDragging)
      return

    const targetEle = (e.target as HTMLElement).closest(`.${props.resizeItemClass}`)
    if (!targetEle || !(targetEle instanceof HTMLElement)) {
      return
    }

    isDragging = false
    dragDiv.style.display = 'none'
    const targetEleRect = targetEle.getBoundingClientRect()
    if (!props.handleLeft && targetEleRect.right - e.clientX < 5
      || props.handleLeft && e.clientX - targetEleRect.left < 5
    ) {
      dragDiv.style.display = 'flex'
      dragDiv.style.height = `${targetEleRect.height + 6}px`
      dragDiv.style.top = `${targetEleRect.top - 4}px`
      dragDiv.style.left = !props.handleLeft ? `${targetEleRect.right - 12}px` : `${targetEleRect.left - 12}px`
      currItemEle = targetEle
    }
  })
})
</script>

<template>
  <div ref="columnResizeRef" />
</template>
