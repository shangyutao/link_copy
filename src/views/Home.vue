<template>
  <div class="home-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>

    <div class="container">
      <!-- 头部区域 -->
      <header class="header animate-fade-in-up">
        <div class="logo">
          <div class="logo-icon glow-effect">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
          </div>
          <div class="logo-text">
            <h1 class="gradient-text">Link Copy</h1>
            <p>智能视频解析与文案提取</p>
          </div>
        </div>
        
        <van-button 
          class="install-btn btn-glass"
          icon="wap-home-o"
          @click="handleInstallClick"
        >
          添加到桌面
        </van-button>
      </header>

      <!-- 主要内容区域 -->
      <main class="main-content">
        <!-- 输入区域 -->
        <div class="input-section animate-fade-in-up">
          <div class="input-card card-floating">
            <!-- 选项卡切换 -->
            <div class="tab-switcher">
              <div class="tab-buttons">
                <button 
                  :class="['tab-button', { active: activeTab === 'link' }]"
                  @click="switchTab('link')"
                >
                  <van-icon name="link" />
                  <span>链接解析</span>
                </button>
                <button 
                  :class="['tab-button', { active: activeTab === 'upload' }]"
                  @click="switchTab('upload')"
                >
                  <van-icon name="upgrade" />
                  <span>文件上传</span>
                </button>
              </div>
            </div>

            <!-- 链接解析界面 -->
            <div v-if="activeTab === 'link'" class="tab-content">
              <div class="input-header">
                <h2>粘贴视频链接</h2>
                <p>支持抖音、哔哩哔哩等主流视频平台</p>
              </div>
              
              <div class="input-area">
                <van-field
                  v-model="inputUrl"
                  type="textarea"
                  placeholder="在此粘贴视频链接或分享文本..."
                  rows="3"
                  maxlength="2000"
                  :disabled="isInputDisabled"
                  class="url-input"
                  @update:model-value="onInputChange"
                  @focus="onInputFocus"
                  @blur="onInputBlur"
                />
                
                <div class="input-actions">
                  <van-button 
                    v-if="clipboardSupported"
                    class="paste-btn btn-glass"
                    icon="add-o"
                    @click="pasteFromClipboard"
                    :loading="pasting"
                  >
                    粘贴
                  </van-button>
                  
                  <van-button
                    type="primary"
                    class="submit-btn btn-primary"
                    :loading="submitting"
                    :disabled="!isValidInput || isInputDisabled"
                    @click="handleSubmit"
                  >
                    <template #icon>
                      <van-icon name="play-circle" />
                    </template>
                    开始解析
                  </van-button>
                </div>
              </div>
              
              <!-- 平台检测提示 -->
              <div v-if="detectedPlatform" class="platform-hint">
                <van-tag type="primary" class="platform-tag">
                  <van-icon :name="getPlatformIcon(detectedPlatform)" />
                  检测到：{{ getPlatformName(detectedPlatform) }}
                </van-tag>
              </div>
            </div>

            <!-- 文件上传界面 -->
            <div v-if="activeTab === 'upload'" class="tab-content">
              <div class="input-header">
                <h2>上传视频文件</h2>
                <p>支持 MP4、AVI、MOV 等格式，文件大小不超过 500MB</p>
              </div>
              
              <div class="upload-area">
                <!-- 文件拖拽区域 -->
                <div 
                  class="upload-dropzone"
                  :class="{ 
                    'dragover': isDragOver, 
                    'has-file': selectedFile,
                    'disabled': isInputDisabled 
                  }"
                  @click="triggerFileSelect"
                  @dragover.prevent="handleDragOver"
                  @dragleave.prevent="handleDragLeave"
                  @drop.prevent="handleFileDrop"
                >
                  <input 
                    ref="fileInput"
                    type="file"
                    accept="video/*,.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv,.m4v,.3gp,.ogv"
                    @change="handleFileSelect"
                    style="display: none"
                    :disabled="isInputDisabled"
                  />
                  
                  <div v-if="!selectedFile" class="upload-prompt">
                    <div class="upload-icon">
                      <van-icon name="plus" size="48px" />
                    </div>
                    <h3>点击选择或拖拽视频文件</h3>
                    <p>支持 MP4、AVI、MOV、WMV、FLV、WEBM、MKV、M4V、3GP、OGV</p>
                    <p class="size-hint">文件大小限制：500MB</p>
                  </div>
                  
                  <div v-else class="file-preview">
                    <div class="file-icon">
                      <van-icon name="video-o" size="48px" />
                    </div>
                    <div class="file-info">
                      <h4>{{ selectedFile.name }}</h4>
                      <p>{{ formatFileSize(selectedFile.size) }}</p>
                    </div>
                    <van-button 
                      size="small" 
                      type="danger" 
                      plain
                      @click.stop="removeSelectedFile"
                    >
                      移除
                    </van-button>
                  </div>
                </div>
                
                <!-- 上传操作按钮 -->
                <div class="upload-actions">
                  <van-button
                    type="primary"
                    class="upload-btn btn-primary"
                    :loading="uploading"
                    :disabled="!selectedFile || isInputDisabled"
                    @click="handleFileUpload"
                  >
                    <template #icon>
                      <van-icon name="upgrade" />
                    </template>
                    开始上传
                  </van-button>
                </div>
                
                <!-- 上传进度 -->
                <div v-if="uploadProgress > 0 && uploading" class="upload-progress">
                  <div class="progress-info">
                    <span>上传进度</span>
                    <span>{{ uploadProgress }}%</span>
                  </div>
                  <van-progress
                    :percentage="uploadProgress"
                    stroke-width="8"
                    color="#667eea"
                    track-color="rgba(102, 126, 234, 0.1)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 进度显示区域 -->
        <div v-if="showProgress" class="progress-section animate-fade-in-up">
          <div class="progress-card card-floating">
            <div class="progress-header">
              <div class="progress-icon">
                <van-loading v-if="isProcessing" size="24px" color="#667eea" />
                <van-icon v-else-if="isCompleted" name="success" color="#10b981" />
                <van-icon v-else-if="isFailed" name="cross" color="#ef4444" />
                <van-icon v-else name="clock-o" color="#f59e0b" />
              </div>
              <div class="progress-content">
                <h3>{{ statusText }}</h3>
                <p>{{ statusDetail }}</p>
              </div>
              <van-button 
                v-if="isProcessing" 
                size="small" 
                type="danger" 
                plain
                @click="handleCancelTask"
                :loading="canceling"
              >
                取消
              </van-button>
            </div>
            
            <div v-if="isProcessing" class="progress-bar-container">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: currentProgress + '%' }"></div>
              </div>
              <span class="progress-text">{{ Math.round(currentProgress) }}%</span>
            </div>
          </div>
        </div>

        <!-- 平台支持展示 -->
        <div class="platforms-section animate-fade-in-up">
          <div class="platforms-card card-floating">
            <div class="platforms-header">
              <h3>支持平台</h3>
              <p>持续扩展中，更多平台即将支持</p>
            </div>
            <div class="platforms-grid">
              <div 
                v-for="platform in supportedPlatforms" 
                :key="platform.name"
                class="platform-item"
              >
                <div class="platform-icon" :style="{ color: platform.color }">
                  <van-icon :name="platform.icon" />
                </div>
                <span class="platform-name">{{ platform.displayName }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 功能特性 -->
        <div class="features-section animate-fade-in-up">
          <div class="features-card card-floating">
            <div class="features-header">
              <h3>功能特性</h3>
              <p>强大的视频处理能力，一站式解决方案</p>
            </div>
            <div class="features-grid">
              <div v-for="feature in features" :key="feature.name" class="feature-item">
                <div class="feature-icon">
                  <van-icon :name="feature.icon" />
                </div>
                <div class="feature-content">
                  <h4>{{ feature.name }}</h4>
                  <p>{{ feature.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    
    <!-- 安装提示组件 -->
    <InstallPrompt 
      v-model="showInstallPrompt"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useTaskStore } from '@/stores/task'
import { isValidUrl, detectPlatform } from '@/utils/validate'
import { copyToClipboard, readFromClipboard } from '@/utils/clipboard'
import { videoCleaner } from '@/services/video'
import InstallPrompt from '@/components/InstallPrompt.vue'

const router = useRouter()
const route = useRoute()
const taskStore = useTaskStore()

// 响应式数据
const inputUrl = ref('')
const detectedPlatform = ref('')
const submitting = ref(false)
const pasting = ref(false)
const canceling = ref(false)
// 模拟进度条
const currentProgress = ref(0)
const progressTimer = ref(null)
const pollingTimer = ref(null)

// 文件上传相关
const activeTab = ref('link') // 当前激活的选项卡
const selectedFile = ref(null) // 选中的文件
const uploading = ref(false) // 上传状态
const uploadProgress = ref(0) // 上传进度
const isDragOver = ref(false) // 拖拽状态
const fileInput = ref(null) // 文件input引用

// 安装提示相关
const showInstallPrompt = ref(false)
const deviceType = ref('desktop')
const deferredPrompt = ref(null)
const canAutoInstall = ref(false)

// 计算属性
const isValidInput = computed(() => {
  const url = inputUrl.value || ''
  return typeof url === 'string' && url.trim().length > 0 && isValidUrl(url)
})

const isInputDisabled = computed(() => {
  return isProcessing.value || submitting.value || uploading.value || taskStore.isDownloading
})

const clipboardSupported = computed(() => {
  return navigator.clipboard && window.isSecureContext
})

const showProgress = computed(() => {
  return taskStore.currentTask && taskStore.currentTask.status !== 'idle'
})

const isProcessing = computed(() => {
  return ['pending', 'downloading', 'transcribing'].includes(taskStore.currentTask?.status)
})

const isCompleted = computed(() => {
  return taskStore.currentTask?.status === 'completed'
})

const isFailed = computed(() => {
  return taskStore.currentTask?.status === 'failed'
})

const statusText = computed(() => {
  if (!taskStore.currentTask) return ''
  
  switch (taskStore.currentTask.status) {
    case 'pending':
      return '任务准备中'
    case 'downloading':
      return '视频解析中'
    case 'transcribing':
      return '音频转文案中'
    case 'completed':
      return '处理完成'
    case 'failed':
      return '处理失败'
    default:
      return ''
  }
})

const statusDetail = computed(() => {
  if (!taskStore.currentTask) return ''
  
  switch (taskStore.currentTask.status) {
    case 'pending':
      return '正在创建下载任务...'
    case 'downloading':
      return '正在下载视频文件...'
    case 'transcribing':
      return '正在转换音频为文案...'
    case 'completed':
      return '所有处理步骤已完成'
    case 'failed':
      return taskStore.currentTask.errorMessage || '处理过程中出现错误'
    default:
      return ''
  }
})

// 支持的平台
const supportedPlatforms = ref([
  {
    name: 'douyin',
    displayName: '抖音',
    icon: 'music-o',
    color: '#000000'
  },
  {
    name: 'bilibili',
    displayName: '哔哩哔哩',
    icon: 'video-o',
    color: '#fb7299'
  },
  {
    name: 'upload',
    displayName: '文件上传',
    icon: 'upgrade',
    color: '#667eea'
  }
])

// 功能特性
const features = ref([
  {
    name: '智能解析',
    description: '自动识别视频平台，快速解析下载链接',
    icon: 'search'
  },
  {
    name: '文件上传',
    description: '直接上传本地视频文件，支持多种格式',
    icon: 'upgrade'
  },
  {
    name: '高清下载',
    description: '支持多种分辨率，保证视频质量',
    icon: 'down'
  },
  {
    name: '音频转文案',
    description: '利用AI技术将视频音频转换为文字',
    icon: 'volume-o'
  },
  {
    name: '文案优化',
    description: '智能优化文案内容，提升可读性',
    icon: 'edit'
  }
])

// 方法
const onInputChange = (value) => {
  // 确保值是字符串
  const stringValue = String(value || '')
  inputUrl.value = stringValue
  
  // 不再在输入变化时清理任务，避免重复请求clean接口
  // 只检测平台
  detectedPlatform.value = detectPlatform(stringValue)
}

const onInputFocus = () => {
  // 输入框获得焦点时的处理
}

const onInputBlur = () => {
  // 输入框失去焦点时的处理
}

const pasteFromClipboard = async () => {
  if (!clipboardSupported.value) {
    showToast('当前环境不支持剪贴板操作')
    return
  }
  
  try {
    pasting.value = true
    const text = await readFromClipboard()
    if (text) {
      inputUrl.value = text
      onInputChange(text)
      showToast('粘贴成功')
    } else {
      showToast('剪贴板为空')
    }
  } catch (error) {
    console.error('粘贴失败:', error)
    showToast('粘贴失败')
  } finally {
    pasting.value = false
  }
}

const handleSubmit = async () => {
  if (!isValidInput.value) {
    showToast('请输入有效的视频链接')
    return
  }
  
  try {
    submitting.value = true
    
    // 重置进度条
    currentProgress.value = 0
    
    // 确保获取字符串值并清理
    const url = String(inputUrl.value || '').trim()
    if (!url) {
      throw new Error('请输入有效的视频链接')
    }
    
    // 创建下载任务
    await taskStore.createTask(url)
    
    // 开始轮询状态
    startPolling()
    
    showToast('任务创建成功')
  } catch (error) {
    console.error('创建任务失败:', error)
    showToast('创建任务失败: ' + error.message)
  } finally {
    submitting.value = false
  }
}

const handleCancelTask = async () => {
  try {
    await showConfirmDialog({
      title: '确认取消',
      message: '确定要取消当前任务吗？'
    })
    
    canceling.value = true
    await taskStore.cancelTask()
    stopPolling()
    showToast('任务已取消')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消任务失败:', error)
      showToast('取消任务失败')
    }
  } finally {
    canceling.value = false
  }
}

const startPolling = () => {
  if (pollingTimer.value) return
  
  // 开始模拟进度条
  startProgressAnimation()
  
  pollingTimer.value = setInterval(async () => {
    if (!taskStore.currentTask?.taskId) {
      stopPolling()
      return
    }
    
    try {
      await taskStore.updateTaskStatus()
      
      // 如果任务完成或失败，停止轮询并跳转
      if (['completed', 'failed'].includes(taskStore.currentTask.status)) {
        stopPolling()
        
        if (taskStore.currentTask.status === 'completed') {
          // 完成时进度条跳到100%
          currentProgress.value = 100
          setTimeout(() => {
            // 跳转到预览页面
            router.push(`/preview/${taskStore.currentTask.taskId}`)
          }, 500)
        }
      }
    } catch (error) {
      console.error('轮询状态失败:', error)
      // 继续轮询，不中断
    }
      }, 5000)
}

const startProgressAnimation = () => {
  currentProgress.value = 0
  
  progressTimer.value = setInterval(() => {
    if (currentProgress.value < 99) {
      // 模拟进度增长，越接近99%越慢
      const increment = Math.max(0.5, (99 - currentProgress.value) * 0.1)
      currentProgress.value = Math.min(99, currentProgress.value + increment)
    }
  }, 200)
}

const stopProgressAnimation = () => {
  if (progressTimer.value) {
    clearInterval(progressTimer.value)
    progressTimer.value = null
  }
}

const stopPolling = () => {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value)
    pollingTimer.value = null
  }
  stopProgressAnimation()
}

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

