<template>
  <div class="install-prompt-overlay" v-if="showPrompt" @click="closePrompt">
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
          
          <div class="steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <div class="step-icon">
                  <van-icon name="share" size="24" color="#007AFF" />
                </div>
                <div class="step-text">
                  <strong>点击分享按钮</strong>
                  <span>在底部导航栏找到分享图标</span>
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
                  <span>在分享菜单中选择此选项</span>
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
                  <span>确认后即可在桌面找到应用</span>
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
        <button class="btn-secondary" @click="remindLater">稍后提醒</button>
        <button class="btn-primary" @click="closePrompt">我知道了</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'InstallPrompt',
  setup() {
    const showPrompt = ref(false)
    const deviceType = ref('desktop')

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
      // 检查是否已经安装为PWA
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return false
      }

      // 检查是否已经关闭过提示
      const dismissed = localStorage.getItem('install-prompt-dismissed')
      const lastShown = localStorage.getItem('install-prompt-last-shown')
      
      if (dismissed === 'true') {
        return false
      }

      // 如果选择了稍后提醒，24小时内不再显示
      if (lastShown) {
        const lastShownTime = new Date(lastShown)
        const now = new Date()
        const hoursDiff = (now - lastShownTime) / (1000 * 60 * 60)
        
        if (hoursDiff < 24) {
          return false
        }
      }

      // 只在移动设备上显示
      return deviceType.value === 'ios' || deviceType.value === 'android'
    }

    // 关闭提示
    const closePrompt = () => {
      showPrompt.value = false
      localStorage.setItem('install-prompt-dismissed', 'true')
    }

    // 稍后提醒
    const remindLater = () => {
      showPrompt.value = false
      localStorage.setItem('install-prompt-last-shown', new Date().toISOString())
    }

    onMounted(() => {
      detectDevice()
      
      // 延迟3秒显示提示，让用户先体验一下应用
      setTimeout(() => {
        if (shouldShowPrompt()) {
          showPrompt.value = true
        }
      }, 3000)
    })

    return {
      showPrompt,
      deviceType,
      closePrompt,
      remindLater
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
  margin-bottom: 24px;

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
.btn-primary {
  flex: 1;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
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