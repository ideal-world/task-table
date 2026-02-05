<script setup lang="ts">
import { computed, reactive, watchEffect } from 'vue'
import TableSetCommon from '../common/TableSetCommon.vue'
import * as iconSvg from '../../assets/icon'
import type { LayoutModifyProps } from '../../props'
import { GanttDatakind, GanttTimeShow } from '../../props'
import * as eb from '../eventbus'
import type { LayoutConf, TableConf } from '../../components/conf'

const props = defineProps<{
  // 甘特图显示计划时间、实际时间

  tableConf: TableConf
  layoutConf: LayoutConf
  layoutId: string

}>()

const dataKindOpts = [{ label: 'gantt.planPeriod', value: GanttDatakind.PLAN }, { label: 'gantt.actualPeriod', value: GanttDatakind.ACTUAL }, { label: 'gantt.leavePeriod', value: GanttDatakind.LEAVE }, { label: 'gantt.overtimePeriod', value: GanttDatakind.OVERTIME }]

const dataSeries = computed(() => {
  const dataSeries = props.layoutConf.gantt?.dataSeries ? props.layoutConf.gantt?.dataSeries : props.tableConf.gantt?.dataSeries
  return dataSeries ?? []
})

async function toggleShowDataKind(kind: GanttDatakind) {
  let newDataSeries = []
  const findKind = dataSeries.value.find(val => val === kind)
  if (findKind) {
    newDataSeries = dataSeries.value.filter(val => val !== kind)
  }
  else {
    newDataSeries = dataSeries.value.concat(kind)
  }
  const changedLayoutReq: any = {
    gantt: { ...props.layoutConf.gantt, dataSeries: newDataSeries },
  }
  await eb.modifyLayout(changedLayoutReq)
}
</script>

<template>
  <TableSetCommon :title="$t('gantt.showDataSeries')" is-show>
    <div class="flex flex-wrap justify-between  border-gray-200">
      <div v-for="item in dataKindOpts" :key="item.value" class="w-[50%]">
        <input
          type="checkbox"
          class="iw-toggle iw-toggle-primary iw-toggle-xs align-middle mr-2"
          :checked="dataSeries.includes(item.value)"
          @click="toggleShowDataKind(item.value)"
        >

        <span class="text-xs font-normal">{{
          $t(item.label)
        }}</span>
      </div>
    </div>
  </TableSetCommon>
</template>
