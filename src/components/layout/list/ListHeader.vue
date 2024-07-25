<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LayoutModifyProps } from '../../../props'
import MenuComp from '../../common/Menu.vue'
import type { ColumnConf, LayoutConf, TableConf } from '../../conf'
import * as eb from '../../eventbus'
import ColumnResizeComp from '../../function/ColumnResize.vue'
import ColumnFixedComp from './ListColumnFixed.vue'
import ColumnWrapComp from './ListColumnWrap.vue'

enum ORDER_ENUM {
  POSITIVE_SORT = false, //正序
  INVERT_SORT= true, //倒序
  UNDEFINED = null //不排序
}

const props = defineProps<{
  // 列配置
  // Column configuration
  columnsConf: ColumnConf[]
  // 布局配置
  // Layout configuration
  layoutConf: LayoutConf
  // 表格配置
  // Table configuration
  tableConf: TableConf
  // 设置列样式
  // Set column style
  setColumnStyles: (colIdx: number, width?: number) => any
}>()

// 上下文菜单组件引用
// Context menu component reference
const headerMenuCompRef = ref<InstanceType<typeof MenuComp>>()
// 当前选择的列配置
// Currently selected column configuration
const selectedColumnConf = ref<ColumnConf | undefined>()

function showHeaderContextMenu(event: MouseEvent, columName: string) {
  selectedColumnConf.value = props.columnsConf.find(col => col.name === columName)
  headerMenuCompRef.value?.show(event.target as HTMLElement)
}

// 是否有分类列（多表头）
// Whether there is a category column (multi-header)
const hasCateColumn = computed(() => props.columnsConf.some(col => col.categoryTitle !== undefined))

// 分类列
// Category column
const cateColumns = computed(() => {
  if (!hasCateColumn.value) {
    return
  }
  // title: 分类标题，width: 分类列宽度，colIdx: 分类列起始列索引，与实际列索引对应，用于同步固定列样式
  // title: Category title, width: Category column width, colIdx: Category column start column index, corresponding to the actual column index, used to synchronize fixed column styles
  const cateColumns: { title?: string, width: number, colIdx: number }[] = []
  let prevCateTitle = props.columnsConf[0].categoryTitle
  let prevWidth = props.columnsConf[0].width
  let prevColIdx = 0
  props.columnsConf.slice(1).forEach((columnConf, idx) => {
    if (columnConf.categoryTitle === undefined || columnConf.categoryTitle === '' || columnConf.categoryTitle !== prevCateTitle) {
      cateColumns.push({
        title: prevCateTitle,
        width: prevWidth,
        colIdx: prevColIdx,
      })
      prevWidth = columnConf.width
      prevCateTitle = columnConf.categoryTitle
      prevColIdx = idx + 1
    }
    else {
      prevWidth += columnConf.width
    }
  })
  cateColumns.push({
    title: prevCateTitle,
    width: prevWidth,
    colIdx: prevColIdx,
  })
  return cateColumns
})

/**
 * 组装sort数据到columns（sort: { enabledColumnNames: ['no'], items: [{ columnName: 'no', orderDesc: false }] }）
 * Assemble sort data into columns
 */
const columnsWithSort = computed(()=> {

  return props.columnsConf.map(e=> {
    const canSort = props.layoutConf.sort.enabledColumnNames.includes(e.name);
    if(canSort) {
      return {
        ...e,
        orderDesc: props.layoutConf.sort.items?.find(f=> f.columnName === e.name)?.orderDesc ?? ORDER_ENUM.UNDEFINED
      }
    }
    return e;
  })
})

/**
 * 设置新的列宽
 *
 * Set new column width
 *
 * @param newWidth 新的宽度 / New width
 * @param columnName 列名 / Column name
 */
async function setNewWidth(newWidth: number, columnName?: string) {
  const columnConf = props.columnsConf.find(col => col.name === columnName)
  if (columnConf) {
    const changedLayoutReq: LayoutModifyProps = {
      changedColumn: {
        ...columnConf,
        width: newWidth,
      },
    }
    await eb.modifyLayout(changedLayoutReq)
  }
}

/**
 * 排序事件 sort event
 * @param column 列
 */
function handleSort(column) {
  const { orderDesc , name } = column;
  const items = props.layoutConf.sort?.items || [];
  const currentIndex = items?.findIndex(f=> f.columnName === name)
  const currentItem = items?.find(f=> f.columnName === name)
  if(currentItem) {//存在修改 exist modify
    switch(orderDesc){
      case ORDER_ENUM.POSITIVE_SORT: 
        currentItem.orderDesc = ORDER_ENUM.INVERT_SORT;
        break;
      case ORDER_ENUM.INVERT_SORT: 
        items.splice(currentIndex, 1)
        // currentItem.orderDesc = ORDER_ENUM.UNDEFINED;
        break;
      case ORDER_ENUM.UNDEFINED: 
        currentItem.orderDesc = ORDER_ENUM.POSITIVE_SORT;
        break;
      
    }
  }else {//不存在添加 no exist add
    items.push({
      columnName: column.name,
      orderDesc: ORDER_ENUM.POSITIVE_SORT,
    })
  }
  
  eb.modifyLayout({
    sort: {
      enabledColumnNames: props.layoutConf.sort.enabledColumnNames,
      items,
    },
  })
}
</script>

