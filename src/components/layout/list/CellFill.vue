<script setup lang="ts">
import { inject, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { FN_UPDATE_DATA } from '../../../constant'
import { getChildIndex, getParentWithClass } from '../../../utils/basic'
import { AlertKind, showAlert } from '../../common/Alert'
import { CachedColumnConf } from '../../conf'
import { DataKind, TableDataGroupResp, TableDataResp } from '../../props'
const { t } = useI18n()

const props = defineProps<{
  columnsConf: CachedColumnConf[]
  data: TableDataResp | TableDataGroupResp[]
  pkColumnName: string
}>()
const updateDataFun = inject(FN_UPDATE_DATA)

onMounted(() => {
  let startColumnName = ''
  let startRowIdx = 0
  let movedRowIdx = 0
  let startCellFixedX = 0
  let startCellEle: HTMLElement
  let isDragging = false
  const listEle = document.getElementsByClassName('iw-list')[0] as HTMLElement
  const selectDiv = document.createElement('div')
  selectDiv.classList.add('iw-list-fill--select')
  const dragDiv = document.createElement('div')
  const subDragDiv = document.createElement('div')
  dragDiv.appendChild(subDragDiv)
  selectDiv.appendChild(dragDiv)
  listEle.appendChild(selectDiv)

  dragDiv.addEventListener('pointerdown', (event: PointerEvent) => {
    isDragging = true
    const targetEle = event.target as HTMLElement
    targetEle.setPointerCapture(event.pointerId)
  })

  dragDiv.addEventListener('pointerup', (event: PointerEvent) => {
    if (!isDragging) {
      return
    }
    isDragging = false
    const targetEle = event.target as HTMLElement
    targetEle.releasePointerCapture(event.pointerId)
    selectDiv.style.display = 'none'
    if (startRowIdx == movedRowIdx) {
      return
    }
    const parentListEle = getParentWithClass(startCellEle, 'iw-list')
    if (parentListEle == null) {
      return
    }

    const pkKindIsNumber = props.columnsConf.find((col) => col.name == props.pkColumnName)?.dataKind == DataKind.NUMBER
    const selectedPks: string[] | number[] = []
    if (startRowIdx < movedRowIdx) {
      for (let i = startRowIdx; i <= movedRowIdx; i++) {
        if (pkKindIsNumber) {
          // @ts-ignore
          selectedPks.push(parseInt((parentListEle.children[i] as HTMLElement).dataset.pk ?? ''))
        } else {
          // @ts-ignore
          selectedPks.push((parentListEle.children[i] as HTMLElement).dataset.pk ?? '')
        }
      }
    } else {
      for (let i = startRowIdx; i >= movedRowIdx; i--) {
        if (pkKindIsNumber) {
          // @ts-ignore
          selectedPks.push(parseInt((parentListEle.children[i] as HTMLElement).dataset.pk ?? ''))
        } else {
          // @ts-ignore
          selectedPks.push((parentListEle.children[i] as HTMLElement).dataset.pk ?? '')
        }
      }
    }

    const changedData: any[] = []
    if (!Array.isArray(props.data)) {
      const targetData = props.data.records.find((item) => item[props.pkColumnName] == selectedPks[0])?.[startColumnName]
      props.data.records.forEach((item) => {
        // @ts-ignore
        if (selectedPks.includes(item[props.pkColumnName])) {
          changedData.push(
            {
              [props.pkColumnName]: item[props.pkColumnName],
              [startColumnName]: targetData,
            }
          )
        }
      })
    } else {
      props.data.forEach((groupData) => {
        const targetData = groupData.records.find((item) => item[props.pkColumnName] == selectedPks[0])?.[startColumnName]
        groupData.records.forEach((item) => {
          // @ts-ignore
          if (selectedPks.includes(item[props.pkColumnName])) {
            changedData.push(
              {
                [props.pkColumnName]: item[props.pkColumnName],
                [startColumnName]: targetData,
              }
            )
          }
        })
      })
    }
    // @ts-ignore
    updateDataFun(changedData)
  })

  dragDiv.addEventListener('pointermove', (event) => {
    if (!isDragging) {
      return
    }
    const movedEleOpt = document.elementsFromPoint(startCellFixedX + 4, (event as MouseEvent).clientY).find((ele) => ele.classList.contains('iw-list-data-cell'))
    if (!movedEleOpt) {
      showAlert(t("list.cellFill.acrossGroupError"), 2, AlertKind.WARNING)
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
    if (!targetEle.classList.contains('iw-list-data-cell')) {
      return
    }
    const parentListEle = getParentWithClass(targetEle, 'iw-list')
    if (parentListEle == null) {
      return
    }
    const selectRowEle = getParentWithClass(targetEle, 'iw-list-data-row')
    if (selectRowEle == null) {
      return
    }
    const currColumnName = targetEle.dataset.columnName ?? ''
    if (props.columnsConf.find((item) => item.name == currColumnName && (currColumnName == props.pkColumnName || !item.dataEditable))) {
      return
    }
    selectDiv.style.display = 'flex'
    selectDiv.style.left = targetEle.offsetLeft - 1 + 'px'
    selectDiv.style.top = targetEle.offsetTop - 1 + 'px'
    selectDiv.style.width = targetEle.offsetWidth + 2 + 'px'
    selectDiv.style.height = targetEle.offsetHeight + 2 + 'px'
    startColumnName = currColumnName
    startRowIdx = getChildIndex(parentListEle, selectRowEle)
    startCellEle = targetEle
    startCellFixedX = targetEle.getBoundingClientRect().left
  })
})
</script>

<template></template>

<style lang="css">
.iw-list-fill--select {
  @apply absolute hidden z-[1000] border-solid border-2 border-primary;

  &>div {
    @apply absolute flex w-[28px] h-[28px] p-[10px] right-[-15px] bottom-[-15px] cursor-crosshair;

    &>div {
      @apply flex-1 border-solid border-2 border-base-100 bg-primary;
    }
  }
}
</style>
