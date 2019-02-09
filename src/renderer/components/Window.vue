<template>
  <div>
    <div class="dragtool" v-if="dragging"></div>
    <div>
      <div id="box" class="box" v-bind:style="pos" @mousedown="startDrag" @mousemove="doDrag"></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dragging: false,
      box: null,
      pos: {
        top: '0px',
        left: '0px',
        opacity: 1
      },
      offset: {
        top: Number,
        left: Number
      }
    };
  },
  methods: {
    startDrag(event) {
      this.dragging = true;
      this.box.setPointerCapture(1);
      this.offset.top = `${event.clientY - this.pos.top.substring(0, this.pos.top.length - 2)}`;
      this.offset.left = `${event.clientX - this.pos.left.substring(0, this.pos.left.length - 2)}`;
      this.pos.opacity = 0.5;
    },
    stopDrag(event) {
      this.dragging = false;
      this.box.releasePointerCapture(1);
      this.pos.opacity = 1;
    },
    doDrag(event) {
      if (this.dragging) {
        this.pos.top = `${event.clientY - this.offset.top}px`;
        this.pos.left = `${event.clientX - this.offset.left}px`;
      }
    }
  },
  mounted() {
    window.addEventListener('mouseup', this.stopDrag);
    this.box = document.getElementById('box');
  }
};
</script>

<style scoped>
.box {
  position: absolute;
  background-color: green;
  height: 50px;
  width: 50px;
}

.dragtool {
  position: absolute;
  background-color: red;
  top: 50%;
  left: 50%;
  margin-left: -25px;
  margin-top: -25px;
  height: 50px;
  width: 50px;
  opacity: 0.5;
}
</style>
