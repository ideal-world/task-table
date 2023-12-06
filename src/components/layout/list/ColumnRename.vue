<script setup lang="ts">
import { inject, ref } from 'vue'
import IconPickerComp from '../../common/IconPicker.vue'
import { FUN_CLOSE_CONTEXT_MENU_TYPE, MenuOffsetKind } from '../../common/Menu.vue'
import type { CachedColumnConf } from '../../conf'
import { FUN_MODIFY_COLUMN_TYPE } from '../../events'

const props = defineProps<{
  curColumnConf: CachedColumnConf | undefined
  pkColumnName: string
  columnsConf: CachedColumnConf[]
}>()
const modifyColumnFun = inject(FUN_MODIFY_COLUMN_TYPE)!
const closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!
const iconPickerCompRef = ref()

async function renameColumn(event: Event) {
  const target = event.target as HTMLInputElement
  if (props.curColumnConf) {
    await modifyColumnFun({
      name: props.curColumnConf.name,
      title: target.value,
      icon: props.curColumnConf.icon,
      dataKind: props.curColumnConf.dataKind,
      dataEditable: props.curColumnConf.dataEditable,
      useDict: props.curColumnConf.useDict,
      dictEditable: props.curColumnConf.dictEditable,
      multiValue: props.curColumnConf.multiValue,
      kindDateTimeFormat: props.curColumnConf.kindDateTimeFormat,
    })
  }
  closeContextMenuFun()
}

async function showIconContainer(event: Event) {
  iconPickerCompRef.value.show(event, MenuOffsetKind.MEDIUM_BOTTOM, undefined, true)
}

async function selectIcon(icon: string) {
  if (props.curColumnConf) {
    props.curColumnConf.icon = icon
    await modifyColumnFun(props.curColumnConf)
  }
}
</script>

<template>
  <div class="iw-contextmenu__item flex justify-between items-center w-full">
    <i
      :class="`${props.curColumnConf?.icon} cursor-pointer mr-1`"
      @click="showIconContainer"
    />
    <input
      class="input input-bordered input-xs w-28 flex-1" type="text"
      :value="props.curColumnConf?.title" @change="renameColumn"
    >
  </div>
  <IconPickerComp ref="iconPickerCompRef" @select-icon="selectIcon" />
</template>