// 处理安装按钮点击
const handleInstallClick = async () => {
  console.log('🎯 用户点击安装按钮')
  console.log('设备类型:', deviceType.value)
  console.log('是否支持自动安装:', canAutoInstall.value)
  
  // 优先尝试Android Chrome的一键安装
  if (canAutoInstall.value && deviceType.value === 'android' && deferredPrompt.value) {
    try {
      console.log('🚀 尝试一键安装')
      // 显示安装提示
      deferredPrompt.value.prompt()
      
      // 等待用户响应
      const { outcome } = await deferredPrompt.value.userChoice
      console.log('用户选择:', outcome)
      
      if (outcome === 'accepted') {
        console.log('✅ 用户接受了安装')
        showToast({
          message: '安装成功！请在桌面查看应用',
          type: 'success',
          duration: 3000
        })
        return // 安装成功，不再显示指引
      } else {
        console.log('❌ 用户拒绝了安装')
      }
      
      // 清除deferredPrompt，因为它只能使用一次
      deferredPrompt.value = null
      canAutoInstall.value = false
    } catch (error) {
      console.error('一键安装失败:', error)
    }
  }
  
  // 显示安装指引（包括一键安装失败的情况）
  console.log('📱 显示安装指引')
  showInstallPrompt.value = true
}

