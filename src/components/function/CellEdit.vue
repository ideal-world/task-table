<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { EditDataProps } from '../../props'
import type { DataGroupResp, DataResp } from '../../props/basicProps'
import { DataKind, getInputTypeByDataKind } from '../../props/enumProps'
import { delegateEvent } from '../../utils/basic'
import type { ColumnConf } from '../conf'
import * as eb from '../eventbus'
import DictSelectComp from './DictSelect.vue'

const props = defineProps<{
  // 容器类名，用于标识编辑元素的共同父元素。父元素必须是 ``relative`` 定位
  // Container class name, used to identify the common parent element of the editing elements. The parent element must be positioned ``relative``
  containerClass: string
  // 主键列名
  // Primary key column name
  pkColumnName: string
  // 主键是否为数字类型
  // Whether the primary key is of numeric type
  pkKindIsNumber: boolean
  // 编辑功能配置
  // Edit function configuration
  edit: EditDataProps
  // 可能涉及的列配置
  // Possible column configuration
  columnsConf: ColumnConf[]
  // 可能涉及的数据
  // Possible data
  data: DataResp | DataGroupResp[]
  // 编辑单元格类名，用于确定哪些元素可以编辑
  // Edit cell class name, used to determine which elements can be edited
  editCellClass: string
  // 编辑单元格列名属性，用于确定该元素对应的列名
  // Edit cell column name attribute, used to determine the column name corresponding to the element
  editCellColumnNameProp: string
  // 编辑行类名，用于找到可编辑列对应的行元素
  // Edit row class name, used to find the row element corresponding to the editable column
  editRowClass: string
  // 编辑行主键值属性，用于确定该行对应的主键值
  // Edit row primary key value attribute, used to determine the primary key value corresponding to the row
  editRowPkValueProp: string
}>()

// 编辑容器，用于显示编辑功能
// Edit container, used to display edit function
const cellEditContainerRef = ref<InstanceType<typeof HTMLElement>>()

// 当前正在编辑的列配置
// Column configuration currently being edited
const curColumnConf = ref<ColumnConf>()
// 当前正在编辑的主键值
// Primary key value currently being edited
const curPk = ref()
// 当前正在编辑的值
// Value currently being edited
const curValue = ref()

/**
 * 进入编辑模式
 *
 * Enter edit mode
 *
 * 编辑模式的本质是将编辑容器（cellEditContainerRef）显示在当前正在编辑的单元格之上。
 *
 * Essence of edit mode is to display the edit container (cellEditContainerRef) above the cell currently being edited.
 *
 * @param value 当前正在编辑的值 / Value currently being edited
 * @param pkValue 当前正在编辑的主键值 / Primary key value currently being edited
 * @param columnConf 当前正在编辑的列配置 / Column configuration currently being edited
 * @param editCellEle 当前正在编辑的单元格元素 / Cell element currently being edited
 */
async function enterEditMode(value: any, pkValue: any, columnConf: ColumnConf, editCellEle: HTMLElement) {
  curColumnConf.value = columnConf
  curPk.value = pkValue
  curValue.value = value

  cellEditContainerRef.value!.style.left = `${editCellEle.offsetLeft - 1}px`
  cellEditContainerRef.value!.style.top = `${editCellEle.offsetTop - 1}px`
  cellEditContainerRef.value!.style.width = `${editCellEle.offsetWidth + 2}px`
  cellEditContainerRef.value!.style.height = `${editCellEle.offsetHeight + 2}px`
  cellEditContainerRef.value!.style.display = `flex`
  if (!curColumnConf.value.useDict) {
    const inputEle = cellEditContainerRef.value!.children[0] as HTMLElement
    inputEle.focus()
  }
}

/**
 * 离开编辑模式
 *
 * Leave edit mode
 */
async function leaveEditMode() {
  curColumnConf.value = undefined
  curPk.value = undefined
  curValue.value = undefined
  cellEditContainerRef.value!.style.display = `none`
}

/**
 * 设置值
 *
 * Set value
 *
 * @param value 值 / Value
 */
async function setValue(value: any) {
  if (value !== curValue.value) {
    if (curColumnConf.value!.dataKind === DataKind.DATETIME) {
      value = new Date(value)
    }
    await eb.modifyData([{
      [props.pkColumnName]: curPk.value,
      [curColumnConf.value!.name]: value,
    }])
  }
  if (!curColumnConf.value?.multiValue) {
    leaveEditMode()
  }
}

/**
 * 检查是否可编辑
 *
 * Check if it is editable
 *
 * 逻辑：
 * 1. 优先看返回数据的要求：
 *    1. 如果存在不可编辑的数据行的主键，且当前主键值在不可编辑主键值列表中，则不可编辑
 *    2. 如果存在可编辑的数据行的主键，且当前主键值不在可编辑主键值列表中，则不可编辑
 * 2. 最后看配置的列是否可编辑
 *
 * Logic:
 * 1. First look at the requirements of the returned data:
 *   1. If there are primary keys of data rows that cannot be edited, and the current primary key value is in the list of primary keys that cannot be edited, it cannot be edited
 *   2. If there are primary keys of data rows that can be edited, and the current primary key value is not in the list of primary keys that can be edited, it cannot be edited
 * 2. Finally, see if the configured column is editable
 *
 * @param data 数据 / Data
 * @param pkValue 主键值 / Primary key value
 * @param columnConf 列配置 / Column configuration
 * @returns 是否可编辑 / Whether it is editable
 */
