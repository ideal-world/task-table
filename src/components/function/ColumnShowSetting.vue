<script setup lang="ts">
import TableSetCommon from "../common/TableSetCommon.vue";
import type { LayoutColumnProps, LayoutModifyProps } from "../../props";
import type { TableConf } from "../conf";
import * as eb from "../eventbus";

const props = defineProps<{
  // 布局ID
  // Layout ID
  layoutId: string;
  // 布局列
  // Layout columns
  layoutColumns: LayoutColumnProps[];
  // 表格配置
  // Table configuration
  tableConf: TableConf;
}>();

async function setShowToggleColumn(column: LayoutColumnProps) {
  const changedLayoutReq: LayoutModifyProps = {
    changedColumn: {
      ...column,
      hide: !column.hide,
    },
  };
  await eb.modifyLayout(changedLayoutReq);
}
</script>

<template>
  <!-- <div class="iw-divider cursor-pointer iw-table-setting-title">
    {{ $t("function.column.showTitle") }}
  </div>
  <div class="w-full" style="display: none"> -->
  <TableSetCommon :title="$t('function.column.showTitle')">
    <div class="grid grid-cols-1 divide-y divide-dashed">
      <div
        v-for="column in props.layoutColumns.filter(
          (col) => col.name !== props.tableConf.pkColumnName
        )"
        :key="`${props.layoutId}-${column.name}`"
        class="iw-contextmenu__item flex items-center justify-between w-full py-2"
      >
        <span>
          <i
            :class="
              props.tableConf.columns.find((col) => col.name === column.name)
                ?.icon
            "
          ></i>
          {{
            props.tableConf.columns.find((col) => col.name === column.name)
              ?.title
          }}
        </span>
        <input
          type="checkbox"
          class="iw-toggle iw-toggle-primary iw-toggle-xs"
          :checked="!props.layoutColumns.find(col => col.name === column.name)!.hide"
          @click="setShowToggleColumn(column)"
        />
      </div>
    </div>
  </TableSetCommon>
</template>
