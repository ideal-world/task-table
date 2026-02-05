<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { delegateEvent, getParentWithClass } from '../../../utils/basic'
import * as eb from '../../eventbus'

const props = defineProps<{
  // 数据
  // Data
  records: { [columnName: string]: any }[]
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

let selectAllEle: HTMLInputElement

onMounted(() => {
  listEle = selectEleRef.value!.closest('.iw-row-select-container')! as HTMLElement
  selectAllEle = listEle.querySelector('.iw-row-select-all-cell__chk') as HTMLInputElement
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
  // eslint-disable-next-line ts/no-unused-expressions
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
      const childrenCheckBoxEle = parentRowEle.querySelector('.iw-row-select-cell__chk') as HTMLInputElement
      const parentPk = props.pkKindIsNumber ? Number.parseInt((parentRowEle as HTMLElement).dataset.pk as string) : (parentRowEle as HTMLElement).dataset.pk
      if (props.selectedPks.includes(parentPk)) {
        // 已选中，表明这个父节点不是半选状态，是明确选中状态，故不受子节点取消选择的影响，直接返回
        // Already selected, indicating that this parent node is not in an indeterminate state, but in a clear selected state, so it is affected by the deselection of the child node, and the return is directly
        return
      }
      // 判断子数据是否有选中
      // Judge whether the sub-data is selected
      const childHasSelected = Array.prototype.some.call(listEle.querySelectorAll(`.iw-data-row[data-parent-pk='${parentPk}']`), (element) => {
        const childPk = props.pkKindIsNumber ? Number.parseInt((element as HTMLElement).dataset.pk as string) : (element as HTMLElement).dataset.pk
        return props.selectedPks.includes(childPk)
      })
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

/**
 * 清空选择
 *
 * Clear select
 *
 */
function ClearSelect() {
  selectAllEle.checked = false
  selectAllEle.indeterminate = false
  listEle?.querySelectorAll('.iw-row-select-cell__chk')?.forEach((ele) => {
    (ele as HTMLInputElement).checked = false
  })
}
// 根据pks来选中行
// Select rows by pks
function selectRowsByPks(pks: number[] | string[]) {
  if (!pks?.length) {
    ClearSelect()
    return
  }
  pks.forEach((pk) => {
    const { rowEle, chkEle } = getRowElAndChkEle(pk)
    // 如果行元素存在且复选框未被选中，则添加选择
    // If the row element exists and the checkbox is not checked, then add the selection
    if (rowEle && !chkEle.checked) {
      addSelect(pk, chkEle)
      // 处理父数据选择
      // Process parent data selection
      processParentSelect(rowEle)
    }
  })
}
// 根据pks清除其他行的选择
// Clear other row selections based on pks
function removeRowsByPks(pks: number[] | string[]) {
  if (!pks?.length) {
    return
  }
  pks.forEach((pk) => {
    const { rowEle, chkEle } = getRowElAndChkEle(pk)
    if (chkEle && chkEle.checked) {
      chkEle.checked = false
      removeSelect(pk, chkEle)// 处理父数据选择
      // Process parent data selection
      processParentSelect(rowEle)
    }
  })
}
// 获取行元素和复选框元素
// Get row element and checkbox element
function getRowElAndChkEle(pk: number | string) {
  const rowEle = listEle.querySelector(`.iw-data-row[data-pk='${pk}']`) as HTMLElement
  const chkEle = rowEle?.querySelector('.iw-row-select-cell__chk') as HTMLInputElement
  return { rowEle, chkEle }
}

function judgeAllSelected() {
  const dataPks = props.records.filter(record => props.selectedPks.includes(record[props.pkColumnName]))
      .map(record => record[props.pkColumnName])
      if (dataPks.length && (dataPks.length === props.records.length)) {
      // 全选
      selectAllEle.checked = true
    }else {
      
      selectAllEle.checked = false
    }
}

watch(
  () => props.selectedPks?.length,
  () => {
    // selectedPks变化有两种情况，一种是用户点击了选择，另一种是外部传入的selectedPks发生了变化
    selectRowsByPks(props.selectedPks)
    // 如果外部传入的selectedPks发生了变化，需要取消当前表格数据其他数据的选择
    // If the external selectedPks changes, need to unselect other data in the current table data
    const curUnselectedRecordPks = props.records.filter(record => !props.selectedPks.includes(record[props.pkColumnName])).map(record => record[props.pkColumnName])
    removeRowsByPks(curUnselectedRecordPks)
    judgeAllSelected()
  },
)

watch(
  () => props.records,
  () => {
    const dataPks = props.records.filter(record => props.selectedPks.includes(record[props.pkColumnName]))
      .map(record => record[props.pkColumnName])
    selectRowsByPks(dataPks)
    judgeAllSelected()
  },
  { deep: true },
)
</script>

<template>
  <div ref="selectEleRef" />
</template>
