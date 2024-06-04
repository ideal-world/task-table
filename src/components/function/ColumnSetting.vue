<script setup lang="ts">
import { ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import type { TableLayoutModifyProps } from '../../props'
import MenuComp, { MenuOffsetKind } from '../common/Menu.vue'
import type { TableColumnConf, TableLayoutColumnConf } from '../conf'
import * as eb from '../eventbus'

const props = defineProps<{
  basicColumnsConf: TableColumnConf[]
  layoutColumnsConf: TableLayoutColumnConf[]
  pkColumnName: string
}>()
const columnCompRef = ref<InstanceType<typeof MenuComp>>()

async function setShowToggleColumn(columnConf: TableLayoutColumnConf) {
  const changedLayoutReq: TableLayoutModifyProps = {
    changedColumn: {
      name: columnConf.name,
      wrap: columnConf.wrap,
      fixed: columnConf.fixed,
      width: columnConf.width,
      hide: !columnConf.hide,
      dateStart: columnConf.dateStart,
      dateEnd: columnConf.dateEnd,
      render: columnConf.render,
    },
  }
  await eb.modifyLayout(changedLayoutReq)
}
</script>

<template>
  <a class="cursor-pointer"><i :class="iconSvg.MORE" @click="(e) => { columnCompRef?.show(e) }" /></a>
  <MenuComp ref="columnCompRef">
    <div class="iw-divider">
      {{ $t('function.column.showTitle') }}
    </div>
    <div v-for="column in props.layoutColumnsConf.filter(column => column.name !== props.pkColumnName)" :key="column.name" class="iw-contextmenu__item flex justify-between w-full">
      <span>
        <i :class="props.basicColumnsConf.find(col => col.name === column.name)?.icon" />
        {{ props.basicColumnsConf.find(col => col.name === column.name)?.title }}
      </span>
      <input
        type="checkbox" class="iw-toggle iw-toggle-xs"
        :checked="!props.layoutColumnsConf.find(col => col.name === column.name)?.hide ?? false"
        @click="setShowToggleColumn(column)"
      >
    </div>
  </MenuComp>
</template>
