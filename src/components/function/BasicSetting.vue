<script setup lang="ts">
import { ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import type { LayoutModifyProps } from '../../props'
import IconPickerComp from '../common/IconPicker.vue'
import { MenuOffsetKind } from '../common/Menu'
import type MenuComp from '../common/Menu.vue'
import type { LayoutConf } from '../conf'
import * as eb from '../eventbus'

const props = defineProps<{
  // 布局配置
  // Layout configuration
  layoutConf: LayoutConf
}>()
const iconPickerCompRef = ref<InstanceType<typeof MenuComp>>()

async function renameLayoutTitle(e: Event) {
  const layout: LayoutModifyProps = {
    title: (e.target as HTMLInputElement).value,
  }
  await eb.modifyLayout(layout)
}

async function setLayoutIcon(icon: string) {
  const layout: LayoutModifyProps = {
    icon,
  }
  await eb.modifyLayout(layout)
}
</script>

<template>
  <div class="iw-contextmenu__item flex items-center justify-between w-full">
    <i
      :class="`${props.layoutConf.icon ? props.layoutConf.icon : iconSvg.TEXT} text-lg mr-1`"
      class="cursor-pointer" @click="e => { iconPickerCompRef?.show(e, MenuOffsetKind.RIGHT_TOP, undefined, true) }"
    />
    <input
      :value="props.layoutConf.title" class="flex-1 iw-input iw-input-bordered iw-input-sm w-28" type="text"
      :placeholder="$t('layout.title.rename')"
      @change="renameLayoutTitle"
    >
    <IconPickerComp ref="iconPickerCompRef" @select-icon="setLayoutIcon" />
  </div>
</template>
