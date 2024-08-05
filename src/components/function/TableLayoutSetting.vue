<script setup lang="ts">
import { ref } from 'vue'
import { MenuOffsetKind } from '../common/Menu'
import MenuComp from '../common/Menu.vue'
import type { ColumnConf, LayoutConf, TableConf } from '../conf'
import BasicSettingComp from './BasicSetting.vue'
import ColumnShowSettingComp from './ColumnShowSetting.vue'
import GroupSettingComp from './GroupSetting.vue'
import SubDataShowSettingComp from './SubDataShowSetting.vue'

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

// 表格布局设置菜单
// Table layout setting menu
const tableLayoutSettingRef = ref<InstanceType<typeof MenuComp>>()

defineExpose({
  /**
   * 表格布局设置菜单
   *
   * Table layout setting menu
   */
  tableLayoutSettingRef,
})
</script>

<template>
  <MenuComp ref="tableLayoutSettingRef" style="width: 372px">
    <BasicSettingComp :table-layout-setting-ref="tableLayoutSettingRef" :layout-conf="props.layoutConf" :layout-length="props.layoutLength" />
    <template v-if="props.tableConf.parentPkColumnName">
      <SubDataShowSettingComp :sub-data-show-kind="props.layoutConf.subDataShowKind" />
    </template>
    <GroupSettingComp v-if="props.layoutConf.group" :layout-id="props.layoutConf.id" :group="props.layoutConf.group" :columns-conf="props.columnsConf" />
    <ColumnShowSettingComp :layout-id="props.layoutConf.id" :layout-columns="props.layoutConf.columns" :table-conf="props.tableConf" />
  </MenuComp>
</template>
