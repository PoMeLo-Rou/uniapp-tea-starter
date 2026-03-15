import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import pinia from '@/stores'
import { useLoadingStore } from '@/stores/modules/loading'
export function createApp() {
  const app = createSSRApp(App)
  app.use(pinia)
  const loadingStore = useLoadingStore()
  app.config.globalProperties.$showLoading = loadingStore.showLoading
  app.config.globalProperties.$hideLoading = loadingStore.hideLoading
  return {
    app
  }
}
// #endif