<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import TableSetCommon from '../common/TableSetCommon.vue'
import * as iconSvg from '../../assets/icon'
import type { GanttTimeShow, LayoutModifyProps } from '../../props'
import { GanttShowKind } from '../../props'
import * as eb from '../eventbus'
import type { LayoutConf, TableConf } from '../../components/conf'

const props = defineProps<{
  // 甘特图显示计划时间、实际时间
  tableConf: TableConf
  layoutConf: LayoutConf
  layoutId: string

}>()

const showList = ref([
  {
    title: 'gantt.kind.DAY',
    value: GanttShowKind.DAY,
  },
  {
    title: 'gantt.kind.WEEK',
    value: GanttShowKind.WEEK,
  },
  {
    title: 'gantt.kind.MONTH',
    value: GanttShowKind.MONTH,
  },
  {
    title: 'gantt.kind.YEAR',
    value: GanttShowKind.YEAR,
  },

])

const currentViewMode = computed(() => props.layoutConf.gantt?.showKind ?? props.tableConf.gantt?.showKind)

// const state = reactive({  })

async function changeGanttViewMode(kind: GanttShowKind) {
  console.log('toggleShowGanttTime')
  const changedLayoutReq: any = {
    gantt: { ...props.layoutConf.gantt, showKind: kind },
  }
  await eb.modifyLayout(changedLayoutReq)
}
</script>

<template>
  <TableSetCommon :title="$t('gantt.showPeriod')" is-show>
    <div class="flex justify-between  border-gray-200">
      <div v-for="item in showList" :key="item.value">
        <input
          type="radio"
          class="iw-radio iw-radio-primary iw-radio-xs align-middle mr-2"
          :checked="item.value === currentViewMode"
          @click="changeGanttViewMode(item.value)"
        >

        <span class="text-xs font-normal">
          {{ $t(item.title) }}</span>
      </div>
    </div>
  </TableSetCommon>
</template>
