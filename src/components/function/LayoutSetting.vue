<script setup lang="ts">
import { ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import * as eb from '../eventbus'
import MenuComp, { MenuOffsetKind } from '../common/Menu.vue'
import type { TableBasicConf, TableLayoutConf } from '../conf'
import type { TableLayoutModifyProps } from '../../props'
import IconPickerComp from '../common/IconPicker.vue'
import ColumnShowSettingComp from './ColumnShowSetting.vue'
import GroupSettingComp from './GroupSetting.vue'
import SubDataShowSettingComp from './SubDataShowSetting.vue'

const props = defineProps<{
  basicConf: TableBasicConf
  layoutConf: TableLayoutConf
}>()
const layoutSettingCompRef = ref<InstanceType<typeof MenuComp>>()
const iconPickerCompRef = ref<InstanceType<typeof MenuComp>>()

async function renameLayoutTitle() {
  const layout: TableLayoutModifyProps = {
    title: props.layoutConf.title,
  }
  await eb.modifyLayout(layout)
}

async function setLayoutIcon(icon: string) {
  const layout: TableLayoutModifyProps = {
    icon,
  }
  await eb.modifyLayout(layout)
}

function deleteLayout() {
  eb.deleteLayout(props.layoutConf.id)
}

function collapseEle(e: Event) {
  const toggleEle = (e.target as HTMLElement).nextSibling as HTMLElement
  toggleEle.style.display = toggleEle.style.display === 'none' ? 'block' : 'none'
}
</script>

<template>
  <a class="cursor-pointer"><i :class="iconSvg.MORE" @click="(e) => { layoutSettingCompRef?.show(e, MenuOffsetKind.RIGHT_TOP) }" /></a>
  <MenuComp ref="layoutSettingCompRef">
    <div class="iw-contextmenu__item flex items-center justify-between w-full">
      <i
        :class="`${props.layoutConf.icon ? props.layoutConf.icon : iconSvg.TEXT} text-lg mr-1`"
        class="cursor-pointer" @click="e => { iconPickerCompRef?.show(e, MenuOffsetKind.RIGHT_TOP, undefined, true) }"
      />
      <input
        v-model="props.layoutConf.title" class="flex-1 iw-input iw-input-bordered iw-input-sm w-28" type="text"
        :placeholder="$t('layout.title.rename')"
        @change="renameLayoutTitle"
      >
      <IconPickerComp ref="iconPickerCompRef" @select-icon="setLayoutIcon" />
    </div>
    <div class="iw-contextmenu__item flex items-center justify-between w-full">
      <button
        class="iw-btn m-1 flex-1"
        :title="$t('layout.delete.title')"
        @click="deleteLayout"
      >
        <i :class="`${iconSvg.TILE_ALL_DATA}`" class="text-lg" />
        <span class="text-xs font-normal">{{ $t('layout.delete.title') }}</span>
      </button>
    </div>

    <template v-if="props.basicConf.parentPkColumnName">
      <div class="iw-divider">
        {{ $t('layout.subData.title') }}
      </div>
      <div>
        <SubDataShowSettingComp :sub-data-show-kind="props.layoutConf.subDataShowKind" />
      </div>
    </template>
    <div
      class="iw-divider cursor-pointer" @click="collapseEle"
    >
      {{ $t('function.group.groupTitle') }}
    </div>
    <div style="display: none;">
      <GroupSettingComp :group="props.layoutConf.group" :columns-conf="props.basicConf.columns" />
    </div>
    <div
      class="iw-divider cursor-pointer" @click="collapseEle"
    >
      {{ $t('function.column.showTitle') }}
    </div>
    <div style="display: none;">
      <ColumnShowSettingComp :layout-column-conf="props.layoutConf.columns" :basic-conf="props.basicConf" />
    </div>
  </MenuComp>
</template>
