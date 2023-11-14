<script setup lang="ts">
import { inject, ref } from 'vue'
import { FN_CLOSE_CONTEXT_MENU, FN_MODIFY_COLUMN } from '../../../constant'
import { ListColumnConf } from './conf'
import { TableColumnProps } from '../../props'
import * as iconSvg from '../../../assets/icon'
import IconPickerComp from '../../common/IconPicker.vue'
import { MenuOffsetKind } from '../../common/Menu.vue'

const props = defineProps<{
  curColumnName: string
  pkColumnName: string
  columnsConf: ListColumnConf[]
}>()
let modifyColumnFun = inject(FN_MODIFY_COLUMN)
let closeContextMenuFun = inject(FN_CLOSE_CONTEXT_MENU)
const iconPickerCompRef = ref()

const renameColumn = async (event: Event) => {
  const curColumnConf = props.columnsConf.find((item) => item.name == props.curColumnName)
  const target = event.target as HTMLInputElement
  if (curColumnConf) {
    let columnProps: TableColumnProps = {
      name: curColumnConf.name,
      title: target.value,
    }
    // @ts-ignore
    if (await modifyColumnFun(columnProps)) {
      curColumnConf.title = target.value
    }
  }
  // @ts-ignore
  closeContextMenuFun()
}

const openIconContainer = async (event: Event) => {
  iconPickerCompRef.value.show(event, MenuOffsetKind.MEDIUM_BOTTOM)
}

const selectIcon = async (icon: string) => {
  const curColumnConf = props.columnsConf.find((item) => item.name == props.curColumnName)
  if (curColumnConf) {
    let columnProps: TableColumnProps = {
      name: curColumnConf.name,
      icon: icon,
    }
    // @ts-ignore
    if (await modifyColumnFun(columnProps)) {
      curColumnConf.icon = icon
    }
  }
}


</script>

<template>
  <div class="iw-contextmenu__item cursor-pointer">
    <i :class="props.columnsConf.find((item) => item.name == props.curColumnName)?.icon + ' mr-1'"
      @click="openIconContainer"></i>
    <input class="input input-bordered input-sm" type="text"
      :value="props.columnsConf.find((item) => item.name == props.curColumnName)?.title" @change="renameColumn" />
  </div>
  <icon-picker-comp ref="iconPickerCompRef" @select-icon="selectIcon"></icon-picker-comp>
</template>

