<script setup lang="ts">
import dayjs from 'dayjs'
import { onMounted, ref } from 'vue'
import * as iconSvg from '../../../assets/icon'
import type { LayoutKind, TableStyleProps } from '../../../props'
import { DATA_DICT_POSTFIX, DATA_NAME_POSTFIX, DataKind, SubDataShowKind } from '../../../props/enumProps'
import type { ColumnConf, TableConf } from '../../conf'
import { NODE_DEPTH_FLAG } from '../../function/RowTree'
import { delegateEvent, dictionaryTxt } from '../../../utils/basic'

const props = defineProps<{
  // 数据
  // Data
  records: { [columnName: string]: any }[]
  // 主键列名
  // Primary key column name
  pkColumnName: string
  // 主键列显示名
  // Primary key column show name
  pkColumnShowName?: string
  // 父主键列名
  // Parent primary key column name
  parentPkColumnName?: string
  // 子数据显示类型
  // Sub-data display type
  subDataShowKind: SubDataShowKind
  // 主键列是否为数字类型
  // Whether the primary key column is of numeric type
  pkKindIsNumber: boolean
  // 列配置
  // Column configuration
  columnsConf: ColumnConf[]
  // 布局ID
  // Layout ID
  layoutId: string
  // 布局类型
  // Layout type
  layoutKind: LayoutKind
  // 表格配置
  // Table configuration
  tableConf: TableConf
  // 表格样式配置
  // Table style configuration
  styleProps: TableStyleProps
  // 是否显示选择列
  // Whether to display the select column
  showSelectColumn: boolean
  // 是否显示主键列
  // Whether the primary key column is show
  showPkColumn: boolean
  // 操作列渲染函数
  // Action column rendering function
  actionColumnRender?: (record: { [columnName: string]: any }, layoutKind: LayoutKind) => any
  // 设置列样式
  // Set column style
  setColumnStyles: (colIdx: number, width?: number) => any
  // 支持拖拽排序的列名
  enableDragSort?: boolean
}>()

// 字典列表元素引用，仅用于向上找到列表元素
// Dictionary list element reference, only used to find the list element upwards
const dictEleRef = ref<HTMLElement | null>(null)
let listEle: HTMLElement
// 字典提示title
// Dictionary prompt title
const dictTitle = ref('')

onMounted(() => {
  listEle = dictEleRef.value!.closest('.iw-list')! as HTMLElement
  delegateEvent(listEle, 'mouseover', '.iw-dict-cell', (e: Event) => {
    const target = (e.target as HTMLElement).closest('.iw-dict-cell') as HTMLElement
    // eslint-disable-next-line eqeqeq
    const row = props.records.find(ele => ele[props.pkColumnName] == target.dataset.rowPk)
    dictTitle.value = dictionaryTxt(row?.[target.dataset.columnName + DATA_DICT_POSTFIX]).txt || ''
  })
})

// 渲染箭头
// Render arrow
function renderArrow(row: any, idx: number) {
  if (props.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA && props.parentPkColumnName) {
    return `<div class="flex justify-end" style="width: ${15 * ((row[NODE_DEPTH_FLAG] ?? 0) + 1)}px" v-html="renderTreeToggleHandler(props.records[idx + 1] && row[props.pkColumnName] === props.records[idx + 1][props.parentPkColumnName])" >
     ${props.records[idx + 1] && row[props.pkColumnName] === props.records[idx + 1][props.parentPkColumnName] ? `<i class="${iconSvg.SHRINK} cursor-pointer" />` : ''}
    </div>`
  }
  else if (props.subDataShowKind === SubDataShowKind.TILE_ALL_DATA && props.parentPkColumnName && row[props.parentPkColumnName]) {
    return `<i class="${iconSvg.SUB}" />`
  }
}
/**
 * 行点击事件
 */
// function handleRowClick(clickedRowPK: any) {
//   eb.clickRow([clickedRowPK])
// }
</script>

<template>
  <!-- key的值使用布局Id+主键+子数据显示类型以确保子数据显示类型切换时可以重新创建所有行。
  否则，折叠行时MutationObserver处理会遗漏一些需要隐藏的子数据。

  The value of key uses primary key + layout id + sub-data display kind to ensure that all rows can be recreated when the sub-data display kind is switched.
  Otherwise, MutationObserver processing when collapsing rows will miss some sub-data that needs to be hidden.
