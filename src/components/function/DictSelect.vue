<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import type { DictItemProps } from '../../props'
import { MenuOffsetKind } from '../common/Menu'
import MenuComp from '../common/Menu.vue'
import * as eb from '../eventbus'

const props = defineProps<{
  // 字典名称
  // Dictionary name
  dictName: string
  // 已选中的字典值
  // Selected dictionary values
  selectedDictValues: any
  // 是否支持多选
  // Whether to support multiple selection
  multiValue: boolean
  // 设置值的方法
  // Method to set value
  setValues: (value: any) => Promise<void>
}>()

// 字典值输入框引用
// Dictionary value input box reference
const inputRef = ref<InstanceType<typeof HTMLInputElement>>()
// 字典选择容器组件引用
// Dictionary selection container component reference
const dictContainerCompRef = ref<InstanceType<typeof MenuComp>>()

// 已选中的字典项
// Selected dictionary items
const selectedDictItems = ref<DictItemProps[]>([])
// 可被选择的字典项
// Selectable dictionary items
const selectableDictItems = ref<DictItemProps[]>([])

/**
 * 加载字典项
 *
 * Load dictionary items
 *
 * @param dictName 要加载的字典名称 / Dictionary name to load
 * @param dictValues 要加载的字典值 / Dictionary values to load
 */
async function loadDictItems(dictName: string, dictValues: any[]): Promise<DictItemProps[]> {
  const dictResp = await eb.loadCellDictItemsWithMultiConds({
    [dictName]: dictValues,
  }, {
    offsetNumber: 0,
    fetchNumber: dictValues.length,
  })
  return dictResp[dictName].records as DictItemProps[]
}

/**
 * 添加或移除选中的字典值
 *
 * Add or remove selected dictionary values
 *
 * @param e 事件 /  Event
 */
function addOrRemoveSelectedDictValue(e: Event) {
  if (!(e.target instanceof HTMLElement)) {
    return
  }
  const itemEle = e.target.closest('.iw-contextmenu__item')
  if (!itemEle || !(itemEle instanceof HTMLElement)) {
    return
  }
  // 获取选中的字典项
  // Get selected dictionary item
  const selectedDictItem = selectableDictItems.value[Number.parseInt(itemEle.dataset.itemIdx!)]!
  if (!selectedDictItems.value.some(item => item.value === selectedDictItem.value)) {
    // 不存在，添加字典项
    // Does not exist, add dictionary item
    selectedDictItems.value.push(selectedDictItem)
  }
  else {
    // 存在，移除字典项
    // Exists, remove dictionary item
    selectedDictItems.value.splice(selectedDictItems.value.findIndex(item => item.value === selectedDictItem.value), 1)
  }
  if (!props.multiValue) {
    // 不支持多选，关闭字典选择容器
    // Do not support multiple selection, close the dictionary selection container
    dictContainerCompRef.value?.close()
  }
  // 清空输入框
  // Clear the input box
  inputRef.value!.value = ''
  // 设置字典值
  // Set dictionary value
  doSetSelectedDictValue()
}

/**
 * 删除选中的字典值
 *
 * Delete selected dictionary values
 *
 * @param value 字典值 / Dictionary value
 */
function deleteSelectedDictValue(value: any) {
  selectedDictItems.value.splice(selectedDictItems.value.findIndex(dictItem => dictItem.value === value), 1)
  doSetSelectedDictValue()
}

/**
 * 设置选中的字典值
 *
 * Set selected dictionary values
 */
function doSetSelectedDictValue() {
  if (props.multiValue) {
    props.setValues(selectedDictItems.value.map(item => item.value))
  }
  else {
    props.setValues(selectedDictItems.value.length > 0 ? selectedDictItems.value[0].value : null)
  }
}

/**
 * 显示可被选择的字典项
 *
 * Show selectable dictionary items
 *
 * @param inputValue 输入值 / Input value
 * @param e 事件 / Event
 */
async function showSelectableDictItems(inputValue: any, e: Event) {
  const selectableResp = await eb.loadCellDictItems(props.dictName, inputValue, {
    offsetNumber: 0,
    // TODO
    fetchNumber: 20,
  })
  selectableDictItems.value = [...selectableResp.records] as any[]
  dictContainerCompRef.value?.show(e.target as HTMLElement, MenuOffsetKind.LEFT_TOP, undefined, true)
}

onMounted(async () => {
  if (Array.isArray(props.selectedDictValues) && props.selectedDictValues.length > 0) {
    const dictItems = await loadDictItems(props.dictName, props.selectedDictValues)
    selectedDictItems.value = [...dictItems]
  }
  else if (!Array.isArray(props.selectedDictValues) && props.selectedDictValues) {
    const dictItems = await loadDictItems(props.dictName, [props.selectedDictValues])
    selectedDictItems.value = [...dictItems]
  }
})
</script>

<template>
  <label class="iw-input rounded-none iw-input-xs flex items-center gap-2">
    <span
      v-for="(dictItem, valueIdx) in selectedDictItems"
      :key="`${props.dictName}-${valueIdx}`"
      :style="`background-color: ${dictItem.color ?? ''}`"
      class="iw-badge"
    >
      <span v-if="dictItem.avatar" class="avatar">
        <img :src="dictItem.avatar" class="w-4 rounded-full">
      </span>
      <span class="ml-1 whitespace-nowrap">{{ dictItem.title }}</span>
      <i
        :class="`${iconSvg.DELETE} ml-0.5 cursor-pointer`"
        @click="deleteSelectedDictValue(dictItem.value)"
      />
    </span>
    <input
      ref="inputRef"
      :class="selectedDictItems.length > 0 ? 'w-12' : ''"
      class="pl-1 rounded-md iw-input-bordered"
      @keyup="e => { showSelectableDictItems((e.target as HTMLInputElement).value, e) }"
    >
  </label>
  <MenuComp ref="dictContainerCompRef">
    <div @click="addOrRemoveSelectedDictValue">
      <div
        v-for="(dictItem, itemIdx) in selectableDictItems" :key="`${props.dictName}-${dictItem.value}`"
        :style="`background-color: ${dictItem.color}`"
        class="iw-contextmenu__item flex cursor-pointer iw-badge m-1.5 pl-0.5 iw-badge-outline"
        :class="selectedDictItems.some(item => item.value === dictItem.value) ? 'iw-badge-primary' : ''"
        :data-item-idx="itemIdx"
      >
        <div v-if="dictItem.avatar" class="avatar">
          <img :src="dictItem.avatar" class="w-4 rounded-full">
        </div>
        <span class="ml-1 whitespace-nowrap">{{ dictItem.title }} </span>
      </div>
    </div>
  </MenuComp>
</template>
