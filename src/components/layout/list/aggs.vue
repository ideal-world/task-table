<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { showGroupAggMappingByDataKind, translateGroupAgg } from '../../function/group/group';
import { AggregateKind, TableDataResp } from '../../props';
import { ListColumnConf, ListStyleConf } from './conf';
import MenuComp from '../../common/menu.vue'
import { MenuOffsetKind, MenuSizeKind } from '../../common/menu.vue';
import { FN_LOAD_DATA } from '../../../constant';

const props = defineProps<{
  stylesConf: ListStyleConf
  columnsConf: ListColumnConf[]
  layoutAggs: { [key: string]: AggregateKind }
  dataBasic: TableDataResp
  pkColumnName: string
  groupValue?: string
  setColumnStyles: (colIdx: number) => any
}>()

const aggsMenuCompRefs = ref()
let loadDataFun = inject(FN_LOAD_DATA)

const showAggsContextMenu = (event: MouseEvent, colIdx: number) => {
  const targetEle = event.target as HTMLElement
  aggsMenuCompRefs.value[colIdx].show(targetEle, MenuOffsetKind.RIGHT_BOTTOM, MenuSizeKind.SMALL)
}

function changeColumnAggs(aggKind: AggregateKind, colIdx: number) {
  props.layoutAggs[props.columnsConf[colIdx].name] = aggKind
  // @ts-ignore
  aggsMenuCompRefs.value[colIdx].close()
  // @ts-ignore
  loadDataFun()
}
</script>

<template>
  <div :className="props.stylesConf.rowClass + ' iw-list-row iw-list-agg-row'">
    <template v-for="(column, colIdx) in props.columnsConf" :key="column.name">
      <div :className="props.stylesConf.cellClass + ' iw-list-cell iw-list-agg-row-cell'" :data-column-name="column.name"
        :style="props.setColumnStyles(colIdx)" @click="(event: MouseEvent) => showAggsContextMenu(event, colIdx)"
        v-if="column.name == props.pkColumnName">
        <span class="iw-list-agg-row-cell__group">{{ props.groupValue }}</span>
        <span class="iw-list-agg-row-cell__agg">{{ $t('function.group.agg.count') }}</span>
        <span class="iw-list-agg-row-cell__value">{{ props.dataBasic.totalNumber }}</span>
      </div>
      <div :className="props.stylesConf.cellClass + ' iw-list-cell iw-list-agg-row-cell'" :data-column-name="column.name"
        :style="props.setColumnStyles(colIdx)" @click="(event: MouseEvent) => showAggsContextMenu(event, colIdx)" v-else>
        <template v-if="props.layoutAggs && props.layoutAggs[column.name]">
          <span class="iw-list-agg-row-cell__agg">{{ translateGroupAgg(props.layoutAggs[column.name]) }}</span>
          <span class="iw-list-agg-row-cell__value">{{ props.dataBasic.aggs[column.name] }}</span>
        </template>
      </div>
      <menu-comp ref="aggsMenuCompRefs" className="iw-list-agg-row-contextmenu">
        <p v-for="aggItem in showGroupAggMappingByDataKind(column.dataKind)" className="iw-contextmenu__item"
          @click="() => changeColumnAggs(aggItem.kind, colIdx)" style="cursor: pointer">
          {{ aggItem.title }}
        </p>
      </menu-comp>
    </template>
  </div>
</template>

<style lang="scss" scoped>
@import '../../../assets/main.scss';

@include b('list-agg-row') {
  background-color: var(--el-bg-color-page);
}

@include b('list-agg-row-cell') {
  display: flex;
  cursor: pointer;
  justify-content:end;
  padding: 0 4px;

  @include e('group') {
    flex-grow: 1;
  }

  @include e('agg') {
    color: var(--el-color-info);
    font-size: 0.8em;
    padding-right: 3px;
  }

  @include e('value') {}

}
</style>