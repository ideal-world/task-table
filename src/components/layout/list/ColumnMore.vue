<script setup lang="ts">
import { inject, ref } from 'vue'
import * as iconSvg from '../../../assets/icon'
import { getRandomString } from '../../../utils/basic'
import IconPickerComp from '../../common/IconPicker.vue'
import MenuComp, { MenuOffsetKind } from '../../common/Menu.vue'
import type { TableColumnConf, TableLayoutColumnConf } from '../../conf'
import { dictEnableByDataKind, getDefaultIconByDataKind, getDefaultLayoutColumnConf } from '../../conf'
import { FUN_MODIFY_COLUMN_TYPE, FUN_MODIFY_LAYOUT_TYPE, FUN_NEW_COLUMN_TYPE } from '../../events'
import type { TableLayoutModifyReq } from '../../props'
import { DataKind, translateDataKind } from '../../props'

const props = defineProps<{
  basicColumnsConf: TableColumnConf[]
  layoutColumnsConf: TableLayoutColumnConf[]
}>()
const modifyColumnFun = inject(FUN_MODIFY_COLUMN_TYPE)!
const modifyLayoutFun = inject(FUN_MODIFY_LAYOUT_TYPE)!
const newColumnFun = inject(FUN_NEW_COLUMN_TYPE)!
const columnMoreCompRef = ref()
const columnDataKindCompRef = ref()
const iconPickerCompRef = ref()
const newColumnInfo = ref<{
  title?: string
  icon?: string
  dataKind?: DataKind
  useDict?: boolean
  dictEditable?: boolean
  multiValue?: boolean
}>({
})

function showNewColumnDatKindContextMenu(event: MouseEvent) {
  const targetEle = event.target as HTMLElement
  columnDataKindCompRef.value.show(targetEle, MenuOffsetKind.RIGHT_BOTTOM, undefined, true)
}

function setNewColumnDataKind(dataKind: DataKind) {
  newColumnInfo.value.dataKind = dataKind
  if (!newColumnInfo.value.icon)
    newColumnInfo.value.icon = getDefaultIconByDataKind(dataKind)

  columnDataKindCompRef.value.close()
}

function showNewColumnIconContainer(event: Event) {
  iconPickerCompRef.value.show(event, MenuOffsetKind.MEDIUM_BOTTOM, undefined, true)
}

function setNewColumnIcon(icon: string) {
  newColumnInfo.value.icon = icon
}

async function submitNewColumn() {
  if (newColumnInfo.value.title && newColumnInfo.value.dataKind) {
    const name = getRandomString(10, 'abcdefghijklmnopqrstuvwxyz')
    await newColumnFun({
      name,
      title: newColumnInfo.value.title,
      icon: newColumnInfo.value.icon!,
      dataKind: newColumnInfo.value.dataKind,
      dataEditable: true,
      useDict: newColumnInfo.value.useDict ?? false,
      dictEditable: newColumnInfo.value.useDict ?? false,
      multiValue: newColumnInfo.value.multiValue ?? false,
    }, getDefaultLayoutColumnConf(name))
    newColumnInfo.value = {}
    columnMoreCompRef.value.close()
  }
}

async function setShowToggleColumn(columnConf: TableColumnConf) {
  const layoutColumnsConf = props.layoutColumnsConf.find(col => col.name === columnConf.name)
  if (layoutColumnsConf) {
    await modifyColumnFun(undefined, {
      name: layoutColumnsConf.name,
      wrap: layoutColumnsConf.wrap,
      fixed: layoutColumnsConf.fixed,
      width: layoutColumnsConf.width,
      hide: !layoutColumnsConf.hide,
      dateStart: layoutColumnsConf.dateStart,
      dateEnd: layoutColumnsConf.dateEnd,
    })
  }
  else {
    const changedLayoutReq: TableLayoutModifyReq = {
      newColumn: {
        name: columnConf.name,
        hide: false,
      },
    }
    await modifyLayoutFun(changedLayoutReq)
  }
}

