import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { videoApi, videoCleaner } from '@/services/video'
import { storage, taskHistory as storageTaskHistory } from '@/utils/storage'

export const useTaskStore = defineStore('task', () => {
  // 响应式状态
  const currentTask = ref(null)
  const taskHistory = ref([])
  const isLoading = ref(false)
  const isDownloading = ref(false) // 下载状态
  const pollingTimer = ref(null)
  const transcriptionData = ref(null) // 转文案数据

  // 计算属性
  const currentProgress = computed(() => {
    return currentTask.value?.progress || 0
  })

  const isProcessing = computed(() => {
    const status = currentTask.value?.status
    return status === 'pending' || status === 'downloading'
  })

  const isCompleted = computed(() => {
    return currentTask.value?.status === 'completed'
  })

  const isFailed = computed(() => {
    return currentTask.value?.status === 'failed'
  })

  // 转文案相关状态
  const isTranscribing = computed(() => {
    return transcriptionData.value?.status === 'processing'
  })

  const isTranscriptionCompleted = computed(() => {
    return transcriptionData.value?.status === 'completed'
  })

  const isTranscriptionFailed = computed(() => {
    return transcriptionData.value?.status === 'failed'
  })

  // 动作方法
  
  /**
   * 创建下载任务
   */
  const createTask = async (url, platform = null) => {
    isLoading.value = true
    
    try {
      // 先清理之前的任务
      await cleanupCurrentTask()
      
      const response = await videoApi.createDownloadTask(url, platform)
      
      // 设置当前任务
      currentTask.value = {
        taskId: response.taskId,
        originalUrl: url,
        platform: response.platform,
        status: response.status,
        progress: 0,
        createTime: response.createTime,
        isExisting: response.isExisting
      }
      
      // 设置清理器的当前任务
      videoCleaner.setCurrentTask(response.taskId)
      
      // 保存到本地存储
      await saveTaskToStorage(currentTask.value)
      
      // 添加到历史记录
      addToHistory(currentTask.value)
      
      // 开始轮询状态
      if (isProcessing.value) {
        startPolling(response.taskId)
      }
      
      return response
    } catch (error) {
      console.error('创建任务失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 刷新任务状态
   */
  const refreshTaskStatus = async (taskId) => {
    try {
      const response = await videoApi.getTaskStatus(taskId)
      console.log('API返回的任务状态:', response)
      
      // API响应结构：{code: 200, message: "查询成功", data: {...}}
      // API拦截器返回response.data，即{code, message, data}
      // 我们需要的实际任务数据在response.data字段中
      const taskData = response.data || response
      
      console.log('提取的任务数据:', taskData)
      console.log('任务进度:', taskData.progress)
      
      // 更新当前任务状态
      if (currentTask.value && currentTask.value.taskId === taskId) {
        currentTask.value = {
          ...currentTask.value,
          ...taskData,
          updateTime: new Date().toISOString()
        }
        
        console.log('更新后的任务状态:', currentTask.value)
        
        // 保存到本地存储
        await saveTaskToStorage(currentTask.value)
        
        // 更新历史记录
        updateHistoryItem(currentTask.value)
      } else if (!currentTask.value) {
        // 如果没有当前任务，创建一个
        currentTask.value = {
          ...taskData,
          updateTime: new Date().toISOString()
        }
        
        console.log('创建的当前任务:', currentTask.value)
        
        // 保存到本地存储
        await saveTaskToStorage(currentTask.value)
        
        // 添加到历史记录
        addToHistory(currentTask.value)
      }
      
      return response
    } catch (error) {
      console.error('刷新任务状态失败:', error)
      throw error
    }
  }

  /**
   * 更新任务状态（简化版本，用于手动更新）
   */
  const updateTaskStatus = async () => {
    if (currentTask.value?.taskId) {
      return await refreshTaskStatus(currentTask.value.taskId)
    }
  }

  /**
   * 更新当前任务的属性
   */
  const updateCurrentTask = (updates) => {
    if (currentTask.value) {
      currentTask.value = {
        ...currentTask.value,
        ...updates,
        updateTime: new Date().toISOString()
      }
      
      // 保存到本地存储
      saveTaskToStorage(currentTask.value)
      
      // 更新历史记录
      updateHistoryItem(currentTask.value)
    }
  }

  /**
   * 开始轮询任务状态
   */
  const startPolling = (taskId) => {
    // 先停止之前的轮询
    stopPolling()
    
    pollingTimer.value = setInterval(async () => {
      try {
        await refreshTaskStatus(taskId)
        
        // 如果任务完成或失败，停止轮询
        if (!isProcessing.value) {
          stopPolling()
        }
      } catch (error) {
        console.error('轮询任务状态失败:', error)
        // 轮询失败也停止轮询
        stopPolling()
      }
    }, 5000) // 每5秒轮询一次
  }

  /**
   * 停止轮询
   */
  const stopPolling = () => {
    if (pollingTimer.value) {
      clearInterval(pollingTimer.value)
      pollingTimer.value = null
    }
  }

  /**
   * 下载视频文件
   */
  const downloadVideo = async (taskId) => {
    isDownloading.value = true
    try {
      const downloadUrl = await videoApi.getDownloadUrl(taskId)
      
      // 创建下载链接
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `video_${taskId}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      return true
    } catch (error) {
      console.error('下载视频失败:', error)
      throw error
    } finally {
      isDownloading.value = false
    }
  }

  /**
   * 转换视频为文案
   */
  const transcribeVideo = async (taskId) => {
    try {
      // 设置转换状态
      transcriptionData.value = {
        taskId,
        status: 'processing',
        progress: 0,
        createTime: new Date().toISOString()
      }
      
      const response = await videoApi.transcribeVideo(taskId)
      
      // 更新转文案数据
      transcriptionData.value = {
        ...transcriptionData.value,
        ...response,
        status: 'completed'
      }
      
      return response
    } catch (error) {
      // 设置失败状态
      if (transcriptionData.value) {
        transcriptionData.value.status = 'failed'
        transcriptionData.value.errorMessage = error.message
      }
      
      console.error('转换视频为文案失败:', error)
      throw error
    }
  }

  /**
   * 获取转文案结果
   */
  const getTranscriptionResult = async (taskId) => {
    try {
      const response = await videoApi.getTranscriptionResult(taskId)
      
      // 更新转文案数据
      transcriptionData.value = {
        ...transcriptionData.value,
        ...response.transcription,
        videoInfo: response.videoInfo
      }
      
      return response
    } catch (error) {
      console.error('获取转文案结果失败:', error)
      throw error
    }
  }

  /**
   * AI优化文案
   */
  const optimizeText = async (originalText, options = {}) => {
    try {
      const response = await videoApi.optimizeText(originalText, options)
      return response
    } catch (error) {
      console.error('AI优化文案失败:', error)
      throw error
    }
  }

  /**
   * 清理当前任务
   */
  const cleanupCurrentTask = async () => {
    if (currentTask.value) {
      try {
        await videoCleaner.cleanCurrentTask()
        console.log('已清理当前任务缓存')
      } catch (error) {
        console.warn('清理当前任务失败:', error)
      }
    }
  }

  /**
   * 取消/删除任务
   */
  const cancelTask = async (taskId) => {
    try {
      await videoApi.cleanVideo(taskId)
      
      // 如果是当前任务，清除状态
      if (currentTask.value && currentTask.value.taskId === taskId) {
        currentTask.value = null
        videoCleaner.setCurrentTask(null)
        stopPolling()
      }
      
      // 从历史记录中移除
      removeFromHistory(taskId)
      
      // 从本地存储中移除
      await removeTaskFromStorage(taskId)
      
      return true
    } catch (error) {
      console.error('取消任务失败:', error)
      throw error
    }
  }

  /**
   * 删除任务（向后兼容）
   */
  const deleteTask = async (taskId) => {
    return cancelTask(taskId)
  }

  /**
   * 重试失败任务
   */
  const retryTask = async (taskId) => {
    try {
      const response = await videoApi.retryTask(taskId)
      
      // 如果是当前任务，开始轮询
      if (currentTask.value && currentTask.value.taskId === taskId) {
        currentTask.value.status = 'pending'
        startPolling(taskId)
      }
      
      return response
    } catch (error) {
      console.error('重试任务失败:', error)
      throw error
    }
  }

  /**
   * 重置当前任务状态
   */
  const resetCurrentTask = () => {
    currentTask.value = null
    transcriptionData.value = null
    stopPolling()
    videoCleaner.setCurrentTask(null)
  }

  /**
   * 获取任务历史记录
   */
  const loadTaskHistory = async () => {
    try {
      const history = storage.get('taskHistory', [])
      taskHistory.value = history
      return history
    } catch (error) {
      console.error('加载任务历史失败:', error)
      return []
    }
  }

  /**
   * 清除所有历史记录
   */
  const clearHistory = async () => {
    try {
      taskHistory.value = []
      storage.remove('taskHistory')
      return true
    } catch (error) {
      console.error('清除历史记录失败:', error)
      throw error
    }
  }

  // 辅助方法

  /**
   * 添加到历史记录
   */
  const addToHistory = (task) => {
    const existingIndex = taskHistory.value.findIndex(item => item.taskId === task.taskId)
    
    if (existingIndex >= 0) {
      // 更新已存在的记录
      taskHistory.value[existingIndex] = { ...task, updateTime: new Date().toISOString() }
    } else {
      // 添加新记录，保持最新的在前面
      taskHistory.value.unshift({ ...task, updateTime: new Date().toISOString() })
      
      // 限制历史记录数量
      if (taskHistory.value.length > 50) {
        taskHistory.value = taskHistory.value.slice(0, 50)
      }
    }
    
    // 保存到本地存储
    storage.set('taskHistory', taskHistory.value)
  }

  /**
   * 更新历史记录中的项目
   */
  const updateHistoryItem = (task) => {
    const index = taskHistory.value.findIndex(item => item.taskId === task.taskId)
    if (index >= 0) {
      taskHistory.value[index] = { ...task, updateTime: new Date().toISOString() }
      
      // 保存到本地存储
      storage.set('taskHistory', taskHistory.value)
    }
  }

  /**
   * 从历史记录中移除
   */
  const removeFromHistory = (taskId) => {
    taskHistory.value = taskHistory.value.filter(item => item.taskId !== taskId)
    
    // 保存到本地存储
    storage.set('taskHistory', taskHistory.value)
  }

  /**
   * 保存任务到本地存储
   */
  const saveTaskToStorage = async (task) => {
    try {
      storage.set(`task_${task.taskId}`, task)
    } catch (error) {
      console.error('保存任务到本地存储失败:', error)
    }
  }

  /**
   * 从本地存储移除任务
   */
  const removeTaskFromStorage = async (taskId) => {
    try {
      storage.remove(`task_${taskId}`)
    } catch (error) {
      console.error('从本地存储移除任务失败:', error)
    }
  }

  /**
   * 从本地存储恢复任务
   */
  const restoreTaskFromStorage = async (taskId) => {
    try {
      const task = storage.get(`task_${taskId}`)
      if (task) {
        currentTask.value = task
        return task
      }
      return null
    } catch (error) {
      console.error('从本地存储恢复任务失败:', error)
      return null
    }
  }

  // 初始化
  const initialize = async () => {
    try {
      // 加载历史记录
      await loadTaskHistory()
    } catch (error) {
      console.error('初始化任务存储失败:', error)
    }
  }

  // 返回状态和方法
  return {
    // 状态
    currentTask,
    taskHistory,
    isLoading,
    isDownloading,
    transcriptionData,
    
    // 计算属性
    currentProgress,
    isProcessing,
    isCompleted,
    isFailed,
    isTranscribing,
    isTranscriptionCompleted,
    isTranscriptionFailed,
    
    // 方法
    createTask,
    refreshTaskStatus,
    updateTaskStatus,
    updateCurrentTask,
    startPolling,
    stopPolling,
    downloadVideo,
    transcribeVideo,
    getTranscriptionResult,
    optimizeText,
    cancelTask,
    deleteTask,
    retryTask,
    loadTaskHistory,
    clearHistory,
    restoreTaskFromStorage,
    initialize,
    cleanupCurrentTask,
    resetCurrentTask
  }
}) 