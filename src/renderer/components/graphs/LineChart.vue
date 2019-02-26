<template>
    <div class="fill">
        <div class="settings_bar">
            <a @click="openSettings" class="settings_bar_button rotate_60 fas fa-cog"></a>
            <div v-for="line in firstLines" class="quick_check" @click="toggleLine(line)">
                <div :style="{'background-color': line.color}" :class="{'checked': line.render}"></div>
            </div>
        </div>
        <div class="test" ref="container">
            <svg @mousemove="onMouseOver" width="100%" height="100%" ref="svg">
                <g class="x_axis"></g>
                <g class="y_axis"></g>
                <g v-for="(line, index) in activeLines">
                    <path :d="line.data" :style="{stroke: line.color}"></path>
                </g>
            </svg>
            <div class="pointer" ref="pointer">
                <div>value</div>
            </div>
        </div>
        <transition name="fade">
            <div v-show="showSettings" @click.self="closeSettings" class="modal">
                <div class="modal_content">
                    <div class="settings_bar">
                        <a @click="closeSettings" class="settings_bar_button left fas fa-times"></a>
                    </div>
                    <div class="lines">
                        <div class="line_settings">
                            <div>Color</div>
                            <div>Enabled</div>
                        </div>
                        <div v-for="line in lines" class="line_settings">
                            <input type="color" v-model="line.color">
                            <input type="checkbox" v-model="line.render">
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import * as d3 from 'd3';
export default {
  name: 'VueLineChart',
  data() {
    return {
      data: [
        [1, [0, 1, 2]], //
        [2, [-1, 2, 2]],
        [3, [-2, 2, 2]],
        [4, [0, 1, 2]],
        [5, [0, 1, 2]],
        [6, [-1, 2, 10]],
        [7, [-1, 2, 10]]
      ],
      lines: [
        { data: null, color: '#FF4136', render: true }, //
        { data: null, color: '#7FDBFF', render: false },
        { data: null, color: '#0074D9', render: true }
      ],
      width: 0,
      height: 0,
      offsetRight: 20,
      offsetLeft: 30,
      offsetBottom: 30,
      offsetTop: 30,
      mapper: null,
      showSettings: true
    };
  },
  computed: {
    activeLines: function() {
      return this.lines.filter(line => line.render);
    },
    firstLines: function() {
      return this.lines.slice(0, 10);
    }
  },
  mounted() {
    this.onResize();
    window.addEventListener('resize', this.onResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  methods: {
    closeSettings(event) {
      console.log(event);

      this.showSettings = false;
    },
    openSettings() {
      this.showSettings = true;
    },
    toggleLine(line) {
      console.log(line);

      line.render = !line.render;
    },
    onMouseOver(event) {
      let mappedX = Math.round(this.mapper.x.invert(event.offsetX));
      let row = this.data[mappedX - 1];

      if (row != null) {
        let mappedY = Math.round(this.mapper.y.invert(event.offsetY));
        let yValue = row[1].reduce((prev, curr) => (Math.abs(curr - mappedY) < Math.abs(prev - mappedY) ? curr : prev));

        let newx = this.mapper.x(row[0]) - 6;
        let newy = this.mapper.y(yValue) - 6;

        this.$refs.pointer.style.left = newx + 'px';
        this.$refs.pointer.style.top = newy + 'px';
        this.$refs.pointer.firstChild.innerHTML = yValue;
      }
    },
    onResize() {
      // Update height and width of the svg container
      this.graphWidth = this.$refs.container.offsetWidth - this.offsetRight - this.offsetLeft;
      this.graphHeight = this.$refs.container.offsetHeight - this.offsetBottom - this.offsetTop;
      this.updateGraph();
    },
    updateGraph() {
      // Object with methods for mapping the data to pixels
      this.mapper = this.dataMapper();

      // Update Path
      for (let i = 0; i < this.lines.length; i++) {
        let path = d3
          .line()
          .x(d => this.mapper.x(d[0]))
          .y(d => this.mapper.y(d[1][i]));
        this.lines[i].data = path(this.data);
      }
      updateAxis('x_axis', 0, atOrigoX(this.mapper, this.graphHeight) + this.offsetTop, d3.axisBottom(this.mapper.x));
      updateAxis('y_axis', this.offsetLeft, 0, d3.axisLeft(this.mapper.y));
      // updateAxis('y2_axis', this.offsetLeft + this.graphWidth, 0, d3.axisRight(mapper.y)); //
    },
    dataMapper() {
      // Defines graph diminsions in pixels:
      let x = d3.scaleLinear().range([this.offsetLeft, this.graphWidth + this.offsetLeft]);
      let y = d3.scaleLinear().range([this.graphHeight + this.offsetTop, this.offsetTop]);

      // Axis label ranges (ie domain)
      x.domain(d3.extent(this.data, (d, i) => d[0]));
      y.domain([d3.min(this.data, d => Math.min(...d[1])), d3.max(this.data, d => Math.max(...d[1]))]);
      return { x, y };
    }
  }
};

function updateAxis(axis, posX, posY, axisMethod) {
  d3.select('.' + axis)
    .attr('transform', 'translate(' + posX + ',' + posY + ')')
    .call(axisMethod);
}

function atOrigoX(mapper, height) {
  let min = mapper.y.domain()[0];
  let max = mapper.y.domain()[1];

  if (min < 0) {
    if (max < 0) {
      return 0;
    } else {
      return Math.round(height * (max / (Math.abs(min) + max)));
    }
  }
  return height;
}
</script>

<style lang="scss" scoped>
@import '../../assets/fontawesome/css/all.min.css';
svg {
  position: absolute;
  margin: 0px;
  padding: 0px;
  // border: solid 1px blue;
}
path {
  fill: none;
  stroke-width: 3px;
}

.test {
  position: relative;
  width: 100%;
  height: calc(100% - 22px);
  // background-color: #fafafa;
  background-color: #ececec;
  // border: solid 2px red;
}

.settings_bar {
  display: flex;
  width: 100%;
  margin: auto;
  height: 20px;
  background-color: #3d9970;
  border-bottom: solid 2px #255e44;
  justify-content: flex-start;
}

.settings_bar_button {
  margin: 3px 4px 2px 4px;
  color: #1e4b36;
  transition: color 0.3s ease;
  &:hover {
    color: white;
  }
  &:active {
    transition: none;
    color: #1e4b36;
  }
}

.rotate_60 {
  transition: transform 0.3s ease;
  &:hover {
    transform: rotate(60deg);
  }
}

.left {
  margin-left: auto;
}

.quick_check {
  margin: 3px 2px 0px 10px;
  width: 20px;
  padding: 1px;
  border-radius: 5px 5px 0 0;
  border: #1e4b36 solid 2px;
  background-color: #1e4b36;
  line-height: 0px;

  div {
    transition: height 0.3s ease, border-radius 0.3s ease;
    border-radius: 3px 3px 10px 10px;
    margin: auto;
    width: 20px;
    height: 10px;
    filter: grayscale(90%);
  }

  .checked {
    transition: height 0.3s ease-out;
    filter: grayscale(40%);
    height: 30px;
  }
}

.pointer {
  position: absolute;
  width: 10px;
  height: 10px;
  z-index: 10;
  border: solid black 2px;
  border-radius: 10px;

  transition: left 0.2s ease, top 0.2s ease;

  div {
    background-color: rgb(255, 255, 255);
    float: left;
    margin-left: -2px;
    margin-top: 15px;
    padding: 2px;
    border: solid #999 1px;
    font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  }
}

.modal {
  position: absolute;
  z-index: 10;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: rgb(0, 0, 0);
  background-color: rgba(56, 56, 56, 0.6);
}

.modal_content {
  margin: 10% auto auto auto;
  width: 400px;
  background-color: #ececec;
  display: flex;
  flex-direction: column;
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
}

.line_settings {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  padding: 3px;
  border-bottom: 1px solid #8e9e92;

  &:nth-child(2n + 1) {
    background: #dce2de;
    border-bottom: 1px solid #8e9e92;
    font-weight: bold;
  }
  &:nth-child(1) {
    background: #bec5c0;
    border-bottom: 1px solid #8e9e92;
  }

  // &:nth-child(2n + 1) {
  //   background: red;
  // }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  transform: scaleX(0.1) scaleY(0.1);
  opacity: 0;
}
</style>