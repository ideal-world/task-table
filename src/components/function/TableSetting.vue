<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import { IwUtils } from '../../utils'
import MenuComp, { MenuOffsetKind } from '../common/Menu.vue'
import type { ColumnConf, LayoutConf, TableConf } from '../conf'
import BasicSettingComp from './BasicSetting.vue'
import ColumnShowSettingComp from './ColumnShowSetting.vue'
import GroupSettingComp from './GroupSetting.vue'
import LayoutSettingComp from './LayoutSetting.vue'
import SubDataShowSettingComp from './SubDataShowSetting.vue'
import TableResizeSettingComp from './TableResizeSetting.vue'
import TableThemeSettingComp from './TableThemeSetting.vue'
import TableLocalesSettingComp from './TableLocalesSetting.vue'

const props = defineProps<{
  tableConf: TableConf
  layoutConf: LayoutConf
  layoutColumnsConf: ColumnConf[]
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
      :class="iconSvg.SETTING"
      class="text-base"
      @click="(e) => { tableSettingCompRef?.show(e, MenuOffsetKind.RIGHT_TOP, { width: 220 }, false, (e.target as HTMLElement).closest('.iw-tt') as HTMLElement) }"
    /></a>
  <MenuComp ref="tableSettingCompRef">
    <BasicSettingComp :layout-conf="props.layoutConf" />
    <LayoutSettingComp :table-conf="props.tableConf" :layout-conf="props.layoutConf" :layout-length="props.layoutLength" />
    <template v-if="props.tableConf.parentPkColumnName">
      <SubDataShowSettingComp :sub-data-show-kind="props.layoutConf.subDataShowKind" />
    </template>
    <GroupSettingComp v-if="props.layoutConf.group" :layout-id="props.layoutConf.id" :group="props.layoutConf.group" :layout-columns-conf="props.layoutColumnsConf" />
    <ColumnShowSettingComp :layout-id="props.layoutConf.id" :layout-columns="props.layoutConf.columns" :table-conf="props.tableConf" />
    <div class="iw-divider cursor-pointer iw-table-setting-title">
      {{ $t('_.table.moreSettingTitle') }}
    </div>
    <div style="display: none;">
      <TableResizeSettingComp :size="props.tableConf.styles.size" :styles="props.tableConf.styles" />
      <TableThemeSettingComp />
      <TableLocalesSettingComp />
    </div>
  </MenuComp>
</template>
