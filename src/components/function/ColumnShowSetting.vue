<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Sortable from 'sortablejs'
import TableSetCommon from '../common/TableSetCommon.vue'
import type { LayoutColumnProps, LayoutModifyProps } from '../../props'
import type { TableConf } from '../conf'
import * as eb from '../eventbus'
import { deepToRaw } from '../../utils/vueHelper'

const props = defineProps<{
  // 布局ID
  // Layout ID
  layoutId: string
  // 布局列
  // Layout columns
  layoutColumns: LayoutColumnProps[]
  // 表格配置
  // Table configuration
  tableConf: TableConf
}>()

// 排序dom
// Sortable dom
const sortCompRef = ref<HTMLElement>()
// 主键列
// Primary key column
const pkColumn = computed(() => props.layoutColumns.find(col => col.name === props.tableConf.pkColumnName))
// 显示列
// Displayed columns
const displayedColumns = computed(() => props.layoutColumns.filter(col => col.name !== props.tableConf.pkColumnName && !col.hide))
// 未显示列
// Available columns
const availableColumns = computed(() => props.layoutColumns.filter(col => col.name !== props.tableConf.pkColumnName && col.hide))

async function setShowToggleColumn(column: LayoutColumnProps) {
  const changedLayoutReq: LayoutModifyProps = {
    changedColumn: {
      ...column,
      hide: !column.hide,
    },
  }
  await eb.modifyLayout(changedLayoutReq)
}

onMounted(() => {
  Sortable.create(sortCompRef.value as HTMLElement, {
    draggable: '.iw-row-sort__item',
    async onEnd(evt) {
      if (evt.oldIndex !== evt.newIndex && evt.oldIndex !== -1 && evt.newIndex !== -1) {
        // 移动的列
        // move column
        const moveColumn = displayedColumns.value.find(col => col.name === evt.item.dataset.columnName)
        // 可排序的列
        // sort columns
        const sortColumns = deepToRaw(displayedColumns.value)

        sortColumns.splice(evt.oldIndex! - 1, 1)
        sortColumns.splice(evt.newIndex! - 1, 0, moveColumn as LayoutColumnProps)

        await eb.modifyLayout({
          columns: [pkColumn.value as LayoutColumnProps, ...sortColumns, ...availableColumns.value],
        })
      }
    },
  })
})
</script>

<template>
  <!-- <div class="iw-divider cursor-pointer iw-table-setting-title">
    {{ $t("function.column.showTitle") }}
  </div>
  <div class="w-full" style="display: none"> -->
  <TableSetCommon :title="$t('function.column.showTitle')">
    <div ref="sortCompRef" class="grid grid-cols-1 divide-y divide-dashed">
      <div
        class="iw-divider iw-divider-end mt-1 mb-1 ml-2 mr-2"
      >
        {{ $t('function.column.displayedColumns') }}
      </div>
      <div
        v-for="column in displayedColumns"
        :key="`${props.layoutId}-${column.name}`"
        class="iw-contextmenu__item flex items-center justify-between w-full py-2 iw-row-sort__item"
        :data-column-name="column.name"
      >
        <span>
          <i
            :class="
              props.tableConf.columns.find((col) => col.name === column.name)
                ?.icon
            "
          />
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
        >
      </div>
      <div
        class="iw-divider iw-divider-end mt-1 mb-1 ml-2 mr-2"
      >
        {{ $t('function.column.availableColumns') }}
      </div>
      <div
        v-for="column in availableColumns"
        :key="`${props.layoutId}-${column.name}`"
        class="iw-contextmenu__item flex items-center justify-between w-full py-2"
      >
        <span>
          <i
            :class="
              props.tableConf.columns.find((col) => col.name === column.name)
                ?.icon
            "
          />
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
        >
      </div>
    </div>
  </TableSetCommon>
</template>
