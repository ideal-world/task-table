<script setup lang="ts">
import { inject, ref } from 'vue';
import MenuComp, { MenuOffsetKind } from '../../common/Menu.vue';
import { TableColumnConf, TableLayoutColumnConf, getDefaultIconByDataKind } from '../../conf';
import { FUN_MODIFY_COLUMN_TYPE, FUN_MODIFY_LAYOUT_TYPE, FUN_NEW_COLUMN_TYPE } from '../../events';
import { DataKind, TableLayoutModifyReq, translateDataKind } from '../../props';

const props = defineProps<{
  basicColumnsConf: TableColumnConf[]
  layoutColumnsConf: TableLayoutColumnConf[]
}>()
const modifyColumnFun = inject(FUN_MODIFY_COLUMN_TYPE)!
const modifyLayoutFun = inject(FUN_MODIFY_LAYOUT_TYPE)!
const newColumnFun = inject(FUN_NEW_COLUMN_TYPE)!
const columnMoreCompRef = ref()
const iconPickerCompRef = ref()
const columnDataKindCompRefs = ref()
const newColumnInfo = ref<{
  title?: string
  icon?: string
  dataKind?: DataKind
}>({})

const setNewColumnDataKind = (dataKind: DataKind) => {
  newColumnInfo.value.dataKind = dataKind
  if (!newColumnInfo.value.icon) {
    newColumnInfo.value.icon = getDefaultIconByDataKind(dataKind)
  }
}

const openIconContainer = (event: Event) => {
  iconPickerCompRef.value.show(event, MenuOffsetKind.MEDIUM_BOTTOM)
}

const selectIcon = (icon: string) => {
  newColumnInfo.value.icon = icon
}

const submitNewColumn = async () => {
  if (newColumnInfo.value.title && newColumnInfo.value.dataKind) {
    const name = 
    await newColumnFun({
      name: newColumnInfo.value.title,
    title: newColumnInfo.value.title,
    icon: newColumnInfo.value.icon!,
    dataKind: newColumnInfo.value.dataKind,
    dataEditable: true
    },{
      name: string
    wrap: true,
    fixed: false,
    width: DEFAU
    hide: boolean
    dateStart: boolean
    dateEnd: boolean
    })
    newColumnInfo.value = {}
    columnMoreCompRef.value.close()
  }
}

const setShowToggleColumn = async (columnConf: TableColumnConf) => {
  const layoutColumnsConf = props.layoutColumnsConf.find(col => col.name == columnConf.name)
  if (layoutColumnsConf) {
    layoutColumnsConf.hide = !layoutColumnsConf.hide
    await modifyColumnFun(undefined, layoutColumnsConf)
  } else {
    const changedLayoutReq: TableLayoutModifyReq = {
      newColumn: {
        name: columnConf.name,
        hide: false
      }
    }
    await modifyLayoutFun(changedLayoutReq)
  }
}

function showContainer(event: Event, offsetKind: MenuOffsetKind = MenuOffsetKind.RIGHT_BOTTOM) {
  columnMoreCompRef.value.show(event, offsetKind)
}

defineExpose({
  show: showContainer
})
</script>

<template>
  <menu-comp ref="columnMoreCompRef">
    <div class="divider"> {{ $t('list.columnNew.title') }}</div>
    <div class="iw-contextmenu__item flex justify-between w-full">
      <span>{{ $t('list.columnNew.dataKind') }}</span>
      <span>{{ newColumnInfo.dataKind != undefined ? translateDataKind(newColumnInfo.dataKind) : '' }}</span>
    </div>
    <div class="iw-contextmenu__item cursor-pointer">
      <i :class="newColumnInfo.icon + ' mr-1'" @click="openIconContainer"></i>
      <input class="input input-bordered input-sm" type="text" v-model="newColumnInfo.title" />
    </div>
    <icon-picker-comp ref="iconPickerCompRef" @select-icon="selectIcon"></icon-picker-comp>
    <div class="iw-contextmenu__item flex justify-end w-full">
      <button class="btn btn-outline btn-primary" @click="submitNewColumn">{{ $t('list.columnNew.submit') }}</button>
    </div>
    <menu-comp ref="columnDataKindCompRefs">
      <div v-for="dataKind of Object.values(DataKind)" class="iw-contextmenu__item flex justify-between w-full"
        @click="setNewColumnDataKind(dataKind)" style="cursor: pointer">
        <i :class="getDefaultIconByDataKind(dataKind)"></i>
        <span>{{ translateDataKind(dataKind) }}</span>
      </div>
    </menu-comp>
    <div class="divider"> {{ $t('list.columnHide.title') }}</div>
    <div v-for="column in basicColumnsConf" class="iw-contextmenu__item flex justify-between w-full">
      {{ column.title }}
      <input type="checkbox" class="toggle toggle-sm"
        :checked="props.layoutColumnsConf.find(col => col.name == column.name)?.hide ?? true"
        @click="setShowToggleColumn(column)" />
    </div>
  </menu-comp>
</template>

