<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'
import Sortable from 'sortablejs'
import TableSetCommon from '../common/TableSetCommon.vue'
import type { LayoutColumnProps, LayoutModifyProps } from '../../props'
import type { LayoutConf, TableConf } from '../conf'
import { TEXT } from '../../assets/icon'

import * as eb from '../eventbus'
import { deepToRaw } from '../../utils/vueHelper'
import GroupSetting from './GroupSetting.vue'

interface LayoutColumnPropsE extends LayoutColumnProps {
  disabled?: boolean
}

const props = defineProps<{
  // 布局ID
  // Layout ID
  layoutId: string
  // 布局配置
  layoutConf: LayoutConf
  // 表格配置
  // Table configuration
  tableConf: TableConf
}>()

const layoutColumns = computed(() => props.layoutConf.columns.filter(column => !column.innerHide))

// 排序dom
// Sortable dom
const sortCompRef = ref<HTMLElement>()
// 主键列
// Primary key column
const pkColumn = computed(() => layoutColumns.value.find(col => col.name === props.tableConf.pkColumnName))
// 显示列
// Displayed columns
const showColumns = ref<LayoutColumnPropsE[]>([])

watchEffect(() => {
  const columns: LayoutColumnPropsE[] = layoutColumns.value.filter(col => col.name !== props.tableConf.pkColumnName && !col.hide)
  const { filter, sort } = props.layoutConf
  let columnNames = [] as string[]
  filter?.groups.forEach((group) => {
    columnNames = columnNames.concat(group.items.map(item => item.columnName))
  })
  columnNames = columnNames.concat(sort!.items.map(item => item.columnName))
  columns.forEach((column) => {
    column.disabled = !!columnNames.includes(column.name)
  })
  showColumns.value = columns
})

// 隐藏列
// Available columns
const hideColumns = computed(() => layoutColumns.value.filter(col => col.name !== props.tableConf.pkColumnName && col.hide))

async function setShowToggleColumn(column: LayoutColumnProps) {
  const changedLayoutReq: LayoutModifyProps = {
    changedColumn: {
      ...column,
      hide: !column.hide,
    },
  }
  await eb.modifyLayout(changedLayoutReq)
}
// 操作列
// action column
async function setToggleActionColumn(hide: boolean) {
  const changedLayoutReq: LayoutModifyProps = {
    actionColumn: {
      hide,
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
        const moveColumn = showColumns.value.find(col => col.name === evt.item.dataset.columnName)
        // 可排序的列
        // sort columns
        const sortColumns = deepToRaw(showColumns.value)

        sortColumns.splice(evt.oldIndex! - 2, 1)
        sortColumns.splice(evt.newIndex! - 2, 0, moveColumn as LayoutColumnProps)
        await eb.modifyLayout({
          columns: [pkColumn.value as LayoutColumnProps, ...sortColumns, ...hideColumns.value],
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
  <TableSetCommon :title="$t('function.column.showTitle')" is-show>
    <div ref="sortCompRef" class="grid grid-cols-1 divide-y divide-dashed">
      <div class="text-gray-400 font-medium pt-1">
        {{ $t('function.column.showColumns') }}
      </div>
      <div
        v-show="layoutConf.actionColumn"
        class="flex items-center justify-between w-full py-2 "
      >
        <span>
          <i
            :class="TEXT"
          />
          {{
            $t('layout.action.title')
          }}
        </span>
        <input
          type="checkbox"
          class="iw-toggle iw-toggle-primary iw-toggle-xs"
          :checked="!layoutConf.actionColumn?.hide"
          @click="setToggleActionColumn(!layoutConf.actionColumn?.hide)"
        >
      </div>

      <div
        v-for="column in showColumns"
        :key="`${props.layoutId}-${column.name}`"
        class="flex items-center justify-between w-full py-2 cursor-move iw-row-sort__item"
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
          :disabled="!!column.disabled"
          class="iw-toggle iw-toggle-primary iw-toggle-xs"
          :checked="!column.hide"
          @click="setShowToggleColumn(column)"
        >
      </div>
      <div class="text-gray-400 font-medium pt-1">
        {{ $t('function.column.hideColumns') }}
      </div>
      <div
        v-for="column in hideColumns"
        :key="`${props.layoutId}-${column.name}`"
        class="flex items-center justify-between w-full py-2"
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
          :checked="!column.hide"
          @click="setShowToggleColumn(column)"
        >
      </div>
    </div>
  </TableSetCommon>
</template>
