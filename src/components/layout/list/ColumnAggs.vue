<script setup lang="ts">
import { inject, ref, toRaw } from 'vue'
import MenuComp, { MenuOffsetKind, MenuSizeKind } from '../../common/Menu.vue'
import type { CachedColumnConf, TableStyleConf } from '../../conf'
import { FUN_LOAD_DATA_TYPE } from '../../events'
import { showGroupAggMappingByDataKind } from '../../function/Group.vue'
import type { AggregateKind, TableDataResp } from '../../props'
import { translateGroupAgg } from '../../props'

const props = defineProps<{
  layoutAggs: { [key: string]: AggregateKind }
  dataBasic: TableDataResp
  pkColumnName: string
  columnsConf: CachedColumnConf[]
  stylesConf: TableStyleConf
  groupValue?: string
  setColumnStyles: (colIdx: number) => any
}>()

const aggsMenuCompRefs = ref()
const loadDataFun = inject(FUN_LOAD_DATA_TYPE)!

function showAggsContextMenu(event: MouseEvent, colIdx: number) {
  const targetEle = event.target as HTMLElement
  aggsMenuCompRefs.value[colIdx].show(targetEle, MenuOffsetKind.RIGHT_BOTTOM, MenuSizeKind.SMALL)
}

function changeColumnAggs(aggKind: AggregateKind, colIdx: number) {
  props.layoutAggs[props.columnsConf[colIdx].name] = aggKind
  aggsMenuCompRefs.value[colIdx].close()
  loadDataFun()
}
</script>

<template>
  <div :class="`${props.stylesConf.rowClass} iw-list-row iw-list-agg-row flex border-r border-r-base-300`">
    <template v-for="(column, colIdx) in props.columnsConf" :key="column.name">
      <div
        v-if="column.name === props.pkColumnName"
        :class="`${props.stylesConf.cellClass} iw-list-cell iw-list-agg-cell cursor-pointer flex items-center justify-end pr-1 bg-base-100 border-solid border-b border-b-base-300 border-l  border-l-base-300 hover:bg-base-200`" :data-column-name="column.name"
        :style="props.setColumnStyles(colIdx)" @click="(event: MouseEvent) => showAggsContextMenu(event, colIdx)"
      >
        <span class="iw-list-agg-cell__group font-bold flex-grow pl-1">{{ props.groupValue }}</span>
        <span class="iw-list-agg-cell__agg text-xs pr-1 self-center">{{ $t('_.agg.count')
        }}</span>
        <span class="iw-list-agg-cell__value text-info self-center">{{ props.dataBasic.totalNumber }}</span>
      </div>
      <div
        v-else
        :class="`${props.stylesConf.cellClass} iw-list-cell iw-list-agg-cell cursor-pointer flex items-center justify-end pr-1 bg-base-100 border-solid border-b border-b-base-300 border-l  border-l-base-300 hover:bg-base-200`" :data-column-name="column.name"
        :style="props.setColumnStyles(colIdx)" @click="(event: MouseEvent) => showAggsContextMenu(event, colIdx)"
      >
        <template v-if="props.layoutAggs && props.layoutAggs[column.name]">
          <span class="iw-list-agg-cell__agg text-xs pr-1 self-center">{{
            translateGroupAgg(props.layoutAggs[column.name]) }}</span>
          <span class="iw-list-agg-cell__value text-info self-center">{{ props.dataBasic.aggs[column.name] }}</span>
        </template>
      </div>
      <MenuComp ref="aggsMenuCompRefs" class="iw-list-agg-row-contextmenu">
        <div
          v-for="aggItem in showGroupAggMappingByDataKind(column.dataKind)" class="iw-contextmenu__item"
          :key="aggItem.kind"
          style="cursor: pointer" @click="() => changeColumnAggs(aggItem.kind, colIdx)"
        >
          {{ aggItem.title }}
        </div>
      </MenuComp>
    </template>
    <div
      :class="`${props.stylesConf.cellClass} iw-list-cell iw-list-agg-cell cursor-pointer flex items-center justify-end pr-1 bg-base-100 border-solid border-b border-b-base-300 border-l  border-l-base-300 hover:bg-base-200`"
      :style="props.setColumnStyles(-1)"
    />
  </div>
</template>
