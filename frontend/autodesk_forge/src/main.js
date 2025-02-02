// src/main.js

import { createApp } from 'vue'
import App from './App.vue'

// 如果你已安裝 Vuetify (假設你使用 Vite + Vuetify 3)
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import router from './router' // <-- 引入我們剛剛建立的 router

const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App)
app.use(router)
app.use(vuetify)

app.mount('#app')