-->
  <div
    v-for="(row, idx) in props.records"
    :key="`${layoutId}-${row[props.pkColumnName]}-${props.subDataShowKind}`"
    :draggable="props.enableDragSort"
    :data-pk="row[props.pkColumnName]"
    :data-parent-pk="props.parentPkColumnName ? row[props.parentPkColumnName] : undefined"
    :class="`${props.tableConf.clickedRowPks.includes(row[props.pkColumnName]) ? 'iw-data-row--selected' : 'iw-data-row--unselected'} ${props.styleProps.rowClass} iw-list-row iw-data-row ${props.subDataShowKind === SubDataShowKind.FOLD_SUB_DATA ? 'iw-data-fold' : ''} ${props.enableDragSort ? 'cursor-grab' : ''} flex border-b border-b-base-300 border-r border-r-base-300`"
  >
    <!-- 选择列 -->
    <!-- Select column -->
    <div
      v-if="props.showSelectColumn"
      :class="`${props.styleProps.cellClass} iw-list-cell flex justify-center items-center whitespace-nowrap flex-nowrap`"
      :style="props.setColumnStyles(-1)"
    >
      <input type="checkbox" class="iw-row-select-cell__chk iw-checkbox iw-checkbox-primary border-gray-300 iw-checkbox-xs rounded">
    </div>
    <!-- 主键数据列 -->
    <!-- Primary key data column -->
    <div
      v-if="props.showPkColumn"
      :class="`${props.styleProps.cellClass} iw-list-cell iw-data-cell flex items-center ${props.showSelectColumn && 'border-l border-l-base-300 '} whitespace-nowrap flex-nowrap`"
      :data-column-name="props.pkColumnName" :data-row-pk="row[props.pkColumnName]" :style="{ ...props.columnsConf[0].styles, ...props.setColumnStyles(0) }"
    >
      <!-- 显示折叠图标和展开图标 -->
      <!-- Show the collapse icon and expand icon -->
      <div class="row-arrow-box" v-html="renderArrow(row, idx)" />
      {{ row[props.pkColumnShowName || props.pkColumnName] }}
    </div>
    <!-- 常规数据列 -->
    <!-- Normal data column -->
    <div
      v-for="(column, colIdx) in props.columnsConf.slice(props.showPkColumn ? 1 : 0)" :key="`${props.layoutId}-${column.name}`"
      class="group/item"
      :class="`${props.styleProps.cellClass} iw-list-cell iw-data-cell flex items-center border-l border-l-base-300 overflow-hidden ${column.wrap ? 'break-words flex-wrap' : 'whitespace-nowrap text-ellipsis flex-nowrap'}`"
      :data-column-name="column.name" :data-row-pk="row[props.pkColumnName]" :style="{ ...column.styles, ...props.setColumnStyles(colIdx + (props.showPkColumn ? 1 : 0)) }"
    >
      <!-- 不显示主键列且当前列索引为0时，显示折叠图标和展开图标 -->
      <!-- Do not display the main key column and current column index is 0, show the collapse icon and expand icon -->
      <template v-if="!props.showPkColumn && colIdx === 0">
        <div class="row-arrow-box" v-html="renderArrow(row, idx)" />
      </template>
      <!-- 优先使用自定义渲染 -->
      <!-- Prefer custom rendering -->
      <div v-if="column.name === 'name'" style="display: none;" class="hover-edit invisible group-hover/item:visible cursor-pointer h-full flex items-center absolute right-0 top-0 pr-1">
        <i class="octicon-pencil-24" />
      </div>
      <div v-if="column.render" class="w-full truncate" v-html="column.render(row, props.layoutKind)" />
      <template v-else-if="column.dataKind === DataKind.DATE || column.dataKind === DataKind.TIME || column.dataKind === DataKind.DATETIME">
        <div class="w-full truncate" :title="column.kindDateTimeFormat ? dayjs(row[column.name]).format(column.kindDateTimeFormat) : row[column.name]">
          {{ (column.kindDateTimeFormat && dayjs(row[column.name]).isValid()) ? dayjs(row[column.name]).format(column.kindDateTimeFormat) : row[column.name] }}
        </div>
      </template>
      <img v-else-if="column.dataKind === DataKind.IMAGE" :src="row[column.name]" class="w-4 h-4 transition duration-300 transform hover:scale-[8] hover:rounded-sm hover:z-[3000]">
      <a v-else-if="column.dataKind === DataKind.FILE" :href="row[column.name]" :title="row[column.name] && row[column.name].substring(row[column.name].lastIndexOf('/') + 1)" target="_blank" class="underline w-full  truncate">{{ row[column.name] && row[column.name].substring(row[column.name].lastIndexOf('/') + 1) }}</a>
      <template v-else-if="!column.useDict">
        <div class="w-full truncate" :title="row[column.name]">
          {{ row[column.name] }}
        </div>
      </template>
      <div v-else-if="row[column.name + DATA_DICT_POSTFIX]?.length" :title="dictTitle" :data-row-pk="row[props.pkColumnName]" :data-column-name="column.name" class="iw-dict-cell w-full truncate" v-html="dictionaryTxt(row[column.name + DATA_DICT_POSTFIX]).htmlStr" />
      <div v-else-if="row[column.name + DATA_NAME_POSTFIX] && !row[column.name + DATA_DICT_POSTFIX]?.length" class="w-full truncate" :title="row[column.name + DATA_NAME_POSTFIX]">
        {{ row[column.name + DATA_NAME_POSTFIX] }}
      </div>
    </div>
    <!-- 操作列 -->
    <!-- Action column -->
    <div
      v-if="props.actionColumnRender"
      :class="`${props.styleProps.cellClass} iw-active-cell iw-active-row-cell  iw-list-cell flex justify-center items-center border-l border-l-base-300 whitespace-nowrap flex-nowrap`"
      :style="props.setColumnStyles(-2)"
      v-html="props.actionColumnRender(row, props.layoutKind)"
    />
  </div>
  <div ref="dictEleRef" />
</template>

<style lang="css">
.iw-data-row--unselected>.iw-list-cell {
  @apply bg-base-100;
}
.iw-data-row--selected>.iw-list-cell {
  background-color: var(--sys-primary-color-2);
}
.iw-list .editable-cell {
  cursor: pointer;
}
.iw-list .editable-cell:hover {
  background-color: var(--sys-primary-color-2);
}
.dragging>.iw-list-cell {
  background-color:  var(--sys-primary-color-2);
}
.drag-over-up>.iw-list-cell {
  border-top: 1px solid var(--sys-primary);
}
.drag-over-down>.iw-list-cell {
  border-bottom: 1px solid var(--sys-primary);
}
.drag-over-middle {
  border: 1px solid var(--sys-primary);
}
</style>
