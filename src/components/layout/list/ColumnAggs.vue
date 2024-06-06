<script setup lang="ts">
import { h, ref } from 'vue'
import type { AggregateKind, TableDataResp } from '../../../props'
import { showAggMappingByDataKind, translateAggregateKind } from '../../../props'
import MenuComp, { MenuOffsetKind, MenuSizeKind } from '../../common/Menu.vue'
import type { CachedColumnConf, TableStyleConf } from '../../conf'
import * as eb from '../../eventbus'

const props = defineProps<{
  layoutAggs: { [key: string]: AggregateKind }
  showSelectColumn: boolean
  showActionColumn: boolean
  dataBasic: TableDataResp
  columnsConf: CachedColumnConf[]
  stylesConf: TableStyleConf
  groupValue?: string
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
      onClick: () => changeColumnAggs(aggItem.kind, colIdx),
    }, aggItem.title),
  )
  aggsMenuCompRef.value?.show(event, MenuOffsetKind.RIGHT_BOTTOM, MenuSizeKind.MINI)
}

async function changeColumnAggs(aggKind: AggregateKind, colIdx: number) {
  const aggs = JSON.parse(JSON.stringify(props.layoutAggs))
  aggs[props.columnsConf[colIdx].name] = aggKind
  await eb.modifyLayout({
    aggs,
  })
  aggsMenuCompRef.value?.close()
}
</script>

<template>
  <div :class="`${props.stylesConf.rowClass} iw-list-row iw-list-agg-row flex border-t border-t-base-300 border-r border-r-base-300 text-sm`">
    <div
      v-if="props.showSelectColumn"
      :class="`${props.stylesConf.cellClass} iw-list-cell flex justify-center items-center bg-base-100 border-b border-b-base-300 border-l border-l-base-300 whitespace-nowrap flex-nowrap`"
      :style="props.setColumnStyles(-1)"
    />
    <template v-for="(column, colIdx) in props.columnsConf" :key="column.name">
      <div
        v-if="colIdx === 0"
        :class="`${props.stylesConf.cellClass} iw-list-cell iw-list-agg-cell flex items-center justify-end pr-1 bg-base-100 border-solid border-b border-b-base-300 border-l border-l-base-300`" :data-column-name="column.name"
        :style="props.setColumnStyles(0)"
      >
        <span class="iw-list-agg-cell__group font-bold flex-grow pl-1">{{ props.groupValue }}</span>
        <span class="iw-list-agg-cell__agg text-xs pr-1 self-center">{{ $t('_.agg.count') }}</span>
        <span class="iw-list-agg-cell__value text-info self-center">{{ props.dataBasic.totalNumber }}</span>
      </div>
      <div
        v-else
        :class="`${props.stylesConf.cellClass} iw-list-cell iw-list-agg-cell cursor-pointer flex items-center justify-end pr-1 bg-base-100 border-solid border-b border-b-base-300 border-l border-l-base-300 hover:bg-base-200`" :data-column-name="column.name"
        :style="props.setColumnStyles(colIdx)" @click="(event: MouseEvent) => showAggsContextMenu(event, colIdx)"
      >
        <template v-if="props.layoutAggs && props.layoutAggs[column.name]">
          <span class="iw-list-agg-cell__agg text-xs pr-1 self-center">{{
            translateAggregateKind(props.layoutAggs[column.name]) }}</span>
          <span class="iw-list-agg-cell__value text-info self-center">{{ props.dataBasic.aggs[column.name] }}</span>
        </template>
      </div>
    </template>
    <div
      v-if="props.showActionColumn"
      :class="`${props.stylesConf.cellClass} iw-list-cell flex justify-center items-center bg-base-100 border-b border-b-base-300 border-l border-l-base-300 whitespace-nowrap flex-nowrap`"
      :style="props.setColumnStyles(-2)"
    />
  </div>
  <MenuComp ref="aggsMenuCompRef" class="iw-list-agg-row-contextmenu">
    <component :is="dynamicAggMenuContent" />
  </MenuComp>
</template>