const getPlatformIcon = (platform) => {
  const platformConfig = supportedPlatforms.value.find(p => p.name === platform)
  return platformConfig?.icon || 'play-circle'
}

const getPlatformName = (platform) => {
  const platformConfig = supportedPlatforms.value.find(p => p.name === platform)
  return platformConfig?.displayName || platform
}

// 文件上传相关方法
const switchTab = (tab) => {
  activeTab.value = tab
  // 切换选项卡时重置状态
  if (tab === 'link') {
    resetFileUpload()
  } else {
    inputUrl.value = ''
    detectedPlatform.value = ''
  }
}

const resetFileUpload = () => {
  selectedFile.value = null
  uploadProgress.value = 0
  isDragOver.value = false
}

const triggerFileSelect = () => {
  if (!isInputDisabled.value && fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    validateAndSetFile(file)
  }
}

const handleFileDrop = (event) => {
  isDragOver.value = false
  if (isInputDisabled.value) return
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    validateAndSetFile(files[0])
  }
}

const handleDragOver = () => {
  if (!isInputDisabled.value) {
    isDragOver.value = true
  }
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const validateAndSetFile = (file) => {
  // 文件大小验证（500MB）
  const maxSize = 500 * 1024 * 1024
  if (file.size > maxSize) {
    showToast(`文件大小不能超过500MB，当前文件：${formatFileSize(file.size)}`)
    return
  }
  
  // 文件类型验证
  const supportedTypes = [
    'video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo',
    'video/x-flv', 'video/webm', 'video/x-matroska', 'video/mp4v-es',
    'video/3gpp', 'video/ogg'
  ]
  
  const supportedExtensions = [
    '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v', '.3gp', '.ogv'
  ]
  
  const fileName = file.name.toLowerCase()
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'))
  
  if (!supportedTypes.includes(file.type) && !supportedExtensions.includes(fileExtension)) {
    showToast('不支持的视频格式，请上传 MP4、AVI、MOV、WMV、FLV、WEBM、MKV、M4V、3GP、OGV 格式的视频文件')
    return
  }
  
  selectedFile.value = file
  showToast('文件选择成功')
}

const removeSelectedFile = () => {
  selectedFile.value = null
  uploadProgress.value = 0
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleFileUpload = async () => {
  if (!selectedFile.value) {
    showToast('请先选择视频文件')
    return
  }
  
  try {
    uploading.value = true
    uploadProgress.value = 0
    
    // 创建上传任务
    await taskStore.createUploadTask(selectedFile.value, (progress) => {
      uploadProgress.value = progress
    })
    
    // 开始轮询状态
    startPolling()
    
    showToast('文件上传成功')
  } catch (error) {
    console.error('文件上传失败:', error)
    showToast('文件上传失败: ' + error.message)
  } finally {
    uploading.value = false
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生命周期
onMounted(() => {
  // 页面加载时清理之前的任务（只在刷新时执行）
  if (taskStore.currentTask?.taskId) {
    console.log('页面刷新，清理之前的任务:', taskStore.currentTask.taskId)
    videoCleaner.cleanTask(taskStore.currentTask.taskId)
  }
  
  // 重置文件上传状态
  resetFileUpload()
  
  // 检测设备类型
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
    deferredPrompt.value = null
    canAutoInstall.value = false
    showToast({
      message: '应用安装成功！',
      type: 'success',
      duration: 3000
    })
  })
})

onUnmounted(() => {
  stopPolling()
})

// 监听路由变化，停止轮询
watch(() => route.path, () => {
  stopPolling()
})
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  position: relative;
  background: $bg-primary;
  
  .bg-decoration {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 0;
    
    .decoration-circle {
      position: absolute;
      border-radius: 50%;
      background: $primary-gradient;
      opacity: 0.1;
      animation: float 6s ease-in-out infinite;
      
      &.circle-1 {
        width: 200px;
        height: 200px;
        top: 10%;
        left: 10%;
        animation-delay: 0s;
      }
      
      &.circle-2 {
        width: 150px;
        height: 150px;
        top: 60%;
        right: 15%;
        animation-delay: 2s;
      }
      
      &.circle-3 {
        width: 100px;
        height: 100px;
        bottom: 20%;
        left: 60%;
        animation-delay: 4s;
      }
    }
  }
  
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 $space-md;
    position: relative;
    
    @include respond-to('md') {
      padding: 0 $space-lg;
    }
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-2xl 0;
  
  .logo {
    display: flex;
    align-items: center;
    gap: $space-md;
    
    .logo-icon {
      width: 56px;
      height: 56px;
      @include glass-effect(0.2);
      border-radius: $radius-xl;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      
      &:hover {
        transform: scale(1.05);
        box-shadow: $shadow-glow;
      }
      
      svg {
        width: 28px;
        height: 28px;
        color: $primary-color;
      }
    }
    
    .logo-text {
      h1 {
        font-size: $font-3xl;
        font-weight: $font-bold;
        margin: 0;
        letter-spacing: -0.025em;
      }
      
      p {
        font-size: $font-sm;
        color: $text-secondary;
        margin: 4px 0 0 0;
      }
    }
  }
  
  .install-btn {
    @include glass-effect(0.25);
    color: $text-secondary;
    border: none;
    font-weight: $font-medium;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    white-space: nowrap; // 防止文字换行
    min-width: 120px; // 确保按钮有足够宽度
    
    // 添加渐变背景动画
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
      transition: left 0.5s ease;
    }
    
    &:hover {
      @include glass-effect(0.4);
      color: $primary-color;
      transform: translateY(-1px);
      box-shadow: $shadow-glow;
      
      &::before {
        left: 100%;
      }
    }
  }
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: $space-2xl;
  padding-bottom: $space-3xl;
}

