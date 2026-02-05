<script setup lang="ts">
import { reactive, watchEffect } from 'vue'
import TableSetCommon from '../common/TableSetCommon.vue'
import * as iconSvg from '../../assets/icon'
import type { LayoutModifyProps } from '../../props'
import { GanttTimeShow } from '../../props'
import * as eb from '../eventbus'
import type { LayoutConf, TableConf } from '../../components/conf'

const props = defineProps<{
  // 甘特图显示计划时间、实际时间

  tableConf: TableConf
  layoutConf: LayoutConf
  layoutId: string

}>()

const state = reactive({ planPeriod: true, actualPeriod: true })

watchEffect(() => {
  state.planPeriod = props.layoutConf.gantt?.showPlanPeriod ?? true
  state.actualPeriod = props.layoutConf.gantt?.showRealPeriod ?? true
})

async function toggleShowGanttTime(kind: 'plan' | 'actual') {
  if (kind === 'plan') {
    state.planPeriod = !state.planPeriod
  }
  else {
    state.actualPeriod = !state.actualPeriod
  }
  const changedLayoutReq: any = {
    gantt: { ...props.layoutConf.gantt, showPlanPeriod: state.planPeriod, showRealPeriod: state.actualPeriod },
  }
  await eb.modifyLayout(changedLayoutReq)
}
</script>

<template>
  <TableSetCommon :title="$t('gantt.showTime')" is-show>
    <div class="flex justify-between  border-gray-200">
      <div>
        <input
          type="checkbox"
          class="iw-toggle iw-toggle-primary iw-toggle-xs align-middle mr-2"
          :checked="state.planPeriod"
          @click="toggleShowGanttTime('plan')"
        >

        <span class="text-xs font-normal">{{
          $t('gantt.planPeriod')
        }}</span>
      </div>
      <div>
        <input
          type="checkbox"
          class="iw-toggle iw-toggle-primary iw-toggle-xs align-middle mr-2"
          :checked="state.actualPeriod"
          @click="toggleShowGanttTime('actual')"
        >

        <span class="text-xs font-normal">{{
          $t('gantt.actualPeriod')
        }}</span>
      </div>
    </div>
  </TableSetCommon>
</template>
