<script setup lang="ts">
import type { Ref } from 'vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { DataGroupResp, DataResp } from '../../../props'
import { DataKind, SubDataShowKind } from '../../../props'
import type { ColumnConf, LayoutConf, TableConf } from '../../conf'
import { registerCellClickListener } from '../../function/CellClick'
import { registerRowDragEvent } from '../../function/RowDrag'
import CellEditComp from '../../function/CellEdit.vue'
import PaginationComp from '../../function/Pagination.vue'
import { registerTreeRowToggleListener } from '../../function/RowTree'
import ColumnAggComp from './ListColumnAgg.vue'
import { setFixedColumnStyles } from './ListColumnFixed.vue'
import HeaderComp from './ListHeader.vue'
import RowsComp from './ListRows.vue'
import ListRowSelectComp from './ListRowSelect.vue'

const props = defineProps<
  {
  // 布局配置
  // Layout configuration
    layoutConf: LayoutConf
    // 表格配置
    // Table configuration
    tableConf: TableConf
    // 列配置
    // Column configuration
    columnsConf: ColumnConf[]
    // 是否显示主键列
    // Whether the primary key column is show
    showPkColumn: boolean
  }
>()

// 列表元素引用
// List element reference
const listRef: Ref<HTMLDivElement | null> = ref(null)

// 是否宽度不够，自动拉伸最后一列
// Whether the width is not enough, automatically stretch the last column
// const isWidenLastColumn = ref(false)

// 选择列宽度
// Select column width
const selectColumnWidth = computed(() => props.layoutConf.showSelectColumn ? 35 : 0)
// 操作列宽度
// Action column width
const actionColumnWidth = computed(() => props.layoutConf.actionColumn?.width ? props.layoutConf.actionColumn.width : 0)

// 主键列是否为数字类型
// Whether the primary key column is of numeric type
const pkKindIsNumber = props.tableConf.columns.some(col => col.name === props.tableConf.pkColumnName && [DataKind.NUMBER, DataKind.SERIAL].includes(col.dataKind))

// 是分组模式
// Is grouping mode
const isGroupMode = computed(() => props.layoutConf.data && Array.isArray(props.layoutConf.data))

// 表格数据（分组或不分组全量数据）
// Table data (full data in grouped or ungrouped mode)
const tableData = computed(() => {
  if (!props.layoutConf.data)
    return []
  if (!isGroupMode.value) {
    return (props.layoutConf.data as DataResp).records || []
  }
  else {
    return (props.layoutConf.data as DataGroupResp[]).map((group: any) => group.records).flat()
  }
})

// 启用拖拽排序
// Enable drag and drop sorting
const enableDragSort = computed(() => {
  const sortItems = props.layoutConf.sort?.items
  return sortItems?.length === 1 && sortItems[0].columnName === props.tableConf.dragSortColumnName
})
/**
 * 设置列样式
 *
 * Set column style
 *
 * @param colIdx 列索引 / Column index
 * @param width 强制指定列的宽度 / Force the width of the column
 */
function setColumnStyles(colIdx: number, width?: number) {
// ColIdx of select column = -1
// ColIdx of action column = -2
  const styles: any = {}
  if (colIdx === -1) {
    styles.width = `${selectColumnWidth.value}px`
  }
  else if (colIdx === -2) {
    styles.width = `${actionColumnWidth.value}px`
  }
  else {
    styles.width = `${width || props.columnsConf[colIdx].width}px`
    styles.flex = ''
    if (colIdx === props.columnsConf.length - 1) {
      styles.flex = '1'
    }
  }
  // 设置固定列样式
  // Set fixed column styles
  setFixedColumnStyles(styles, colIdx, props.columnsConf, selectColumnWidth.value, props.layoutConf)
  return styles
}

// iw-table 宽度
// iw-table width
// const iwTableWidth = computed(() => {
//   return (listRef.value?.closest('.iw-tt-table') as HTMLElement)?.offsetWidth || 0
// })

/**
 * 设置表格宽度
 *
 * Set table width
 */
function setTableWidth() {
  const styles: any = {}
  // 2px for border
  styles.width = `${props.layoutConf.columns.filter(column => !column.innerHide && !column.hide).reduce((count, col) => count + col.width, selectColumnWidth.value + actionColumnWidth.value + 2)}px`
  return styles
}

onMounted(() => {
  // 注册树形行展开/折叠监听
  // Register tree row expansion/collapse listener
  registerTreeRowToggleListener(listRef.value!)
  // 注册单元格点击监听
  // Register cell click listener
  registerCellClickListener(listRef.value!)
  // 注册行拖拽事件
  // Register row drag event
  registerRowDragEvent(listRef.value!)
})

// watch(
//   () => props.columnsConf.length,
//   () => {
//     nextTick(() => {
//       if (!listRef.value || !iwTableWidth.value)
//         return
//       if (listRef.value.offsetWidth < iwTableWidth.value) {
//         listRef.value.style.minWidth = '100%'
//         isWidenLastColumn.value = true
//       }
//       else {
//         listRef.value.style.minWidth = ''
//         isWidenLastColumn.value = false
//       }
//     })
//   },
//   {
//     deep: true,
//   },
// )
// 分组的默认条数改为5
function setDefaultGroupSliceNumber(groupValue: any) {
  return groupValue !== undefined && props.layoutConf.group!.slices && props.layoutConf.group!.slices[groupValue]
    ? { ...props.layoutConf.slice, ...props.layoutConf.group!.slices[groupValue] }
    : {
        ...props.layoutConf.slice,
        fetchNumber: 5,
      }
}
</script>

