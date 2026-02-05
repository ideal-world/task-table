<script setup lang="ts">
import { ref } from 'vue'
import MenuComp from '../common/Menu.vue'
import type { ColumnConf, LayoutConf, TableConf } from '../conf'
import { LayoutKind } from '../../props/enumProps'
import BasicSettingComp from './BasicSetting.vue'
import ColumnShowSettingComp from './ColumnShowSetting.vue'
import GroupSettingComp from './GroupSetting.vue'
import SubDataShowSettingComp from './SubDataShowSetting.vue'
import GanttTimeShowSetting from './GanttTimeShowSetting.vue'
import GanttRemarkShowSetting from './GanttRemarkShowSetting.vue'
import GanttViewModeSetting from './GanttViewModeSetting.vue'
import GanttDataKindShowSetting from './GanttDataKindShowSetting.vue'

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
    <BasicSettingComp :table-layout-setting-ref="tableLayoutSettingRef" :table-conf="tableConf" :layout-conf="props.layoutConf" :layout-length="props.layoutLength" />
    <template v-if="props.tableConf.parentPkColumnName">
      <SubDataShowSettingComp :sub-data-show-kind="props.layoutConf.subDataShowKind" />
    </template>
    <GroupSettingComp v-if="props.layoutConf.group && props.layoutConf.layoutKind !== LayoutKind.GANTT_NEW" :layout-id="props.layoutConf.id" :group="props.layoutConf.group" :columns-conf="props.columnsConf" />
    <ColumnShowSettingComp :layout-id="props.layoutConf.id" :layout-conf="props.layoutConf" :table-conf="props.tableConf" />
    <template v-if="props.layoutConf.layoutKind === LayoutKind.GANTT_NEW">
      <template v-if="props.layoutConf.ganttConf?.kind === 'task'">
        <GanttTimeShowSetting :layout-id="props.layoutConf.id" :layout-conf="props.layoutConf" :table-conf="props.tableConf" />
        <GanttRemarkShowSetting :layout-id="props.layoutConf.id" :layout-conf="props.layoutConf" :table-conf="props.tableConf" />
      </template>
      <GanttDataKindShowSetting v-else :layout-id="props.layoutConf.id" :layout-conf="props.layoutConf" :table-conf="props.tableConf" />
      <GanttViewModeSetting :layout-id="props.layoutConf.id" :layout-conf="props.layoutConf" :table-conf="props.tableConf" />
    </template>
  </MenuComp>
</template>
