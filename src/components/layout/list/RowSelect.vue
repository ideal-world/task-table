<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { IwUtils } from '../../../utils';
import { getParentWithClass } from '../../../utils/basic';
import * as eb from '../../eventbus';

const props = defineProps<{
  selectedPks: any[]
  pkColumnName: string
  pkKindIsNumber: boolean
}>()

const currentCompRef = ref<HTMLElement | null>(null)
let listEle: HTMLElement

onMounted(() => {
  listEle = currentCompRef.value!.closest('.iw-list')! as HTMLElement
  IwUtils.delegateEvent(listEle, 'click', '.iw-list-select-cell__chk', onSelectToggle)
  IwUtils.delegateEvent(listEle, 'click', '.iw-list-select-all-cell__chk', onSelectAllToggle)
})

function onSelectToggle(event: Event) {
  const selectCheckBoxEle = event.target as HTMLInputElement
  const selectRowEle = getParentWithClass(selectCheckBoxEle, 'iw-list-data-row')!
  let selectPk
  if (props.pkKindIsNumber) {
    selectPk = Number.parseInt(selectRowEle.dataset.pk as string)
  }
  else {
    selectPk = selectRowEle.dataset.pk
  }
  const listEle = getParentWithClass(selectRowEle, 'iw-list')!
  if (!props.selectedPks.includes(selectPk)) {
    addSelect(selectPk, selectCheckBoxEle, listEle)
  }
  else {
    removeSelect(selectPk, selectCheckBoxEle, selectRowEle, listEle)
  }
  indeterminateSelect(selectRowEle, listEle)
  eb.selectData(props.selectedPks)
}

function onSelectAllToggle(event: Event) {
  const selectAllCheckBoxEle = event.target as HTMLInputElement
  const listEle = getParentWithClass(selectAllCheckBoxEle, 'iw-list')!
  Array.from(listEle.querySelectorAll('.iw-list-data-row')).forEach((rowEle) => {
    const selectPk = props.pkKindIsNumber ? Number.parseInt((rowEle as HTMLElement).dataset.pk as string) : (rowEle as HTMLElement).dataset.pk
    const selectCheckBoxEle = rowEle.querySelector('.iw-list-select-cell__chk') as HTMLInputElement
    if (selectAllCheckBoxEle.checked && !props.selectedPks.includes(selectPk)) {
      addSelect(selectPk, selectCheckBoxEle, listEle)
    }
    else if (!selectAllCheckBoxEle.checked && props.selectedPks.includes(selectPk)) {
      removeSelect(selectPk, selectCheckBoxEle, rowEle as HTMLElement, listEle)
    }
  })
  eb.selectData(props.selectedPks)
}

function addSelect(selectPk: any, selectCheckBoxEle: HTMLInputElement, listEle: HTMLElement) {
  !props.selectedPks.includes(selectPk) && props.selectedPks.push(selectPk)
  selectCheckBoxEle.checked = true
  selectCheckBoxEle.indeterminate = false
  listEle.querySelectorAll(`.iw-list-data-row[data-parent-pk='${selectPk}']`).forEach((childrenRowEle) => {
    const childrenPk = props.pkKindIsNumber ? Number.parseInt((childrenRowEle as HTMLElement).dataset.pk as string) : (childrenRowEle as HTMLElement).dataset.pk
    const childrenCheckBoxEle = childrenRowEle.querySelector('.iw-list-select-cell__chk') as HTMLInputElement
    addSelect(childrenPk, childrenCheckBoxEle, listEle)
  })
}

function removeSelect(selectPk: any, selectCheckBoxEle: HTMLInputElement, rowEle: HTMLElement, listEle: HTMLElement) {
  props.selectedPks.includes(selectPk) && props.selectedPks.splice(props.selectedPks.indexOf(selectPk), 1)
  selectCheckBoxEle.checked = false
  selectCheckBoxEle.indeterminate = false
  listEle.querySelectorAll(`.iw-list-data-row[data-parent-pk='${selectPk}']`).forEach((childrenRowEle) => {
    const childrenPk = props.pkKindIsNumber ? Number.parseInt((childrenRowEle as HTMLElement).dataset.pk as string) : (childrenRowEle as HTMLElement).dataset.pk
    const childrenCheckBoxEle = childrenRowEle.querySelector('.iw-list-select-cell__chk') as HTMLInputElement
    removeSelect(childrenPk, childrenCheckBoxEle, childrenRowEle as HTMLElement, listEle)
  })
  const selectAllEle = listEle.querySelector('.iw-list-select-all-cell__chk') as HTMLInputElement
  selectAllEle.checked = false
}

function indeterminateSelect(rowEle: HTMLElement, listEle: HTMLElement) {
  if (rowEle.dataset.parentPk) {
    const parentRowEle = listEle.querySelector(`.iw-list-data-row[data-pk='${rowEle.dataset.parentPk}']`)
    if (parentRowEle) {
      const parentPk = props.pkKindIsNumber ? Number.parseInt((parentRowEle as HTMLElement).dataset.pk as string) : (parentRowEle as HTMLElement).dataset.pk
      props.selectedPks.includes(parentPk) && props.selectedPks.splice(props.selectedPks.indexOf(parentPk), 1)
      const childrenCheckBoxEle = parentRowEle.querySelector('.iw-list-select-cell__chk') as HTMLInputElement
      childrenCheckBoxEle.indeterminate = true
      indeterminateSelect(parentRowEle as HTMLElement, listEle)
    }
  }
}
</script>

<template>
  <div ref="currentCompRef" />
</template>
