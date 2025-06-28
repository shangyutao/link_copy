<template>
  <div class="install-prompt-overlay" v-if="visible" @click="closePrompt">
    <div class="install-prompt" @click.stop>
      <!-- 关闭按钮 -->
      <div class="close-btn" @click="closePrompt">
        <van-icon name="cross" size="20" />
      </div>

      <!-- 应用图标和标题 -->
      <div class="app-info">
        <div class="app-icon">
          <img src="/vite.svg" alt="Link Copy" />
        </div>
        <h3 class="app-title">添加到主屏幕</h3>
        <p class="app-subtitle">获得更好的使用体验</p>
      </div>

      <!-- 设备特定的安装步骤 -->
      <div class="install-steps">
                 <!-- iOS Safari 步骤 -->
         <div v-if="deviceType === 'ios'" class="steps-container">
           <div class="device-badge ios">
             <van-icon name="apple-o" size="16" />
             <span>iPhone / iPad</span>
           </div>

           <!-- iOS 增强提示 -->
           <div class="ios-enhanced-tip">
             <van-icon name="info-o" size="20" color="#007AFF" />
             <p>iOS设备需要手动操作，无法自动安装</p>
           </div>
           
           <div class="steps">
             <div class="step">
               <div class="step-number">1</div>
               <div class="step-content">
                 <div class="step-icon">
                   <van-icon name="share" size="24" color="#007AFF" />
                 </div>
                 <div class="step-text">
                   <strong>点击分享按钮</strong>
                   <span>在底部导航栏找到 <van-icon name="share" size="14" /> 分享图标</span>
                 </div>
               </div>
             </div>

             <div class="step">
               <div class="step-number">2</div>
               <div class="step-content">
                 <div class="step-icon">
                   <van-icon name="plus" size="24" color="#007AFF" />
                 </div>
                 <div class="step-text">
                   <strong>添加到主屏幕</strong>
                   <span>在分享菜单中找到并点击此选项</span>
                 </div>
               </div>
             </div>

             <div class="step">
               <div class="step-number">3</div>
               <div class="step-content">
                 <div class="step-icon">
                   <van-icon name="success" size="24" color="#34C759" />
                 </div>
                 <div class="step-text">
                   <strong>完成安装</strong>
                   <span>点击"添加"即可在桌面找到应用</span>
                 </div>
               </div>
             </div>
           </div>
         </div>

        <!-- Android Chrome 步骤 -->
        <div v-else-if="deviceType === 'android'" class="steps-container">
          <div class="device-badge android">
            <van-icon name="android-o" size="16" />
            <span>Android</span>
          </div>
          
          <div class="steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <div class="step-icon">
                  <van-icon name="wap-nav" size="24" color="#4285F4" />
                </div>
                <div class="step-text">
                  <strong>打开菜单</strong>
                  <span>点击浏览器右上角的三个点</span>
                </div>
              </div>
            </div>

            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <div class="step-icon">
                  <van-icon name="plus" size="24" color="#4285F4" />
                </div>
                <div class="step-text">
                  <strong>添加到主屏幕</strong>
                  <span>在菜单中选择"添加到主屏幕"</span>
                </div>
              </div>
            </div>

            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <div class="step-icon">
                  <van-icon name="success" size="24" color="#34A853" />
                </div>
                <div class="step-text">
                  <strong>完成安装</strong>
                  <span>确认后即可在桌面使用</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 桌面浏览器 -->
        <div v-else class="steps-container">
          <div class="device-badge desktop">
            <van-icon name="desktop-o" size="16" />
            <span>桌面浏览器</span>
          </div>
          
          <div class="desktop-info">
            <van-icon name="info-o" size="24" color="#667eea" />
            <p>在桌面浏览器中，您可以：</p>
            <ul>
              <li>将此页面添加到书签</li>
              <li>创建桌面快捷方式</li>
              <li>或直接在浏览器中使用</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="prompt-actions">
        <!-- Android Chrome 一键安装按钮 -->
        <button 
          v-if="canAutoInstall && deviceType === 'android'" 
          class="btn-install" 
          @click="handleAutoInstall"
        >
          <van-icon name="plus" size="16" />
          一键安装
        </button>
        
        <!-- 常规按钮 -->
        <template v-if="!canAutoInstall || deviceType !== 'android'">
          <button class="btn-secondary" @click="remindLater">稍后提醒</button>
          <button class="btn-primary" @click="closePrompt">暂时关闭</button>
        </template>
        
        <!-- Android有一键安装时的次要按钮 -->
        <template v-else>
          <button class="btn-secondary" @click="remindLater">稍后提醒</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'

