<script setup lang="ts">
import { h, ref, toRaw } from 'vue'
import type { AggDataProps, AggregateKind, DataResp, TableStyleProps } from '../../../props'
import { showAggMappingByDataKind, translateAggregateKind } from '../../../props'
import MenuComp, { MenuOffsetKind, MenuSizeKind } from '../../common/Menu.vue'
import type { ColumnConf } from '../../conf'
import * as eb from '../../eventbus'

const props = defineProps<{
  layoutId: string
  agg: AggDataProps
  dataBasic: DataResp
  showSelectColumn: boolean
  showActionColumn: boolean
  columnsConf: ColumnConf[]
  groupColumnName?: string
  groupValue?: string
  styleProps: TableStyleProps
  setColumnStyles: (colIdx: number) => any
}>()

const aggsMenuCompRef = ref<InstanceType<typeof MenuComp>>()
const dynamicAggMenuContent = ref()

function showAggsContextMenu(event: MouseEvent, colIdx: number) {
  const column = props.columnsConf[colIdx]
  dynamicAggMenuContent.value = () => showAggMappingByDataKind(column.dataKind).map(aggItem =>
    h('div', {
      key: aggItem.kind,
      class: 'iw-contextmenu__item text-sm',
      style: 'cursor: pointer',
      onClick: () => changeColumnAggs(aggItem.kind, column.name),
    }, aggItem.title),
  )
  aggsMenuCompRef.value?.show(event, MenuOffsetKind.RIGHT_BOTTOM, MenuSizeKind.MINI)
}

async function changeColumnAggs(aggKind: AggregateKind, columnName: string) {
  const agg = toRaw(props.agg)
  const idx = agg.items.findIndex(item => item.columnName === columnName)
  if (idx === -1) {
    agg.items.push({ columnName, aggKind })
  }
  else {
    agg.items[idx].aggKind = aggKind
  }
  await eb.modifyLayout({
    agg,
  })
  aggsMenuCompRef.value?.close()
}
</script>

<template>
  <div :class="`${props.styleProps.rowClass} iw-list-row iw-list-agg-row flex border-t border-t-base-300 border-r border-r-base-300 text-sm`">
    <div
      v-if="props.showSelectColumn"
      :class="`${props.styleProps.cellClass} iw-list-cell flex justify-center items-center bg-base-100 border-b border-b-base-300 border-l border-l-base-300 whitespace-nowrap flex-nowrap`"
      :style="props.setColumnStyles(-1)"
    />
    <template v-for="(column, colIdx) in props.columnsConf" :key="`${props.layoutId}-${column.name}`">
      <div
        v-if="colIdx === 0"
        :class="`${props.styleProps.cellClass} iw-list-cell iw-list-agg-cell flex items-center justify-end pr-1 bg-base-100 border-solid border-b border-b-base-300 border-l border-l-base-300 whitespace-nowrap flex-nowrap`" :data-column-name="column.name"
        :style="props.setColumnStyles(0)"
      >
        <span v-if="props.groupColumnName" class="iw-list-agg-cell__group font-bold flex-grow pl-1">{{ props.groupValue }}</span>
        <span class="iw-list-agg-cell__agg text-xs pr-1 self-center">{{ $t('_.agg.count') }}</span>
        <span class="iw-list-agg-cell__value text-info self-center">{{ props.dataBasic.totalNumber }}</span>
      </div>
      <div
        v-else-if="!props.agg.enabledColumnNames.includes(column.name)"
        :class="`${props.styleProps.cellClass} iw-list-cell iw-list-agg-cell cursor-pointer flex items-center justify-end pr-1 bg-base-100 border-solid border-b border-b-base-300 border-l border-l-base-300 hover:bg-base-200 whitespace-nowrap flex-nowrap`" :data-column-name="column.name"
        :style="props.setColumnStyles(colIdx)"
      >
        &nbsp;
      </div>
      <div
        v-else
        :class="`${props.styleProps.cellClass} iw-list-cell iw-list-agg-cell cursor-pointer flex items-center justify-end pr-1 bg-base-100 border-solid border-b border-b-base-300 border-l border-l-base-300 hover:bg-base-200 whitespace-nowrap flex-nowrap`" :data-column-name="column.name"
        :style="props.setColumnStyles(colIdx)" @click="(event: MouseEvent) => showAggsContextMenu(event, colIdx)"
      >
        <template v-if="props.agg.items.some(item => item.columnName === column.name)">
          <span class="iw-list-agg-cell__agg text-xs pr-1 self-center">{{
            translateAggregateKind(props.agg.items.find(item => item.columnName === column.name)!.aggKind) }}</span>
          <span class="iw-list-agg-cell__value text-info self-center">{{ props.dataBasic.aggs[column.name] }}</span>
        </template>
      </div>
    </template>
    <div
      v-if="props.showActionColumn"
      :class="`${props.styleProps.cellClass} iw-list-cell flex justify-center items-center bg-base-100 border-b border-b-base-300 border-l border-l-base-300 whitespace-nowrap flex-nowrap`"
      :style="props.setColumnStyles(-2)"
    />
  </div>
  <MenuComp ref="aggsMenuCompRef" class="iw-list-agg-row-contextmenu">
    <component :is="dynamicAggMenuContent" />
  </MenuComp>
</template>