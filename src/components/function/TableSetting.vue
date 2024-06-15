<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import { IwUtils } from '../../utils'
import MenuComp, { MenuOffsetKind } from '../common/Menu.vue'
import type { TableBasicConf, TableLayoutConf } from '../Initializer'
import BasicSettingComp from './BasicSetting.vue'
import ColumnShowSettingComp from './ColumnShowSetting.vue'
import GroupSettingComp from './GroupSetting.vue'
import LayoutSettingComp from './LayoutSetting.vue'
import SubDataShowSettingComp from './SubDataShowSetting.vue'
import TableResizeSettingComp from './TableResizeSetting.vue'
import TableThemeSettingComp from './TableThemeSetting.vue'

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
      @click="(e) => { tableSettingCompRef?.show(e, MenuOffsetKind.RIGHT_TOP, { width: 220 }, false, (e.target as HTMLElement).closest('.iw-tt') as HTMLElement) }"
    /></a>
  <MenuComp ref="tableSettingCompRef">
    <BasicSettingComp :layout-conf="props.layoutConf" />
    <LayoutSettingComp :basic-conf="props.basicConf" :layout-conf="props.layoutConf" :layout-length="props.layoutLength" />
    <template v-if="props.basicConf.parentPkColumnName">
      <SubDataShowSettingComp :sub-data-show-kind="props.layoutConf.subDataShowKind" />
    </template>
    <GroupSettingComp :group="props.layoutConf.group" :columns-conf="props.basicConf.columns" />
    <ColumnShowSettingComp :layout-column-conf="props.layoutConf.columns" :basic-conf="props.basicConf" />
    <div class="iw-divider cursor-pointer iw-table-setting-title">
      {{ $t('_.table.moreSettingTitle') }}
    </div>
    <div style="display: none;">
      <TableResizeSettingComp :size="props.basicConf.styles.size" :styles="props.basicConf.styles" />
      <TableThemeSettingComp :styles="props.basicConf.styles" />
    </div>
  </MenuComp>
</template>
