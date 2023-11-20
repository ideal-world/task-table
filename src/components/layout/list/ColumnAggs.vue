<script setup lang="ts">
import { inject, ref } from 'vue'
import MenuComp, { MenuOffsetKind, MenuSizeKind } from '../../common/Menu.vue'
import { CachedColumnConf, TableStyleConf } from '../../conf'
import { FUN_LOAD_DATA_TYPE } from '../../events'
import { showGroupAggMappingByDataKind } from '../../function/Group.vue'
import { AggregateKind, TableDataResp, translateGroupAgg } from '../../props'

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

const showAggsContextMenu = (event: MouseEvent, colIdx: number) => {
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
  <div :class="props.stylesConf.rowClass + ' iw-list-row iw-list-agg-row flex border-r border-r-base-300'">
    <template v-for="(column, colIdx) in props.columnsConf" :key="column.name">
      <div
        :class="props.stylesConf.cellClass + ' iw-list-cell iw-list-agg-cell cursor-pointer flex items-center justify-end pr-1 bg-base-100 border-solid border-b border-b-base-300 border-l  border-l-base-300 hover:bg-base-200'"
        :data-column-name="column.name" :style="props.setColumnStyles(colIdx)"
        @click="(event: MouseEvent) => showAggsContextMenu(event, colIdx)" v-if="column.name == props.pkColumnName">
        <span class="iw-list-agg-cell__group font-bold flex-grow pl-1">{{ props.groupValue }}</span>
        <span class="iw-list-agg-cell__agg text-xs pr-1 self-center">{{ $t('function.group.agg.count')
        }}</span>
        <span class="iw-list-agg-cell__value text-info self-center">{{ props.dataBasic.totalNumber }}</span>
      </div>
      <div
        :class="props.stylesConf.cellClass + ' iw-list-cell iw-list-agg-cell cursor-pointer flex items-center justify-end pr-1 bg-base-100 border-solid border-b border-b-base-300 border-l  border-l-base-300 hover:bg-base-200'"
        :data-column-name="column.name" :style="props.setColumnStyles(colIdx)"
        @click="(event: MouseEvent) => showAggsContextMenu(event, colIdx)" v-else>
        <template v-if="props.layoutAggs && props.layoutAggs[column.name]">
          <span class="iw-list-agg-cell__agg text-xs pr-1 self-center">{{
            translateGroupAgg(props.layoutAggs[column.name]) }}</span>
          <span class="iw-list-agg-cell__value text-info self-center">{{ props.dataBasic.aggs[column.name] }}</span>
        </template>
      </div>
      <menu-comp ref="aggsMenuCompRefs" class="iw-list-agg-row-contextmenu">
        <div v-for="aggItem in showGroupAggMappingByDataKind(column.dataKind)" class="iw-contextmenu__item"
          @click="() => changeColumnAggs(aggItem.kind, colIdx)" style="cursor: pointer">
          {{ aggItem.title }}
        </div>
      </menu-comp>
    </template>
    <div
      :class="props.stylesConf.cellClass + ' iw-list-cell iw-list-agg-cell cursor-pointer flex items-center justify-end pr-1 bg-base-100 border-solid border-b border-b-base-300 border-l  border-l-base-300 hover:bg-base-200'"
      :style="props.setColumnStyles(-1)">
    </div>
  </div>
</template>