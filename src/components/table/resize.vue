<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { TableColumnConf } from './conf'

const props = defineProps<{
  columnsConf: TableColumnConf[]
}>()

let currColumnName = ''
let currCellRect: DOMRect
let isDragging = false

onMounted(() => {
  const tableHeaderEle = document.getElementsByClassName('iw-table-header')[0] as HTMLElement
  const dragDiv = document.createElement('div')
  dragDiv.style.position = 'fixed'
  dragDiv.style.display = 'none'
  dragDiv.style.zIndex = '1000'
  dragDiv.style.width = '24px'
  dragDiv.style.padding = '2px 10px'
  dragDiv.style.cursor = 'ew-resize'
  const subDragDiv = document.createElement('div')
  subDragDiv.style.flex = '1'
  subDragDiv.style.backgroundColor = 'var(--el-color-primary-light-3)'
  dragDiv.appendChild(subDragDiv)
  tableHeaderEle.appendChild(dragDiv)

  dragDiv.addEventListener('mousedown', () => {
    isDragging = true
  })

  dragDiv.addEventListener('mouseup', () => {
    isDragging = false
    dragDiv.style.display = 'none'
  })

  dragDiv.addEventListener('mousemove', (event) => {
    if (!isDragging) {
      return
    }
    dragDiv.style.left = (event as MouseEvent).clientX - 12 + 'px'
    const newWidth = (event as MouseEvent).clientX - currCellRect.left
    let columnConf = props.columnsConf.find((col) => col.name == currColumnName)
    if (columnConf) {
      columnConf.width = newWidth
    }
  })

  tableHeaderEle.addEventListener('mousemove', (event) => {
    const targetEle = event.target as HTMLElement
    if (!targetEle.classList.contains('iw-table-header-cell')) {
      return
    }
    isDragging = false
    dragDiv.style.display = 'none'
    const targetEleRect = targetEle.getBoundingClientRect()
    if (targetEleRect.right - (event as MouseEvent).clientX < 5) {
      dragDiv.style.display = 'flex'
      dragDiv.style.height = targetEleRect.height + 6 + 'px'
      dragDiv.style.left = targetEleRect.right - 12 + 'px'
      dragDiv.style.top = targetEleRect.top - 4 + 'px'
      currColumnName = targetEle.dataset.columnName || ''
      currCellRect = targetEleRect
    }
  })
})
</script>

<template></template>


