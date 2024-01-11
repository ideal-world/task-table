<script setup lang="ts">
import { onMounted } from 'vue'
import { getParentWithClass } from '../../../utils/basic'
import type { CachedColumnConf } from '../../conf'
import { DataKind } from '../../props'

const props = defineProps<{
  columnsConf: CachedColumnConf[]
  pkColumnName: string
  wrap: {
    cellSelectedInfo: CellSelectedInfo | undefined
  }
}>()

const pkKindIsNumber = props.columnsConf.find(col => col.name === props.pkColumnName)?.dataKind === DataKind.NUMBER

onMounted(() => {
  document.querySelectorAll('.iw-list').forEach((listEle) => {
    listEle.addEventListener('click', onClick as EventListener)
  })
  document.addEventListener('keydown', onKeyDown as EventListener)
})

function onClick(event: MouseEvent) {
  if (!(event.target instanceof HTMLElement))
    return
  if (event.target.classList.contains('iw-list-fill--select'))
    return

  setSelected(event.target)
}

function onKeyDown(event: KeyboardEvent) {
  if (props.wrap.cellSelectedInfo === undefined)
    return
  if (!(event.target instanceof HTMLElement))
    return

  let targetEle
  switch (event.key) {
    case 'ArrowLeft':
      targetEle = props.wrap.cellSelectedInfo.ele.previousElementSibling
      break
    case 'ArrowUp':{
      const rowEle = getParentWithClass(props.wrap.cellSelectedInfo.ele, 'iw-list-data-row')
      targetEle = rowEle?.previousElementSibling?.querySelector(`.iw-list-data-cell[data-column-name="${props.wrap.cellSelectedInfo.columnName}"]`)
      break
    }
    case 'ArrowRight':
      targetEle = props.wrap.cellSelectedInfo.ele.nextElementSibling
      break
    case 'ArrowDown':{
      const rowEle = getParentWithClass(props.wrap.cellSelectedInfo.ele, 'iw-list-data-row')
      targetEle = rowEle?.nextElementSibling?.querySelector(`.iw-list-data-cell[data-column-name="${props.wrap.cellSelectedInfo.columnName}"]`)
      break
    }
    default:
      return
  }
  if (targetEle !== undefined && targetEle as HTMLElement)
    setSelected(targetEle as HTMLElement)
  else
    props.wrap.cellSelectedInfo = undefined
}

function setSelected(targetEle: HTMLElement) {
  const cellEle = getParentWithClass(targetEle, 'iw-list-data-cell')
  if (!cellEle) {
    props.wrap.cellSelectedInfo = undefined
    return
  }
  const columnName = cellEle.dataset.columnName!
  if (props.columnsConf.find(item => item.name === columnName && (columnName === props.pkColumnName || !item.dataEditable))) {
    props.wrap.cellSelectedInfo = undefined
    return
  }

  const selectRowEle = getParentWithClass(cellEle, 'iw-list-data-row')
  const rowPkStr = selectRowEle!.dataset.pk!
  const rowPk = pkKindIsNumber ? Number.parseInt(rowPkStr) : rowPkStr
  props.wrap.cellSelectedInfo = {
    ele: cellEle,
    columnName,
    rowPk,
  }
}
</script>

<script  lang="ts">
export interface CellSelectedInfo {
  ele: HTMLElement
  columnName: string
  rowPk: any
}
</script>

<template>
  <div />
</template>
