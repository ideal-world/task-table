<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { TableShowConf, TableStyleConf } from '../conf'
import { ListBasicConf, ListColumnConf, ListConf, ListStyleConf } from './conf'
import MenuComp from '../common/menu.vue'
import FixedComp from './fixed.vue'
import SortComp from './sort.vue'
import ResizeComp from './resize.vue'
import FillComp from './fill.vue'
import DeleteComp from './delete.vue'
import { setFixedColumnStyles } from './fixed.vue'
import { DataKind } from '../props'
const { t } = useI18n()

const listConf = defineProps<
  ListConf & {
    show: TableShowConf
    globalStyles: TableStyleConf
  }
>()

const basicConf = reactive<ListBasicConf>(listConf.basic)
const columnsConf = reactive<ListColumnConf[]>(listConf.columns)
const stylesConf = reactive<ListStyleConf>(listConf.styles)
const selectedDataPks = ref<string[] | number[] | undefined>()
const headerMenuCompRefs = ref()
const rowMenuCompRef = ref()

const setColumnStyles = (colIdx: number) => {
  const styles: any = {}
  styles.width = columnsConf[colIdx].width + 'px'
  setFixedColumnStyles(styles, colIdx, listConf.show.fixedColumnIdx, columnsConf)
  return styles
}

const showHeaderContextMenu = (event: MouseEvent, colIndex: number) => {
  const targetEle = event.target as HTMLElement
  headerMenuCompRefs.value[colIndex].show(targetEle)
}

const showRowContextMenu = (event: MouseEvent) => {
  const targetEle = event.target as HTMLElement
  const selectedRowEle = targetEle.parentElement as HTMLElement
  if (columnsConf.find((col) => col.name == basicConf.pkColumnName)?.dataKind == DataKind.NUMBER) {
    selectedDataPks.value = [parseInt(selectedRowEle.dataset.pk as string)]
  } else {
    selectedDataPks.value = [selectedRowEle.dataset.pk as string]
  }
  rowMenuCompRef.value.show(event)
}
</script>

<template>
  <div :class="'iw-list  iw-list--size-' + globalStyles.size" :style="{ width: columnsConf.reduce((count, col) => count + col.width, 0) + 'px' }">
    <div :className="stylesConf.headerClass + ' iw-list-header'">
      <div
        v-for="(column, colIndex) in columnsConf"
        :key="column.name"
        :className="stylesConf.cellClass + ' iw-list-cell iw-list-header-cell'"
        :data-column-name="column.name"
        :style="setColumnStyles(colIndex)"
        @click="(event:MouseEvent) => showHeaderContextMenu(event,colIndex)"
      >
        <svg v-html="column.icon"></svg> {{ column.name }}
        <menu-comp ref="headerMenuCompRefs" className="iw-list-header-contextmenu">
          <fixed-comp :current-col-idx="colIndex" :basic-conf="basicConf" :show="listConf.show"></fixed-comp>
        </menu-comp>
      </div>
    </div>
    <div v-for="(row, rowIndex) in listConf.show.data" :key="row[basicConf.pkColumnName]" :data-pk="row[basicConf.pkColumnName]" :className="stylesConf.rowClass + ' iw-list-row'">
      <template v-for="(column, colIndex) in columnsConf" :key="column.name">
        <div
          :className="stylesConf.cellClass + ' iw-list-cell iw-list-row-cell'"
          :data-column-name="column.name"
          :data-row-idx="rowIndex"
          :style="setColumnStyles(colIndex)"
          @contextmenu.prevent="showRowContextMenu"
        >
          {{ row[column.name] }}
        </div>
      </template>
    </div>
    <menu-comp ref="rowMenuCompRef" className="iw-list-row-contextmenu">
      <delete-comp :select-pks="selectedDataPks" v-show="basicConf.editable"></delete-comp>
    </menu-comp>
  </div>
  <sort-comp :columns-conf="columnsConf"></sort-comp>
  <resize-comp :columns-conf="columnsConf"></resize-comp>
  <fill-comp :columns-conf="columnsConf" :data="listConf.show.data" :pkColumnName="listConf.basic.pkColumnName" v-if="basic.fillable"></fill-comp>
</template>

<style lang="scss" scoped>
@import '../../assets/main.scss';

@include b('list') {
  position: relative;

  @include m('size-mini') {
    font-size: 9pt;

    @include b('list-cell') {
      padding: 1px;
    }
  }

  @include m('size-small') {
    font-size: 10pt;

    @include b('list-cell') {
      padding: 3px;
    }
  }

  @include m('size-medium') {
    font-size: 11pt;

    @include b('list-cell') {
      padding: 4px 5px;
    }
  }

  @include m('size-large') {
    font-size: 13pt;

    @include b('list-cell') {
      padding: 6px 7px;
    }
  }
}

@include b('list-header') {
  display: flex;
  border-top: 1px solid var(--el-border-color);
  border-right: 1px solid var(--el-border-color);
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1100;

  @include b('list-cell') {
    display: flex;
    align-items: center;
    &:hover {
      cursor: pointer;
      background-color: var(--el-color-info-light-7);
    }

    & svg {
      width: 1em;
      height: 1em;
      margin-right: 3px;
    }
  }
}

@include b('list-row') {
  display: flex;
  border-right: 1px solid var(--el-border-color);

  &:hover .iw-list-cell {
    background-color: var(--el-color-info-light-9);
  }
}

@include b('list-cell') {
  border-left: 1px solid var(--el-border-color);
  border-bottom: 1px solid var(--el-border-color);
  background-color: var(--el-bg-color);
}
</style>
