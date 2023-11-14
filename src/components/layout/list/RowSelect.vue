<script  lang="ts">
let hasInit = false
</script>
<script setup lang="ts">
import { onMounted } from 'vue'
import { getChildIndex, getParentWithClass, hasParentWithClass } from '../../../utils/basic'
import { AlertKind, showAlert } from '../../common/Alert'
import { useI18n } from 'vue-i18n';
const { t } = useI18n()

const props = defineProps<{
  selectPks: string[] | number[],
  pkColumnName: string
  pkKindIsNumber: boolean
}>()

let selectStartRowEle: HTMLElement | null

if (!hasInit) {
  document.addEventListener('click', onRowClick as EventListener)
  document.addEventListener('mousedown', function (event: PointerEvent) {
    if (event.shiftKey) {
      event.preventDefault();
    }
  } as EventListener)
}
hasInit = true


onMounted(() => {
  selectStartRowEle = null

})

function onRowClick(event: PointerEvent) {
  const targetEle = event.target
  if (!(targetEle instanceof HTMLElement) || targetEle instanceof HTMLElement && !targetEle.classList.contains('iw-list-row-cell')) {
    return
  }
  let parentListEle = getParentWithClass(targetEle, 'iw-list')
  if (parentListEle == null) {
    return
  }
  let selectCellEle = getParentWithClass(targetEle, 'iw-list-cell')
  if (selectCellEle == null) {
    return
  }
  if (selectCellEle.dataset.columnName != props.pkColumnName) {
    // clean all selected
    cleanSelect(parentListEle)
    return
  }
  let selectRowEle = getParentWithClass(targetEle, 'iw-list-data-row')
  if (selectRowEle == null) {
    return
  }

  if (event.shiftKey && selectStartRowEle != null) {
    let endIdx = getChildIndex(parentListEle, selectRowEle)
    if (endIdx == -1) {
      selectStartRowEle = null
      return
    }
    let startIdx = getChildIndex(parentListEle, selectStartRowEle)
    let selectedEles = []
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
      showAlert(t("list.rowSelect.acrossGroupError"), 2, AlertKind.WARNING, parentListEle)
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
  props.selectPks.splice(0, props.selectPks.length)
  Array.prototype.forEach.call(parentEle.children, function (rowEle) {
    if (rowEle as HTMLElement && rowEle.classList.contains('iw-list-data-row')) {
      rowEle.classList.remove('iw-list-data-row--selected')
      rowEle.classList.add('iw-list-data-row--unselected')
    }
  })
}

function addSelect(selectedEle: HTMLElement) {
  if (props.pkKindIsNumber) {
    // @ts-ignore
    props.selectPks.push(parseInt(selectedEle.dataset.pk as string))
  } else {
    // @ts-ignore
    props.selectPks.push(selectedEle.dataset.pk as string)
  }
  selectedEle.classList.add('iw-list-data-row--selected')
  selectedEle.classList.remove('iw-list-data-row--unselected')
}

</script>

<template></template>

<style lang="css">
.iw-list-data-row--selected {
  @apply bg-base-200;
}
</style>
