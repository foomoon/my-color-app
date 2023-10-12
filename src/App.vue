<script>
import { ColorTrackerOpenCv } from './ColorTrackerOpenCv.js'

export default {
  data() {
    return {
      fps: 0,
      resolution: [1280, 720],
      tracker: null,
      blur: 1,
      size: [.1, 1],
      colors: [
        {
          name: 'red',
          selected: true,
          data: [
            {
              limits: [0, 180],
              val: [0, 5],
              type: 'h',
            },
            {
              limits: [0, 255],
              val: [75, 255],
              type: 's',
            },
            {
              limits: [0, 255],
              val: [128, 255],
              type: 'v',
            },
          ],
        },
        {
          name: 'green',
          selected: false,
          data: [
            {
              limits: [0, 180],
              val: [20, 25],
              type: 'h',
            },
            {
              limits: [0, 255],
              val: [75, 255],
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
          selected: false,
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
          selected: false,
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
          selected: false,
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
          selected: false,
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
          name: 'white',
          selected: false,
          data: [
            {
              limits: [0, 180],
              val: [0, 255],
              type: 'h',
            },
            {
              limits: [0, 255],
              val: [0, 5],
              type: 's',
            },
            {
              limits: [0, 255],
              val: [240, 255],
              type: 'v',
            },
          ],
        },
      ],
    }
  },
  
  mounted() {
    const video = document.querySelector('#video')
    const canvas = document.querySelector('#canvasOutput')
    this.tracker = new ColorTrackerOpenCv(video, canvas)
    this.tracker.loadOpenCv(() => {
      // OpenCV.js is now loaded and can be used in this component
      // let keys = Object.keys(cv).filter((key) => !key.includes('dynCall') && !key.startsWith('_'))
      // console.log(keys)
      this.resolution = [this.tracker.stream_width, this.tracker.stream_height]
      console.log('Resolution', this.resolution)
      console.log(this.tracker.deviceInfo)
      console.log(this.tracker.cameraList)
    })

    
    setInterval(() => {
      this.fps = this.tracker?.fps
    }, 1000);
    
    this.blur = this.tracker.blurSize
    this.size = [this.tracker.minBlobAreaPercent, this.tracker.maxBlobAreaPercent]

    let tempColors = []
    for (let key in this.tracker.colorModels) {
      if (this.tracker.colorModels.hasOwnProperty(key)) {
        // Access the property using key and myObject[key]
        let model = this.tracker.colorModels[key]
        // console.log(key + ': ' + model)
        tempColors.push({
          name: key,
          selected: false,
          data: [
            {
              limits: [0, 180],
              val: [model.lower[0], model.upper[0]],
              type: 'h',
            },
            {
              limits: [0, 255],
              val: [model.lower[1], model.upper[1]],
              type: 's',
            },
            {
              limits: [0, 255],
              val: [model.lower[2], model.upper[2]],
              type: 'v',
            },
          ],
        })
      }
    }
    this.colors = tempColors
  },
  watch: {
    colors: {
      handler: function (val) {
        // filter val based on val.selected
        let selectedColors = val.filter((color) => color.selected).map((color) => color.name)
        this.tracker.selectedColors = selectedColors
        let colorModel = {}
        val.forEach((color) => {
          const h = color.data[0].val
          const s = color.data[1].val
          const v = color.data[2].val
          colorModel[color.name] = {
            lower: [h[0], s[0], v[0], 255],
            upper: [h[1], s[1], v[1], 255],
          }
        })
        this.tracker.colorModels = colorModel
      },
      deep: true,
    },
    blur: {
      handler: function (val) {
        this.tracker.blurSize = val
      },
    },
    size: {
      handler: function (val) {
        this.tracker.minBlobAreaPercent = val[0]
        this.tracker.maxBlobAreaPercent = val[1]
      },
    },
  },
  methods: {
    hsl(data, index) {
      let h = (data[0].val[index] * 2) / 360
      const s = data[1].val[index] / 255
      const v = data[2].val[index] / 255

      // Calculate lightness (L)
      let l = ((2 - s) * v) / 2

      // Calculate saturation (S)
      let sNew = l < 0.5 ? (s * v) / (l * 2) : (s * v) / (2 - l * 2)

      h = Math.round(h * 360)
      sNew = Math.round(sNew * 100)
      l = Math.round(l * 100)
      return `hsl(${h}, ${sNew}%, ${l}%)`
    },
    slideChange(val) {
      // console.log(val)
    },
  },
}
</script>

<template>
  <div id="app">
    <!-- <img src="@/assets/logo.svg" alt="Vite logo" /> -->
    <section>
      <!-- <b-button label="Colors" @click="showColors = !showColors" /> -->
      <b-message title="T3 - Tracker Tuning Tool" :closable="false" >
        {{ this.tracker?.colorModels }}
      </b-message>
    </section>
    <section class="my-3">
      <div v-for="color in colors" :key="color.name">
        <!-- <span class="label" :style="'background-colorx:' + color.name">{{ color.name }}</span> -->
        <b-field>
          <b-switch v-model="color.selected" type="is-info" outlined>
            <span class="switch-label">{{ color.name }}</span>
          </b-switch>
          <b-taglist attached>
            <b-tag
              type="is-dark"
              :style="'background-color: ' + hsl(color.data, 0) + '; opacity:' + (color.selected ? '1' : '0.5')"
              >Lo</b-tag
            >
            <b-tag
              type="is-info"
              :style="'background-color: ' + hsl(color.data, 1) + '; opacity:' + (color.selected ? '1' : '0.5')"
              >Hi</b-tag
            >
          </b-taglist>
          <b-slider
            indicator
            v-for="slider in color.data"
            :key="slider.type"
            :min="slider.limits[0]"
            :max="slider.limits[1]"
            type="is-info"
            size="is-small"
            :tooltip="false"
            :disabled="!color.selected"
            v-model="slider.val"
            @dragging="slideChange"
            class="mx-5"
            ><div class="sliderText">
              <span>{{ slider.type }}</span>
            </div></b-slider
          >
        </b-field>
      </div>
    </section>
    <section>
      <span>{{ this.fps }} fps</span>
      <video id="video" :width="resolution[0]" :height="resolution[1]" autoplay></video>
      <canvas id="canvasOutput" :width="resolution[0]" :height="resolution[1]"></canvas>
      
    </section>
    <section>
      <b-field>
        <b-slider v-model="blur" :min="1" :max="100" indicator type="is-info" :tooltip="false" class="mx-5"
          ><div class="sliderText">
            <span>blur</span>
          </div></b-slider
        >
        <b-slider v-model="size" :min="0" :max="0.3" :step="0.001" indicator type="is-info" :tooltip="false" class="mx-5"
          ><div class="sliderText">
            <span>size</span>
          </div></b-slider
        >
      </b-field>
    </section>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 20px;
  padding: 2em;
}
.label {
  padding: 3px;
}
.tags {
  flex-wrap: nowrap !important;
}
.tags:not(:last-child) {
  margin-bottom: 0 !important;
}
.tags .tag {
  margin-bottom: 0 !important;
}
.b-slider-thumb {
  padding: 10px 8px !important;
}
.sliderText {
  position: relative;
  width: 100%;
  text-align: center;
}
.sliderText span {
  z-index: 1000;
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.8);
}
.switch-label {
  display: inline-block;
  min-width: 4em;
}
video {
  position: absolute;
  opacity: 0;
}
canvas {
  display: block;
  margin: 2em auto;
}
</style>
