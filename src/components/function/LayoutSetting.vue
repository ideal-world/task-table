<script setup lang="ts">
import { ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import { SubDataShowKind, type TableLayoutModifyProps } from '../../props'
import IconPickerComp from '../common/IconPicker.vue'
import MenuComp, { MenuOffsetKind, MenuSizeKind } from '../common/Menu.vue'
import type { TableBasicConf, TableLayoutConf } from '../conf'
import * as eb from '../eventbus'
import ColumnShowSettingComp from './ColumnShowSetting.vue'
import GroupSettingComp from './GroupSetting.vue'
import SubDataShowSettingComp from './SubDataShowSetting.vue'

const props = defineProps<{
  basicConf: TableBasicConf
  layoutConf: TableLayoutConf
  layoutLength: number
}>()
const layoutSettingCompRef = ref<InstanceType<typeof MenuComp>>()
const iconPickerCompRef = ref<InstanceType<typeof MenuComp>>()
const confirmDeleteLayoutCompRef = ref<InstanceType<typeof MenuComp>>()
const confirmResetLayoutCompRef = ref<InstanceType<typeof MenuComp>>()

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

async function deleteLayout() {
  await eb.deleteLayout(props.layoutConf.id)
  confirmDeleteLayoutCompRef.value?.close()
}

async function resetLayout() {
  const layout: TableLayoutModifyProps = {
    filters: [],
    sorts: [],
    removeGroup: true,
    aggs: {},
    groupSlices: {},
    subDataShowKind: SubDataShowKind.FOLD_SUB_DATA,
    defaultSlice: {
      offsetNumber: 0,
      fetchNumber: props.layoutConf.defaultSlice.fetchNumber,
      fetchNumbers: props.layoutConf.defaultSlice.fetchNumbers,
    },
  }
  await eb.modifyLayout(layout)
  confirmResetLayoutCompRef.value?.close()
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
        class="iw-btn iw-btn-xs"
        :title="$t('layout.reset.title')"
        @click="e => { confirmResetLayoutCompRef?.show(e, MenuOffsetKind.RIGHT_TOP, MenuSizeKind.MINI, true) }"
      >
        <i :class="`${iconSvg.RESET}`" />
        <span>{{ $t('layout.reset.title') }}</span>
      </button>
      <MenuComp ref="confirmResetLayoutCompRef">
        <div class="iw-contextmenu__item flex items-center justify-between w-full text-error">
          {{ $t('layout.reset.confirm', { title: props.layoutConf.title }) }}
        </div>
        <div class="iw-contextmenu__item flex items-center justify-between w-full pl-2 pr-2">
          <button
            class="iw-btn iw-btn-secondary iw-btn-xs"
            @click="resetLayout"
          >
            <i :class="`${iconSvg.CONFIRM}`" />
          </button>
          <button
            class="iw-btn iw-btn-xs"
            @click="e => { confirmResetLayoutCompRef?.close() }"
          >
            <i :class="`${iconSvg.CANCEL}`" />
          </button>
        </div>
      </MenuComp>
      <button
        v-if="props.layoutLength > 1"
        class="iw-btn iw-btn-xs"
        :title="$t('layout.delete.title')"
        @click="e => { confirmDeleteLayoutCompRef?.show(e, MenuOffsetKind.RIGHT_TOP, MenuSizeKind.MINI, true) }"
      >
        <i :class="`${iconSvg.TRASH}`" />
        <span>{{ $t('layout.delete.title') }}</span>
      </button>
      <MenuComp ref="confirmDeleteLayoutCompRef">
        <div class="iw-contextmenu__item flex items-center justify-between w-full text-error">
          {{ $t('layout.delete.confirm', { title: props.layoutConf.title }) }}
        </div>
        <div class="iw-contextmenu__item flex items-center justify-between w-full pl-2 pr-2">
          <button
            class="iw-btn iw-btn-secondary iw-btn-xs"
            @click="deleteLayout"
          >
            <i :class="`${iconSvg.CONFIRM}`" />
          </button>
          <button
            class="iw-btn iw-btn-xs"
            @click="e => { confirmDeleteLayoutCompRef?.close() }"
          >
            <i :class="`${iconSvg.CANCEL}`" />
          </button>
        </div>
      </MenuComp>
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
