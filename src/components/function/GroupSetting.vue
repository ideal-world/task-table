<script setup lang="ts">
import TableSetCommon from '../common/TableSetCommon.vue'
import * as iconSvg from '../../assets/icon'
import type { GroupDataProps } from '../../props'
import type { ColumnConf } from '../conf'
import * as eb from '../eventbus'

const props = defineProps<{
  // 布局ID
  // Layout ID
  layoutId: string
  // 分组配置
  // Group configuration
  group: GroupDataProps
  // 可能涉及的列配置
  // Possible column configuration
  columnsConf: ColumnConf[]
}>()

/**
 * 设置分组
 *
 * Set group
 *
 * @param columnName 列名 / Column name
 */
async function setGroupColumn(columnName: string) {
  if (props.group.item && props.group.item.columnName !== columnName) {
    await eb.modifyLayout({
      group: {
        enabledColumnNames: props.group.enabledColumnNames,
        item: {
          columnName,
          orderDesc: props.group.item.orderDesc,
          hideEmptyRecord: props.group.item.hideEmptyRecord,
        },
        slices: props.group.slices,
      },
    })
  }
  else if (props.group.item) {
    await eb.modifyLayout({
      group: {
        enabledColumnNames: props.group.enabledColumnNames,
      },
    })
  }
  else {
    await eb.modifyLayout({
      group: {
        enabledColumnNames: props.group.enabledColumnNames,
        item: {
          columnName,
          orderDesc: false,
          hideEmptyRecord: false,
        },
        slices: props.group.slices,
      },
    })
  }
}

/**
 * 设置分组排序
 *
 * Set group sort
 */
async function setGroupDescSort() {
  if (props.group) {
    await eb.modifyLayout({
      group: {
        enabledColumnNames: props.group.enabledColumnNames,
        item: {
          columnName: props.group.item!.columnName,
          orderDesc: !props.group.item!.orderDesc,
          hideEmptyRecord: props.group.item!.hideEmptyRecord,
        },
        slices: props.group.slices,
      },
    })
  }
}

/**
 * 设置分组隐藏空记录
 *
 * Set group hide empty records
 */
async function setGroupHideEmpty() {
  if (props.group) {
    await eb.modifyLayout({
      group: {
        enabledColumnNames: props.group.enabledColumnNames,
        item: {
          columnName: props.group.item!.columnName,
          orderDesc: props.group.item!.orderDesc,
          hideEmptyRecord: !props.group.item!.hideEmptyRecord,
        },
        slices: props.group.slices,
      },
    })
  }
}
</script>

<template>
  <TableSetCommon :title="$t('function.group.groupTitle')">
    <div class="text-gray-400 font-medium mb-4">
      {{ $t("function.group.columnsTitle") }}
    </div>
    <div class="grid grid-cols-1 divide-y bg-gray-100 p-2 rounded-md mb-2">
      <div
        v-for="column in props.columnsConf.filter((col) =>
          props.group.enabledColumnNames.includes(col.name),
        )"
        :key="`${props.layoutId}=${column.name}`"
        class="flex items-center justify-between w-full py-2"
      >
        <span>
          <i :class="column.icon" />
          {{ column.title }}
        </span>
        <input
          type="checkbox"
          class="iw-toggle iw-toggle-primary iw-toggle-xs"
          :checked="column.name === props.group.item?.columnName"
          @click="setGroupColumn(column.name)"
        >
      </div>
    </div>

    <div class="flex justify-between items-center w-full mr-2 pb-2">
      <span>
        <i :class="iconSvg.SORT" />
        {{ $t("function.group.groupSortTitle") }}
      </span>
      <input
        type="checkbox"
        class="iw-toggle iw-toggle-primary iw-toggle-xs"
        :checked="props.group.item?.orderDesc"
        @click="setGroupDescSort"
      >
    </div>
    <div class="flex justify-between items-center w-full mr-2">
      <span>
        <i :class="iconSvg.SORT" />
        {{ $t("function.group.hideEmptyTitle") }}
      </span>
      <input
        type="checkbox"
        class="iw-toggle iw-toggle-xs"
        :checked="props.group.item?.hideEmptyRecord"
        @click="setGroupHideEmpty"
      >
    </div>
  </TableSetCommon>
</template>
