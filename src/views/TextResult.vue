<template>
  <div class="text-result-page">
    <!-- 导航栏 -->
    <van-nav-bar
      title="文案结果"
      left-arrow
      fixed
      placeholder
      class="nav-bar"
      @click-left="goBack"
    >
      <template #right>
        <van-icon 
          name="share-o" 
          size="18" 
          @click="handleShare"
        />
      </template>
    </van-nav-bar>

    <div class="page-content">
      <!-- 状态卡片 -->
      <div v-if="showStatus" class="status-section">
        <div class="status-card" :class="statusClass">
          <div class="status-content">
            <div class="status-icon">
              <van-loading v-if="isTranscribing" size="24px" color="white" />
              <van-icon v-else-if="isCompleted" name="checked" size="24px" />
              <van-icon v-else-if="isFailed" name="close" size="24px" />
              <van-icon v-else name="volume-o" size="24px" />
            </div>
            <div class="status-text">
              <h3>{{ statusTitle }}</h3>
              <p>{{ statusDescription }}</p>
            </div>
          </div>
          
          <!-- 进度条 -->
          <div v-if="isTranscribing" class="progress-section">
            <van-progress
              :percentage="transcribeProgress"
              stroke-width="6"
              color="rgba(255,255,255,0.9)"
              track-color="rgba(255,255,255,0.2)"
            />
            <span class="progress-text">{{ transcribeProgress }}%</span>
          </div>
        </div>
      </div>

      <!-- 视频信息概览 -->
      <div v-if="videoInfo" class="video-summary">
        <div class="summary-card">
          <div class="video-thumb">
            <img 
                              :src="videoInfo.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMzYgNzJIMTg0VjEwOEgxMzZWNzJaIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0xNTIgODRWOTZMMTY4IDkwTDE1MiA4NFoiIGZpbGw9IndoaXRlIi8+Cjx0ZXh0IHg9IjE2MCIgeT0iMTMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QjlCIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPuinhumikea1i+WkseaViTwvdGV4dD4KPC9zdmc+'" 
              :alt="videoInfo.title"
              @error="handleImageError"
            />
          </div>
          <div class="video-info">
            <h3 class="video-title">{{ videoInfo.title }}</h3>
            <div class="video-meta">
              <span class="duration">{{ formatTime(videoInfo.duration) }}</span>
              <van-tag :color="getPlatformColor(videoInfo.platform)">
                {{ getPlatformName(videoInfo.platform) }}
              </van-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 文案内容区域 -->
      <div v-if="originalText || optimizedText" class="text-content-section">
        <!-- 原始文案 -->
        <div v-if="originalText" class="text-card original-text">
          <div class="text-header">
            <h3>
              <van-icon name="volume-o" />
              原始文案
            </h3>
            <div class="text-actions">
              <van-button 
                size="mini" 
                type="default"
                @click="copyText(originalText)"
              >
                <van-icon name="copy" />
                复制
              </van-button>
            </div>
          </div>
          <div class="text-content">
            <p>{{ originalText }}</p>
          </div>
          <div class="text-footer">
            <span class="text-length">{{ originalText.length }} 字</span>
            <span class="text-time">{{ formatDate(transcribeTime) }}</span>
          </div>
        </div>

        <!-- AI优化文案 -->
        <div v-if="optimizedText" class="text-card optimized-text">
          <div class="text-header">
            <h3>
              <van-icon name="magic" />
              AI优化文案
            </h3>
            <div class="text-actions">
              <van-button 
                size="mini" 
                type="primary"
                @click="copyText(optimizedText)"
              >
                <van-icon name="copy" />
                复制
              </van-button>
            </div>
          </div>
          <div class="text-content">
            <p>{{ optimizedText }}</p>
          </div>
          <div class="text-footer">
            <span class="text-length">{{ optimizedText.length }} 字</span>
            <span class="text-time">{{ formatDate(optimizeTime) }}</span>
          </div>
        </div>

        <!-- AI优化按钮 -->
        <div v-if="originalText && !optimizedText" class="optimize-section">
          <van-button
            type="primary"
            size="large"
            class="optimize-btn"
            @click="handleOptimize"
            :loading="optimizing"
          >
            <van-icon name="magic" />
            AI优化文案
          </van-button>
          <p class="optimize-desc">
            使用AI智能优化文案，让表达更清晰流畅
          </p>
        </div>
      </div>

      <!-- 操作按钮区域 -->
      <div v-if="isCompleted" class="action-section">
        <div class="action-buttons">
          <van-button
            type="success"
            size="large"
            class="action-btn"
            @click="handleExport"
          >
            <van-icon name="down" />
            导出文案
          </van-button>
          
          <van-button
            type="primary"
            size="large"
            class="action-btn"
            @click="handleNewTask"
          >
            <van-icon name="plus" />
            新建任务
          </van-button>
        </div>
      </div>

      <!-- 历史记录按钮 -->
      <div class="history-section">
        <van-button
          type="default"
          size="large"
          class="history-btn"
          @click="goToHistory"
        >
          <van-icon name="records" />
          查看历史记录
        </van-button>
      </div>

      <!-- 错误信息 -->
      <div v-if="errorMessage" class="error-section">
        <van-notice-bar
          type="danger"
          :text="errorMessage"
          left-icon="warning-o"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/task'
