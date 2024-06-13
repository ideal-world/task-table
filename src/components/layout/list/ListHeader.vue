<script setup lang="ts">
import { computed, ref } from 'vue'
import MenuComp from '../../common/Menu.vue'
import type { CachedColumnConf, TableBasicConf, TableLayoutConf } from '../../conf'
import ColumnResizeComp from '../../function/ColumnResize.vue'
import ColumnFixedComp from './ListColumnFixed.vue'
import ColumnWrapComp from './ListColumnWrap.vue'

const props = defineProps<{
  columnsConf: CachedColumnConf[]
  layout: TableLayoutConf
  basic: TableBasicConf
  setColumnStyles: (colIdx: number) => any
}>()

const selectedColumnConf = ref<CachedColumnConf | undefined>()
const headerRef = ref<InstanceType<typeof HTMLElement>>()
const headerMenuCompRef = ref<InstanceType<typeof MenuComp>>()

function showHeaderContextMenu(event: MouseEvent, columName: string) {
  selectedColumnConf.value = props.columnsConf.find(col => col.name === columName)
  const targetEle = event.target as HTMLElement
  headerMenuCompRef.value?.show(targetEle)
}

const hasCateColumn = computed(() => props.columnsConf.some(col => col.categoryTitle !== undefined))

const cateColumns = computed(() => {
  const cateColumns: { title?: string, width: number }[] = []
  let prevCateTitle = props.columnsConf[0].categoryTitle
  let prevWidth = props.columnsConf[0].width
  props.columnsConf.slice(1).forEach((columnConf) => {
    if (columnConf.categoryTitle === undefined || columnConf.categoryTitle === '' || columnConf.categoryTitle !== prevCateTitle) {
      cateColumns.push({
        title: prevCateTitle,
        width: prevWidth,
      })
      prevWidth = columnConf.width
      prevCateTitle = columnConf.categoryTitle
    }
    else {
      prevWidth += columnConf.width
    }
  })
  cateColumns.push({
    title: prevCateTitle,
    width: prevWidth,
  })
  return cateColumns
})
</script>

<template>
  <div
    ref="headerRef"
    :class="`${props.basic.styles.headerClass} iw-column-header flex flex-col sticky top-0 z-[1500] bg-base-200 border-b border-b-base-300`"
  >
    <div v-if="hasCateColumn" class="flex items-center">
      <div
        v-if="props.layout.showSelectColumn"
        :class="`${props.basic.styles.cellClass} iw-list-cell iw-column-header-cell flex justify-center items-center bg-base-200`"
        :style="props.setColumnStyles(-1)"
      >
        &nbsp;
      </div>
      <div
        v-for="(cateColumn, colIdx) in cateColumns"
        :key="`${props.layout.id}-${colIdx}`"
        :style="`width:${cateColumn.width}px`"
        :class="`${props.basic.styles.cellClass} iw-list-cell flex justify-center items-center bg-base-200 ${cateColumn.title && 'border-b border-b-base-300'} ${(colIdx !== 0 || props.layout.showSelectColumn) && 'border-l border-l-base-300'}`"
      >
        {{ cateColumn.title ? cateColumn.title : '&nbsp;' }}
      </div>
      <div
        v-if="props.layout.actionColumnRender"
        :class="`${props.basic.styles.cellClass} iw-list-cell iw-column-header-cell flex justify-center items-center bg-base-200 border-l border-l-base-300`"
        :style="props.setColumnStyles(-2)"
      >
        &nbsp;
      </div>
    </div>
    <div class="flex items-center">
      <div
        v-if="props.layout.showSelectColumn"
        :class="`${props.basic.styles.cellClass} iw-list-cell iw-column-header-cell flex justify-center items-center bg-base-200`"
        :style="props.setColumnStyles(-1)"
      >
        <input type="checkbox" class="iw-row-select-all-cell__chk iw-checkbox iw-checkbox-xs">
      </div>
      <div
        v-for="(column, colIdx) in columnsConf" :key="`${props.layout.id}-${column.name}`"
        :class="`${props.basic.styles.cellClass} iw-list-cell iw-column-header-cell ${column.name !== props.basic.pkColumnName ? 'iw-list-header-normal-cell' : ''} flex items-center bg-base-200 ${(colIdx !== 0 || props.layout.showSelectColumn) && 'border-l border-l-base-300'} hover:cursor-pointer`"
        :data-column-name="column.name"
        :style="props.setColumnStyles(colIdx)"
        @click="(event: MouseEvent) => showHeaderContextMenu(event, column.name)"
      >
        <i :class="`${column.icon} mr-1`" /> {{ column.title }}
      </div>
      <div
        v-if="props.layout.actionColumnRender"
        :class="`${props.basic.styles.cellClass} iw-list-cell iw-column-header-cell flex justify-center items-center bg-base-200 border-l border-l-base-300`"
        :style="props.setColumnStyles(-2)"
      >
        {{ $t('layout.action.title') }}
      </div>
    </div>
    <ColumnResizeComp :columns-conf="columnsConf" />
  </div>
  <MenuComp ref="headerMenuCompRef" class="text-sm">
    <template v-if="selectedColumnConf">
      <div
        class="iw-contextmenu__item flex justify-between w-full p-1"
      >
        <ColumnFixedComp :cur-column-conf="selectedColumnConf" :columns-conf="columnsConf" />
      </div>
      <div
        class="iw-contextmenu__item flex justify-between w-full p-1"
      >
        <ColumnWrapComp :cur-column-conf="selectedColumnConf!" :pk-column-name="props.basic.pkColumnName" :columns-conf="columnsConf" />
      </div>
    </template>
  </MenuComp>
</template>
