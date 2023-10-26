<template>
  <table>
    <thead>
      <tr>
        <th v-for="(column, index) in columns" :key="index" @mousedown="startDrag(index)" @mouseup="endDrag(index)">
          <div class="column" :class="{ dragging: index === draggingColumnIndex }">
            {{ column.title }}
          </div>
        </th>
      </tr>
    </thead>
    <tbody>
      <transition-group name="row" tag="tr">
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
          <td v-for="(column, columnIndex) in columns" :key="columnIndex">
            {{ row[column.field] }}
          </td>
        </tr>
      </transition-group>
    </tbody>
  </table>
</template>

<script>
export default {
  data() {
    return {
      rows: [
        { id: 1, name: 'John', age: 25, city: 'New York' },
        { id: 2, name: 'Jane', age: 30, city: 'Los Angeles' },
        { id: 3, name: 'Bob', age: 20, city: 'Chicago' }
      ],
      columns: [
        { title: 'ID', field: 'id' },
        { title: 'Name', field: 'name' },
        { title: 'Age', field: 'age' },
        { title: 'City', field: 'city' }
      ],
      draggingColumnIndex: null
    };
  },
  methods: {
    startDrag(index) {
      this.draggingColumnIndex = index;
    },
    endDrag(index) {
      if (this.draggingColumnIndex !== null && index !== this.draggingColumnIndex) {
        const temp = this.columns[index];
        this.$set(this.columns, index, this.columns[this.draggingColumnIndex]);
        this.$set(this.columns, this.draggingColumnIndex, temp);
      }
      this.draggingColumnIndex = null;
    }
  }
};
</script>

<style>
.column {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: move;
  user-select: none;
}

.column.dragging {
  opacity: 0.5;
}

.row-enter-active,
.row-leave-active {
  transition: all 0.3s;
}

.row-enter,
.row-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>