import { formatTime, formatDate } from '@/utils/format'
import { showToast, showConfirmDialog } from 'vant'
import { copyToClipboard } from '@/utils/clipboard'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()

// 响应式数据
const taskId = ref(route.params.taskId)
const optimizing = ref(false)
const errorMessage = ref('')
const transcribeProgress = ref(0)

// 计算属性
const currentTask = computed(() => taskStore.currentTask)
const transcriptionData = computed(() => taskStore.transcriptionData)
const isTranscribing = computed(() => taskStore.isTranscribing)
const isCompleted = computed(() => taskStore.isTranscriptionCompleted)
const isFailed = computed(() => taskStore.isTranscriptionFailed)

const videoInfo = computed(() => currentTask.value?.videoInfo)
const originalText = computed(() => transcriptionData.value?.text)
const optimizedText = computed(() => transcriptionData.value?.optimizedText)
const transcribeTime = computed(() => transcriptionData.value?.createTime)
const optimizeTime = computed(() => transcriptionData.value?.optimizeTime)

const showStatus = computed(() => {
  return isTranscribing.value || (!originalText.value && !isFailed.value)
})

const statusClass = computed(() => {
  if (isTranscribing.value) return 'status-processing'
  if (isCompleted.value) return 'status-completed'
  if (isFailed.value) return 'status-failed'
  return 'status-pending'
})

const statusTitle = computed(() => {
  if (isTranscribing.value) return '正在转换文案'
  if (isCompleted.value) return '转换完成'
  if (isFailed.value) return '转换失败'
  return '准备转换'
})

const statusDescription = computed(() => {
  if (isTranscribing.value) return '正在将视频音频转换为文字，请稍候...'
  if (isCompleted.value) return '音频转文案完成，可进行AI优化'
  if (isFailed.value) return '转换过程中出现错误，请重试'
  return '即将开始音频转文案'
})

// 方法
const goBack = () => {
  router.push(`/video-preview/${taskId.value}`)
}

const goToHistory = () => {
  router.push('/history')
}

const handleNewTask = () => {
  router.push('/')
}

