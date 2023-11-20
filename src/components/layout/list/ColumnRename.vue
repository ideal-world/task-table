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

const showIconContainer = async (event: Event) => {
  iconPickerCompRef.value.show(event, MenuOffsetKind.MEDIUM_BOTTOM, undefined, true)
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
  <div class="iw-contextmenu__item flex justify-between items-center w-full">
    <i :class="props.columnsConf.find((item) => item.name == props.curColumnName)?.icon + ' cursor-pointer mr-1'"
      @click="showIconContainer"></i>
    <input class="input input-bordered input-xs w-28" type="text"
      :value="props.columnsConf.find((item) => item.name == props.curColumnName)?.title" @change="renameColumn" />
  </div>
  <icon-picker-comp ref="iconPickerCompRef" @select-icon="selectIcon"></icon-picker-comp>
</template>

