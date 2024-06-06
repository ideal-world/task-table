<script setup lang="ts">
import type { TableLayoutModifyProps } from '../../props';
import type { TableBasicConf, TableLayoutColumnConf } from '../conf';
import * as eb from '../eventbus';

const props = defineProps<{
  layoutColumnConf: TableLayoutColumnConf[]
  basicConf: TableBasicConf
}>()

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
  <div v-for="column in props.layoutColumnConf.filter(column => column.name !== props.basicConf.pkColumnName)" :key="column.name" class="iw-contextmenu__item flex justify-between w-full">
    <span>
      <i :class="props.basicConf.columns.find(col => col.name === column.name)?.icon" />
      {{ props.basicConf.columns.find(col => col.name === column.name)?.title }}
    </span>
    <input
      type="checkbox" class="iw-toggle iw-toggle-xs"
      :checked="!props.layoutColumnConf.find(col => col.name === column.name)?.hide ?? false"
      @click="setShowToggleColumn(column)"
    >
  </div>
</template>
