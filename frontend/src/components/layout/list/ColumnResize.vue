<script setup lang="ts">
import { inject, onMounted } from 'vue';
import type { CachedColumnConf } from '../../conf';
import { FUN_MODIFY_COLUMN_TYPE } from '../../events';

const props = defineProps<{
  columnsConf: CachedColumnConf[]
}>()
const modifyColumnFun = inject(FUN_MODIFY_COLUMN_TYPE)!

let currColumnName = ''
let currCellRect: DOMRect
let isDragging = false

onMounted(() => {
  const listHeaderEle = document.getElementsByClassName('iw-list-header')[0] as HTMLElement
  const dragDiv = document.createElement('div')
  dragDiv.style.position = 'fixed'
  dragDiv.style.display = 'none'
  dragDiv.style.zIndex = '1000'
  dragDiv.style.width = '24px'
  dragDiv.style.padding = '2px 10px'
  dragDiv.style.cursor = 'ew-resize'
  const subDragDiv = document.createElement('div')
  subDragDiv.style.flex = '1'
  subDragDiv.classList.add('bg-base-300')
  dragDiv.appendChild(subDragDiv)
  listHeaderEle.appendChild(dragDiv)

  dragDiv.addEventListener('pointerdown', (event: PointerEvent) => {
    isDragging = true
    const targetEle = event.target as HTMLElement
    targetEle.setPointerCapture(event.pointerId)
  })

  dragDiv.addEventListener('pointerup', async (event: PointerEvent) => {
    isDragging = false
    dragDiv.style.display = 'none'
    const targetEle = event.target as HTMLElement
    targetEle.releasePointerCapture(event.pointerId)

    const curColumnConf = props.columnsConf.find(item => item.name === currColumnName)
    if (curColumnConf) {
      await modifyColumnFun(undefined, {
        name: curColumnConf.name,
        wrap: curColumnConf.wrap,
        fixed: curColumnConf.fixed,
        width: curColumnConf.width,
        hide: curColumnConf.hide,
        dateStart: curColumnConf.dateStart,
        dateEnd: curColumnConf.dateEnd,
      })
    }
  })

  dragDiv.addEventListener('pointermove', (event) => {
    if (!isDragging)
      return

    dragDiv.style.left = `${(event as MouseEvent).clientX - 12}px`
    const newWidth = (event as MouseEvent).clientX - currCellRect.left
    const columnConf = props.columnsConf.find(col => col.name === currColumnName)
    if (columnConf)
      columnConf.width = newWidth
  })

  listHeaderEle.addEventListener('pointermove', (event) => {
    const targetEle = event.target as HTMLElement
    if (!targetEle.classList.contains('iw-list-header-cell'))
      return

    isDragging = false
    dragDiv.style.display = 'none'
    const targetEleRect = targetEle.getBoundingClientRect()
    if (targetEleRect.right - (event as MouseEvent).clientX < 5) {
      dragDiv.style.display = 'flex'
      dragDiv.style.height = `${targetEleRect.height + 6}px`
      dragDiv.style.left = `${targetEleRect.right - 12}px`
      dragDiv.style.top = `${targetEleRect.top - 4}px`
      currColumnName = targetEle.dataset.columnName ?? ''
      currCellRect = targetEleRect
    }
  })
})
</script>

<template>
  <div />
</template>