<template>
  <div
    ref="listRef"
    :class="`iw-list iw-row-select-container relative iw-list--size${props.tableConf.styles.size}`"
    :style="setTableWidth()"
    style="min-width: 100%"
  >
    <HeaderComp :columns-conf="props.columnsConf" :layout-conf="props.layoutConf" :table-conf="props.tableConf" :show-pk-column="props.showPkColumn" :set-column-styles="setColumnStyles" />
    <!-- 不分组模式 -->
    <!-- Non-grouping mode -->
    <template v-if="props.layoutConf.data && !Array.isArray(props.layoutConf.data)">
      <RowsComp
        :records="props.layoutConf.data.records"
        :pk-column-name="props.tableConf.pkColumnName"
        :pk-column-show-name="props.tableConf.pkColumnShowName"
        :parent-pk-column-name="props.tableConf.parentPkColumnName"
        :sub-data-show-kind="props.layoutConf.subDataShowKind"
        :pk-kind-is-number="pkKindIsNumber"
        :columns-conf="props.columnsConf"
        :layout-id="props.layoutConf.id"
        :layout-kind="props.layoutConf.layoutKind"
        :table-conf="props.tableConf"
        :style-props="props.tableConf.styles"
        :show-select-column="props.layoutConf.showSelectColumn"
        :show-pk-column="props.showPkColumn"
        :action-column-render="!props.layoutConf.actionColumn?.hide ? props.layoutConf.actionColumn?.render : undefined"
        :set-column-styles="setColumnStyles"
        :enable-drag-sort="enableDragSort"
      />
      <!-- <ColumnAggComp
        v-if="layoutConf.agg"
        :layout-id="props.layoutConf.id"
        :agg="layoutConf.agg"
        :data-basic="(layoutConf.data as DataResp)"
        :show-select-column="layoutConf.showSelectColumn"
        :show-action-column="layoutConf.actionColumn !== undefined"
        :columns-conf="props.columnsConf"
        :style-props="props.tableConf.styles"
        :set-column-styles="setColumnStyles"
      /> -->
    </template>
    <!-- 分组模式 -->
    <!-- Grouping mode -->
    <template v-else-if="props.layoutConf.data && Array.isArray(props.layoutConf.data)">
      <template v-for="groupData in props.layoutConf.data" :key="`${props.layoutConf.id}-${groupData.groupValue}`">
        <ColumnAggComp
          v-if="layoutConf.agg"
          :layout-id="props.layoutConf.id"
          :agg="layoutConf.agg"
          :data-basic="groupData"
          :show-select-column="layoutConf.showSelectColumn"
          :show-pk-column="props.showPkColumn"
          :show-action-column="!props.layoutConf.actionColumn?.hide"
          :columns-conf="props.columnsConf"
          :group-column-name="props.layoutConf.group?.item?.columnName"
          :group-value="groupData.groupShowTitle ?? groupData.groupValue"
          :style-props="props.tableConf.styles"
          :set-column-styles="setColumnStyles"
        />
        <RowsComp
          :records="groupData.records"
          :pk-column-name="props.tableConf.pkColumnName"
          :pk-column-show-name="props.tableConf.pkColumnShowName"
          :parent-pk-column-name="props.tableConf.parentPkColumnName"
          :sub-data-show-kind="props.layoutConf.subDataShowKind"
          :pk-kind-is-number="pkKindIsNumber"
          :columns-conf="props.columnsConf"
          :layout-id="props.layoutConf.id"
          :layout-kind="props.layoutConf.layoutKind"
          :table-conf="props.tableConf"
          :style-props="props.tableConf.styles"
          :show-select-column="props.layoutConf.showSelectColumn"
          :show-pk-column="props.showPkColumn"
          :action-column-render="!props.layoutConf.actionColumn?.hide ? props.layoutConf.actionColumn?.render : undefined"
          :set-column-styles="setColumnStyles"
          :enable-drag-sort="enableDragSort"
        />
        <div
          class="flex justify-end p-2 min-h-0"
        >
          <PaginationComp :slice="setDefaultGroupSliceNumber(groupData.groupValue)" :group-props="layoutConf.group" :group-value="groupData.groupValue" :total-number="groupData.totalNumber" />
        </div>
      </template>
    </template>
    <ListRowSelectComp
      v-if="props.layoutConf.showSelectColumn"
      :records="tableData"
      :selected-pks="props.layoutConf.selectedDataPks"
      :pk-column-name="props.tableConf.pkColumnName"
      :pk-kind-is-number="pkKindIsNumber"
    />
    <CellEditComp
      v-if="props.layoutConf.edit && props.layoutConf.data"
      :pk-column-name="props.tableConf.pkColumnName"
      :pk-kind-is-number="pkKindIsNumber"
      :edit="props.layoutConf.edit"
      :columns-conf="props.columnsConf"
      :data="props.layoutConf.data"
      :layout-id="layoutConf.id"
      container-class="iw-list"
      edit-cell-class="iw-data-cell"
      edit-cell-column-name-prop="columnName"
      edit-row-class="iw-data-row"
      edit-row-pk-value-prop="pk"
    />
  </div>
</template>

<style lang="css">
.iw-list--size-xs {
  @apply text-xs;

  .iw-list-cell {
    @apply p-0
  }
}

.iw-list--size-sm {
  @apply text-sm;

  .iw-list-cell {
    @apply p-[1px] pl-[6px]
  }
}

.iw-list--size {
  @apply text-base;

  .iw-list-cell {
    @apply p-[2px] pl-[6px]
  }
}

.iw-list--size-lg {
  @apply text-lg;

  .iw-list-cell {
    @apply p-1.5
  }
}
</style>
