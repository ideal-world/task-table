<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import MenuComp from '../common/Menu.vue'
import MInput from './MInput/index.vue'
import MenuTreeComp from './MenuTree/index.vue'

import type { DictItemProps } from '../../props'
import { MenuOffsetKind } from '../common/Menu'
import * as eb from '../eventbus'
import * as iconSvg from '../../assets/icon'

const props = defineProps<{
  // 已选中的字典值
  // Selected dictionary values
  value: any
  options?: DictItemProps[]
  filterable?: boolean
  multiple?: boolean
  // 是否远程筛选
  // whether remote filter
  remote?: boolean
  dictName?: string
  clearable?: boolean
}>()

const emits = defineEmits(['update:value'])

// 字典值输入框引用
// Dictionary value input box reference
const MInputRef = ref<InstanceType<typeof MInput>>()
const inputVal = ref()
// 字典选择容器组件引用
// Dictionary selection container component reference
const selectContainerCompRef = ref<InstanceType<typeof MenuComp>>()

const remoteOptions = ref<DictItemProps[]>([])

// 已选中的字典项 eg:[{value: 'value', title: ''}]
// Selected dictionary items
const selectedOptions = ref<DictItemProps[]>([])

watch(
  () => props.value,
  (val) => {
    if (props.multiple) return
    inputVal.value = val
  }
)

// watch(
//   () => selectedOptions.value.length,
//   () => {
//     emits(
//       'update:value',
//       selectedOptions.value.map((e) => e.value)
//     )
//   }
// )

onMounted(async () => {
  if (props.dictName) {
    const values = Array.isArray(props.value) ? props.value : [props.value]
    const dictItems = await loadDictItems(props.dictName, values)
    selectedOptions.value = [...dictItems]
  }

  if (props.filterable) MInputRef.value?.inputRef?.focus()
  if (props.remote) await getRemoteOptions('')
  MInputRef.value?.inputRef?.click()
})

// 已选中的值 eg:['value']
const selectedVals = computed(() => selectedOptions.value.map((e) => e.value))

// 最终展示options finally show options
const showOptions = computed(() => {
  if (props.remote) {
    return remoteOptions.value
  } else {
    return inputVal.value
      ? props.options!.filter((e) => e.title.includes(inputVal.value))
      : props.options
  }
}) as any

/**
 * 显示可被选择的字典项
 *
 * Show selectable dictionary items
 *
 * @param inputValue 输入值 / Input value
 * @param e 事件 / Event
 */
async function showMenuComp(inputValue: any, _: number, e: Event) {
  if (props.remote) {
    await getRemoteOptions(inputValue)
  }
  selectContainerCompRef.value?.show(
    e.target as HTMLElement,
    MenuOffsetKind.LEFT_TOP,
    undefined,
    true
  )
}

async function getRemoteOptions(inputValue: any) {
  const res = await eb.loadCellDictItems(props.dictName!, inputValue, {
    offsetNumber: 0,
    fetchNumber: 20
  })
  remoteOptions.value = [...res.records] as any[]
}

/**
 * 添加字典值
 *
 * Add selected dictionary values
 *
 * @param e 事件 /  Event
 */
function addSelectedDictValue(e: Event) {
  if (!(e.target instanceof HTMLElement)) {
    return
  }
  const itemEle = e.target.closest('.iw-contextmenu__item')
  if (!itemEle || !(itemEle instanceof HTMLElement)) {
    return
  }
  // 获取选中的字典项
  // Get selected dictionary item
  const value = itemEle.dataset.value
  const selectedDictItem = showOptions.value.find((item: any) => item.value === value)
  if (
    !selectedVals.value.some((item: any) => item === selectedDictItem.value)
  ) {
    // 不存在，添加字典项
    selectedOptions.value.push(selectedDictItem)
  } else {
    // 存在，不能选
    // Exists, not allow choosed
    return
  }
  if (!props.multiple) {
    // 不支持多选，关闭字典选择容器
    // Do not support multiple selection, close the dictionary selection container
    selectContainerCompRef.value?.close()
  }
  // 清空输入框
  // Clear the input box
  MInputRef.value?.clearInput()
  // 设置字典值
  // Set dictionary value
  updateValueFn()
}

/**
 * 删除选中的字典值
 *
 * Delete selected dictionary values
 *
 * @param value 字典值 / Dictionary value
 */
function deleteSelectedDictValue(index: number) {
  selectedOptions.value.splice(
    index,
    1
  )
  updateValueFn()
}

function updateValueFn() {
  const val = props.multiple
    ? selectedOptions.value.map((e) => e.value)
    : selectedOptions.value?.[selectedOptions.value.length - 1]?.value
  emits('update:value', val)
}

/**
 * 加载字典项
 *
 * Load dictionary items
 *
 * @param dictName 要加载的字典名称 / Dictionary name to load
 * @param dictValues 要加载的字典值 / Dictionary values to load
 */
async function loadDictItems(
  dictName: string,
  dictValues: any[]
): Promise<DictItemProps[]> {
  const dictResp = await eb.loadCellDictItemsWithMultiConds(
    {
      [dictName]: dictValues
    },
    {
      offsetNumber: 0,
      fetchNumber: dictValues.length
    }
  )
  return dictResp[dictName].records as DictItemProps[]
}
</script>
<template>
  <MInput ref="MInputRef" :options="selectedOptions" :showDictItems="showMenuComp" :deleteAValue="(_:number, index:number)=> deleteSelectedDictValue(index)" />
    <MenuTreeComp ref="selectContainerCompRef" :values="selectedOptions.map(e=>e.value)"
    :options="showOptions" :setFilterADictValue="addSelectedDictValue" />
</template>
