<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { delegateEvent, getParentWithClass } from '../../../utils/basic'
import * as eb from '../../eventbus'

const props = defineProps<{
  // 已选中的主键
  // Selected primary key
  selectedPks: any[]
  // 主键列名
  // Primary key column name
  pkColumnName: string
  // 主键类型是否为数字
  // Whether the primary key type is a number
  pkKindIsNumber: boolean
}>()

// 列选择元素引用，仅用于向上找到列表元素
// Column selection element reference, only used to find the list element upwards
const selectEleRef = ref<HTMLElement | null>(null)
// 列表元素
// List element
let listEle: HTMLElement

onMounted(() => {
  listEle = selectEleRef.value!.closest('.iw-row-select-container')! as HTMLElement
  delegateEvent(listEle, 'click', '.iw-row-select-cell__chk', onSelectToggle)
  delegateEvent(listEle, 'click', '.iw-row-select-all-cell__chk', onSelectAllToggle)
})

/**
 * 单行选择切换
 *
 * Single row selection toggle
 *
 * @param event 点击事件 / Click event
 */
async function onSelectToggle(event: Event) {
  const selectCheckBoxEle = event.target as HTMLInputElement
  const selectRowEle = getParentWithClass(selectCheckBoxEle, 'iw-data-row')!
  let selectPk
  if (props.pkKindIsNumber) {
    selectPk = Number.parseInt(selectRowEle.dataset.pk as string)
  }
  else {
    selectPk = selectRowEle.dataset.pk
  }
  if (!props.selectedPks.includes(selectPk)) {
    // 添加选择
    // Add selection
    addSelect(selectPk, selectCheckBoxEle)
  }
  else {
    // 移除选择
    // Remove selection
    removeSelect(selectPk, selectCheckBoxEle)
  }
  // 处理父数据选择
  // Process parent data selection
  processParentSelect(selectRowEle)
  // 通知外部已选中的主键
  // Notify the external selected primary key
  await eb.selectData(props.selectedPks)
}

/**
 * 全选切换
 *
 * Toggle select all
 *
 * @param event 点击事件 / Click event
 */
async function onSelectAllToggle(event: Event) {
  const selectAllCheckBoxEle = event.target as HTMLInputElement
  Array.from(listEle.querySelectorAll('.iw-data-row')).forEach((rowEle) => {
    const selectPk = props.pkKindIsNumber ? Number.parseInt((rowEle as HTMLElement).dataset.pk as string) : (rowEle as HTMLElement).dataset.pk
    const selectCheckBoxEle = rowEle.querySelector('.iw-row-select-cell__chk') as HTMLInputElement
    if (selectAllCheckBoxEle.checked && !props.selectedPks.includes(selectPk)) {
      // 添加选择
      // Add selection
      addSelect(selectPk, selectCheckBoxEle)
    }
    else if (!selectAllCheckBoxEle.checked && props.selectedPks.includes(selectPk)) {
      // 移除选择
      // Remove selection
      removeSelect(selectPk, selectCheckBoxEle)
    }
  })
  // 通知外部已选中的主键
  // Notify the external selected primary key
  await eb.selectData(props.selectedPks)
}

/**
 * 添加选择
 *
 * Add selection
 *
 * @param selectPk 要添加的主键 / Primary key to add
 * @param selectCheckBoxEle 要添加的选择框元素 / Checkbox element to add
 */
function addSelect(selectPk: any, selectCheckBoxEle: HTMLInputElement) {
  // 添加主键到已选中列表
  // Add primary key to selected list
  !props.selectedPks.includes(selectPk) && props.selectedPks.push(selectPk)
  selectCheckBoxEle.checked = true
  selectCheckBoxEle.indeterminate = false
  // 递归添加子数据
  // Recursively add sub-data
  listEle.querySelectorAll(`.iw-data-row[data-parent-pk='${selectPk}']`).forEach((childrenRowEle) => {
    const childrenPk = props.pkKindIsNumber ? Number.parseInt((childrenRowEle as HTMLElement).dataset.pk as string) : (childrenRowEle as HTMLElement).dataset.pk
    const childrenCheckBoxEle = childrenRowEle.querySelector('.iw-row-select-cell__chk') as HTMLInputElement
    addSelect(childrenPk, childrenCheckBoxEle)
  })
}

/**
 * 移除选择
 *
 * Remove selection
 *
 * @param selectPk 要移除的主键 / Primary key to remove
 * @param selectCheckBoxEle 要移除的选择框元素 / Checkbox element to remove
 */
function removeSelect(selectPk: any, selectCheckBoxEle: HTMLInputElement) {
  // 从已选中列表中移除主键
  // Remove the primary key from the selected list
  props.selectedPks.includes(selectPk) && props.selectedPks.splice(props.selectedPks.indexOf(selectPk), 1)
  selectCheckBoxEle.checked = false
  selectCheckBoxEle.indeterminate = false
  // 递归移除子数据
  // Recursively remove sub-data
  listEle.querySelectorAll(`.iw-data-row[data-parent-pk='${selectPk}']`).forEach((childrenRowEle) => {
    const childrenPk = props.pkKindIsNumber ? Number.parseInt((childrenRowEle as HTMLElement).dataset.pk as string) : (childrenRowEle as HTMLElement).dataset.pk
    const childrenCheckBoxEle = childrenRowEle.querySelector('.iw-row-select-cell__chk') as HTMLInputElement
    removeSelect(childrenPk, childrenCheckBoxEle)
  })
  // 移除全选的选中状态
  // Remove the selected state of select all
  const selectAllEle = listEle.querySelector('.iw-row-select-all-cell__chk') as HTMLInputElement
  selectAllEle.checked = false
}

/**
 * 处理父数据选择
 *
 * Process parent data selection
 *
 * @param rowEle 行元素 / Row element
 */
function processParentSelect(rowEle: HTMLElement) {
  if (rowEle.dataset.parentPk) {
    const parentRowEle = listEle.querySelector(`.iw-data-row[data-pk='${rowEle.dataset.parentPk}']`)
    if (parentRowEle) {
      const parentPk = props.pkKindIsNumber ? Number.parseInt((parentRowEle as HTMLElement).dataset.pk as string) : (parentRowEle as HTMLElement).dataset.pk
      // 从已选中列表中移除主键
      // Remove the primary key from the selected list
      props.selectedPks.includes(parentPk) && props.selectedPks.splice(props.selectedPks.indexOf(parentPk), 1)
      // 判断子数据是否有选中
      // Judge whether the sub-data is selected
      const childHasSelected = Array.prototype.some.call(listEle.querySelectorAll(`.iw-data-row[data-parent-pk='${parentPk}']`), (element) => {
        const childPk = props.pkKindIsNumber ? Number.parseInt((element as HTMLElement).dataset.pk as string) : (element as HTMLElement).dataset.pk
        return props.selectedPks.includes(childPk)
      })
      const childrenCheckBoxEle = parentRowEle.querySelector('.iw-row-select-cell__chk') as HTMLInputElement
      if (!childHasSelected) {
        // 取消选择
        // Remove selection
        childrenCheckBoxEle.checked = false
        childrenCheckBoxEle.indeterminate = false
      }
      else {
        // 设置半选状态
      // Set indeterminate state
        childrenCheckBoxEle.indeterminate = true
      }
      // 递归设置父数据
      // Recursively set parent data
      processParentSelect(parentRowEle as HTMLElement)
    }
  }
}
</script>

<template>
  <div ref="selectEleRef" />
</template>
