<template>
  <div style="height: 400px">
    <iw-task-table :columns="columns" :events="events" :layouts="layouts"></iw-task-table>
  </div>
</template>

<script setup lang="ts">
import { TableDataFilterReq, TableDataSortReq, TableDataGroupReq, DataKind, LayoutKind, AggregateKind } from '../src/components/props'

const columns = [{ name: 'no', pk: true, fillable: false, dataKind: DataKind.NUMBER }, { name: 'name' }, { name: 'phone' }, { name: 'addr' }, { name: 'time' }]
const layouts = [{
  id: "hi",
  title: "HI",
  layoutKind: LayoutKind.LIST,
  aggs: { name: AggregateKind.MIN }
}]
const events = {
  loadData: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          records: data,
          totalNumber: data.length,
          aggs: {"name": "Name1"}
        })
      }, 1000)
    })
  },
  saveData: (data: { [key: string]: any }[]) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 1000)
    })
  },
  deleteData: (deletedPks: string[]) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 1000)
    })
  },
}

const data = [
  { no: 1, name: 'Name1', phone: 'Phone1', addr: 'Addr1', time: '2023-10-23' },
  { no: 2, name: 'Name2', phone: 'Phone2', addr: 'Addr2', time: '2023-10-24' },
  { no: 3, name: 'Name3', phone: 'Phone3', addr: 'Addr3', time: '2023-10-25' },
  { no: 4, name: 'Name4', phone: 'Phone4', addr: 'Addr4', time: '2023-10-26' },
  { no: 5, name: 'Name5', phone: 'Phone5', addr: 'Addr5', time: '2023-10-27' },
  { no: 6, name: 'Name6', phone: 'Phone6', addr: 'Addr6', time: '2023-10-28' },
  { no: 7, name: 'Name7', phone: 'Phone7', addr: 'Addr7', time: '2023-10-29' },
  { no: 8, name: 'Name8', phone: 'Phone8', addr: 'Addr8', time: '2023-10-30' },
  { no: 9, name: 'Name9', phone: 'Phone9', addr: 'Addr9', time: '2023-10-31' },
  { no: 10, name: 'Name10', phone: 'Phone10', addr: 'Addr10', time: '2023-11-1' },
  { no: 11, name: 'Name11', phone: 'Phone11', addr: 'Addr11', time: '2023-11-2' },
  { no: 12, name: 'Name12', phone: 'Phone12', addr: 'Addr12', time: '2023-11-3' },
  { no: 13, name: 'Name13', phone: 'Phone13', addr: 'Addr13', time: '2023-11-4' },
  { no: 14, name: 'Name14', phone: 'Phone14', addr: 'Addr14', time: '2023-11-5' },
  { no: 15, name: 'Name15', phone: 'Phone15', addr: 'Addr15', time: '2023-11-6' },
  { no: 16, name: 'Name16', phone: 'Phone16', addr: 'Addr16', time: '2023-11-7' },
  { no: 17, name: 'Name17', phone: 'Phone17', addr: 'Addr17', time: '2023-11-8' },
  { no: 18, name: 'Name18', phone: 'Phone18', addr: 'Addr18', time: '2023-11-9' },
  { no: 19, name: 'Name19', phone: 'Phone19', addr: 'Addr19', time: '2023-11-10' },
  { no: 20, name: 'Name20', phone: 'Phone20', addr: 'Addr20', time: '2023-11-11' },
  { no: 21, name: 'Name21', phone: 'Phone21', addr: 'Addr21', time: '2023-11-12' },
  { no: 22, name: 'Name22', phone: 'Phone22', addr: 'Addr22', time: '2023-11-13' },
  { no: 23, name: 'Name23', phone: 'Phone23', addr: 'Addr23', time: '2023-11-14' },
  { no: 24, name: 'Name24', phone: 'Phone24', addr: 'Addr24', time: '2023-11-15' },
  { no: 25, name: 'Name25', phone: 'Phone25', addr: 'Addr25', time: '2023-11-16' },
  { no: 26, name: 'Name26', phone: 'Phone26', addr: 'Addr26', time: '2023-11-17' },
  { no: 27, name: 'Name27', phone: 'Phone27', addr: 'Addr27', time: '2023-11-18' },
  { no: 28, name: 'Name28', phone: 'Phone28', addr: 'Addr28', time: '2023-11-19' },
  { no: 29, name: 'Name29', phone: 'Phone29', addr: 'Addr29', time: '2023-11-20' },
]
</script>
