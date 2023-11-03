<script setup lang="ts">
import { showGroupAggMappingByDataKind, translateGroupAgg } from '../../function/group/group';
import { AggregateKind, TableDataResp } from '../../props';
import { ListColumnConf, ListStyleConf } from './conf';

const props = defineProps<{
  stylesConf: ListStyleConf
  columnsConf: ListColumnConf[]
  layoutAggs: { [key: string]: AggregateKind }
  dataBasic: TableDataResp
  pkColumnName: string
  setColumnStyles: (colIdx: number) => any
}>()
</script>

<template>
  <div :className="props.stylesConf.rowClass + ' iw-list-row iw-list-agg-row'">
    <template v-for="(column, colIndex) in props.columnsConf" :key="column.name">
      <div :className="props.stylesConf.cellClass + ' iw-list-cell iw-list-row-agg-cell'" :data-column-name="column.name"
        :style="props.setColumnStyles(colIndex)" v-if="column.name == props.pkColumnName">
        <span class="iw-list-row-agg-cell__agg">{{ $t('function.group.agg.count') }}</span>
        <span class="iw-list-row-agg-cell__value">{{ props.dataBasic.totalNumber }}</span>
      </div>
      <div :className="props.stylesConf.cellClass + ' iw-list-cell iw-list-row-agg-cell'" :data-column-name="column.name"
        :style="props.setColumnStyles(colIndex)" v-else>
        <template v-if="props.layoutAggs && props.layoutAggs[column.name]">
          <span class="iw-list-row-agg-cell__agg">{{ translateGroupAgg(props.layoutAggs[column.name]) }}</span>
          <span class="iw-list-row-agg-cell__value">{{ props.dataBasic.aggs[column.name] }}</span>
        </template>
        <select v-else>
          <option v-for="aggItem in showGroupAggMappingByDataKind(column.dataKind)" :value="aggItem.code"> {{
            aggItem.title }}</option>
        </select>
      </div>
    </template>
  </div>
</template>