.input-section {
  .input-card {
    @include card-style($shadow-floating);
    @include glass-effect(0.25);
    padding: $space-2xl;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-heavy;
      @include glass-effect(0.35);
    }
    
    .tab-switcher {
      margin-bottom: $space-xl;
      
      .tab-buttons {
        display: flex;
        gap: $space-md;
        
        .tab-button {
          flex: 1;
          padding: $space-lg;
          border: none;
          background: transparent;
          font-weight: $font-medium;
          color: $text-secondary;
          transition: all 0.3s ease;
          
          &.active {
            border-bottom: 2px solid $primary-color;
          }
          
          &:hover {
            color: $primary-color;
          }
        }
      }
    }
    
    .tab-content {
      .input-header {
        text-align: center;
        margin-bottom: $space-xl;
        
        h2 {
          font-size: $font-2xl;
          font-weight: $font-semibold;
          color: $text-primary;
          margin: 0 0 $space-sm 0;
        }
        
        p {
          color: $text-secondary;
          margin: 0;
          font-size: $font-base;
        }
      }
      
      .input-area {
        .url-input {
          :deep(.van-field__control) {
            border: 2px solid $border-light;
            border-radius: $radius-lg;
            padding: $space-lg;
            font-size: $font-base;
            transition: all 0.3s ease;
            resize: none;
            background: $bg-tertiary;
            
            &:focus {
              border-color: $primary-color;
              outline: none;
              box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
              background: $bg-primary;
            }
            
            &::placeholder {
              color: $text-light;
            }
          }
        }
        
        .input-actions {
          display: flex;
          gap: $space-md;
          margin-top: $space-lg;
          
          .paste-btn {
            flex: 0 0 auto;
            min-width: 100px;
          }
          
          .submit-btn {
            flex: 1;
            height: 56px;
            border-radius: $radius-lg;
            font-weight: $font-semibold;
            font-size: $font-lg;
            @include gradient-bg;
            border: none;
            color: white;
            
            &:disabled {
              opacity: 0.6;
              background: $text-light;
              cursor: not-allowed;
            }
            
            &:not(:disabled):hover {
              transform: translateY(-2px);
              box-shadow: $shadow-floating;
            }
          }
        }
      }
      
      .platform-hint {
        margin-top: $space-md;
        text-align: center;
        
        .platform-tag {
          @include glass-effect(0.2);
          border: none;
          color: $primary-color;
          
          .van-icon {
            margin-right: 4px;
          }
        }
      }
    }
  }
}

