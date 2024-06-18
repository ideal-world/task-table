<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { EditDataProps } from '../../props'
import type { DataGroupResp, DataResp } from '../../props/basicProps'
import { DataKind, getInputTypeByDataKind } from '../../props/enumProps'
import { IwUtils } from '../../utils'
import type { ColumnConf } from '../conf'
import * as eb from '../eventbus'
import DictSelectComp from './DictSelect.vue'

const props = defineProps<{
  containerClass: string
  pkColumnName: string
  pkKindIsNumber: boolean
  editProps: EditDataProps
  columnsConf: ColumnConf[]
  data: DataResp | DataGroupResp[]
  editCellClass: string
  editCellColumnNameProp: string
  editRowClass: string
  editRowPkValueProp: string
}>()

const cellEditContainerRef = ref<InstanceType<typeof HTMLElement>>()

const curColumnConf = ref<ColumnConf>()
const curPk = ref()
const curValue = ref()

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

async function leaveEditMode() {
  curColumnConf.value = undefined
  curPk.value = undefined
  curValue.value = undefined
  cellEditContainerRef.value!.style.display = `none`
}

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

function checkEditable(data: DataResp, pkValue: any, columnConf: ColumnConf) {
  if (data.nonEditablePks?.includes(pkValue)) {
    return false
  }
  if (data.editablePks && !data.editablePks.includes(pkValue)) {
    return false
  }
  return columnConf.editable ?? false
}

function markEditable(containerEle: HTMLElement) {
  const editableMarkEles = document.createElement('div')
  editableMarkEles.classList.add('iw-editable-mark')
  editableMarkEles.style.position = 'absolute'
  editableMarkEles.style.right = '0.1rem'
  editableMarkEles.style.bottom = '0.1rem'
  // 生成一个红色的圆点
  editableMarkEles.style.borderRadius = '50%'
  editableMarkEles.style.width = '0.2rem'
  editableMarkEles.style.height = '0.2rem'
  editableMarkEles.classList.add('bg-info')

  containerEle.querySelectorAll(`.${props.editRowClass}`).forEach((ele) => {
    const editRowEle = ele as HTMLElement
    const pkValue = props.pkKindIsNumber ? Number.parseInt(editRowEle.dataset[props.editRowPkValueProp]!) : editRowEle.dataset[props.editRowPkValueProp]!
    const data: DataResp = Array.isArray(props.data) ? props.data.find(groupData => groupData.records.some(record => record[props.pkColumnName] === pkValue))! : props.data

    editRowEle.querySelectorAll(`.${props.editCellClass}`).forEach((ele) => {
      const editCellEle = ele as HTMLElement
      const columnName = editCellEle.dataset[props.editCellColumnNameProp] as string
      const columnConf = props.columnsConf.find(column => column.name === columnName)!
      if (checkEditable(data, pkValue, columnConf)) {
        editCellEle.appendChild(editableMarkEles.cloneNode(true))
      }
    })
  })
}

watch(() => props.columnsConf, () => {
  if (props.editProps.markEditable) {
    markEditable(cellEditContainerRef.value!.closest(`.${props.containerClass}`) as HTMLElement)
  }
})

watch(() => props.data, () => {
  if (props.editProps.markEditable) {
    markEditable(cellEditContainerRef.value!.closest(`.${props.containerClass}`) as HTMLElement)
  }
})

onMounted(() => {
  const containerEle = cellEditContainerRef.value!.closest(`.${props.containerClass}`) as HTMLElement
  IwUtils.delegateEvent(containerEle, 'dblclick', `.${props.editCellClass}`, (e) => {
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
  containerEle.addEventListener('click', (e) => {
    if (!curColumnConf.value || e.target && e.target instanceof HTMLElement && e.target.closest(`.iw-edit-container`)) {
      return
    }
    leaveEditMode()
  })
  if (props.editProps.markEditable) {
    markEditable(containerEle)
  }
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
        :dict-name="curColumnConf.name" :dict-values="curValue" :multi-value="curColumnConf.multiValue"
        :set-values="setValue"
      />
    </template>
  </div>
</template>
