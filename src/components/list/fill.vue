<script setup lang="ts">
import { onMounted, inject } from 'vue'
import { ListColumnConf } from './conf'
import { FN_UPDATE_DATA } from '../../constant'

const props = defineProps<{
  columnsConf: ListColumnConf[]
  data: { [key: string]: any }[]
  pkColumnName: string
}>()

let updateDataFun = inject(FN_UPDATE_DATA)

let startColumnName = ''
let startRowIdx = 0
let movedRowIdx = 0
let startCellFixedX = 0
let startCellEle: HTMLElement
let isDragging = false

onMounted(() => {
  const listEle = document.getElementsByClassName('iw-list')[0] as HTMLElement
  const selectDiv = document.createElement('div')
  selectDiv.style.position = 'absolute'
  selectDiv.style.display = 'none'
  selectDiv.style.zIndex = '1000'
  selectDiv.style.border = '2px solid var(--el-color-primary-light-3)'
  const dragDiv = document.createElement('div')
  dragDiv.style.position = 'absolute'
  dragDiv.style.display = 'flex'
  dragDiv.style.width = '28px'
  dragDiv.style.height = '28px'
  dragDiv.style.padding = '10px'
  dragDiv.style.right = '-15px'
  dragDiv.style.bottom = '-15px'
  dragDiv.style.cursor = 'crosshair'
  const subDragDiv = document.createElement('div')
  subDragDiv.style.flex = '1'
  subDragDiv.style.border = '2px solid #FFF'
  subDragDiv.style.backgroundColor = 'var(--el-color-primary-light-3)'
  dragDiv.appendChild(subDragDiv)
  selectDiv.appendChild(dragDiv)
  listEle.appendChild(selectDiv)

  dragDiv.addEventListener('pointerdown', () => {
    isDragging = true
  })

  selectDiv.addEventListener('pointerup', () => {
    if (!isDragging) {
      return
    }
    isDragging = false
    selectDiv.style.display = 'none'
    let targetData = props.data[startRowIdx][startColumnName]
    let changedData = []
    if (startRowIdx == movedRowIdx) {
      return
    } else if (startRowIdx < movedRowIdx) {
      changedData = props.data.slice(startRowIdx + 1, movedRowIdx + 1).map((item) => {
        return {
          [props.pkColumnName]: item[props.pkColumnName],
          [startColumnName]: targetData,
        }
      })
    } else {
      changedData = props.data.slice(movedRowIdx, startRowIdx).map((item) => {
        return {
          [props.pkColumnName]: item[props.pkColumnName],
          [startColumnName]: targetData,
        }
      })
    }
    // @ts-ignore
    updateDataFun(changedData)
  })

  // 不用dragDiv为解决向上拖拽的问题
  selectDiv.addEventListener('pointermove', (event) => {
    if (!isDragging) {
      return
    }
    const movedEleOpt = document.elementsFromPoint(startCellFixedX + 4, (event as MouseEvent).clientY).find((ele) => ele.classList.contains('iw-list-row-cell'))
    if (!movedEleOpt) {
      return
    }
    let movedEle = movedEleOpt as HTMLElement
    movedRowIdx = parseInt(movedEle.dataset.rowIdx ?? '0')
    if (startRowIdx <= movedRowIdx) {
      selectDiv.style.top = startCellEle.offsetTop - 1 + 'px'
      selectDiv.style.height = movedEle.offsetTop + movedEle.offsetHeight - startCellEle.offsetTop + 'px'
    } else {
      selectDiv.style.top = movedEle.offsetTop - 1 + 'px'
      selectDiv.style.height = startCellEle.offsetTop + startCellEle.offsetHeight - movedEle.offsetTop + 'px'
    }
  })

  document.addEventListener('click', (event) => {
    isDragging = false
    selectDiv.style.display = 'none'
    const targetEle = event.target as HTMLElement
    if (!targetEle.classList.contains('iw-list-row-cell')) {
      return
    }
    const currColumnName = targetEle.dataset.columnName ?? ''
    if (props.columnsConf.find((item) => item.name == currColumnName)?.fillable == false) {
      return
    }
    selectDiv.style.display = 'flex'
    selectDiv.style.left = targetEle.offsetLeft - 1 + 'px'
    selectDiv.style.top = targetEle.offsetTop - 1 + 'px'
    selectDiv.style.width = targetEle.offsetWidth + 2 + 'px'
    selectDiv.style.height = targetEle.offsetHeight + 2 + 'px'
    startColumnName = currColumnName
    startRowIdx = parseInt(targetEle.dataset.rowIdx ?? '0')
    startCellEle = targetEle
    startCellFixedX = targetEle.getBoundingClientRect().left
  })
})
</script>

<script lang="ts"></script>

<template></template>
