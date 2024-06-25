<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps<{
  // 可调整大小的元素类名。必须是 ``relative`` 定位
  // Class name of resizable element. Must be positioned ``relative``
  resizeItemClass: string
  // 可调整大小的元素ID属性名（比如列名）
  // Resizable element ID attribute name (such as column name)
  resizeItemIdProp?: string
  // 可调整大小的元素容器类名，当有多个元素需要调整大小时，用于标识共同的父元素。 必须是 ``relative`` 定位
  // Class name of resizable element container, used to identify the common parent element when multiple elements need to be resized. Must be positioned ``relative``
  resizeContainerClass?: string
  // 调整大小的手柄是否在左侧
  // Whether the resize handle is on the left
  handleLeft?: boolean
  // 设置元素调整后大小的方法
  // Method to set the size of the element after adjustment
  setSize: (width: number, itemId?: string) => Promise<void>
}>()

// 可调整大小的元素，当存在``resizeContainerClass``时对应于父元素，否则对应于自身
// Resizable element, corresponding to the parent element when ``resizeContainerClass`` exists, otherwise corresponding to itself
const columnResizeRef = ref<InstanceType<typeof HTMLElement>>()

// 当前正在调整大小的元素
// Element currently being resized
let currItemEle: HTMLElement
// 是否正在拖动
// Whether it is being dragged
let isDragging = false

/**
 * 准备调整大小，显示拖动手柄
 *
 * Prepare to resize, display the drag handle
 *
 * @param dragEle 拖动手柄元素 / Drag handle element
 * @param targetEle 当前正在调整大小的元素 / Element currently being resized
 * @param e 事件 / Event
 */
function prepareResize(dragEle: HTMLElement, targetEle: HTMLElement, e: PointerEvent) {
  dragEle.style.display = 'flex'
  dragEle.style.height = `${targetEle.offsetHeight - 4}px`
  const left = !props.handleLeft ? targetEle.offsetLeft + targetEle.offsetWidth - 12 : targetEle.offsetLeft - 12
  dragEle.style.left = `${left}px`
  // 记录鼠标位置和元素位置
  // Record mouse position and element position
  dragEle.dataset.clientX = `${e.clientX}`
  dragEle.dataset.offsetLeft = `${left}`
  currItemEle = targetEle
}

/**
 * 开始调整大小
 *
 * Start resizing
 *
 * @param dragEle 拖动手柄元素 / Drag handle element
 * @param e 事件 / Event
 */
function startResize(dragEle: HTMLElement, e: PointerEvent) {
  isDragging = true
  dragEle.setPointerCapture(e.pointerId)
}

/**
 * 更新调整大小
 *
 * Update resizing
 *
 * @param dragEle 拖动手柄元素 / Drag handle element
 * @param e 事件 / Event
 */
function updateResize(dragEle: HTMLElement, e: PointerEvent) {
  if (!isDragging) {
    return
  }
  dragEle.style.left = `${Number.parseFloat(dragEle.dataset.offsetLeft!) + (e.clientX - Number.parseFloat(dragEle.dataset.clientX!))}px`
}

/**
 * 停止调整大小
 *
 * Stop resizing
 *
 * @param dragEle 拖动手柄元素 / Drag handle element
 * @param e 事件 / Event
 * @param saveResize 是否保存调整大小 / Whether to save the resize
 */
async function stopResize(dragEle: HTMLElement, e: PointerEvent, saveResize: boolean) {
  isDragging = false
  dragEle.style.display = 'none'
  dragEle.releasePointerCapture(e.pointerId)
  // 获取新的宽度
  // Get the new width
  const newWidth = props.handleLeft
    ? currItemEle.offsetWidth - (e.clientX - currItemEle.getBoundingClientRect().left)
    : e.clientX - currItemEle.getBoundingClientRect().left
  const currResizeItemId = props.resizeItemIdProp ? currItemEle.dataset[props.resizeItemIdProp] : undefined
  // 保存调整大小
  // Save resize
  saveResize && await props.setSize(newWidth, currResizeItemId)
}

onMounted(() => {
  // 在可调整大小的元素上添加拖动手柄
  // Add a drag handle to the resizable element
  const resizeEle = columnResizeRef.value!.closest(`.${props.resizeContainerClass ?? props.resizeItemClass}`) as HTMLElement
  const dragEle = document.createElement('div')
  dragEle.style.position = 'absolute'
  dragEle.style.top = '2px'
  dragEle.style.display = 'none'
  dragEle.style.zIndex = '1600'
  dragEle.style.width = '24px'
  dragEle.style.padding = '2px 10px'
  dragEle.style.cursor = 'ew-resize'
  const subDragEle = document.createElement('div')
  subDragEle.style.flex = '1'
  subDragEle.classList.add('bg-info')
  dragEle.appendChild(subDragEle)
  resizeEle.appendChild(dragEle)

  // 鼠标移动到元素边缘时显示拖动手柄
  // Display the drag handle when the mouse moves to the edge of the element
  resizeEle.addEventListener('pointermove', (e) => {
    if (isDragging)
      return

    const targetEle = (e.target as HTMLElement).closest(`.${props.resizeItemClass}`)
    if (!targetEle || !(targetEle instanceof HTMLElement)) {
      return
    }

    isDragging = false
    dragEle.style.display = 'none'
    const targetEleRect = targetEle.getBoundingClientRect()
    // 边界计算
    // Boundary calculation
    if (!props.handleLeft && targetEleRect.right - e.clientX < 5
      || props.handleLeft && e.clientX - targetEleRect.left < 5
    ) {
      prepareResize(dragEle, targetEle, e)
    }
  })

  // 鼠标按下时开始调整大小
  // Start resizing when the mouse is pressed
  dragEle.addEventListener('pointerdown', (e: PointerEvent) => {
    startResize(dragEle, e)
  })

  // 鼠标移动时更新调整大小
  // Update resizing when the mouse moves
  dragEle.addEventListener('pointermove', (e) => {
    updateResize(dragEle, e)
  })

  // 鼠标松开时停止调整大小
  // Stop resizing when the mouse is released
  dragEle.addEventListener('pointerup', async (e: PointerEvent) => {
    stopResize(dragEle, e, true)
  })

  // 鼠标移出时停止调整大小
  // Stop resizing when the mouse leaves
  dragEle.addEventListener('pointerleave', (e) => {
    stopResize(dragEle, e, false)
  })
})
</script>

<template>
  <div ref="columnResizeRef" />
</template>
