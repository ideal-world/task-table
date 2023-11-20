<script setup lang="ts">
import { inject, ref } from 'vue'
import { getRandomString } from '../../../utils/basic'
import IconPickerComp from '../../common/IconPicker.vue'
import MenuComp, { MenuOffsetKind } from '../../common/Menu.vue'
import { TableColumnConf, TableLayoutColumnConf, getDefaultIconByDataKind, getDefaultLayoutColumnConf } from '../../conf'
import { FUN_MODIFY_COLUMN_TYPE, FUN_MODIFY_LAYOUT_TYPE, FUN_NEW_COLUMN_TYPE } from '../../events'
import { DataKind, TableLayoutModifyReq, translateDataKind } from '../../props'

const props = defineProps<{
  basicColumnsConf: TableColumnConf[]
  layoutColumnsConf: TableLayoutColumnConf[]
}>()
const modifyColumnFun = inject(FUN_MODIFY_COLUMN_TYPE)!
const modifyLayoutFun = inject(FUN_MODIFY_LAYOUT_TYPE)!
const newColumnFun = inject(FUN_NEW_COLUMN_TYPE)!
const columnMoreCompRef = ref()
const columnDataKindCompRefs = ref()
const iconPickerCompRef = ref()
const newColumnInfo = ref<{
  title?: string
  icon?: string
  dataKind?: DataKind
}>({
})

const showNewColumnDatKindContextMenu = (event: MouseEvent) => {
  const targetEle = event.target as HTMLElement
  columnDataKindCompRefs.value.show(targetEle, MenuOffsetKind.RIGHT_BOTTOM, undefined, true)
}

const setNewColumnDataKind = (dataKind: DataKind) => {
  newColumnInfo.value.dataKind = dataKind
  if (!newColumnInfo.value.icon) {
    newColumnInfo.value.icon = getDefaultIconByDataKind(dataKind)
  }
  columnDataKindCompRefs.value.close()
}

const showNewColumnIconContainer = (event: Event) => {
  iconPickerCompRef.value.show(event, MenuOffsetKind.MEDIUM_BOTTOM, undefined, true)
}

const setNewColumnIcon = (icon: string) => {
  newColumnInfo.value.icon = icon
}

const submitNewColumn = async () => {
  if (newColumnInfo.value.title && newColumnInfo.value.dataKind) {
    const name = getRandomString(10)
    await newColumnFun({
      name: name,
      title: newColumnInfo.value.title,
      icon: newColumnInfo.value.icon!,
      dataKind: newColumnInfo.value.dataKind,
      dataEditable: true
    }, getDefaultLayoutColumnConf(name))
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
    <div class="iw-contextmenu__item flex justify-between w-full cursor-pointer" @click="showNewColumnDatKindContextMenu">
      <span>{{ $t('list.columnNew.dataKind') }}</span>
      <span>{{ newColumnInfo.dataKind != undefined ? translateDataKind(newColumnInfo.dataKind) :
        $t('_.state.selectPlaceholder') }}</span>
    </div>
    <div class="iw-contextmenu__item flex justify-between items-center w-full">
      <i :class="(newColumnInfo.icon ? newColumnInfo.icon : getDefaultIconByDataKind(DataKind.TEXT)) + ' mr-1'"
        class="cursor-pointer" @click="showNewColumnIconContainer"></i>
      <input class="input input-bordered input-sx" type="text" v-model="newColumnInfo.title" />
    </div>
    <div class="iw-contextmenu__item flex justify-end w-full">
      <button class="btn btn-outline btn-primary btn-xs" @click="submitNewColumn"
        v-show="newColumnInfo.title && newColumnInfo.dataKind">
        {{ $t('list.columnNew.submit') }}
      </button>
    </div>
    <menu-comp ref="columnDataKindCompRefs">
      <div v-for="dataKind of Object.values(DataKind)" class="iw-contextmenu__item flex justify-between w-full"
        @click="setNewColumnDataKind(dataKind)" style="cursor: pointer">
        <i :class="getDefaultIconByDataKind(dataKind)"></i>
        <span>{{ translateDataKind(dataKind) }}</span>
      </div>
    </menu-comp>
    <icon-picker-comp ref="iconPickerCompRef" @select-icon="setNewColumnIcon"></icon-picker-comp>
    <div class="divider"> {{ $t('list.columnHide.title') }}</div>
    <div v-for="column in basicColumnsConf" class="iw-contextmenu__item flex justify-between w-full">
      {{ column.title }}
      <input type="checkbox" class="toggle toggle-sm"
        :checked="props.layoutColumnsConf.find(col => col.name == column.name)?.hide ?? true"
        @click="setShowToggleColumn(column)" />
    </div>
  </menu-comp>
</template>

