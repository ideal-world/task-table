<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import type { DictItemProps } from '../../props'
import MenuComp, { MenuOffsetKind } from '../common/Menu.vue'
import * as eb from '../eventbus'

const props = defineProps<{
  dictName: string
  dictValues: any
  multiValue: boolean
  setValues: (value: any) => Promise<void>
}>()

const inputRef = ref<InstanceType<typeof HTMLInputElement>>()
const dictContainerCompRef = ref<InstanceType<typeof MenuComp>>()

const currDictItems = ref<DictItemProps[]>([])
const selectableDictItems = ref<DictItemProps[]>([])

async function loadDictItems(dictName: string, dictValues: any[]): Promise<DictItemProps[]> {
  const dictResp = await eb.loadCellDictItemsWithMultiConds({
    [dictName]: dictValues,
  }, {
    offsetNumber: 0,
    fetchNumber: dictValues.length,
  })
  return dictResp[dictName].records
}

function deleteDictValue(value: any) {
  currDictItems.value.splice(currDictItems.value.findIndex(dictItem => dictItem.value === value), 1)
  doSetValue()
}

function doSetValue() {
  if (props.multiValue) {
    props.setValues(currDictItems.value.map(item => item.value))
  }
  else {
    props.setValues(currDictItems.value.length > 0 ? currDictItems.value[0].value : null)
  }
}

function setDictValue(e: Event) {
  if (!(e.target instanceof HTMLElement)) {
    return
  }
  const itemEle = e.target.closest('.iw-contextmenu__item')
  if (!itemEle || !(itemEle instanceof HTMLElement)) {
    return
  }
  const selectedDictItem = selectableDictItems.value[Number.parseInt(itemEle.dataset.itemIdx!)]!
  if (!currDictItems.value.some(item => item.value === selectedDictItem.value)) {
    currDictItems.value.push(selectedDictItem)
  }
  else {
    currDictItems.value.splice(currDictItems.value.findIndex(item => item.value === selectedDictItem.value), 1)
  }
  if (!props.multiValue) {
    dictContainerCompRef.value?.close()
  }
  inputRef.value!.value = ''
  doSetValue()
}

async function showSelectableDictItems(inputValue: any, e: Event) {
  const selectableResp = await eb.loadCellDictItems(props.dictName, inputValue, {
    offsetNumber: 0,
    // TODO
    fetchNumber: 10,
  })
  selectableDictItems.value = [...selectableResp.records]
  dictContainerCompRef.value?.show(e.target as HTMLElement, MenuOffsetKind.LEFT_TOP, undefined, true)
}

onMounted(async () => {
  if (Array.isArray(props.dictValues) && props.dictValues.length > 0) {
    const dictItems = await loadDictItems(props.dictName, props.dictValues)
    currDictItems.value = [...dictItems]
  }
  else if (!Array.isArray(props.dictValues) && props.dictValues) {
    const dictItems = await loadDictItems(props.dictName, [props.dictValues])
    currDictItems.value = [...dictItems]
  }
})
</script>

<template>
  <label class="iw-input rounded-none iw-input-xs flex items-center gap-2">
    <span
      v-for="(dictItem, valueIdx) in currDictItems"
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
        @click="deleteDictValue(dictItem.value)"
      />
    </span>
    <input
      ref="inputRef"
      :class="currDictItems.length > 0 ? 'w-12' : ''"
      class="pl-1 rounded-md iw-input-bordered"
      @keyup="e => { showSelectableDictItems((e.target as HTMLInputElement).value, e) }"
    >
  </label>
  <MenuComp ref="dictContainerCompRef">
    <div @click="setDictValue">
      <div
        v-for="(dictItem, itemIdx) in selectableDictItems" :key="`${props.dictName}-${dictItem.value}`"
        :style="`background-color: ${dictItem.color}`"
        class="iw-contextmenu__item flex cursor-pointer iw-badge m-1.5 pl-0.5 iw-badge-outline"
        :class="currDictItems.some(item => item.value === dictItem.value) ? 'iw-badge-primary' : ''"
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
