<script setup lang="ts">
import { inject, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getChildIndex, getParentWithClass } from '../../../utils/basic'
import { AlertKind, showAlert } from '../../common/Alert.vue'
import type { CachedColumnConf } from '../../conf'
import { FUN_UPDATE_DATA_TYPE } from '../../events'
import type { TableDataGroupResp, TableDataResp } from '../../props'
import { DataKind } from '../../props'
import type { CellSelectedInfo } from './CellSelect.vue'

const props = defineProps<{
  columnsConf: CachedColumnConf[]
  data: TableDataResp | TableDataGroupResp[]
  pkKindIsNumber: boolean
  pkColumnName: string
  selectedCellInfo: CellSelectedInfo | undefined
}>()

const { t } = useI18n()

const updateDataFun = inject(FUN_UPDATE_DATA_TYPE)!

const selectDiv = document.createElement('div')
let startColumnName = ''
let startRowIdx = 0
let movedRowIdx = 0
let startCellFixedX = 0
let startCellEle: HTMLElement
let isDragging = false

watch(props, () => {
  isDragging = false
  selectDiv.style.display = 'none'

  if (props.selectedCellInfo === undefined)
    return

  const parentListEle = getParentWithClass(props.selectedCellInfo.ele, 'iw-list')
  if (parentListEle == null)
    return

  const selectRowEle = getParentWithClass(props.selectedCellInfo.ele, 'iw-list-data-row')
  if (selectRowEle == null)
    return

  selectDiv.style.display = 'flex'
  selectDiv.style.left = `${props.selectedCellInfo.ele.offsetLeft - 1}px`
  selectDiv.style.top = `${props.selectedCellInfo.ele.offsetTop - 1}px`
  selectDiv.style.width = `${props.selectedCellInfo.ele.offsetWidth + 2}px`
  selectDiv.style.height = `${props.selectedCellInfo.ele.offsetHeight + 2}px`
  startColumnName = props.selectedCellInfo.columnName
  startRowIdx = getChildIndex(parentListEle, selectRowEle)
  startCellEle = props.selectedCellInfo.ele
  startCellFixedX = props.selectedCellInfo.ele.getBoundingClientRect().left
})

onMounted(() => {
  const listEle = document.getElementsByClassName('iw-list')[0] as HTMLElement
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
    if (!isDragging)
      return

    isDragging = false
    const targetEle = event.target as HTMLElement
    targetEle.releasePointerCapture(event.pointerId)
    selectDiv.style.display = 'none'
    if (startRowIdx === movedRowIdx)
      return

    const parentListEle = getParentWithClass(startCellEle, 'iw-list')
    if (parentListEle == null)
      return

    const selectedPks: any[] = []
    if (startRowIdx < movedRowIdx) {
      for (let i = startRowIdx; i <= movedRowIdx; i++) {
        if (props.pkKindIsNumber)
          selectedPks.push(Number.parseInt((parentListEle.children[i] as HTMLElement).dataset.pk ?? ''))
        else
          selectedPks.push((parentListEle.children[i] as HTMLElement).dataset.pk ?? '')
      }
    }
    else {
      for (let i = startRowIdx; i >= movedRowIdx; i--) {
        if (props.pkKindIsNumber)
          selectedPks.push(Number.parseInt((parentListEle.children[i] as HTMLElement).dataset.pk ?? ''))
        else
          selectedPks.push((parentListEle.children[i] as HTMLElement).dataset.pk ?? '')
      }
    }

    const changedData: any[] = []
    if (!Array.isArray(props.data)) {
      const targetData = props.data.records.find(item => item[props.pkColumnName] === selectedPks[0])?.[startColumnName]
      selectedPks.shift()
      props.data.records.forEach((item) => {
        if (selectedPks.includes(item[props.pkColumnName])) {
          changedData.push(
            {
              [props.pkColumnName]: item[props.pkColumnName],
              [startColumnName]: targetData,
            },
          )
        }
      })
    }
    else {
      props.data.forEach((groupData) => {
        const targetData = groupData.records.find(item => item[props.pkColumnName] === selectedPks[0])?.[startColumnName]
        if (!targetData)
          return
        selectedPks.shift()
        groupData.records.forEach((item) => {
          if (selectedPks.includes(item[props.pkColumnName])) {
            changedData.push(
              {
                [props.pkColumnName]: item[props.pkColumnName],
                [startColumnName]: targetData,
              },
            )
          }
        })
      })
    }
    updateDataFun(changedData)
  })

  dragDiv.addEventListener('pointermove', (event) => {
    if (!isDragging)
      return

    const movedEleOpt = document.elementsFromPoint(startCellFixedX + 4, (event as MouseEvent).clientY).find(ele => ele.classList.contains('iw-list-data-cell'))
    if (!movedEleOpt) {
      showAlert(t('list.cellFill.acrossGroupError'), 2, AlertKind.WARNING, getParentWithClass(listEle, 'iw-tt')!)
      return
    }
    const movedEle = movedEleOpt as HTMLElement
    const parentListEle = getParentWithClass(movedEle, 'iw-list')
    if (parentListEle == null)
      return

    const selectRowEle = getParentWithClass(movedEle, 'iw-list-data-row')
    if (selectRowEle == null)
      return

    movedRowIdx = getChildIndex(parentListEle, selectRowEle)
    if (startRowIdx <= movedRowIdx) {
      selectDiv.style.top = `${startCellEle.offsetTop - 1}px`
      selectDiv.style.height = `${movedEle.offsetTop + movedEle.offsetHeight - startCellEle.offsetTop}px`
    }
    else {
      selectDiv.style.top = `${movedEle.offsetTop - 1}px`
      selectDiv.style.height = `${startCellEle.offsetTop + startCellEle.offsetHeight - movedEle.offsetTop}px`
    }
  })
})
</script>

<template>
  <div />
</template>

<style lang="css">
.iw-list-fill--select {
  @apply absolute hidden z-[1200] border-solid border-2 border-primary;

  &>div {
    @apply absolute flex w-[28px] h-[28px] p-[10px] right-[-15px] bottom-[-15px] cursor-crosshair;

    &>div {
      @apply flex-1 border-solid border-2 border-base-100 bg-primary;
    }
  }
}
</style>
