<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { TableProps } from './props'
import { initConf } from './conf'
import * as table from './table/conf'
import TableComp from './table/table.vue'

const props = defineProps<TableProps>()

const [basicConf, basicStyleConf] = initConf(props)
const tableConf = table.initConf(props)
</script>

<template>
  <div :className="basicStyleConf.tableClass + ' iw-tt'" :id="basicConf.tableId">
    <div className="iw-tt-tools"></div>
    <table-comp :basic="tableConf.basic" :columns="tableConf.columns" :data="tableConf.data" :events="tableConf.events" :styles="tableConf.styles" />
  </div>
</template>

<style lang="scss" scoped>
@import '../assets/main.scss';

@include b('tt') {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
</style>
