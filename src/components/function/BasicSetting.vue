<script setup lang="ts">
import { ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import {
  type LayoutModifyProps,
  SubDataShowKind,
  generateDataSliceProps,
} from '../../props'
import IconPickerComp from '../common/IconPicker.vue'
import { MenuOffsetKind, MenuSizeKind } from '../common/Menu'
import MenuComp from '../common/Menu.vue'
import type { LayoutConf } from '../conf'
import * as eb from '../eventbus'
import { deepToRaw } from '../../utils/vueHelper'

const props = defineProps<{
  // 布局配置
  // Layout configuration
  layoutConf: LayoutConf
  // 布局数量
  // Layout quantity
  layoutLength: number
}>()
const iconPickerCompRef = ref<InstanceType<typeof MenuComp>>()
const confirmDeleteLayoutCompRef = ref<InstanceType<typeof MenuComp>>()
const confirmResetLayoutCompRef = ref<InstanceType<typeof MenuComp>>()
const showNewLayoutContainer = ref<boolean>(false)

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

function handleToggle(e: Event, isShow: boolean) {
  console.log('e', e)
  const toggleEle = (e.target as HTMLElement).nextSibling as HTMLElement
  toggleEle.style.display = isShow ? 'block' : 'none'
}

async function deleteLayout() {
  await eb.deleteLayout(props.layoutConf.id)
  confirmDeleteLayoutCompRef.value?.close()
}

async function resetLayout() {
  const layout: LayoutModifyProps = {
    slice: generateDataSliceProps(),
    subDataShowKind: SubDataShowKind.FOLD_SUB_DATA,
  }
  props.layoutConf.filter
  && (layout.filter = {
    enabledColumnNames: props.layoutConf.filter.enabledColumnNames,
    groups: [],
  })
  props.layoutConf.group
  && (layout.group = {
    enabledColumnNames: props.layoutConf.group.enabledColumnNames,
  })
  props.layoutConf.sort
  && (layout.sort = {
    enabledColumnNames: props.layoutConf.sort.enabledColumnNames,
    items: [],
  })
  props.layoutConf.agg
  && (layout.agg = {
    enabledColumnNames: props.layoutConf.agg.enabledColumnNames,
    items: [],
  })
  await eb.modifyLayout(layout)
  confirmResetLayoutCompRef.value?.close()
}

async function copyLayout() {
  const newLayout = deepToRaw(props.layoutConf)
  delete newLayout.data
  newLayout.selectedDataPks = []
  newLayout.title = `${props.layoutConf.title} - Copy`
  await eb.newLayout(newLayout)
}
</script>

<template>
  <div class="iw-contextmenu__item flex items-center justify-between w-full px-4">
    <div class="left-box flex items-center">
      <i
        :class="`${props.layoutConf.icon ? props.layoutConf.icon : iconSvg.TEXT
        } text-lg mr-1`" class="cursor-pointer" @click="(e) => {
          iconPickerCompRef?.show(
            e,
            MenuOffsetKind.RIGHT_TOP,
            undefined,
            true,
          );
        }
        "
      />
      <input
        :value="props.layoutConf.title" class="iw-input iw-input-sm w-28" type="text"
        :placeholder="$t('layout.title.rename')" @change="renameLayoutTitle" @click="(e) => handleToggle(e, false)"
        @blur="(e) => handleToggle(e, true)"
      >
      <i class="octicon-pencil-24 icon-edit pointer-events-none" style="display: block; margin-left: -10px" />
    </div>
    <div class="rightbox">
      <i
        class="text-lg cursor-pointer mr-2" :class="[`${iconSvg.RESET}`]" :title="$t('layout.reset.title')" @click="(e) => {
          confirmResetLayoutCompRef?.show(
            e,
            MenuOffsetKind.RIGHT_TOP,
            MenuSizeKind.MINI,
            true,
          );
        }
        "
      />
      <i
        class="text-lg cursor-pointer mr-2" :class="[`${iconSvg.COPY}`]" :title="$t('layout.copy.title')"
        @click="copyLayout"
      />
      <i
        v-if="layoutLength > 1" class="text-lg cursor-pointer text-[#dc2626]" :class="[`${iconSvg.TRASH}`]" :title="$t('layout.delete.title')" @click="(e) => {
          confirmDeleteLayoutCompRef?.show(
            e,
            MenuOffsetKind.RIGHT_TOP,
            MenuSizeKind.MINI,
            true,
          );
        }
        "
      />
    </div>

    <IconPickerComp ref="iconPickerCompRef" @select-icon="setLayoutIcon" />
    <MenuComp ref="confirmResetLayoutCompRef" class="p-2">
      <div class="iw-contextmenu__item flex items-center justify-between w-full mb-2">
        <i class="octicon-question-24 mr-2" />
        {{ $t("layout.reset.confirm", { title: props.layoutConf.title }) }}
      </div>
      <div class="iw-contextmenu__item flex justify-end w-full pl-2 pr-2">
        <button class="iw-btn iw-btn-primary iw-btn-xs text-white" @click="resetLayout">
          {{ $t("layout.reset.title") }}
        </button>
      </div>
    </MenuComp>
    <MenuComp ref="confirmDeleteLayoutCompRef" class="p-2">
      <div class="iw-contextmenu__item flex items-center justify-between w-full mb-2">
        <i class="octicon-question-24 mr-2" />
        {{ $t("layout.delete.confirm", { title: props.layoutConf.title }) }}
      </div>
      <div class="iw-contextmenu__item flex justify-end w-full pl-2 pr-2">
        <button class="iw-btn iw-btn-error iw-btn-xs text-white" @click="deleteLayout">
          {{ $t("layout.delete.title") }}
        </button>
      </div>
    </MenuComp>
  </div>
</template>
