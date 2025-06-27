import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

console.log('🚀 App starting...')

// Vant样式
import 'vant/lib/index.css'
// 移动端触摸模拟器
import '@vant/touch-emulator'

// 全局样式
import './styles/global.scss'

// Capacitor
import { Capacitor } from '@capacitor/core'
import { StatusBar } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 如果是移动端APP环境
if (Capacitor.isNativePlatform()) {
  console.log('📱 Native platform detected')
  // 设置状态栏
  StatusBar.setStyle({ style: 'default' })
  StatusBar.setBackgroundColor({ color: '#ffffff' })
  
  // 延迟隐藏启动屏，确保应用已加载
  setTimeout(() => {
    console.log('⏰ Hiding splash screen')
    SplashScreen.hide()
  }, 1000)
} else {
  console.log('🌐 Web platform detected')
}

console.log('🔧 Mounting app...')
app.mount('#app')
console.log('✅ App mounted successfully!')

// 注册Service Worker (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('❌ SW registration failed: ', registrationError)
      })
  })
} 