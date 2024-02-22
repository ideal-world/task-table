<script setup lang="ts">
import { inject, ref } from 'vue'
import * as iconSvg from '../../assets/icon'
import MenuComp from '../common/Menu.vue'
import type { TableColumnConf } from '../conf'
import { FUN_LOAD_DATA_TYPE, FUN_MODIFY_LAYOUT_TYPE } from '../events'
import type { TableDataGroupProps } from '../props'

const props = defineProps<{
  group?: TableDataGroupProps
  columnsConf: TableColumnConf[]
}>()

const modifyLayoutFun = inject(FUN_MODIFY_LAYOUT_TYPE)!
const loadDataFun = inject(FUN_LOAD_DATA_TYPE)!
const groupCompRef = ref<InstanceType<typeof MenuComp>>()

function showGroupContextMenu(event: MouseEvent) {
  const targetEle = event.target as HTMLElement
  groupCompRef.value?.show(targetEle)
}

async function setGroupColumn(columnName: string) {
  if (props.group) {
    const columnNames = props.group.columnNames.slice()
    const idx = columnNames.findIndex(groupColumnName => groupColumnName === columnName)
    if (idx !== -1)
      columnNames.splice(idx, 1)
    else
      columnNames.push(columnName)
    await modifyLayoutFun({
      group: {
        columnNames,
        groupOrderDesc: props.group.groupOrderDesc,
        hideEmptyRecord: props.group.hideEmptyRecord,
        slices: props.group.slices,
      },
    })
    await loadDataFun()
  }
  else {
    await modifyLayoutFun({
      group: {
        columnNames: [columnName],
        groupOrderDesc: false,
        hideEmptyRecord: false,
        slices: {
        },
      },
    })
    await loadDataFun()
  }
}

async function setGroupDescSort() {
  if (props.group) {
    await modifyLayoutFun({
      group: {
        columnNames: props.group.columnNames,
        groupOrderDesc: !props.group.groupOrderDesc,
        hideEmptyRecord: props.group.hideEmptyRecord,
        slices: props.group.slices,
      },
    })
    await loadDataFun()
  }
}

async function setGroupHideEmpty() {
  if (props.group) {
    await modifyLayoutFun({
      group: {
        columnNames: props.group.columnNames,
        groupOrderDesc: props.group.groupOrderDesc,
        hideEmptyRecord: !props.group.hideEmptyRecord,
        slices: props.group.slices,
      },
    })
    await loadDataFun()
  }
}
</script>

<template>
  <button class="iw-btn iw-btn-outline iw-btn-xs" @click="showGroupContextMenu">
    <i :class="iconSvg.GROUP" />
    <span class="mr-0.5">{{ props.group !== undefined ? props.group.columnNames.map(groupColumnName => props.columnsConf.find(column => column.name === groupColumnName)!.title).join('+') : $t("function.group.groupTitle") }}</span>
    <i :class="`${iconSvg.CHEVRON_DOWN} ml-0.5`" />
  </button>
  <MenuComp ref="groupCompRef">
    <div class="iw-divider">
      {{ $t('function.group.columnsTitle') }}
    </div>
    <div
      v-for="column in props.columnsConf.filter(columnConf => columnConf.groupable)"
      :key="column.name"
      class="iw-contextmenu__item flex justify-between w-full" :data-column-name="column.name"
    >
      <span>
        <i :class="column.icon" />
        {{ column.title }}
      </span>
      <input
        type="checkbox" class="iw-toggle iw-toggle-xs"
        :checked="props.group !== undefined && props.group.columnNames.findIndex(groupColumnName => groupColumnName === column.name) !== -1"
        @click="setGroupColumn(column.name)"
      >
    </div>
    <div class="iw-divider">
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
  </MenuComp>
</template>
