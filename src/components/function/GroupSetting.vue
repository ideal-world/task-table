<script setup lang="ts">
import * as iconSvg from '../../assets/icon'
import type { GroupDataProps } from '../../props'
import type { ColumnConf } from '../conf'
import * as eb from '../eventbus'

const props = defineProps<{
  layoutId: string
  group: GroupDataProps
  layoutColumnsConf: ColumnConf[]
}>()

async function setGroupColumn(columnName: string) {
  if (props.group.item && props.group.item.columnName !== columnName) {
    await eb.modifyLayout({
      group: {
        item: {
          columnName,
          orderDesc: props.group.item.orderDesc,
          hideEmptyRecord: props.group.item.hideEmptyRecord,
        },
      },
    })
  }
  else if (props.group.item) {
    await eb.modifyLayout({
      group: {},
    })
  }
  else {
    await eb.modifyLayout({
      group: {
        item: {
          columnName,
          orderDesc: false,
          hideEmptyRecord: false,
        },
      },
    })
  }
}

async function setGroupDescSort() {
  if (props.group) {
    await eb.modifyLayout({
      group: {
        item: {
          columnName: props.group.item!.columnName,
          orderDesc: !props.group.item!.orderDesc,
          hideEmptyRecord: props.group.item!.hideEmptyRecord,
        },
      },
    })
  }
}

async function setGroupHideEmpty() {
  if (props.group) {
    await eb.modifyLayout({
      group: {
        item: {
          columnName: props.group.item!.columnName,
          orderDesc: props.group.item!.orderDesc,
          hideEmptyRecord: !props.group.item!.hideEmptyRecord,
        },
      },
    })
  }
}
</script>

<template>
  <div
    class="iw-divider cursor-pointer iw-table-setting-title"
  >
    {{ $t('function.group.groupTitle') }}
  </div>
  <div style="display: none;">
    <div
      class="iw-divider iw-divider-end mt-1 mb-1 ml-2 mr-2"
    >
      {{ $t('function.group.columnsTitle') }}
    </div>
    <div
      v-for="column in props.layoutColumnsConf.filter(col => col.groupable)"
      :key="`${props.layoutId}=${column.name}`" class="iw-contextmenu__item flex items-center justify-between w-full"
    >
      <span>
        <i :class="column.icon" />
        {{ column.title }}
      </span>
      <input
        type="checkbox" class="iw-toggle iw-toggle-xs"
        :checked="column.name === props.group.item?.columnName"
        @click="setGroupColumn(column.name)"
      >
    </div>
    <div
      class="iw-divider mt-1 mb-1 ml-2 mr-2"
    />
    <div class="flex justify-between items-center w-full mr-2">
      <span>
        <i :class="iconSvg.SORT" />
        {{ $t('function.group.groupSortTitle') }}
      </span>
      <input
        type="checkbox" class="iw-toggle iw-toggle-xs"
        :checked="props.group.item?.orderDesc"
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
        :checked="props.group.item?.hideEmptyRecord"
        @click="setGroupHideEmpty"
      >
    </div>
  </div>
</template>