function showContainer(event: Event, offsetKind: MenuOffsetKind = MenuOffsetKind.RIGHT_BOTTOM) {
  columnMoreCompRef.value.show(event, offsetKind)
}

defineExpose({
  show: showContainer,
})
</script>

<template>
  <MenuComp ref="columnMoreCompRef">
    <div class="iw-divider">
      {{ $t('list.columnNew.title') }}
    </div>
    <div class="iw-contextmenu__item flex justify-between w-full cursor-pointer" @click="showNewColumnDatKindContextMenu">
      <span>{{ $t('list.columnNew.dataKind') }}</span>
      <span>{{ newColumnInfo.dataKind !== undefined ? translateDataKind(newColumnInfo.dataKind)
        : $t('_.state.selectPlaceholder') }}</span>
    </div>
    <div class="iw-contextmenu__item flex justify-between items-center w-full">
      <i
        :class="`${newColumnInfo.icon ? newColumnInfo.icon : getDefaultIconByDataKind(DataKind.TEXT)} mr-1`"
        class="cursor-pointer" @click="showNewColumnIconContainer"
      />
      <input
        v-model="newColumnInfo.title" class="iw-input iw-input-bordered iw-input-xs w-28" type="text"
        :placeholder="$t('list.columnNew.columnNamePlaceholder')"
      >
    </div>
    <div class="iw-contextmenu__item flex justify-between items-center w-full">
      <span>
        <i :class="iconSvg.MULTISELECT" />
        {{ $t('list.columnNew.multiValue') }}
      </span>
      <input v-model="newColumnInfo.multiValue" type="checkbox" class="iw-toggle iw-toggle-xs">
    </div>
    <div
      v-show="newColumnInfo.dataKind && dictEnableByDataKind(newColumnInfo.dataKind)"
      class="iw-contextmenu__item flex justify-between items-center w-full"
    >
      <span>
        <i :class="iconSvg.DICT" />
        {{ $t('list.columnNew.useDict') }}
      </span>
      <input v-model="newColumnInfo.useDict" type="checkbox" class="iw-toggle iw-toggle-xs">
    </div>
    <div v-show="newColumnInfo.useDict" class="iw-contextmenu__item flex justify-between items-center w-full">
      <span>
        <i :class="iconSvg.EDIT" />
        {{ $t('list.columnNew.dictEditable') }}
      </span>
      <input v-model="newColumnInfo.dictEditable" type="checkbox" class="iw-toggle iw-toggle-xs">
    </div>
    <div class="iw-contextmenu__item flex justify-end w-full">
      <button
        v-show="newColumnInfo.title && newColumnInfo.dataKind" class="iw-btn iw-btn-outline iw-btn-primary iw-btn-xs"
        @click="submitNewColumn"
      >
        {{ $t('list.columnNew.submit') }}
      </button>
    </div>
    <MenuComp ref="columnDataKindCompRef">
      <div
        v-for="dataKind of Object.values(DataKind)" :key="dataKind"
        class="iw-contextmenu__item flex justify-between w-full"
        style="cursor: pointer" @click="setNewColumnDataKind(dataKind)"
      >
        <i :class="getDefaultIconByDataKind(dataKind)" />
        <span>{{ translateDataKind(dataKind) }}</span>
      </div>
    </MenuComp>
    <IconPickerComp ref="iconPickerCompRef" @select-icon="setNewColumnIcon" />
    <div class="iw-divider">
      {{ $t('list.columnHide.title') }}
    </div>
    <div v-for="column in props.basicColumnsConf" :key="column.name" class="iw-contextmenu__item flex justify-between w-full">
      <span>
        <i :class="column.icon" />
        {{ column.title }}
      </span>
      <input
        type="checkbox" class="iw-toggle iw-toggle-xs"
        :checked="props.layoutColumnsConf.find(col => col.name === column.name)?.hide ?? true"
        @click="setShowToggleColumn(column)"
      >
    </div>
  </MenuComp>
</template>
