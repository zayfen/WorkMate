import { createApp } from 'vue'
import App from './app.vue'
import router from './router'
import './assets/main.css'
import Toast, { type PluginOptions, POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const app = createApp(App)
app.use(router)
app.use<PluginOptions>(Toast, {
  position: POSITION.TOP_RIGHT,
  timeout: 1800,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.2,
  showCloseButtonOnHover: false,
  maxToasts: 3
})
app.mount('#app')


