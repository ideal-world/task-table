<template>
  <div class="container">
    <div class="box" :style="{ width: width + 'px' }" ref="box" @mousedown="startDrag" @mousemove="showHandle" @mouseleave="hideHandle">
      hi
      <div class="handle" v-show="showingHandle" @mousedown="startDrag"></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const box = ref(null);
    const handle = ref(null);
    const startX = ref(0);
    const startWidth = ref(0);
    const isDragging = ref(false);
    const showingHandle = ref(false);

    function startDrag(event) {
      startX.value = event.clientX;
      startWidth.value = box.value.clientWidth;
      isDragging.value = true;
    }

    function onDrag(event) {
      if (isDragging.value) {
        const delta = event.clientX - startX.value;
        const newWidth = startWidth.value + delta;
        box.value.style.width = newWidth + 'px';
      }
    }

    function stopDrag() {
      isDragging.value = false;
    }

    function showHandle(event) {
      const boxRect = box.value.getBoundingClientRect();
      const handleRect = handle.value.getBoundingClientRect();
      const isOverHandle = event.clientX >= boxRect.right - handleRect.width;
      showingHandle.value = isOverHandle;
    }

    function hideHandle() {
      showingHandle.value = false;
    }

    onMounted(() => {
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', stopDrag);
    });

    return {
      box,
      handle,
      width: startWidth,
      startDrag,
      showingHandle
    };
  }
};
</script>

<style>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.box {
  height: 100px;
  background-color: #ccc;
  cursor: ew-resize;
  position: relative;
}

.handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 10px;
  height: 100%;
  background-color: #999;
  cursor: ew-resize;
  opacity: 0.5;
}
</style>