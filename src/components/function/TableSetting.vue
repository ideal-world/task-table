<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import { delegateEvent } from '../../utils/basic'
import { MenuOffsetKind } from '../common/Menu'
import MenuComp from '../common/Menu.vue'
import type { ColumnConf, LayoutConf, TableConf } from '../conf'
import BasicSettingComp from './BasicSetting.vue'
import ColumnShowSettingComp from './ColumnShowSetting.vue'
import GroupSettingComp from './GroupSetting.vue'
import SubDataShowSettingComp from './SubDataShowSetting.vue'
import TableLocalesSettingComp from './TableLocalesSetting.vue'
import TableResizeSettingComp from './TableResizeSetting.vue'
import TableThemeSettingComp from './TableThemeSetting.vue'

const props = defineProps<{
  // 表格配置
  // Table configuration
  tableConf: TableConf
  // 布局配置
  layoutConf: LayoutConf
  // 可能涉及的列配置
  // Possible column configuration
  columnsConf: ColumnConf[]
  // 布局数量
  // Layout quantity
  layoutLength: number
}>()
const tableSettingCompRef = ref<InstanceType<typeof MenuComp>>()

onMounted(() => {
  tableSettingCompRef.value?.onInit(async (menuEle: HTMLElement) => {
    delegateEvent(menuEle, 'click', '.iw-table-setting-title', (e: Event) => {
      const toggleEle = (e.target as HTMLElement).nextSibling as HTMLElement
      const arrowEle = (e.target as HTMLElement).childNodes[1] as HTMLElement
      console.log('e.target', arrowEle)
      if (!toggleEle)
        return
      toggleEle.style.display
        = toggleEle.style.display === 'none' ? 'block' : 'none'
      if (!arrowEle)
        return
      arrowEle.style.transform
        = arrowEle.style.transform === 'rotate(0deg)'
          ? 'rotate(-180deg)'
          : 'rotate(0deg)'
    })
  })
})

function handleSetModalShow(e: Event) {
  tableSettingCompRef.value?.show(
    e.target as HTMLElement,
    MenuOffsetKind.RIGHT_TOP,
    { width: 220 },
    false,
    (e.target as HTMLElement).closest('.iw-tt') as HTMLElement,
  )
}
</script>

<template>
  <a class="cursor-pointer">
    <i :class="iconSvg.SETTING" class="text-base" @click="handleSetModalShow" /></a>
  <MenuComp ref="tableSettingCompRef" style="width: 372px">
    <BasicSettingComp
      :layout-conf="props.layoutConf"
      :layout-length="props.layoutLength"
    />
    <!-- <LayoutSettingComp
      :table-conf="props.tableConf"
      :layout-conf="props.layoutConf"
      :layout-length="props.layoutLength"
    /> -->
    <template v-if="props.tableConf.parentPkColumnName">
      <SubDataShowSettingComp
        :sub-data-show-kind="props.layoutConf.subDataShowKind"
      />
    </template>
    <GroupSettingComp
      v-if="props.layoutConf.group"
      :layout-id="props.layoutConf.id"
      :group="props.layoutConf.group"
      :columns-conf="props.columnsConf"
    />
    <ColumnShowSettingComp
      :layout-id="props.layoutConf.id"
      :layout-columns="props.layoutConf.columns"
      :table-conf="props.tableConf"
    />
    <!-- <div class="iw-divider cursor-pointer iw-table-setting-title">
      {{ $t('_.table.moreSettingTitle') }}
    </div> -->
    <div class="w-full" style="display: none">
      <TableResizeSettingComp
        :size="props.tableConf.styles.size"
        :styles="props.tableConf.styles"
      />
      <TableThemeSettingComp />
      <TableLocalesSettingComp />
    </div>
  </MenuComp>
</template>
