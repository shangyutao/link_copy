<template>
  <div class="video-preview-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
    </div>

    <!-- 导航栏 -->
    <van-nav-bar
      :title="pageTitle"
      left-arrow
      fixed
      placeholder
      class="nav-bar glass-nav"
      @click-left="goBack"
    >
      <template #right>
        <div class="nav-actions">
          <van-icon 
            name="replay" 
            size="18" 
            @click="refreshStatus"
            :class="{ 'spinning': refreshing }"
            class="nav-action-btn"
          />
          <van-icon 
            name="delete-o" 
            size="18" 
            @click="handleCancel"
            class="nav-action-btn cancel-btn"
          />
        </div>
      </template>
    </van-nav-bar>

    <div class="page-content">
      <!-- 页面加载状态 -->
      <div v-if="pageLoading" class="page-loading animate-fade-in">
        <div class="loading-content">
          <van-loading size="40px" color="#667eea" />
          <p class="loading-text">正在加载视频信息...</p>
        </div>
      </div>
      
      <!-- 页面内容 -->
      <template v-else>
        <!-- 状态卡片 -->
        <div class="status-section animate-fade-in-up">
          <div class="status-card card-floating" :class="statusClass">
            <div class="status-content">
              <div class="status-main">
                <div class="status-icon">
                  <van-loading v-if="isProcessing" size="32px" color="white" />
                  <div v-else-if="isCompleted" class="success-icon">
                    <van-icon name="checked" size="32px" />
                  </div>
                  <div v-else-if="isFailed" class="error-icon">
                    <van-icon name="close" size="32px" />
                  </div>
                  <div v-else class="pending-icon">
                    <van-icon name="clock" size="32px" />
                  </div>
                </div>
                <div class="status-text">
                  <h3>{{ statusTitle }}</h3>
                  <p>{{ statusDescription }}</p>
                </div>
              </div>
              
              <!-- 进度条 -->
              <div v-if="isProcessing" class="progress-section">
                <van-progress
                  :percentage="currentProgress"
                  stroke-width="8"
                  color="rgba(255,255,255,0.9)"
                  track-color="rgba(255,255,255,0.2)"
                  class="progress-bar"
                />
                <div class="progress-info">
                  <span class="progress-text">{{ currentProgress }}%</span>
                  <span class="progress-detail">正在处理视频...</span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="status-actions">
                <van-button 
                  v-if="!isCompleted"
                  size="small" 
                  type="danger" 
                  class="btn-glass"
                  @click="handleCancel"
                  :loading="canceling"
                >
                  <template #icon>
                    <van-icon name="cross" />
                  </template>
                  取消任务
                </van-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 视频预览区域 -->
        <div v-if="currentTask" class="video-section animate-fade-in-up">
          <div class="video-card card-floating">
            <div class="video-header">
              <h3 class="video-title">{{ currentTask.fileName || '视频预览' }}</h3>
              <van-button 
                size="small" 
                class="refresh-btn btn-glass"
                @click="refreshStatus"
                :loading="refreshing"
              >
                <van-icon name="replay" />
                刷新
              </van-button>
            </div>
            
            <div class="video-container">
              <!-- 视频播放器 -->
              <div v-if="proxyPreviewUrl">
                <video 
                  ref="videoPlayer"
                  :src="proxyPreviewUrl"
                  controls
                  preload="metadata"
                  crossorigin="anonymous"
                  playsinline
                  class="video-player"
                  @loadstart="handleVideoLoadStart"
                  @loadedmetadata="handleVideoLoadedMetadata"
                  @canplay="handleVideoCanPlay"
                  @error="handleVideoError"
                >
                  您的浏览器不支持视频播放
                </video>
              </div>
              
              <!-- 视频加载失败回退界面 -->
              <div v-else-if="videoLoadFailed" class="video-fallback">
                <div class="fallback-content">
                  <van-icon name="warning-o" size="48px" color="rgba(255,255,255,0.6)" />
                  <h4>视频加载失败</h4>
                  <p>无法加载视频文件，可能是网络问题或文件格式不兼容</p>
                  <div class="fallback-actions">
                    <van-button 
                      type="primary" 
                      size="small"
                      @click="retryVideoLoad"
                      :loading="retryingVideo"
                    >
                      重新加载
                    </van-button>
                    <van-button 
                      type="default" 
                      size="small"
                      @click="goBack"
                    >
                      返回
                    </van-button>
                  </div>
                </div>
              </div>
              
              <!-- 视频缩略图 -->
              <div v-else class="video-thumbnail">
                <img 
                  :src="getPreviewImage()" 
                  :alt="currentTask.fileName"
                  class="thumbnail-image"
                  @error="handleImageError"
                />
                <div class="play-overlay" @click="retryVideoLoad">
                  <van-icon name="play-circle-o" size="64px" class="play-button" />
                </div>
              </div>
            </div>
            
            <div class="video-info">
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">文件大小</div>
                  <div class="info-value">{{ formatFileSize(currentTask.fileSize) }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">平台</div>
                  <div class="info-value">{{ getPlatformName(currentTask.platform) }}</div>
                </div>
                                 <div class="info-item">
                   <div class="info-label">任务ID</div>
                   <div class="info-value task-id" @click="copyTaskId(currentTask.taskId)" title="点击复制完整任务ID">
                     <span class="task-id-text">{{ formatTaskId(currentTask.taskId) }}</span>
                     <van-icon 
                       name="copy" 
                       size="14" 
                       class="copy-icon"
                     />
                   </div>
                 </div>
                <div class="info-item">
                  <div class="info-label">创建时间</div>
                  <div class="info-value">{{ formatDate(currentTask.createTime) }}</div>
                </div>
              </div>
              
              <!-- 标签 -->
              <div v-if="videoInfo.tags && videoInfo.tags.length" class="video-tags">
                <van-tag 
                  v-for="tag in videoInfo.tags.slice(0, 5)" 
                  :key="tag" 
                  size="mini"
                  class="tag-item"
                >
                  {{ tag }}
                </van-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮区域 -->
        <div class="action-section animate-fade-in-up">
          <div v-if="isCompleted" class="action-buttons">
            <!-- 优雅提示信息 -->
            <div class="elegant-hint">
              <van-icon name="info-o" class="hint-icon" />
              <span class="hint-text">AI 处理需要时间，请耐心等待结果返回，期间请勿重复点击按钮</span>
            </div>
            
            <van-button
              type="primary"
              size="large"
              class="action-btn download-btn btn-gradient-primary"
              @click="handleDownload"
              :loading="downloading"
            >
              <template #icon>
                <van-icon name="down" />
              </template>
              下载视频
            </van-button>
            
            <van-button
              type="success"
              size="large"
              class="action-btn transcribe-btn btn-gradient-success"
              @click="handleTranscribe"
              :loading="transcribing"
            >
              <template #icon>
                <van-icon name="volume-o" />
              </template>
              转换文案
            </van-button>
          </div>
          
          <div v-else-if="isProcessing" class="processing-info">
            <div class="processing-card card-glass">
              <van-loading size="24px" color="#667eea" />
              <span>正在处理视频，请耐心等待...</span>
            </div>
          </div>
          
          <div v-else-if="isFailed" class="error-info">
            <div class="error-card card-floating">
              <van-icon name="warning-o" size="24px" color="#ef4444" />
              <span>处理失败，请重试或返回重新选择视频</span>
              <van-button
                type="warning"
                size="small"
                @click="handleRetry"
                :loading="retrying"
              >
                重新尝试
              </van-button>
            </div>
          </div>
        </div>

        <!-- 转文案结果 -->
        <div v-if="transcriptionResult" class="transcription-section animate-fade-in-up">
          <div class="transcription-card card-floating">
            <div class="transcription-header">
              <h3>
                <van-icon name="chat-o" />
                提取的文案
              </h3>
              <van-button 
                size="small" 
                type="primary" 
                class="btn-glass"
                @click="optimizeText"
                :loading="optimizing"
              >
                <van-icon name="fire" />
                AI优化
              </van-button>
            </div>
            
            <div class="transcription-content">
              <div class="text-card original-text">
                <div class="text-header">
                  <h4>原始文案</h4>
                  <van-tag size="mini" color="#f3f4f6" text-color="#6b7280">原始</van-tag>
                </div>
                <div class="text-content">
                  <p>{{ transcriptionResult.text }}</p>
                  <div class="text-meta">
                    <span>时长: {{ formatTime(transcriptionResult.duration) }}</span>
                    <span>{{ formatDate(transcriptionResult.createTime) }}</span>
                  </div>
                </div>
              </div>
              
              <div v-if="optimizedText" class="text-card optimized-text">
                <div class="text-header">
                  <h4>AI优化文案</h4>
                  <van-tag size="mini" type="success">优化</van-tag>
                </div>
                <div class="text-content">
                  <p>{{ optimizedText }}</p>
                  <div class="text-meta">
                    <span>优化时间: {{ formatDate(new Date()) }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="transcription-actions">
              <van-button 
                class="btn-glass"
                @click="copyText(optimizedText || transcriptionResult.text)"
              >
                <template #icon>
                  <van-icon name="copy" />
                </template>
                复制文案
              </van-button>
              
              <van-button 
                class="btn-glass"
                @click="shareText(optimizedText || transcriptionResult.text)"
              >
                <template #icon>
                  <van-icon name="share" />
                </template>
                分享
              </van-button>
              
              <van-button 
                class="btn-glass"
                @click="exportText(optimizedText || transcriptionResult.text)"
              >
                <template #icon>
                  <van-icon name="down" />
                </template>
                导出
              </van-button>
            </div>
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="errorMessage" class="error-section animate-fade-in-up">
          <van-notice-bar
            type="danger"
            :text="errorMessage"
            left-icon="warning-o"
            @click="clearError"
            class="error-notice"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/task'
import { videoCleaner, videoApi } from '@/services/video'

// 占位符图片 (320x180 SVG with video icon and "视频加载失败" text)
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMzYgNzJIMTg0VjEwOEgxMzZWNzJaIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0xNTIgODRWOTZMMTY4IDkwTDE1MiA4NFoiIGZpbGw9IndoaXRlIi8+Cjx0ZXh0IHg9IjE2MCIgeT0iMTMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QjlCIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPuinhumikea1i+WkseaViTwvdGV4dD4KPC9zdmc+'
import { formatTime, formatNumber } from '@/utils/format'
import { copyToClipboard } from '@/utils/clipboard'
import { showToast, showConfirmDialog } from 'vant'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()

// 响应式数据
const taskId = ref(route.params.taskId)
const refreshing = ref(false)
const downloading = ref(false)
const transcribing = ref(false)
const retrying = ref(false)
const canceling = ref(false)
const optimizing = ref(false)
const pageLoading = ref(true)
const errorMessage = ref('')
const transcriptionResult = ref(null)
const optimizedText = ref('')
const videoLoadFailed = ref(false)
const retryingVideo = ref(false)
const videoPlayer = ref(null)

// 计算属性
const currentTask = computed(() => taskStore.currentTask)
const currentProgress = computed(() => taskStore.currentProgress)
const isProcessing = computed(() => taskStore.isProcessing)
const isCompleted = computed(() => taskStore.isCompleted)
const isFailed = computed(() => taskStore.isFailed)

const videoInfo = computed(() => currentTask.value?.videoInfo)
const platform = computed(() => currentTask.value?.platform)

const pageTitle = computed(() => {
  if (isProcessing.value) return '解析中'
  if (isCompleted.value) return '解析完成'
  if (isFailed.value) return '解析失败'
  return '视频预览'
})

const statusClass = computed(() => {
  if (isProcessing.value) return 'status-processing'
  if (isCompleted.value) return 'status-completed'
  if (isFailed.value) return 'status-failed'
  return 'status-pending'
})

const statusTitle = computed(() => {
  if (isProcessing.value) return '正在解析视频'
  if (isCompleted.value) return '解析完成'
  if (isFailed.value) return '解析失败'
  return '等待处理'
})

const statusDescription = computed(() => {
  if (isProcessing.value) return '请耐心等待，正在为您处理视频...'
  if (isCompleted.value) return '视频已准备就绪，您可以下载或转换文案'
  if (isFailed.value) return currentTask.value?.errorMessage || '处理过程中出现错误，请重试'
  return '任务已创建，即将开始处理'
})

// 转换预览URL为代理URL（计算属性）
const proxyPreviewUrl = computed(() => {
  const previewUrl = currentTask.value?.previewUrl
  if (!previewUrl) return null
  
  console.log('=== 视频URL处理调试 ===')
  console.log('原始预览URL:', previewUrl)
  console.log('当前环境:', import.meta.env.DEV ? '开发环境' : '生产环境')
  
  // 环境判断
  const isDevelopment = import.meta.env.DEV
  
  if (isDevelopment) {
    // 开发环境：如果是相对路径，转换为完整URL
    if (previewUrl.startsWith('/videos/')) {
      const fullUrl = `http://47.109.155.18:2222${previewUrl}`
      console.log('开发环境 - 转换为完整URL:', fullUrl)
      return fullUrl
    }
    // 如果已经是完整URL，直接使用
    console.log('开发环境 - 使用原始URL:', previewUrl)
    return previewUrl
  } else {
    // 生产环境：确保使用相对路径通过Netlify代理
    let proxyUrl = previewUrl
    
    // 如果是完整URL，转换为代理路径
    if (previewUrl.startsWith('http://47.109.155.18:2222/')) {
      proxyUrl = previewUrl.replace('http://47.109.155.18:2222', '')
    } else if (previewUrl.startsWith('http://') || previewUrl.startsWith('https://')) {
      // 如果是其他域名的URL，提取路径部分
      try {
        const url = new URL(previewUrl)
        proxyUrl = url.pathname
      } catch (error) {
        console.error('URL解析失败:', error)
        return null
      }
    }
    
    // 确保路径以 /videos/ 开头（这样才能被Netlify代理）
    if (!proxyUrl.startsWith('/videos/')) {
      if (proxyUrl.startsWith('/')) {
        // 如果以 / 开头但不是 /videos/，可能需要修正
        if (proxyUrl.includes('/videos/')) {
          // 提取 /videos/ 之后的部分
          proxyUrl = proxyUrl.substring(proxyUrl.indexOf('/videos/'))
        }
      } else {
        // 如果不以 / 开头，添加 /videos/ 前缀
        proxyUrl = `/videos/${proxyUrl}`
      }
    }
    
    console.log('生产环境 - 转换为代理URL:', proxyUrl)
    console.log('视频将通过Netlify代理访问:', window.location.origin + proxyUrl)
    return proxyUrl
  }
})

// 方法
const goBack = () => {
  router.back()
}

const refreshStatus = async () => {
  if (!taskId.value) return
  
  refreshing.value = true
  try {
    await taskStore.refreshTaskStatus(taskId.value)
    
    // 如果任务已完成，加载预览信息
    if (currentTask.value?.status === 'completed') {
      await loadPreviewInfo()
    }
    
    showToast('状态已刷新')
  } catch (error) {
    console.error('刷新状态失败:', error)
    showToast('刷新失败')
  } finally {
    refreshing.value = false
  }
}

const handleDownload = async () => {
  if (!currentTask.value) return
  
  downloading.value = true
  try {
    await taskStore.downloadVideo(currentTask.value.taskId)
    showToast('下载开始')
  } catch (error) {
    console.error('下载失败:', error)
    showToast('下载失败，请重试')
  } finally {
    downloading.value = false
  }
}

const handleTranscribe = async () => {
  if (!currentTask.value) return
  
  transcribing.value = true
  try {
    const result = await taskStore.transcribeVideo(currentTask.value.taskId)
    const tr = result?.transcription || null
    transcriptionResult.value = tr
    if (tr && tr.status === 'completed' && tr.text) {
      showToast('文案提取完成')
    } else if (tr && tr.status === 'processing') {
      showToast('文案生成中，请稍候…')
    } else {
      showToast('暂未获取到文案，稍后重试')
    }
  } catch (error) {
    console.error('转文案失败:', error)
    showToast('转文案失败，请重试')
  } finally {
    transcribing.value = false
  }
}

const handleRetry = async () => {
  if (!currentTask.value) return
  
  retrying.value = true
  try {
    await taskStore.retryTask(currentTask.value.taskId)
    showToast('重新开始处理')
  } catch (error) {
    console.error('重试失败:', error)
    showToast('重试失败，请稍后再试')
  } finally {
    retrying.value = false
  }
}

const handleCancel = async () => {
  if (!currentTask.value) return
  
  try {
    await showConfirmDialog({
      title: '确认取消',
      message: '确定要取消当前任务吗？这将删除已缓存的视频文件，且无法恢复。',
      confirmButtonText: '确认取消',
      cancelButtonText: '继续等待',
      confirmButtonColor: '#ef4444'
    })
    
    canceling.value = true
    await taskStore.cancelTask(currentTask.value.taskId)
    showToast('任务已取消')
    
    // 返回首页
    router.replace('/')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消任务失败:', error)
      showToast('取消失败，请重试')
    }
  } finally {
    canceling.value = false
  }
}

const optimizeText = async () => {
  if (!transcriptionResult.value?.text) return
  
  optimizing.value = true
  try {
    const result = await taskStore.optimizeText(transcriptionResult.value.text)
    optimizedText.value = result.optimizedText
    showToast('AI优化完成')
  } catch (error) {
    console.error('AI优化失败:', error)
    showToast('AI优化失败，请重试')
  } finally {
    optimizing.value = false
  }
}

const copyText = async (text) => {
  try {
    await copyToClipboard(text)
    showToast('已复制到剪贴板')
  } catch (error) {
    showToast('复制失败')
  }
}

const shareText = async (text) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: '视频文案',
        text: text
      })
    } catch (error) {
      copyText(text)
    }
  } else {
    copyText(text)
  }
}

