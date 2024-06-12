<script setup lang="ts">
import type { TableLayoutModifyProps } from '../../props'
import { type TableBasicConf, type TableLayoutColumnConf, convertLayoutColumnConfToLayoutColumnProps } from '../conf'
import * as eb from '../eventbus'

const props = defineProps<{
  layoutColumnConf: TableLayoutColumnConf[]
  basicConf: TableBasicConf
}>()

async function setShowToggleColumn(columnConf: TableLayoutColumnConf) {
  const changedLayoutReq: TableLayoutModifyProps = {
    changedColumn: {
      ...convertLayoutColumnConfToLayoutColumnProps(columnConf),
      hide: !columnConf.hide,
    },
  }
  await eb.modifyLayout(changedLayoutReq)
}
</script>

<template>
  <div
    class="iw-divider cursor-pointer iw-table-setting-title"
  >
    {{ $t('function.column.showTitle') }}
  </div>
  <div style="display: none;">
    <div v-for="column in props.layoutColumnConf.filter(column => column.name !== props.basicConf.pkColumnName)" :key="column.name" class="iw-contextmenu__item flex items-center justify-between w-full">
      <span>
        <i :class="props.basicConf.columns.find(col => col.name === column.name)?.icon" />
        {{ props.basicConf.columns.find(col => col.name === column.name)?.title }}
      </span>
      <input
        type="checkbox" class="iw-toggle iw-toggle-xs"
        :checked="!props.layoutColumnConf.find(col => col.name === column.name)!.hide"
        @click="setShowToggleColumn(column)"
      >
    </div>
  </div>
</template>
