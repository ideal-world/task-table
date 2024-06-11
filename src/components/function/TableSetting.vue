<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import { IwUtils } from '../../utils'
import MenuComp, { MenuOffsetKind } from '../common/Menu.vue'
import type { TableBasicConf, TableLayoutConf } from '../conf'
import BasicSettingComp from './BasicSetting.vue'
import ColumnShowSettingComp from './ColumnShowSetting.vue'
import GroupSettingComp from './GroupSetting.vue'
import LayoutSettingComp from './LayoutSetting.vue'
import ResizeSettingComp from './ResizeSetting.vue'
import SubDataShowSettingComp from './SubDataShowSetting.vue'
import ThemeSettingComp from './ThemeSetting.vue'

const props = defineProps<{
  basicConf: TableBasicConf
  layoutConf: TableLayoutConf
  layoutLength: number
}>()
const tableSettingCompRef = ref<InstanceType<typeof MenuComp>>()

onMounted(() => {
  tableSettingCompRef.value?.onInit(async (menuEle: HTMLElement) => {
    IwUtils.delegateEvent(menuEle, 'click', '.iw-table-setting-title', (e: Event) => {
      const toggleEle = (e.target as HTMLElement).nextSibling as HTMLElement
      toggleEle.style.display = toggleEle.style.display === 'none' ? 'block' : 'none'
    })
  })
})
</script>

<template>
  <a class="cursor-pointer">
    <i
      :class="iconSvg.MORE"
      @click="(e) => { tableSettingCompRef?.show(e, MenuOffsetKind.RIGHT_TOP, undefined, false, (e.target as HTMLElement).closest('.iw-tt') as HTMLElement) }"
    /></a>
  <MenuComp ref="tableSettingCompRef">
    <BasicSettingComp :layout-conf="props.layoutConf" />
    <template v-if="props.basicConf.parentPkColumnName">
      <SubDataShowSettingComp :sub-data-show-kind="props.layoutConf.subDataShowKind" />
    </template>
    <GroupSettingComp :group="props.layoutConf.group" :columns-conf="props.basicConf.columns" />
    <ColumnShowSettingComp :layout-column-conf="props.layoutConf.columns" :basic-conf="props.basicConf" />
    <LayoutSettingComp :layout-conf="props.layoutConf" :layout-length="props.layoutLength" />
    <div class="iw-divider cursor-pointer iw-table-setting-title">
      {{ $t('_.table.moreSettingTitle') }}
    </div>
    <div style="display: none;">
      <ResizeSettingComp :size="props.basicConf.styles.size" :styles="props.basicConf.styles" />
      <ThemeSettingComp :styles="props.basicConf.styles" />
    </div>
  </MenuComp>
</template>