export default {
  name: 'InstallPrompt',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'close'],
  setup(props, { emit }) {
    const showPrompt = ref(false)
    const deviceType = ref('desktop')
    const deferredPrompt = ref(null)
    const canAutoInstall = ref(false)
    
    // 计算属性：显示状态
    const visible = computed(() => props.modelValue || showPrompt.value)

    // 检测设备类型
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      
      if (/iphone|ipad|ipod/.test(userAgent)) {
        deviceType.value = 'ios'
      } else if (/android/.test(userAgent)) {
        deviceType.value = 'android'
      } else {
        deviceType.value = 'desktop'
      }
    }

    // 检查是否应该显示提示
    const shouldShowPrompt = () => {
      console.log('🔍 检查是否显示安装提示...')
      console.log('设备类型:', deviceType.value)
      
      // 检查是否已经安装为PWA
      const isPWA = window.matchMedia('(display-mode: standalone)').matches
      console.log('是否已安装PWA:', isPWA)
      if (isPWA) {
        return false
      }

      // 检查用户设置
      const dismissCount = parseInt(localStorage.getItem('install-prompt-dismiss-count') || '0')
      const lastShown = localStorage.getItem('install-prompt-last-shown')
      console.log('关闭次数:', dismissCount)
      console.log('上次显示时间:', lastShown)
      
      // 如果用户关闭超过3次，则减少频率
      if (dismissCount >= 3) {
        if (lastShown) {
          const lastShownTime = new Date(lastShown)
          const now = new Date()
          const hoursDiff = (now - lastShownTime) / (1000 * 60 * 60)
          console.log('距离上次显示小时数:', hoursDiff)
          
          // 关闭3次以上，7天后再显示
          if (hoursDiff < 168) { // 7天 = 168小时
            console.log('❌ 用户已多次关闭，7天内不再显示')
            return false
          }
        }
      } else {
        // 关闭次数少于3次，采用较短的间隔
        if (lastShown) {
          const lastShownTime = new Date(lastShown)
          const now = new Date()
          const hoursDiff = (now - lastShownTime) / (1000 * 60 * 60)
          console.log('距离上次显示小时数:', hoursDiff)
          
          // 根据关闭次数决定间隔时间
          let cooldownHours = 0.5; // 默认30分钟
          if (dismissCount === 1) cooldownHours = 2; // 第一次关闭后2小时
          if (dismissCount === 2) cooldownHours = 6; // 第二次关闭后6小时
          
          console.log('需要等待小时数:', cooldownHours)
          
          if (hoursDiff < cooldownHours) {
            console.log(`❌ 需要等待${cooldownHours}小时后再显示`)
            return false
          }
        }
      }

      // 在移动设备和桌面都显示（桌面显示不同内容）
      const shouldShow = true
      console.log('是否应该显示:', shouldShow)
      return shouldShow
    }

    // 关闭提示
    const closePrompt = () => {
      showPrompt.value = false
      emit('update:modelValue', false)
      emit('close')
      
      // 只有自动弹出的提示才记录关闭次数
      if (!props.modelValue) {
        const currentCount = parseInt(localStorage.getItem('install-prompt-dismiss-count') || '0')
        localStorage.setItem('install-prompt-dismiss-count', (currentCount + 1).toString())
        localStorage.setItem('install-prompt-last-shown', new Date().toISOString())
        console.log('🔕 用户关闭提示，当前关闭次数:', currentCount + 1)
      }
    }

    // 稍后提醒
    const remindLater = () => {
      showPrompt.value = false
      emit('update:modelValue', false)
      emit('close')
      
      // 只有自动弹出的提示才记录稍后提醒
      if (!props.modelValue) {
        localStorage.setItem('install-prompt-last-shown', new Date().toISOString())
        console.log('⏰ 用户选择稍后提醒')
      }
    }

    // 一键安装功能（Android Chrome支持）
    const handleAutoInstall = async () => {
      if (deferredPrompt.value) {
        console.log('🚀 触发自动安装')
        try {
          // 显示安装提示
          deferredPrompt.value.prompt()
          
          // 等待用户响应
          const { outcome } = await deferredPrompt.value.userChoice
          console.log('用户选择:', outcome)
          
          if (outcome === 'accepted') {
            console.log('✅ 用户接受了安装')
            showPrompt.value = false
          } else {
            console.log('❌ 用户拒绝了安装')
          }
          
          // 清除deferredPrompt，因为它只能使用一次
          deferredPrompt.value = null
          canAutoInstall.value = false
        } catch (error) {
          console.error('安装失败:', error)
        }
      } else {
        console.log('❌ 当前环境不支持自动安装')
      }
    }

    onMounted(() => {
      detectDevice()
      
      // 监听PWA安装事件（主要是Android Chrome）
      window.addEventListener('beforeinstallprompt', (e) => {
        console.log('🎯 检测到PWA安装提示事件')
        // 阻止默认的安装提示
        e.preventDefault()
        // 保存事件，稍后使用
        deferredPrompt.value = e
        canAutoInstall.value = true
        console.log('✅ 支持一键安装功能')
      })

      // 监听PWA安装完成事件
      window.addEventListener('appinstalled', () => {
        console.log('🎉 PWA安装完成')
        showPrompt.value = false
        deferredPrompt.value = null
        canAutoInstall.value = false
      })
      
      console.log('🚀 InstallPrompt组件已挂载')
      
      // 减少延迟时间用于测试
      setTimeout(() => {
        console.log('⏰ 延迟时间到，检查是否显示提示')
        if (shouldShowPrompt()) {
          console.log('✅ 显示安装提示')
          showPrompt.value = true
        } else {
          console.log('❌ 不显示安装提示')
        }
      }, 1000) // 改为1秒，方便测试
    })

    return {
      visible,
      showPrompt,
      deviceType,
      canAutoInstall,
      closePrompt,
      remindLater,
      handleAutoInstall
    }
  }
}
</script>

