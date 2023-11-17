<script  lang="ts">
let hasInit = false
</script>
<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getChildIndex, getParentWithClass } from '../../../utils/basic'
import { AlertKind, showAlert } from '../../common/Alert'
const { t } = useI18n()

const props = defineProps<{
  selectedPks: string[] | number[],
  pkColumnName: string
  pkKindIsNumber: boolean
}>()

let selectStartRowEle: HTMLElement | null

if (!hasInit) {
  document.addEventListener('pointerdown', onRowSelect as EventListener)
  document.addEventListener('mousedown', function (event: PointerEvent) {
    if (event.shiftKey) {
      event.preventDefault()
    }
  } as EventListener)
}
hasInit = true


onMounted(() => {
  selectStartRowEle = null

})

function onRowSelect(event: PointerEvent) {
  if (event.button != 0) {
    return
  }
  const targetEle = event.target
  if (!(targetEle instanceof HTMLElement) || targetEle instanceof HTMLElement && !targetEle.classList.contains('iw-list-data-cell')) {
    return
  }
  const parentListEle = getParentWithClass(targetEle, 'iw-list')
  if (parentListEle == null) {
    return
  }
  const selectCellEle = getParentWithClass(targetEle, 'iw-list-cell')
  if (selectCellEle == null) {
    return
  }
  if (selectCellEle.dataset.columnName != props.pkColumnName) {
    // clean all selected
    cleanSelect(parentListEle)
    return
  }
  const selectRowEle = getParentWithClass(targetEle, 'iw-list-data-row')
  if (selectRowEle == null) {
    return
  }

  if (event.shiftKey && selectStartRowEle != null) {
    const endIdx = getChildIndex(parentListEle, selectRowEle)
    if (endIdx == -1) {
      selectStartRowEle = null
      return
    }
    const startIdx = getChildIndex(parentListEle, selectStartRowEle)
    const selectedEles = []
    if (startIdx < endIdx) {
      for (let i = startIdx + 1; i <= endIdx; i++) {
        selectedEles.push(parentListEle.children[i] as HTMLElement)
      }
    } else {
      for (let i = startIdx - 1; i >= endIdx; i--) {
        selectedEles.push(parentListEle.children[i] as HTMLElement)
      }
    }
    if (selectedEles.find(ele => !ele.classList.contains('iw-list-data-row'))) {
      showAlert(t("list.rowSelect.acrossGroupError"), 2, AlertKind.WARNING)
      cleanSelect(parentListEle)
      return
    }
    selectedEles.forEach(ele => {
      addSelect(ele)
    })
  } else {
    cleanSelect(parentListEle)
    selectStartRowEle = selectRowEle
    addSelect(selectRowEle)
  }
}

function cleanSelect(parentEle: HTMLElement) {
  selectStartRowEle = null
  props.selectedPks.splice(0, props.selectedPks.length)
  Array.prototype.forEach.call(parentEle.children, function (rowEle) {
    if (rowEle as HTMLElement && rowEle.classList.contains('iw-list-data-row')) {
      Array.prototype.forEach.call(rowEle.children, function (cellEle) {
        cellEle.classList.remove('iw-list-data-row--selected')
        cellEle.classList.add('iw-list-data-row--unselected')
      })
    }
  })
}

function addSelect(selectedEle: HTMLElement) {
  if (props.pkKindIsNumber) {
    // @ts-ignore
    props.selectedPks.push(parseInt(selectedEle.dataset.pk as string))
  } else {
    // @ts-ignore
    props.selectedPks.push(selectedEle.dataset.pk as string)
  }
  Array.prototype.forEach.call(selectedEle.children, function (cellEle) {
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