const handleShare = async () => {
  const shareText = optimizedText.value || originalText.value
  if (!shareText) {
    showToast('暂无文案可分享')
    return
  }

  try {
    if (navigator.share) {
      await navigator.share({
        title: '视频文案分享',
        text: shareText
      })
    } else {
      await copyToClipboard(shareText)
      showToast('文案已复制到剪贴板')
    }
  } catch (error) {
    console.error('分享失败:', error)
    showToast('分享失败')
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

const handleOptimize = async () => {
  if (!originalText.value) {
    showToast('没有可优化的文案')
    return
  }

  optimizing.value = true
  try {
    await taskStore.optimizeText(originalText.value)
    showToast('AI优化完成')
  } catch (error) {
    showToast('优化失败，请重试')
  } finally {
    optimizing.value = false
  }
}

const handleExport = async () => {
  const textToExport = optimizedText.value || originalText.value
  if (!textToExport) {
    showToast('暂无文案可导出')
    return
  }

  try {
    // 创建下载链接
    const blob = new Blob([textToExport], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `视频文案_${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
    showToast('文案已导出')
  } catch (error) {
    showToast('导出失败')
  }
}

// 占位符图片常量
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMzYgNzJIMTg0VjEwOEgxMzZWNzJaIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0xNTIgODRWOTZMMTY4IDkwTDE1MiA4NFoiIGZpbGw9IndoaXRlIi8+Cjx0ZXh0IHg9IjE2MCIgeT0iMTMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QjlCIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPuinhumikea1i+WkseaViTwvdGV4dD4KPC9zdmc+'

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

const getPlatformColor = (platform) => {
  const colorMap = {
    'douyin': '#ff6b6b',
    'bilibili': '#fb7299',
    'youtube': '#ff0000',
    'upload': '#667eea',
    'default': '#666eea'
  }
  return colorMap[platform] || colorMap.default
}

const getPlatformName = (platform) => {
  const nameMap = {
    'douyin': '抖音',
    'bilibili': '哔哩哔哩',
    'youtube': 'YouTube',
    'upload': '文件上传',
    'default': '未知平台'
  }
  return nameMap[platform] || nameMap.default
}

// 生命周期
onMounted(async () => {
  // 检查是否有任务数据
  if (!currentTask.value || currentTask.value.taskId !== taskId.value) {
    try {
      await taskStore.refreshTaskStatus(taskId.value)
    } catch (error) {
      errorMessage.value = '无法获取任务信息'
      console.error('获取任务状态失败:', error)
      return
    }
  }

  // 获取转文案结果
  try {
    await taskStore.getTranscriptionResult(taskId.value)
  } catch (error) {
    console.error('获取转文案结果失败:', error)
    // 如果还没有转文案结果，可能需要等待或重新开始转换
    if (!transcriptionData.value) {
      errorMessage.value = '转文案结果不存在，请重新转换'
    }
  }

  // 如果正在转换中，开始轮询
  if (isTranscribing.value) {
    startTranscriptionPolling()
  }
})

onUnmounted(() => {
  stopTranscriptionPolling()
})

// 转文案轮询
let pollingTimer = null

const startTranscriptionPolling = () => {
  if (pollingTimer) return
  
  pollingTimer = setInterval(async () => {
    try {
      await taskStore.getTranscriptionResult(taskId.value)
      
      // 模拟进度更新
      if (isTranscribing.value) {
        transcribeProgress.value = Math.min(transcribeProgress.value + 5, 95)
      } else {
        transcribeProgress.value = 100
        stopTranscriptionPolling()
      }
    } catch (error) {
      console.error('轮询转文案状态失败:', error)
    }
  }, 2000)
}

const stopTranscriptionPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}
</script>

<style lang="scss" scoped>
.text-result-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.nav-bar {
  :deep(.van-nav-bar__content) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    .van-nav-bar__title {
      color: white;
      font-weight: 600;
    }
    
    .van-icon {
      color: white;
    }
  }
}

.page-content {
  padding: $space-lg;
  padding-top: 0;
}

.status-section {
  margin-bottom: $space-lg;
}

.status-card {
  @include card-style;
  padding: $space-lg;
  border-radius: $radius-2xl;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  
  &.status-processing {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }
  
  &.status-completed {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }
  
  &.status-failed {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  }
}

.status-content {
  display: flex;
  align-items: center;
  margin-bottom: $space-md;
}

.status-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $space-md;
  
  .van-icon {
    color: white;
  }
}

.status-text {
  flex: 1;
  
  h3 {
    font-size: $font-lg;
    font-weight: 600;
    margin-bottom: $space-xs;
  }
  
  p {
    font-size: $font-sm;
    opacity: 0.9;
    line-height: 1.4;
  }
}

.progress-section {
  display: flex;
  align-items: center;
  gap: $space-md;
  
  .van-progress {
    flex: 1;
  }
  
  .progress-text {
    font-size: $font-sm;
    font-weight: 600;
    min-width: 40px;
  }
}

.video-summary {
  margin-bottom: $space-lg;
}

.summary-card {
  @include card-style;
  padding: $space-md;
  border-radius: $radius-xl;
  background: white;
  display: flex;
  gap: $space-md;
}

.video-thumb {
  width: 80px;
  height: 60px;
  border-radius: $radius-lg;
  overflow: hidden;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.video-info {
  flex: 1;
  min-width: 0;
}

.video-title {
  font-size: $font-base;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $space-xs;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: $space-sm;
  font-size: $font-sm;
  color: $text-secondary;
}

.text-content-section {
  margin-bottom: $space-lg;
}

.text-card {
  @include card-style;
  margin-bottom: $space-lg;
  border-radius: $radius-xl;
  background: white;
  border-left: 4px solid transparent;
  
  &.original-text {
    border-left-color: #4facfe;
  }
  
  &.optimized-text {
    border-left-color: #43e97b;
  }
}

.text-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-lg $space-lg $space-md;
  border-bottom: 1px solid $border-color;
  
  h3 {
    display: flex;
    align-items: center;
    font-size: $font-lg;
    font-weight: 600;
    color: $text-primary;
    
    .van-icon {
      margin-right: $space-sm;
      color: $primary-color;
    }
  }
}

.text-actions {
  display: flex;
  gap: $space-sm;
}

.text-content {
  padding: $space-lg;
  
  p {
    line-height: 1.8;
    color: $text-primary;
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.text-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-md $space-lg;
  background: $bg-secondary;
  font-size: $font-xs;
  color: $text-secondary;
}

.optimize-section {
  text-align: center;
  padding: $space-xl;
  
  .optimize-btn {
    width: 100%;
    height: 48px;
    border-radius: $radius-xl;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    font-weight: 600;
    margin-bottom: $space-md;
    
    .van-icon {
      margin-right: $space-sm;
    }
  }
  
  .optimize-desc {
    color: $text-secondary;
    font-size: $font-sm;
    line-height: 1.5;
  }
}

.action-section {
  margin-bottom: $space-lg;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-md;
}

.action-btn {
  height: 48px;
  border-radius: $radius-xl;
  font-weight: 600;
  
  .van-icon {
    margin-right: $space-sm;
  }
}

.history-section {
  margin-bottom: $space-lg;
}

.history-btn {
  width: 100%;
  height: 44px;
  border-radius: $radius-xl;
  background: white;
  border: 1px solid $border-color;
  color: $text-secondary;
  
  .van-icon {
    margin-right: $space-sm;
  }
}

.error-section {
  margin-bottom: $space-lg;
  
  :deep(.van-notice-bar) {
    border-radius: $radius-lg;
  }
}

// 响应式适配
@include respond-to('md') {
  .page-content {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .action-buttons {
    gap: $space-lg;
  }
}
</style> 