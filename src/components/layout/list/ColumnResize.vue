<script setup lang="ts">
import { onMounted } from 'vue'
import type { CachedColumnConf } from '../../conf'
import * as eb from '../../eventbus'
import type { TableLayoutModifyProps } from '../../../props'

const props = defineProps<{
  columnsConf: CachedColumnConf[]
}>()

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

  dragDiv.addEventListener('pointerup', async (e: PointerEvent) => {
    isDragging = false
    dragDiv.style.display = 'none'
    const targetEle = e.target as HTMLElement
    targetEle.releasePointerCapture(e.pointerId)

    const curColumnConf = props.columnsConf.find(item => item.name === currColumnName)
    if (curColumnConf) {
      const changedLayoutReq: TableLayoutModifyProps = {
        changedColumn: {
          name: curColumnConf.name,
          wrap: curColumnConf.wrap,
          fixed: curColumnConf.fixed,
          width: curColumnConf.width,
          hide: curColumnConf.hide,
          dateStart: curColumnConf.dateStart,
          dateEnd: curColumnConf.dateEnd,
          render: curColumnConf.render,
        },
      }
      await eb.modifyLayout(changedLayoutReq)
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
