<script setup lang="ts">
import { inject, ref } from 'vue'
import IconPickerComp from '../../common/IconPicker.vue'
import { FUN_CLOSE_CONTEXT_MENU_TYPE, MenuOffsetKind } from '../../common/Menu.vue'
import type { CachedColumnConf } from '../../conf'
import { FUN_MODIFY_COLUMN_TYPE } from '../../events'

const props = defineProps<{
  curColumnConf: CachedColumnConf
  pkColumnName: string
  columnsConf: CachedColumnConf[]
}>()
const modifyColumnFun = inject(FUN_MODIFY_COLUMN_TYPE)!
const closeContextMenuFun = inject(FUN_CLOSE_CONTEXT_MENU_TYPE)!
const iconPickerCompRef = ref<InstanceType<typeof IconPickerComp>>()

async function renameColumn(event: Event) {
  const target = event.target as HTMLInputElement
  await modifyColumnFun({
    name: props.curColumnConf.name,
    title: target.value,
    icon: props.curColumnConf.icon,
    dataKind: props.curColumnConf.dataKind,
    dataEditable: props.curColumnConf.dataEditable,
    useDict: props.curColumnConf.useDict,
    dictEditable: props.curColumnConf.dictEditable,
    multiValue: props.curColumnConf.multiValue,
    groupable: props.curColumnConf.groupable,
    kindDateTimeFormat: props.curColumnConf.kindDateTimeFormat,
  })
  closeContextMenuFun()
}

async function showIconContainer(event: MouseEvent) {
  iconPickerCompRef.value?.show(event, MenuOffsetKind.MEDIUM_BOTTOM)
}

async function selectIcon(icon: string) {
  props.curColumnConf.icon = icon
  await modifyColumnFun(props.curColumnConf)
}
</script>

<template>
  <div class="iw-contextmenu__item flex justify-between items-center w-full">
    <i
      :class="`${props.curColumnConf.icon} cursor-pointer mr-1`"
      @click="showIconContainer"
    />
    <input
      class="iw-input iw-input-bordered iw-input-xs w-28 flex-1" type="text"
      :value="props.curColumnConf.title" @change="renameColumn"
    >
  </div>
  <IconPickerComp ref="iconPickerCompRef" @select-icon="selectIcon" />
</template>
