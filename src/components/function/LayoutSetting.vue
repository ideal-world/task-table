<script setup lang="ts">
import { ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import MenuComp, { MenuOffsetKind } from '../common/Menu.vue'
import type { TableBasicConf, TableLayoutConf } from '../conf'
import ColumnShowSettingComp from './ColumnShowSetting.vue'
import GroupSettingComp from './GroupSetting.vue'
import SubDataShowSettingComp from './SubDataShowSetting.vue'

const props = defineProps<{
  basicConf: TableBasicConf
  layoutConf: TableLayoutConf
}>()
const columnCompRef = ref<InstanceType<typeof MenuComp>>()

function collapseEle(e: Event) {
  const toggleEle = (e.target as HTMLElement).nextSibling as HTMLElement
  toggleEle.style.display = toggleEle.style.display === 'none' ? 'block' : 'none'
}
</script>

<template>
  <a class="cursor-pointer"><i :class="iconSvg.MORE" @click="(e) => { columnCompRef?.show(e, MenuOffsetKind.RIGHT_TOP) }" /></a>
  <MenuComp ref="columnCompRef">
    <template v-if="props.basicConf.parentPkColumnName">
      <div class="iw-divider font-bold">
        {{ $t('layout.subData.title') }}
      </div>
      <div>
        <SubDataShowSettingComp :sub-data-show-kind="props.layoutConf.subDataShowKind" />
      </div>
    </template>
    <div
      class="iw-divider font-bold cursor-pointer" @click="collapseEle"
    >
      {{ $t('function.group.groupTitle') }}
    </div>
    <div style="display: none;">
      <GroupSettingComp :group="props.layoutConf.group" :columns-conf="props.basicConf.columns" />
    </div>
    <div
      class="iw-divider font-bold cursor-pointer" @click="collapseEle"
    >
      {{ $t('function.column.showTitle') }}
    </div>
    <div style="display: none;">
      <ColumnShowSettingComp :layout-column-conf="props.layoutConf.columns" :basic-conf="props.basicConf" />
    </div>
  </MenuComp>
</template>
