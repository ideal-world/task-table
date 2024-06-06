<script setup lang="ts">
import * as iconSvg from '../../assets/icon'
import type { TableDataGroupProps } from '../../props'
import type { TableColumnConf } from '../conf'
import * as eb from '../eventbus'

const props = defineProps<{
  group?: TableDataGroupProps
  columnsConf: TableColumnConf[]
}>()

async function setGroupColumn(columnName: string) {
  if (props.group && props.group.columnName !== columnName) {
    await eb.modifyLayout({
      group: {
        columnName,
        groupOrderDesc: props.group.groupOrderDesc,
        hideEmptyRecord: props.group.hideEmptyRecord,
      },
    })
  }
  else if (props.group) {
    await eb.modifyLayout({
      removeGroup: true,
    })
  }
  else {
    await eb.modifyLayout({
      group: {
        columnName,
        groupOrderDesc: false,
        hideEmptyRecord: false,
      },
    })
  }
}

async function setGroupDescSort() {
  if (props.group) {
    await eb.modifyLayout({
      group: {
        columnName: props.group.columnName,
        groupOrderDesc: !props.group.groupOrderDesc,
        hideEmptyRecord: props.group.hideEmptyRecord,
      },
    })
  }
}

async function setGroupHideEmpty() {
  if (props.group) {
    await eb.modifyLayout({
      group: {
        columnName: props.group.columnName,
        groupOrderDesc: props.group.groupOrderDesc,
        hideEmptyRecord: !props.group.hideEmptyRecord,
      },
    })
  }
}
</script>

<template>
  <div
    class="iw-divider mt-1 mb-1 ml-2 mr-2"
  >
    {{ $t('function.group.columnsTitle') }}
  </div>
  <div
    v-for="column in props.columnsConf.filter(columnConf => columnConf.groupable)"
    :key="column.name" class="iw-contextmenu__item flex items-center justify-between w-full"
  >
    <span>
      <i :class="column.icon" />
      {{ column.title }}
    </span>
    <input
      type="checkbox" class="iw-toggle iw-toggle-xs"
      :checked="column.name === props.group?.columnName"
      @click="setGroupColumn(column.name)"
    >
  </div>
  <div
    class="iw-divider mt-1 mb-1 ml-2 mr-2"
  >
    {{ $t('function.group.moreConfTitle') }}
  </div>
  <div class="flex justify-between items-center w-full mr-2">
    <span>
      <i :class="iconSvg.SORT" />
      {{ $t('function.group.groupSortTitle') }}
    </span>
    <input
      type="checkbox" class="iw-toggle iw-toggle-xs"
      :checked="props.group?.groupOrderDesc"
      @click="setGroupDescSort"
    >
  </div>
  <div class="flex justify-between items-center w-full mr-2">
    <span>
      <i :class="iconSvg.SORT" />
      {{ $t('function.group.hideEmptyTitle') }}
    </span>
    <input
      type="checkbox" class="iw-toggle iw-toggle-xs"
      :checked="props.group?.hideEmptyRecord"
      @click="setGroupHideEmpty"
    >
  </div>
</template>

<style scoped>
.iw-divider::before{
  height: 0.05rem;
}
.iw-divider::after{
  height: 0.05rem;
}
</style>
