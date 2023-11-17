<script setup lang="ts">
import { inject, ref } from 'vue'
import IconPickerComp from '../../common/IconPicker.vue'
import { FUN_CLOSE_CONTEXT_MENU_TYPE, MenuOffsetKind } from '../../common/Menu.vue'
import { CachedColumnConf } from '../../conf'
import { FUN_MODIFY_COLUMN_TYPE } from '../../events'

const props = defineProps<{
  curColumnName: string
  pkColumnName: string
  columnsConf: CachedColumnConf[]
}>()
const modifyColumnFun = inject(FUN_MODIFY_COLUMN_TYPE)!
const closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!
const iconPickerCompRef = ref()

const renameColumn = async (event: Event) => {
  const curColumnConf = props.columnsConf.find((item) => item.name == props.curColumnName)
  const target = event.target as HTMLInputElement
  if (curColumnConf) {
    curColumnConf.title = target.value
    await modifyColumnFun(curColumnConf)
  }
  closeContextMenuFun()
}

const openIconContainer = async (event: Event) => {
  iconPickerCompRef.value.show(event, MenuOffsetKind.MEDIUM_BOTTOM)
}

const selectIcon = async (icon: string) => {
  const curColumnConf = props.columnsConf.find((item) => item.name == props.curColumnName)
  if (curColumnConf) {
    curColumnConf.icon = icon
    await modifyColumnFun(curColumnConf)
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