function checkEditable(data: DataResp, pkValue: any, columnConf: ColumnConf) {
  if (data.nonEditablePks?.includes(pkValue)) {
    return false
  }
  if (data.editablePks && !data.editablePks.includes(pkValue)) {
    return false
  }
  return props.edit.enabledColumnNames.includes(columnConf.name) ?? false
}

/**
 * 标记可编辑单元格
 *
 * Mark editable cells
 *
 * @param containerEle 可编辑单元格共同父元素（容器） / Common parent element of editable cells (container)
 */
function markEditable(containerEle: HTMLElement) {
  const editableMarkEles = document.createElement('div')
  editableMarkEles.classList.add('iw-editable-mark')
  editableMarkEles.style.position = 'absolute'
  editableMarkEles.style.right = '0.1rem'
  editableMarkEles.style.bottom = '0.1rem'
  // 生成一个红色的圆点
  // Generate a red dot
  editableMarkEles.style.borderRadius = '50%'
  editableMarkEles.style.width = '0.2rem'
  editableMarkEles.style.height = '0.2rem'
  editableMarkEles.classList.add('bg-info')

  containerEle.querySelectorAll(`.${props.editRowClass}`).forEach((ele) => {
    // 找到行信息
    // Find row information
    const editRowEle = ele as HTMLElement
    const pkValue = props.pkKindIsNumber ? Number.parseInt(editRowEle.dataset[props.editRowPkValueProp]!) : editRowEle.dataset[props.editRowPkValueProp]!
    const data: DataResp = Array.isArray(props.data) ? props.data.find(groupData => groupData.records.some(record => record[props.pkColumnName] === pkValue))! : props.data

    editRowEle.querySelectorAll(`.${props.editCellClass}`).forEach((ele) => {
      // 找到单元格信息，并附加可编辑标记
      // Find cell information and attach editable mark
      const editCellEle = ele as HTMLElement
      const columnName = editCellEle.dataset[props.editCellColumnNameProp] as string
      const columnConf = props.columnsConf.find(column => column.name === columnName)!
      if (checkEditable(data, pkValue, columnConf)) {
        editCellEle.appendChild(editableMarkEles.cloneNode(true))
      }
    })
  })
}

// 监听配置变化，重新标记可编辑单元格
// Listen for configuration changes and re-mark editable cells
watch([() => props.columnsConf, () => props.data], () => {
  if (props.edit.markEditable) {
    markEditable(cellEditContainerRef.value!.closest(`.${props.containerClass}`) as HTMLElement)
  }
})

onMounted(() => {
  const containerEle = cellEditContainerRef.value!.closest(`.${props.containerClass}`) as HTMLElement
  // 双击尝试进入编辑模式
  // Double-click to try to enter edit mode
  delegateEvent(containerEle, 'dblclick', `.${props.editCellClass}`, (e) => {
    if (!e.target || !(e.target instanceof HTMLElement)) {
      return
    }
    const editCellEle = e.target.closest(`.${props.editCellClass}`) as HTMLElement
    const columnName = editCellEle.dataset[props.editCellColumnNameProp] as string
    const editRowEle = editCellEle.closest(`.${props.editRowClass}`) as HTMLElement
    const columnConf = props.columnsConf.find(column => column.name === columnName)!
    const pkValue = props.pkKindIsNumber ? Number.parseInt(editRowEle.dataset[props.editRowPkValueProp]!) : editRowEle.dataset[props.editRowPkValueProp]!
    const data: DataResp = Array.isArray(props.data) ? props.data.find(groupData => groupData.records.some(record => record[props.pkColumnName] === pkValue))! : props.data
    if (checkEditable(data, pkValue, columnConf)) {
      const value = data.records.find(record => record[props.pkColumnName] === pkValue)![columnName]!
      enterEditMode(value, pkValue, columnConf, editCellEle)
    }
    else {
      leaveEditMode()
    }
  })
  // 容器冒泡捕捉到单击事件后，尝试离开编辑模式
  // After the container captures the click event, try to leave edit mode
  containerEle.addEventListener('click', (e) => {
    if (!curColumnConf.value || e.target && e.target instanceof HTMLElement && e.target.closest(`.iw-edit-container`)) {
      return
    }
    // 在编辑模式下，且点击的不是编辑容器(cellEditContainerRef)，则尝试离开编辑模式
    // In edit mode, and if you click on something other than the edit container, try to leave edit mode
    leaveEditMode()
  })
})
</script>

<template>
  <div ref="cellEditContainerRef" class="iw-edit-container items-center absolute z-auto hidden border-2 border-base-300 bg-base-100">
    <template v-if="curColumnConf?.dataKind === DataKind.BOOLEAN">
      <input
        class="iw-edit-input iw-toggle iw-input-bordered ml-1" type="checkbox" :checked="curValue"
        @click="event => setValue((event.target as HTMLInputElement).checked)"
      >
    </template>
    <template v-else-if="!curColumnConf?.useDict">
      <input
        class="iw-edit-input iw-input rounded-none pl-0.5 pr-0.5 h-full w-full" :type="getInputTypeByDataKind(curColumnConf?.dataKind)"
        :value="curValue" @change="event => setValue((event.target as HTMLInputElement).value)"
      >
    </template>
    <template v-else>
      <DictSelectComp
        :dict-name="curColumnConf.name" :selected-dict-values="curValue" :multi-value="curColumnConf.multiValue"
        :set-values="setValue"
      />
    </template>
  </div>
</template>
