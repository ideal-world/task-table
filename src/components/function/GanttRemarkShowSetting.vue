<script setup lang="ts">
import { computed, reactive, ref, watch, watchEffect } from 'vue'
import TableSetCommon from '../common/TableSetCommon.vue'
import type { LayoutModifyProps } from '../../props'
import { GanttTimeShow } from '../../props'
import * as eb from '../eventbus'
import type { LayoutConf, TableConf } from '../../components/conf'
import locales from '../../locales'

const props = defineProps<{
  // 表格配置
  // Table configuration
  tableConf: TableConf
  layoutConf: LayoutConf
  layoutId: string

}>()

const { t } = locales.global

const RemarkLabelMap: any = {
  _planPeriod: t('gantt.planDurationPeriod'),
  _actualPeriod: t('gantt.actualDurationPeriod'),
}

const blockRemarkOptions = computed(() => {
  const remarkOptionKeys = props.layoutConf.ganttConf?.remarkOptionKeys ?? props.tableConf.ganttConf?.remarkOptionKeys
  const options = [{ label: '无', value: '' }]
  let confOptions: { label: string, value: string }[] = []
  if (remarkOptionKeys) {
    const columnsMap = new Map()
    props.tableConf.columns.forEach((item) => {
      columnsMap.set(item.name, item)
    })
    confOptions = remarkOptionKeys.map((name) => {
      const item = columnsMap.get(name)
      return item ? { label: item.title, value: item.name } : ['_planPeriod', '_actualPeriod'].includes(name) ? { label: RemarkLabelMap[name], value: name } : undefined
    }).filter(el => el !== undefined)
  }
  return options.concat(confOptions)
})

const state = reactive({ leftRemark: '', rightRemark: '' })

watchEffect(() => {
  state.leftRemark = props.layoutConf.gantt?.leftMark ?? ''
  state.rightRemark = props.layoutConf.gantt?.rightMark ?? ''
})

async function changeGanttRemark(type: 'leftRemark' | 'rightRemark', e: MouseEvent) {
  const val = blockRemarkOptions.value[(e.target as HTMLSelectElement)!.selectedIndex].value
  if (type === 'leftRemark')
    state.leftRemark = val
  else (state.rightRemark = val)
  const changedLayoutReq: any = {
    gantt: { ...props.layoutConf.gantt, leftMark: state.leftRemark, rightMark: state.rightRemark },
  }
  await eb.modifyLayout(changedLayoutReq)
}
</script>

<template>
  <TableSetCommon :title="$t('gantt.blockRemark')" is-show>
    <div class=" border-gray-200">
      <div class="flex justify-between">
        <span class="text-xs font-normal">{{
          $t('gantt.leftRemark')
        }}</span>
        <select v-model="state.leftRemark" clear class="iw-select iw-select-xs w-[150px]" @change="(val: any) => changeGanttRemark('leftRemark', val)">
          <option v-for="item in blockRemarkOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </div>
      <div class="flex justify-between mt-1">
        <span class="text-xs font-normal">{{
          $t('gantt.rightRemark')
        }}</span>
        <select v-model="state.rightRemark" class="iw-select iw-select-xs w-[150px]" @change="(val: any) => changeGanttRemark('rightRemark', val)">
          <option v-for="item in blockRemarkOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </div>
    </div>
  </TableSetCommon>
</template>