.progress-section {
  .progress-card {
    @include card-style($shadow-light, $bg-primary);
    @include glass-effect(0.2);
    padding: $space-xl;
    border: 1px solid $border-light;
    
    .progress-header {
      display: flex;
      align-items: center;
      gap: $space-md;
      margin-bottom: $space-lg;
      
      .progress-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: $bg-tertiary;
      }
      
      .progress-content {
        flex: 1;
        
        h3 {
          font-size: $font-lg;
          font-weight: $font-semibold;
          color: $text-primary;
          margin: 0 0 4px 0;
        }
        
        p {
          font-size: $font-sm;
          color: $text-secondary;
          margin: 0;
        }
      }
    }
    
    .progress-bar-container {
      display: flex;
      align-items: center;
      gap: $space-md;
      
      .progress-bar {
        flex: 1;
        height: 8px;
        background: $bg-tertiary;
        border-radius: $radius-full;
        overflow: hidden;
        
        .progress-fill {
          height: 100%;
          background: $primary-gradient;
          border-radius: $radius-full;
          transition: width 0.3s ease;
        }
      }
      
      .progress-text {
        font-size: $font-sm;
        font-weight: $font-medium;
        color: $text-secondary;
        min-width: 40px;
        text-align: right;
      }
    }
  }
}

