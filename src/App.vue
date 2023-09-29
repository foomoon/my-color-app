<script>
import cv from '@techstark/opencv-js'

export default {
  data() {
    return {
      colors: [
        {
          name: 'red',
          data: [
            {
              limits: [0, 180],
              val: [0, 255],
              type: 'h',
            },
            {
              limits: [0, 255],
              val: [0, 255],
              type: 's',
            },
            {
              limits: [0, 255],
              val: [0, 255],
              type: 'v',
            },
          ],
        },
        {
          name: 'green',
          data: [
            {
              limits: [0, 180],
              val: [0, 255],
              type: 'h',
            },
            {
              limits: [0, 255],
              val: [0, 255],
              type: 's',
            },
            {
              limits: [0, 255],
              val: [0, 255],
              type: 'v',
            },
          ],
        },
        {
          name: 'blue',
          data: [
            {
              limits: [0, 180],
              val: [0, 255],
              type: 'h',
            },
            {
              limits: [0, 255],
              val: [0, 255],
              type: 's',
            },
            {
              limits: [0, 255],
              val: [0, 255],
              type: 'v',
            },
          ],
        },
        {
          name: 'cyan',
          data: [
            {
              limits: [0, 180],
              val: [0, 255],
              type: 'h',
            },
            {
              limits: [0, 255],
              val: [0, 255],
              type: 's',
            },
            {
              limits: [0, 255],
              val: [0, 255],
              type: 'v',
            },
          ],
        },
        {
          name: 'magenta',
          data: [
            {
              limits: [0, 180],
              val: [0, 255],
              type: 'h',
            },
            {
              limits: [0, 255],
              val: [0, 255],
              type: 's',
            },
            {
              limits: [0, 255],
              val: [0, 255],
              type: 'v',
            },
          ],
        },
        {
          name: 'yellow',
          data: [
            {
              limits: [0, 180],
              val: [0, 255],
              type: 'h',
            },
            {
              limits: [0, 255],
              val: [0, 255],
              type: 's',
            },
            {
              limits: [0, 255],
              val: [0, 255],
              type: 'v',
            },
          ],
        },
      ],
    }
  },
  methods: {
    slideChange(val) {
      console.log(val)
    },
  },
  mounted() {
    console.log('mounted')
  },
}
</script>

<template>
  <div id="app">
    <!-- <img src="@/assets/logo.svg" alt="Vite logo" /> -->
    <h1>Color Tester</h1>
    <div v-for="color in colors" :key="color.name">
      <span class="label" :style="'background-color:' + color.name">{{ color.name }}</span>
      <b-slider
        indicator
        v-for="slider in color.data"
        :key="slider.type"
        :min="slider.limits[0]"
        :max="slider.limits[1]"
        v-model="slider.val"
        @dragging="slideChange"
      ></b-slider>
    </div>
  </div>
</template>

<style>
#app {
  /* font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px; */
  padding: 2em;
}
.label {
  padding: 3px;
}
</style>
