import Vue from 'vue'
import App from './App.vue'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
// import cv from '@techstark/opencv-js'

Vue.use(Buefy)
// Vue.use(cv)

new Vue(App).$mount('#app')
