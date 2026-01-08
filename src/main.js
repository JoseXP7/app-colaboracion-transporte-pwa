import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { registerSW } from 'virtual:pwa-register'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// Register service worker for PWA (auto-update enabled)
try {
  const updateSW = registerSW({ immediate: true })
  // `updateSW` can be used to trigger updates programmatically
} catch (e) {
  // graceful fallback if the virtual module is unavailable in dev
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
}
