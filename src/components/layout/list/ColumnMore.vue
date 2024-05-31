<script setup lang="ts">
import { ref } from 'vue'
import type { TableLayoutModifyProps } from '../../../props'
import MenuComp, { MenuOffsetKind } from '../../common/Menu.vue'
import type { TableColumnConf, TableLayoutColumnConf } from '../../conf'
import * as eb from '../../eventbus'

const props = defineProps<{
  basicColumnsConf: TableColumnConf[]
  layoutColumnsConf: TableLayoutColumnConf[]
}>()
const columnMoreCompRef = ref<InstanceType<typeof MenuComp>>()

async function setShowToggleColumn(columnConf: TableColumnConf) {
  const layoutColumnsConf = props.layoutColumnsConf.find(col => col.name === columnConf.name)
  if (layoutColumnsConf) {
    await eb.modifyColumn({
      name: layoutColumnsConf.name,
      wrap: layoutColumnsConf.wrap,
      fixed: layoutColumnsConf.fixed,
      width: layoutColumnsConf.width,
      hide: !layoutColumnsConf.hide,
      dateStart: layoutColumnsConf.dateStart,
      dateEnd: layoutColumnsConf.dateEnd,
    })
  }
  else {
    const changedLayoutReq: TableLayoutModifyProps = {
      newColumn: {
        name: columnConf.name,
        hide: false,
      },
    }
    await eb.modifyLayout(changedLayoutReq)
  }
}

function showContainer(event: MouseEvent, offsetKind: MenuOffsetKind = MenuOffsetKind.RIGHT_BOTTOM) {
  columnMoreCompRef.value?.show(event, offsetKind)
}

defineExpose({
  show: showContainer,
})
</script>

<template>
  <MenuComp ref="columnMoreCompRef">
    <div class="iw-divider">
      {{ $t('list.columnHide.title') }}
    </div>
    <div v-for="column in props.basicColumnsConf" :key="column.name" class="iw-contextmenu__item flex justify-between w-full">
      <span>
        <i :class="column.icon" />
        {{ column.title }}
      </span>
      <input
        type="checkbox" class="iw-toggle iw-toggle-xs"
        :checked="props.layoutColumnsConf.find(col => col.name === column.name)?.hide ?? true"
        @click="setShowToggleColumn(column)"
      >
    </div>
  </MenuComp>
</template>
