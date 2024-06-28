<script setup lang="ts">
import type { Ref } from 'vue'
import { computed, onMounted, ref } from 'vue'
import type { DataResp } from '../../../props'
import { DataKind, SubDataShowKind } from '../../../props'
import type { ColumnConf, LayoutConf, TableConf } from '../../conf'
import { registerCellClickListener } from '../../function/CellClick'
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
  }
>()

// 列表元素引用
// List element reference
const listRef: Ref<HTMLDivElement | null> = ref(null)

// 选择列宽度
// Select column width
const selectColumnWidth = computed(() => props.layoutConf.showSelectColumn ? 25 : 0)
// 操作列宽度
// Action column width
const actionColumnWidth = computed(() => props.layoutConf.actionColumn ? props.layoutConf.actionColumn.width : 0)

// 主键列是否为数字类型
// Whether the primary key column is of numeric type
const pkKindIsNumber = props.tableConf.columns.some(col => col.name === props.tableConf.pkColumnName && [DataKind.NUMBER, DataKind.SERIAL].includes(col.dataKind))

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
  }
  // 设置固定列样式
  // Set fixed column styles
  setFixedColumnStyles(styles, colIdx, props.columnsConf, selectColumnWidth.value)
  return styles
}

/**
 * 设置表格宽度
 *
 * Set table width
 */
function setTableWidth() {
  const styles: any = {}
  // 2px for border
  styles.width = `${props.layoutConf.columns.filter(column => !column.hide).reduce((count, col) => count + col.width, selectColumnWidth.value + actionColumnWidth.value + 2)}px`
  return styles
}

onMounted(() => {
  // 注册树形行展开/折叠监听
  // Register tree row expansion/collapse listener
  props.layoutConf.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA && registerTreeRowToggleListener(listRef.value!)
  // 注册单元格点击监听
  // Register cell click listener
  registerCellClickListener(listRef.value!)
})
</script>

<template>
  <div
    ref="listRef"
    :class="`iw-list iw-row-select-container relative iw-list--size${props.tableConf.styles.size}`"
    :style="setTableWidth()"
  >
    <HeaderComp :columns-conf="props.columnsConf" :layout-conf="props.layoutConf" :table-conf="props.tableConf" :set-column-styles="setColumnStyles" />
    <!-- 不分组模式 -->
    <!-- Non-grouping mode -->
    <template v-if="props.layoutConf.data && !Array.isArray(props.layoutConf.data)">
      <RowsComp
        :records="props.layoutConf.data.records"
        :pk-column-name="props.tableConf.pkColumnName"
        :parent-pk-column-name="props.tableConf.parentPkColumnName"
        :sub-data-show-kind="props.layoutConf.subDataShowKind"
        :pk-kind-is-number="pkKindIsNumber"
        :columns-conf="props.columnsConf"
        :layout-id="props.layoutConf.id"
        :layout-kind="props.layoutConf.layoutKind"
        :style-props="props.tableConf.styles"
        :show-select-column="props.layoutConf.showSelectColumn"
        :action-column-render="props.layoutConf.actionColumn?.render"
        :set-column-styles="setColumnStyles"
      />
      <ColumnAggComp
        v-if="layoutConf.agg"
        :layout-id="props.layoutConf.id"
        :agg="layoutConf.agg"
        :data-basic="layoutConf.data as DataResp"
        :show-select-column="layoutConf.showSelectColumn"
        :show-action-column="layoutConf.actionColumn !== undefined"
        :columns-conf="props.columnsConf"
        :style-props="props.tableConf.styles"
        :set-column-styles="setColumnStyles"
      />
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
          :show-action-column="layoutConf.actionColumn !== undefined"
          :columns-conf="props.columnsConf"
          :group-column-name="props.layoutConf.group?.item?.columnName"
          :group-value="groupData.groupShowTitle ?? groupData.groupValue"
          :style-props="props.tableConf.styles"
          :set-column-styles="setColumnStyles"
        />
        <RowsComp
          :records="groupData.records"
          :pk-column-name="props.tableConf.pkColumnName"
          :parent-pk-column-name="props.tableConf.parentPkColumnName"
          :sub-data-show-kind="props.layoutConf.subDataShowKind"
          :pk-kind-is-number="pkKindIsNumber"
          :columns-conf="props.columnsConf"
          :layout-id="props.layoutConf.id"
          :layout-kind="props.layoutConf.layoutKind"
          :style-props="props.tableConf.styles"
          :show-select-column="props.layoutConf.showSelectColumn"
          :action-column-render="props.layoutConf.actionColumn?.render"
          :set-column-styles="setColumnStyles"
        />
        <div
          class="flex justify-end p-2 min-h-0"
        >
          <PaginationComp :slice="layoutConf.slice" :group-props="layoutConf.group" :group-value="groupData.groupValue" :total-number="groupData.totalNumber" />
        </div>
      </template>
    </template>
    <ListRowSelectComp
      v-if="props.layoutConf.showSelectColumn"
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
    @apply p-[1px]
  }
}

.iw-list--size {
  @apply text-base;

  .iw-list-cell {
    @apply p-[2px] pl-[4px]
  }
}

.iw-list--size-lg {
  @apply text-lg;

  .iw-list-cell {
    @apply p-1.5
  }
}
</style>