.platforms-section,
.features-section {
  .platforms-card,
  .features-card {
    @include card-style($shadow-light);
    @include glass-effect(0.2);
    padding: $space-xl;
    transition: all 0.3s ease;
    
    &:hover {
      @include glass-effect(0.3);
      transform: translateY(-2px);
      box-shadow: $shadow-floating;
    }
    
    .platforms-header,
    .features-header {
      text-align: center;
      margin-bottom: $space-xl;
      
      h3 {
        font-size: $font-xl;
        font-weight: $font-semibold;
        color: $text-primary;
        margin: 0 0 $space-sm 0;
      }
      
      p {
        color: $text-secondary;
        margin: 0;
        font-size: $font-sm;
      }
    }
  }
}

.platforms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: $space-lg;
  
  .platform-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-sm;
    padding: $space-lg;
    border-radius: $radius-lg;
    @include glass-effect(0.15);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-floating;
      @include glass-effect(0.25);
    }
    
    .platform-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: white;
      box-shadow: $shadow-light;
      
      .van-icon {
        font-size: 20px;
      }
    }
    
    .platform-name {
      font-size: $font-sm;
      font-weight: $font-medium;
      color: $text-primary;
    }
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: $space-lg;
  
  .feature-item {
    display: flex;
    gap: $space-md;
    padding: $space-lg;
    border-radius: $radius-lg;
    @include glass-effect(0.15);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-floating;
      @include glass-effect(0.25);
    }
    
    .feature-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: $primary-gradient;
      color: white;
      flex-shrink: 0;
      
      .van-icon {
        font-size: 20px;
      }
    }
    
    .feature-content {
      h4 {
        font-size: $font-base;
        font-weight: $font-semibold;
        color: $text-primary;
        margin: 0 0 4px 0;
      }
      
      p {
        font-size: $font-sm;
        color: $text-secondary;
        margin: 0;
        line-height: 1.5;
      }
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

// 选项卡样式
.tab-switcher {
  margin-bottom: $space-xl;
  
  .tab-buttons {
    display: flex;
    background: $bg-tertiary;
    border-radius: $radius-lg;
    padding: 4px;
    @include glass-effect(0.1);
    
    .tab-button {
      flex: 1;
      padding: $space-lg;
      border: none;
      background: transparent;
      border-radius: $radius-md;
      color: $text-secondary;
      font-weight: $font-medium;
      font-size: $font-base;
      transition: all 0.3s ease;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: $space-sm;
      
      &.active {
        background: $primary-gradient;
        color: white;
        box-shadow: $shadow-light;
        transform: translateY(-1px);
      }
      
      &:hover:not(.active) {
        background: rgba(102, 126, 234, 0.1);
        color: $primary-color;
      }
      
      .van-icon {
        font-size: 18px;
      }
    }
  }
}

// 文件上传样式
.upload-area {
  .upload-dropzone {
    border: 2px dashed $border-light;
    border-radius: $radius-lg;
    padding: $space-2xl;
    text-align: center;
    background: $bg-tertiary;
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    
    &:hover:not(.disabled) {
      border-color: $primary-color;
      background: rgba(102, 126, 234, 0.05);
      transform: translateY(-2px);
      box-shadow: $shadow-light;
    }
    
    &.dragover {
      border-color: $primary-color;
      background: rgba(102, 126, 234, 0.1);
      transform: scale(1.02);
      box-shadow: $shadow-floating;
    }
    
    &.has-file {
      border-style: solid;
      border-color: $primary-color;
      background: rgba(102, 126, 234, 0.05);
    }
    
    &.disabled {
      opacity: 0.6;
      cursor: not-allowed;
      
      &:hover {
        transform: none;
        box-shadow: none;
      }
    }
    
    .upload-prompt {
      .upload-icon {
        margin-bottom: $space-lg;
        
        .van-icon {
          color: $primary-color;
          opacity: 0.7;
        }
      }
      
      h3 {
        font-size: $font-lg;
        font-weight: $font-semibold;
        color: $text-primary;
        margin: 0 0 $space-md 0;
      }
      
      p {
        color: $text-secondary;
        margin: 0 0 $space-sm 0;
        font-size: $font-sm;
        
        &.size-hint {
          color: $text-light;
          font-size: $font-xs;
        }
      }
    }
    
    .file-preview {
      display: flex;
      align-items: center;
      gap: $space-lg;
      text-align: left;
      
      .file-icon {
        .van-icon {
          color: $primary-color;
        }
      }
      
      .file-info {
        flex: 1;
        
        h4 {
          font-size: $font-base;
          font-weight: $font-semibold;
          color: $text-primary;
          margin: 0 0 4px 0;
          word-break: break-all;
        }
        
        p {
          font-size: $font-sm;
          color: $text-secondary;
          margin: 0;
        }
      }
    }
  }
  
  .upload-actions {
    margin-top: $space-lg;
    text-align: center;
    
    .upload-btn {
      height: 56px;
      min-width: 160px;
      border-radius: $radius-lg;
      font-weight: $font-semibold;
      font-size: $font-lg;
      @include gradient-bg;
      border: none;
      color: white;
      
      &:disabled {
        opacity: 0.6;
        background: $text-light;
        cursor: not-allowed;
      }
      
      &:not(:disabled):hover {
        transform: translateY(-2px);
        box-shadow: $shadow-floating;
      }
    }
  }
  
  .upload-progress {
    margin-top: $space-lg;
    padding: $space-lg;
    background: $bg-tertiary;
    border-radius: $radius-lg;
    @include glass-effect(0.1);
    
    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $space-md;
      font-size: $font-sm;
      font-weight: $font-medium;
      color: $text-primary;
    }
  }
}
</style> 