<template>
  <!-- sticky 确保表头固定在顶部，z-[1500] 确保不会被覆盖 -->
  <!-- sticky ensures that the header is fixed at the top, z-[1500] ensures that it is not covered -->
  <div
    :class="`${props.tableConf.styles.headerClass} flex flex-col sticky top-0 z-[1500] bg-base-200 border-b border-b-base-300`"
  >
    <!-- 分类表头 -->
    <!-- Category header -->
    <div v-if="hasCateColumn" class="flex items-center">
      <div
        v-if="props.layoutConf.showSelectColumn"
        :class="`${props.tableConf.styles.cellClass} iw-list-cell flex justify-center items-center bg-base-200`"
        :style="props.setColumnStyles(-1)"
      >
        &nbsp;
      </div>
      <div
        v-for="(cateColumn, colIdx) in cateColumns"
        :key="`${props.layoutConf.id}-${colIdx}`"
        :title="cateColumn.title"
        :class="`${props.tableConf.styles.cellClass} iw-list-cell flex justify-center items-center z-[1000] bg-base-200 ${cateColumn.title && 'border-b border-b-base-300'} ${(colIdx !== 0 || props.layoutConf.showSelectColumn) && 'border-l border-l-base-300'} whitespace-nowrap overflow-hidden text-ellipsis flex-nowrap`"
        :style="props.setColumnStyles(cateColumn.colIdx, cateColumn.width)"
      >
        {{ cateColumn.title ? cateColumn.title : '&nbsp;' }}
      </div>
      <div
        v-if="props.layoutConf.actionColumn"
        :class="`${props.tableConf.styles.cellClass} iw-list-cell flex justify-center items-center bg-base-200 border-l border-l-base-300`"
        :style="props.setColumnStyles(-2)"
      >
        &nbsp;
      </div>
    </div>
    <!-- 常规表头 -->
    <!-- Normal header -->
    <div class="iw-column-header flex items-center relative">
      <div
        v-if="props.layoutConf.showSelectColumn"
        :class="`${props.tableConf.styles.cellClass} iw-list-cell flex justify-center items-center bg-base-200`"
        :style="props.setColumnStyles(-1)"
      >
        <!-- 选择列 -->
        <!-- Select column -->
        <input type="checkbox" class="iw-row-select-all-cell__chk iw-checkbox iw-checkbox-xs rounded">
      </div>
      <!-- 数据列 -->
      <!-- Data column -->
      <div
        v-for="(column, colIdx) in columnsWithSort" :key="`${props.layoutConf.id}-${column.name}`"
        :class="`${props.tableConf.styles.cellClass} iw-list-cell iw-resize-item flex items-center bg-base-200 ${(colIdx !== 0 || props.layoutConf.showSelectColumn) && 'border-l border-l-base-300'} whitespace-nowrap overflow-hidden text-ellipsis flex-nowrap hover:cursor-pointer`"
        :data-column-name="column.name"
        :style="props.setColumnStyles(colIdx)"
        :title="column.title"
        @click="(event: MouseEvent) => showHeaderContextMenu(event, column.name)"
      >
        <i :class="`${column.icon} mr-1`" /> {{ column.title }}
        <div v-if="column.hasOwnProperty('orderDesc')" class="sort-box flex flex-col items-center justify-center ml-2" @click.stop="handleSort(column)">
          <i class="sort-icon octicon-chevron-up-12" :class="`${column.orderDesc === false ? 'text-primary' : ''}`" />
          <i class="sort-icon octicon-chevron-down-12 mt-[-12px]" :class="column.orderDesc ? 'text-primary' : ''" />
        </div>
      </div>
      <!-- 操作列 -->
      <!-- Action column -->
      <div
        v-if="props.layoutConf.actionColumn"
        :class="`${props.tableConf.styles.cellClass} iw-list-cell flex justify-center items-center bg-base-200 border-l border-l-base-300`"
        :style="props.setColumnStyles(-2)"
      >
        {{ $t('layout.action.title') }}
      </div>
      <ColumnResizeComp resize-item-class="iw-resize-item" resize-item-id-prop="columnName" resize-container-class="iw-column-header" :set-size="setNewWidth" />
    </div>
  </div>
  <MenuComp ref="headerMenuCompRef" class="text-sm">
    <template v-if="selectedColumnConf">
      <div
        class="iw-contextmenu__item flex justify-between w-full p-1"
      >
        <ColumnFixedComp :current-column-conf="selectedColumnConf" :columns-conf="columnsConf" />
      </div>
      <div
        class="iw-contextmenu__item flex justify-between w-full p-1"
      >
        <ColumnWrapComp :current-column-conf="selectedColumnConf!" :pk-column-name="props.tableConf.pkColumnName" />
      </div>
    </template>
  </MenuComp>
</template>