<style lang="scss" scoped>
.install-prompt-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;
}

.install-prompt {
  background: white;
  border-radius: 20px;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.4s ease-out;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 1;

  &:hover {
    background: #e8e8e8;
    transform: scale(1.1);
  }
}

.app-info {
  text-align: center;
  padding: 32px 24px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.app-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  border-radius: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);

  img {
    width: 48px;
    height: 48px;
    filter: brightness(0) invert(1);
  }
}

.app-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.app-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.install-steps {
  padding: 24px;
}

.device-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;

  &.ios {
    background: #e3f2fd;
    color: #1976d2;
  }

  &.android {
    background: #e8f5e8;
    color: #2e7d32;
  }

  &.desktop {
    background: #f3e5f5;
    color: #7b1fa2;
  }
}

.ios-enhanced-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f0f8ff;
  border: 1px solid #e3f2fd;
  border-radius: 8px;
  margin-bottom: 20px;

  p {
    margin: 0;
    font-size: 14px;
    color: #1976d2;
    font-weight: 500;
  }
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.step-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.step-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.step-text {
  flex: 1;

  strong {
    display: block;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 4px;
  }

  span {
    font-size: 14px;
    color: #666;
    line-height: 1.4;
  }
}

.desktop-info {
  text-align: center;
  padding: 20px;
  background: #f8f9ff;
  border-radius: 12px;
  
  p {
    margin: 12px 0 16px;
    color: #666;
    font-size: 16px;
  }

  ul {
    text-align: left;
    margin: 0;
    padding-left: 20px;
    color: #666;

    li {
      margin-bottom: 8px;
      font-size: 14px;
    }
  }
}

.prompt-actions {
  padding: 24px;
  display: flex;
  gap: 12px;
  border-top: 1px solid #f0f0f0;
}

.btn-secondary,
.btn-primary,
.btn-install {
  flex: 1;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;

  &:hover {
    background: #e8e8e8;
  }
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
}

.btn-install {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-weight: 700;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  // 添加闪光效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// 移动端适配
@media (max-width: 480px) {
  .install-prompt {
    margin: 10px;
    max-height: 85vh;
  }

  .app-info {
    padding: 24px 20px 20px;
  }

  .app-icon {
    width: 64px;
    height: 64px;

    img {
      width: 36px;
      height: 36px;
    }
  }

  .app-title {
    font-size: 20px;
  }

  .install-steps {
    padding: 20px;
  }

  .prompt-actions {
    padding: 20px;
    flex-direction: column;

    .btn-secondary,
    .btn-primary {
      padding: 16px 20px;
    }
  }
}
</style> 