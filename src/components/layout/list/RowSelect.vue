<script  lang="ts">
</script>
<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getChildIndex, getParentWithClass } from '../../../utils/basic';
import { AlertKind, showAlert } from '../../common/Alert.vue';
const { t } = useI18n()

const props = defineProps<{
  selectedPks: string[] | number[],
  pkColumnName: string
  pkKindIsNumber: boolean
}>()

let startRowIdx = 0
let movedRowIdx = 0
let startCellFixedX = 0
let listEle: HTMLElement | undefined

onMounted(() => {
  document.querySelectorAll('.iw-list').forEach(listEle => {
    listEle.addEventListener('pointerdown', onSelectDragging as EventListener)
    listEle.addEventListener('pointermove', onRowSelectMove as EventListener)
    listEle.addEventListener('pointerup', onRowSelectDraped as EventListener)
  })
})

function onSelectDragging(event: PointerEvent) {
  // Disable right-click to avoid right-click menu and selection conflicts
  if (event.button == 2) {
    return
  }
  const targetEle = event.target
  if (!(targetEle instanceof HTMLElement)) {
    return
  }
  const parentListEle = getParentWithClass(targetEle, 'iw-list')
  if (parentListEle == null) {
    return
  }
  if (!targetEle.classList.contains('iw-list-data-cell')) {
    return
  }
  cleanSelects(parentListEle)
  if (getParentWithClass(targetEle, 'iw-list-cell')?.dataset.columnName != props.pkColumnName) {
    return
  }
  const selectRowEle = getParentWithClass(targetEle, 'iw-list-data-row')
  if (selectRowEle == null) {
    return
  }
  startRowIdx = getChildIndex(parentListEle, selectRowEle)
  startCellFixedX = targetEle.getBoundingClientRect().left
  listEle = parentListEle
  addSelect(selectRowEle)
}

function onRowSelectDraped(event: PointerEvent) {
  startCellFixedX = 0
  listEle = undefined
  startRowIdx = 0
  movedRowIdx = 0
}

function onRowSelectMove(event: PointerEvent) {
  event.preventDefault()
  if (!listEle) {
    return
  }
  const movedEleOpt = document.elementsFromPoint(startCellFixedX + 4, (event as MouseEvent).clientY).find((ele) => ele.classList.contains('iw-list-data-cell'))
  if (!movedEleOpt) {
    showAlert(t("list.rowSelect.acrossGroupError"), 2, AlertKind.WARNING, getParentWithClass(listEle, 'iw-tt')!)
    cleanSelects(listEle)
    startCellFixedX = 0
    listEle = undefined
    startRowIdx = 0
    movedRowIdx = 0
    return
  }
  const movedEle = movedEleOpt as HTMLElement
  const parentListEle = getParentWithClass(movedEle, 'iw-list')
  if (parentListEle == null) {
    return
  }
  const selectRowEle = getParentWithClass(movedEle, 'iw-list-data-row')
  if (selectRowEle == null) {
    return
  }
  movedRowIdx = getChildIndex(parentListEle, selectRowEle)
  if (startRowIdx == movedRowIdx) {
    return
  }
  cleanSelects(parentListEle)
  if (startRowIdx < movedRowIdx) {
    for (let i = startRowIdx; i <= movedRowIdx; i++) {
      addSelect(parentListEle.children[i] as HTMLElement)
    }
  } else {
    for (let i = movedRowIdx; i <= startRowIdx; i++) {
      addSelect(parentListEle.children[i] as HTMLElement)
    }
  }
}

function cleanSelects(listEle: HTMLElement) {
  props.selectedPks.splice(0, props.selectedPks.length)
  listEle.querySelectorAll('.iw-list-data-row--selected').forEach(cellEle => {
    cellEle.classList.remove('iw-list-data-row--selected')
    cellEle.classList.add('iw-list-data-row--unselected')
  })
}

function addSelect(selectedRowEle: HTMLElement) {
  if (props.pkKindIsNumber) {
    // @ts-ignore
    props.selectedPks.push(parseInt(selectedRowEle.dataset.pk as string))
  } else {
    // @ts-ignore
    props.selectedPks.push(selectedRowEle.dataset.pk as string)
  }
  Array.prototype.forEach.call(selectedRowEle.children, function (cellEle) {
    cellEle.classList.remove('iw-list-data-row--unselected')
    cellEle.classList.add('iw-list-data-row--selected')
  })
}

</script>

<template></template>

<style lang="css">
.iw-list-data-row--selected {
  @apply bg-base-200;
}
</style>

