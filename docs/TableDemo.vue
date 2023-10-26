<template>
  <div style="height: 400px">
    <iw-task-table :show="show" :columns="columns" :data="data"></iw-task-table>
  </div>
</template>

<script setup lang="ts">
const show = { fixedColumn: '' }
const columns = [{ name: 'no', unique: true }, { name: 'name' }, { name: 'phone' }, { name: 'addr' }, { name: 'time' }]
const data = [
  { no: 1, name: 'Name1', phone: 'Phone1', addr: 'Addr1', time: '2023-10-23' },
  { no: 2, name: 'Name1', phone: 'Phone1', addr: 'Addr1', time: '2023-10-23' },
  { no: 3, name: 'Name1', phone: 'Phone1', addr: 'Addr1', time: '2023-10-23' },
  { no: 4, name: 'Name1', phone: 'Phone1', addr: 'Addr1', time: '2023-10-23' },
  { no: 5, name: 'Name1', phone: 'Phone1', addr: 'Addr1', time: '2023-10-23' },
  { no: 6, name: 'Name1', phone: 'Phone1', addr: 'Addr1', time: '2023-10-23' },
  { no: 7, name: 'Name1', phone: 'Phone1', addr: 'Addr1', time: '2023-10-23' },
  { no: 8, name: 'Name1', phone: 'Phone1', addr: 'Addr1', time: '2023-10-23' },
  { no: 9, name: 'Name1', phone: 'Phone1', addr: 'Addr1', time: '2023-10-23' },
  { no: 10, name: 'Name1', phone: 'Phone1', addr: 'Addr1', time: '2023-10-23' },
  { no: 11, name: 'Name1', phone: 'Phone1', addr: 'Addr1', time: '2023-10-23' },
  { no: 12, name: 'Name1', phone: 'Phone1', addr: 'Addr1', time: '2023-10-23' },
  { no: 13, name: 'Name1', phone: 'Phone1', addr: 'Addr1', time: '2023-10-23' },
]
</script>