const exportText = (text) => {
  try {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `视频文案_${new Date().getTime()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast('文案已导出')
  } catch (error) {
    console.error('导出失败:', error)
    showToast('导出失败')
  }
}

const clearError = () => {
  errorMessage.value = ''
}

const loadPreviewInfo = async () => {
  if (!taskId.value) return
  
  try {
    console.log('加载预览信息...')
    const response = await videoApi.getVideoPreview(taskId.value)
    console.log('预览信息响应:', response)
    
    // 更新当前任务的预览信息
    if (currentTask.value && response && response.data) {
      console.log('预览URL:', response.data.previewUrl)
      
      // 直接更新store中的currentTask（最简单的方法）
      if (taskStore.currentTask) {
        taskStore.currentTask.previewUrl = response.data.previewUrl
        taskStore.currentTask.downloadUrl = response.data.downloadUrl
        taskStore.currentTask.fileInfo = response.data.fileInfo
        console.log('已直接更新taskStore.currentTask')
      }
      
      console.log('更新后的任务信息:', currentTask.value)
    }
  } catch (error) {
    console.error('加载预览信息失败:', error)
  }
}

const getPreviewImage = () => {
  // 优先使用previewUrl，然后是thumbnail，最后是占位符
  const previewUrl = currentTask.value?.previewUrl || currentTask.value?.videoInfo?.previewUrl
  const thumbnail = currentTask.value?.videoInfo?.thumbnail
  
  console.log('获取预览图片:', {
    previewUrl,
    thumbnail,
    currentTask: currentTask.value
  })
  
  return previewUrl || thumbnail || PLACEHOLDER_IMAGE
}

const handleImageError = (event) => {
  // 防止无限循环：如果已经是占位符图片，就不再重新设置
  if (event.target.src.includes('placeholder-video.jpg') || 
      event.target.src.includes('data:image/svg+xml') || 
      event.target.dataset.errorHandled) {
    return
  }
  
  // 标记已处理过错误，防止重复处理
  event.target.dataset.errorHandled = 'true'
  
  // 使用占位符图片
  event.target.src = PLACEHOLDER_IMAGE
}

const handleVideoLoadStart = (event) => {
  console.log('=== 视频开始加载 ===')
  console.log('视频URL:', event.target.src)
  console.log('加载时间:', new Date().toISOString())
}

const handleVideoLoadedMetadata = (event) => {
  console.log('=== 视频元数据加载完成 ===')
  console.log('视频时长:', event.target.duration)
  console.log('视频尺寸:', `${event.target.videoWidth}x${event.target.videoHeight}`)
  console.log('网络状态:', event.target.networkState)
  console.log('就绪状态:', event.target.readyState)
}

const handleVideoCanPlay = (event) => {
  console.log('=== 视频可以开始播放 ===')
  console.log('缓冲状态:', event.target.buffered.length > 0 ? `${event.target.buffered.end(0)}s` : '0s')
  console.log('✅ 视频加载成功')
  
  // 重置视频加载失败状态
  videoLoadFailed.value = false
}

const handleVideoError = (event) => {
  console.error('=== 视频加载失败调试 ===')
  console.error('视频URL:', event.target.src)
  console.error('错误事件:', event)
  console.error('错误详情:', event.target.error)
  console.error('视频networkState:', event.target.networkState)
  console.error('视频readyState:', event.target.readyState)
  
  // 错误代码映射
  const errorMessages = {
    1: 'MEDIA_ERR_ABORTED - 用户终止了视频加载',
    2: 'MEDIA_ERR_NETWORK - 网络错误导致视频下载失败',
    3: 'MEDIA_ERR_DECODE - 视频解码失败',
    4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - 视频格式不支持或文件不存在'
  }
  
  const errorCode = event.target.error?.code
  const errorMessage = errorMessages[errorCode] || '未知错误'
  console.error('错误类型:', errorMessage)
  
  // 尝试检查视频是否可访问
  const videoUrl = event.target.src
  console.log('尝试验证视频URL可访问性:', videoUrl)
  
  fetch(videoUrl, { 
    method: 'HEAD',
    mode: 'cors',
    credentials: 'omit'
  })
    .then(response => {
      console.log('视频文件HTTP状态:', response.status)
      console.log('视频文件Content-Type:', response.headers.get('Content-Type'))
      console.log('视频文件Content-Length:', response.headers.get('Content-Length'))
      console.log('视频文件响应头:', Object.fromEntries(response.headers.entries()))
      
      if (response.status === 200) {
        console.log('✅ 视频文件可访问，可能是格式或编码问题')
        showToast('视频文件可访问但无法播放，可能是格式不兼容')
      } else {
        console.log('❌ 视频文件HTTP状态异常')
        showToast(`视频文件访问失败 (状态码: ${response.status})`)
      }
    })
    .catch(error => {
      console.error('视频文件访问失败:', error)
      
      if (error.name === 'TypeError' && error.message.includes('CORS')) {
        console.error('❌ CORS跨域问题')
        showToast('视频访问被跨域策略阻止，请检查代理配置')
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        console.error('❌ 网络请求失败')
        showToast('无法访问视频文件，请检查网络连接或代理配置')
      } else {
        console.error('❌ 其他网络错误')
        showToast('视频加载失败，请检查网络连接或稍后重试')
      }
    })
  
  // 显示更具体的错误信息
  if (errorCode === 4) {
    showToast('视频格式不支持或文件不存在')
  } else if (errorCode === 2) {
    showToast('网络错误，无法下载视频')
  } else {
    showToast(`视频加载失败: ${errorMessage}`)
  }
  
  // 设置视频加载失败状态，显示回退界面
  videoLoadFailed.value = true
}

const retryVideoLoad = async () => {
  if (!videoPlayer.value || !taskId.value) return
  
  retryingVideo.value = true
  videoLoadFailed.value = false
  
  try {
    // 重新加载预览信息
    await loadPreviewInfo()
    
    // 重置视频元素
    videoPlayer.value.load()
    
    showToast('正在重新加载视频...')
  } catch (error) {
    console.error('重新加载视频失败:', error)
    showToast('重新加载失败，请稍后重试')
    videoLoadFailed.value = true
  } finally {
    retryingVideo.value = false
  }
}

const getPlatformName = (platform) => {
  const platformMap = {
    'douyin': '抖音',
    'bilibili': '哔哩哔哩',
    'youtube': 'YouTube',
    'tiktok': 'TikTok',
    'upload': '文件上传'
  }
  return platformMap[platform] || platform
}

const getPlatformColor = (platform) => {
  const colorMap = {
    'douyin': '#ff0050',
    'bilibili': '#00a1d6',
    'youtube': '#ff0000',
    'tiktok': '#000000',
    'upload': '#667eea'
  }
  return colorMap[platform] || '#667eea'
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      return '今天 ' + date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else if (diffDays === 2) {
      return '昨天 ' + date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else if (diffDays <= 7) {
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      return weekdays[date.getDay()] + ' ' + date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else {
      return date.toLocaleDateString('zh-CN', { 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  } catch (error) {
    return dateString
  }
}

const formatTaskId = (id) => {
  if (!id) return 'N/A'
  const truncatedId = id.substring(0, 8) + '...' + id.substring(id.length - 4)
  return truncatedId
}

const copyTaskId = async (id) => {
  try {
    await copyToClipboard(id)
    showToast('任务ID已复制')
  } catch (error) {
    showToast('复制失败')
  }
}

// 监听器
watch(proxyPreviewUrl, (newUrl) => {
  if (newUrl) {
    // 当预览URL变化时，重置视频失败状态
    videoLoadFailed.value = false
    console.log('预览URL已更新:', newUrl)
  }
})

// 生命周期
onMounted(async () => {
  console.log('VideoPreview mounted, taskId:', taskId.value)
  
  // 设置当前任务
  if (taskId.value) {
    videoCleaner.setCurrentTask(taskId.value)
    
    try {
      // 优化：先尝试从存储中恢复任务，如果有就直接使用
      const restoredTask = await taskStore.restoreTaskFromStorage(taskId.value)
      console.log('恢复的任务:', restoredTask)
      
      // 如果恢复的任务已经完成，立即尝试加载预览信息（不等待refreshStatus）
      if (currentTask.value?.status === 'completed') {
        console.log('任务已完成，立即加载预览信息')
        // 不等待，让预览信息在后台加载
        loadPreviewInfo().catch(error => {
          console.error('后台加载预览信息失败:', error)
        })
      }
      
      // 如果没有当前任务，再进行刷新状态（这通常只在异常情况下才需要）
      if (!currentTask.value || !currentTask.value.taskId) {
        console.log('没有当前任务，需要刷新状态')
        await refreshStatus()
      } else {
        console.log('已有任务数据，跳过状态刷新')
        
        // 如果任务状态不是completed但恢复的任务可能过期，在后台刷新状态
        if (currentTask.value.status !== 'completed') {
          console.log('任务未完成，后台刷新状态')
          refreshStatus().catch(error => {
            console.error('后台刷新状态失败:', error)
          })
        }
      }
    } catch (error) {
      console.error('初始化任务失败:', error)
      errorMessage.value = '加载任务失败，请刷新页面重试'
    } finally {
      // 确保无论成功失败都停止加载状态
      pageLoading.value = false
    }
  } else {
    errorMessage.value = '无效的任务ID'
    pageLoading.value = false
  }
})

onBeforeUnmount(() => {
  // 页面离开时不自动清理，让用户可以从历史记录恢复
  videoCleaner.setShouldCleanOnUnload(false)
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

// 渐变背景混入
@mixin gradient-bg($gradient) {
  background: $gradient;
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
}

// 渐变动画
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

// 渐变定义
$primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

.video-preview-page {
  min-height: 100vh;
  background: $bg-gradient;
  position: relative;
  
  // 背景装饰
  .bg-decoration {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
    
    .decoration-circle {
      position: absolute;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08));
      animation: float 8s ease-in-out infinite;
      
      &.circle-1 {
        width: 300px;
        height: 300px;
        top: 20%;
        right: 10%;
        animation-delay: 0s;
      }
      
      &.circle-2 {
        width: 200px;
        height: 200px;
        bottom: 30%;
        left: 5%;
        animation-delay: 3s;
      }
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-30px);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.nav-bar {
  @include glass-effect(0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  
  :deep(.van-nav-bar__title) {
    color: $text-primary;
    font-weight: $font-semibold;
  }
  
  :deep(.van-nav-bar__left) {
    color: $text-secondary;
  }
  
  .nav-actions {
    display: flex;
    gap: $space-md;
    
    .nav-action-btn {
      padding: $space-xs;
      border-radius: $radius-md;
      background: rgba(255, 255, 255, 0.1);
      color: $text-secondary;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
        color: $primary-color;
      }
      
      &.cancel-btn {
        color: $error-color;
        
        &:hover {
          background: rgba(239, 68, 68, 0.1);
          color: $error-color;
        }
      }
      
      &.spinning {
        animation: spin 1s linear infinite;
      }
    }
  }
}

.page-content {
  padding: $space-lg;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: $space-xl;
  
  @include respond-to('md') {
    padding: $space-xl;
  }
  
  // 页面加载状态
  .page-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    
    .loading-content {
      text-align: center;
      
      .loading-text {
        margin-top: $space-lg;
        color: $text-secondary;
        font-size: $font-base;
      }
    }
  }
}

.status-section {
  .status-card {
    padding: $space-xl;
    
    &.status-processing {
      background: linear-gradient(135deg, $accent-color 0%, rgba(79, 172, 254, 0.8) 100%);
      color: white;
    }
    
    &.status-completed {
      background: linear-gradient(135deg, $success-color 0%, rgba(16, 185, 129, 0.8) 100%);
      color: white;
    }
    
    &.status-failed {
      background: linear-gradient(135deg, $error-color 0%, rgba(239, 68, 68, 0.8) 100%);
      color: white;
    }
    
    &.status-pending {
      background: linear-gradient(135deg, $text-light 0%, rgba(148, 163, 184, 0.8) 100%);
      color: white;
    }
    
    .status-content {
      .status-main {
        display: flex;
        align-items: center;
        gap: $space-lg;
        margin-bottom: $space-lg;
        
        .status-icon {
          flex-shrink: 0;
          
          .success-icon, .error-icon, .pending-icon {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.2);
          }
        }
        
        .status-text {
          flex: 1;
          
          h3 {
            font-size: $font-2xl;
            font-weight: $font-bold;
            margin: 0 0 $space-xs 0;
          }
          
          p {
            font-size: $font-base;
            margin: 0;
            opacity: 0.9;
            line-height: 1.5;
          }
        }
      }
      
      .progress-section {
        margin-bottom: $space-lg;
        
        .progress-bar {
          margin-bottom: $space-sm;
        }
        
        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: $font-sm;
          
          .progress-text {
            font-weight: $font-semibold;
          }
          
          .progress-detail {
            opacity: 0.8;
          }
        }
      }
      
      .status-actions {
        display: flex;
        gap: $space-md;
        justify-content: flex-end;
      }
    }
  }
}

.video-section {
  .video-card {
    overflow: hidden;
    
    .video-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $space-lg;
      
      .video-title {
        font-size: $font-xl;
        font-weight: $font-bold;
        color: $text-primary;
        margin: 0;
      }
      
      .refresh-btn {
        padding: $space-xs $space-sm;
        border-radius: $radius-md;
        background: rgba(255, 255, 255, 0.1);
        color: $text-secondary;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(255, 255, 255, 0.2);
          color: $primary-color;
        }
      }
    }
    
    .video-container {
      position: relative;
      aspect-ratio: 16/9;
      border-radius: $radius-xl;
      overflow: hidden;
      background: $bg-dark;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .video-player {
        width: 100%;
        height: 100%;
        border-radius: $radius-lg;
        background: #000;
        
        &:focus {
          outline: none;
        }
      }
      
      .video-fallback {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: $radius-lg;
        
        .fallback-content {
          text-align: center;
          color: white;
          
          h4 {
            margin: $space-md 0 $space-sm 0;
            font-size: $font-lg;
            font-weight: $font-semibold;
          }
          
          p {
            margin: 0 0 $space-lg 0;
            font-size: $font-sm;
            color: rgba(255, 255, 255, 0.8);
            line-height: 1.4;
          }
          
          .fallback-actions {
            display: flex;
            gap: $space-sm;
            justify-content: center;
            
            .van-button {
              min-width: 80px;
              
              &.van-button--primary {
                background: $primary-color;
                border-color: $primary-color;
              }
              
              &.van-button--default {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.2);
                color: white;
                
                &:hover {
                  background: rgba(255, 255, 255, 0.2);
                }
              }
            }
          }
        }
      }
      
      .video-thumbnail {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
        cursor: pointer;
        
        &:hover {
          opacity: 1;
        }
        
        .thumbnail-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .play-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          
          &:hover {
            opacity: 1;
          }
          
          .play-button {
            color: white;
            transform: scale(1);
            transition: transform 0.3s ease;
            
            &:hover {
              transform: scale(1.1);
            }
          }
        }
      }
    }
    
    .video-info {
      padding: $space-xl;
      background: $bg-secondary;
      border-radius: $radius-lg;
      margin-top: $space-lg;
      box-shadow: $shadow-light;
      
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: $space-md;
        margin-bottom: $space-lg;
      }
      
      .info-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        
        .info-label {
          font-size: $font-sm;
          color: $text-light;
          margin-bottom: $space-xs;
        }
        
                 .info-value {
           font-size: $font-base;
           font-weight: $font-semibold;
           color: $text-primary;
           
           &.task-id {
             cursor: pointer;
             display: flex;
             align-items: center;
             gap: $space-xs;
             padding: $space-xs $space-sm;
             border-radius: $radius-md;
             background: rgba(102, 126, 234, 0.1);
             border: 1px solid rgba(102, 126, 234, 0.2);
             color: $primary-color;
             transition: all 0.3s ease;
             
             &:hover {
               background: rgba(102, 126, 234, 0.2);
               border-color: rgba(102, 126, 234, 0.3);
               transform: translateY(-1px);
             }
             
             .task-id-text {
               overflow: hidden;
               text-overflow: ellipsis;
               white-space: nowrap;
               max-width: 120px;
             }
             
             .copy-icon {
               color: $primary-color;
               opacity: 0.8;
               transition: opacity 0.3s ease;
               flex-shrink: 0;
               
               &:hover {
                 opacity: 1;
               }
             }
           }
         }
      }
      
      .video-tags {
        display: flex;
        gap: $space-sm;
        flex-wrap: wrap;
        
        .tag-item {
          background: rgba(102, 126, 234, 0.1);
          color: $primary-color;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }
      }
    }
  }
}

.action-section {
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: $space-md;
    
    .elegant-hint {
      display: flex;
      align-items: center;
      gap: $space-xs;
      background: rgba(255, 255, 255, 0.1);
      padding: $space-sm $space-md;
      border-radius: $radius-lg;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.8);
      font-size: $font-sm;
      opacity: 0.9;
      margin-bottom: $space-sm;
      
      .hint-icon {
        color: #667eea;
        flex-shrink: 0;
      }
      
      .hint-text {
        line-height: 1.4;
      }
    }
    
    .action-btn {
      height: 56px;
      border-radius: $radius-xl;
      font-weight: $font-semibold;
      font-size: $font-base;
      
      &.btn-gradient-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        &:active {
          transform: translateY(0);
        }
      }
      
      &.btn-gradient-success {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: white;
        border: none;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
        }
        
        &:active {
          transform: translateY(0);
        }
      }
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: $shadow-floating;
      }
    }
  }
  
  .processing-info, .error-info {
    .processing-card, .error-card {
      padding: $space-lg;
      border-radius: $radius-xl;
      display: flex;
      align-items: center;
      gap: $space-md;
      justify-content: center;
      text-align: center;
      
      span {
        font-size: $font-base;
        color: $text-secondary;
      }
    }
    
    .error-card {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      
      span {
        color: $error-color;
        flex: 1;
      }
    }
  }
}

.transcription-section {
  .transcription-card {
    padding: $space-xl;
    
    .transcription-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $space-xl;
      
      h3 {
        font-size: $font-xl;
        font-weight: $font-bold;
        color: $text-primary;
        margin: 0;
        display: flex;
        align-items: center;
        gap: $space-sm;
        
        .van-icon {
          color: $primary-color;
        }
      }
    }
    
    .transcription-content {
      margin-bottom: $space-xl;
      
      .text-card {
        @include card-style($shadow-light, $bg-secondary);
        padding: $space-lg;
        margin-bottom: $space-lg;
        
        .text-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: $space-md;
          
          h4 {
            font-size: $font-base;
            font-weight: $font-semibold;
            color: $text-primary;
            margin: 0;
          }
        }
        
        .text-content {
          p {
            background: $bg-primary;
            padding: $space-lg;
            border-radius: $radius-lg;
            margin: 0 0 $space-sm 0;
            line-height: 1.6;
            color: $text-primary;
            border: 1px solid $border-light;
          }
          
          .text-meta {
            display: flex;
            justify-content: space-between;
            font-size: $font-xs;
            color: $text-light;
            
            span {
              &:last-child {
                text-align: right;
              }
            }
          }
        }
      }
    }
    
    .transcription-actions {
      display: flex;
      gap: $space-md;
      justify-content: center;
      flex-wrap: wrap;
      
      .btn-glass {
        height: 48px;
        padding: 0 $space-lg;
        border-radius: $radius-lg;
        font-weight: $font-medium;
        min-width: 120px;
      }
    }
  }
}

.error-section {
  .error-notice {
    border-radius: $radius-xl;
    @include card-style($shadow-light);
  }
}

// 响应式设计
@include respond-to('sm') {
  .page-content {
    padding: $space-md;
  }
  
  .status-section .status-card .status-content .status-main {
    flex-direction: column;
    text-align: center;
    gap: $space-md;
  }
  
  .action-section .action-buttons {
    flex-direction: column;
  }
  
  .transcription-section .transcription-card .transcription-actions {
    flex-direction: column;
    
    .btn-glass {
      width: 100%;
    }
  }
}
</style> 