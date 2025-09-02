import api from './api'

/**
 * 视频相关API服务
 */
export const videoApi = {
  /**
   * 创建下载任务
   * @param {string} url - 视频链接
   * @param {string} platform - 平台名称（可选）
   * @returns {Promise<Object>} 任务信息
   */
  async createDownloadTask(url, platform = null) {
    const response = await api.post('/video/download', {
      url,
      platform
    })
    return response.data
  },

  /**
   * 上传视频文件
   * @param {File} file - 视频文件
   * @param {Function} onProgress - 上传进度回调
   * @returns {Promise<Object>} 任务信息
   */
  async uploadVideoFile(file, onProgress = null) {
    // 参数验证
    if (!file || !(file instanceof File)) {
      throw new Error('请选择有效的视频文件')
    }

    // 文件大小验证（500MB限制）
    const MAX_SIZE = 500 * 1024 * 1024 // 500MB
    if (file.size > MAX_SIZE) {
      throw new Error(`文件大小不能超过500MB，当前文件大小：${this.formatFileSize(file.size)}`)
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
    
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    if (!supportedTypes.includes(file.type) && !supportedExtensions.includes(fileExtension)) {
      throw new Error('不支持的视频格式，请上传 MP4、AVI、MOV、WMV、FLV、WEBM、MKV、M4V、3GP、OGV 格式的视频文件')
    }

    // 创建FormData
    const formData = new FormData()
    formData.append('video', file)

    // 配置请求选项
    const config = {
      // 不手动设置 Content-Type，交给浏览器自动生成带 boundary 的 multipart/form-data
      timeout: 300000, // 5分钟超时
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      }
    }

    try {
      const response = await api.post('/video/upload', formData, config)
      return response.data
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('上传超时，请检查网络连接或尝试上传更小的文件')
      }
      if (error.response?.status === 413) {
        throw new Error('文件过大，请上传小于500MB的视频文件')
      }
      throw error
    }
  },

  /**
   * 查询任务状态
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} 任务状态信息
   */
  async getTaskStatus(taskId) {
    const response = await api.get(`/video/status/${taskId}`, {
      showLoading: false // 轮询时不显示loading
    })
    return response.data
  },

  /**
   * 获取视频文件下载链接
   * @param {string} taskId - 任务ID
   * @returns {Promise<string>} 下载链接
   */
  async getDownloadUrl(taskId) {
    // 返回直接下载链接
    return `${api.defaults.baseURL}/video/file/${taskId}`
  },

  /**
   * 清理视频文件（立即删除）
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} 删除结果
   */
  async cleanVideo(taskId) {
    const response = await api.delete(`/video/clean/${taskId}`, {
      showLoading: false // 避免显示loading，因为清理操作通常在后台进行
    })
    return response.data
  },

  /**
   * 删除视频文件 (向后兼容)
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteTask(taskId) {
    return this.cleanVideo(taskId)
  },

  /**
   * 获取支持的平台列表
   * @returns {Promise<Object>} 平台列表
   */
  async getSupportedPlatforms() {
    const response = await api.get('/video/platforms')
    return response.data
  },

  /**
   * 获取任务列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 任务列表
   */
  async getTaskList(params = {}) {
    const response = await api.get('/video/tasks', { params })
    return response.data
  },

  /**
   * 获取系统统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async getStats() {
    const response = await api.get('/video/stats')
    return response.data
  },

  /**
   * 批量清理过期文件
   * @param {number} hours - 过期小时数
   * @returns {Promise<Object>} 清理结果
   */
  async cleanExpiredFiles(hours = 24) {
    const response = await api.post('/video/clean/expired', {
      hours
    })
    return response.data
  },

  /**
   * 重试失败任务
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} 重试结果
   */
  async retryTask(taskId) {
    const response = await api.post(`/video/retry/${taskId}`)
    return response.data
  },

  /**
   * 获取视频预览信息
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} 预览信息
   */
  async getVideoPreview(taskId) {
    const response = await api.get(`/video/preview/${taskId}`)
    return response
  },

  /**
   * 视频音频转文案
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} 转文案结果
   */
  async transcribeVideo(taskId) {
    const response = await api.post(`/video/transcribe/${taskId}`)
    return response.data
  },

  /**
   * AI优化文案
   * @param {string} text - 原始文案
   * @param {Object} options - 优化选项
   * @returns {Promise<Object>} 优化结果
   */
  async optimizeText(text, options = {}) {
    // 参数验证
    if (!text || typeof text !== 'string') {
      throw new Error('文案内容不能为空')
    }
    
    const trimmedText = text.trim()
    if (trimmedText.length === 0) {
      throw new Error('文案内容不能为空')
    }
    
    // 检查字符长度限制
    const MAX_LENGTH = 10000
    if (trimmedText.length > MAX_LENGTH) {
      throw new Error(`文案长度不能超过${MAX_LENGTH}字符，当前长度：${trimmedText.length}`)
    }
    
    // 设置超时时间（接口文档要求至少120秒）
    const timeout = options.timeout || 120000 // 120秒
    
    // 如果文案较长，需要分段处理
    const CHUNK_SIZE = 1500
    if (trimmedText.length > CHUNK_SIZE) {
      return await this._optimizeTextInChunks(trimmedText, timeout)
    }
    
    // 单段处理
    try {
      const response = await api.post('/video/optimize-text', {
        text: trimmedText
      }, {
        timeout,
        showLoading: options.showLoading !== false
      })
      return response.data
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.response?.status === 408) {
        throw new Error('AI优化请求超时，建议将长文案分段提交')
      }
      throw error
    }
  },

  /**
   * 分段优化文案（私有方法）
   * @param {string} text - 原始文案
   * @param {number} timeout - 超时时间
   * @returns {Promise<Object>} 优化结果
   */
  async _optimizeTextInChunks(text, timeout) {
    const CHUNK_SIZE = 1500
    const chunks = []
    
    // 按句号、问号、感叹号等自然断句分段
    const sentences = text.split(/([。！？\.\!\?]+)/)
    let currentChunk = ''
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i]
      
      if (currentChunk.length + sentence.length <= CHUNK_SIZE) {
        currentChunk += sentence
      } else {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim())
        }
        currentChunk = sentence
      }
    }
    
    // 添加最后一段
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim())
    }
    
    // 如果没有合适的断句，强制按字符数分段
    if (chunks.length === 1 && chunks[0].length > CHUNK_SIZE) {
      chunks.length = 0
      for (let i = 0; i < text.length; i += CHUNK_SIZE) {
        chunks.push(text.slice(i, i + CHUNK_SIZE))
      }
    }
    
    console.log(`文案分为${chunks.length}段进行优化`)
    
    // 逐段优化
    const optimizedChunks = []
    const errors = []
    
    for (let i = 0; i < chunks.length; i++) {
      try {
        console.log(`正在优化第${i + 1}/${chunks.length}段...`)
        const response = await api.post('/video/optimize-text', {
          text: chunks[i]
        }, {
          timeout,
          showLoading: false // 分段时不显示loading，避免频繁弹窗
        })
        
        optimizedChunks.push(response.data.optimizedText || chunks[i])
        
        // 分段之间添加小延迟，避免请求过于频繁
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(`第${i + 1}段优化失败:`, error)
        errors.push(`第${i + 1}段: ${error.message}`)
        optimizedChunks.push(chunks[i]) // 使用原文
      }
    }
    
    // 合并结果
    const optimizedText = optimizedChunks.join('')
    
    return {
      originalText: text,
      optimizedText,
      optimizationTime: new Date().toISOString(),
      model: 'doubao-seed-1-6-250615',
      chunks: chunks.length,
      errors: errors.length > 0 ? errors : undefined
    }
  },

  /**
   * 获取转文案结果
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} 转文案结果
   */
  async getTranscriptionResult(taskId) {
    const response = await api.get(`/video/transcription/${taskId}`, {
      showLoading: false // 轮询时不显示loading
    })
    return response.data
  },

  /**
   * 轮询获取转文案最终结果
   * @param {string} taskId - 任务ID
   * @param {Object} options - 配置项
   * @returns {Promise<Object>} 转文案结果
   */
  async pollTranscriptionResult(taskId, { interval = 3000, maxAttempts = 100 } = {}) {
    let attempts = 0
    while (attempts < maxAttempts) {
      try {
        const res = await this.getTranscriptionResult(taskId)
        if (res.status === 'completed' || res.transcription?.status === 'completed') {
          return res
        }
        if (res.status === 'failed' || res.transcription?.status === 'failed') {
          throw new Error(res.errorMessage || res.transcription?.errorMessage || '转文案失败')
        }
      } catch (error) {
        // 404 表示结果尚未生成，继续轮询
        if (error?.response?.status !== 404) {
          throw error
        }
      }
      await new Promise(resolve => setTimeout(resolve, interval))
      attempts++
    }
    throw new Error('转文案超时，请稍后重试')
  }
}

/**
 * 任务轮询器类
 */
export class TaskPoller {
  constructor(taskId, onUpdate, options = {}) {
    this.taskId = taskId
    this.onUpdate = onUpdate
    this.options = {
      interval: 3000, // 轮询间隔（毫秒）
      maxAttempts: 100, // 最大尝试次数
      onError: null, // 错误回调
      onComplete: null, // 完成回调
      onFailed: null, // 失败回调
      ...options
    }
    
    this.isRunning = false
    this.attempts = 0
    this.timer = null
  }

  /**
   * 开始轮询
   */
  start() {
    if (this.isRunning) {
      return
    }
    
    this.isRunning = true
    this.attempts = 0
    this.poll()
  }

  /**
   * 停止轮询
   */
  stop() {
    this.isRunning = false
    this.attempts = 0
    
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  /**
   * 执行轮询
   */
  async poll() {
    if (!this.isRunning) {
      return
    }

    this.attempts++

    try {
      const result = await videoApi.getTaskStatus(this.taskId)
      
      // 调用更新回调
      if (this.onUpdate) {
        this.onUpdate(result)
      }

      // 检查任务状态
      if (result.status === 'completed') {
        this.stop()
        if (this.options.onComplete) {
          this.options.onComplete(result)
        }
        return
      }

      if (result.status === 'failed') {
        this.stop()
        if (this.options.onFailed) {
          this.options.onFailed(result)
        }
        return
      }

      // 检查是否超过最大尝试次数
      if (this.attempts >= this.options.maxAttempts) {
        this.stop()
        const error = new Error(`轮询超时：已尝试 ${this.attempts} 次`)
        if (this.options.onError) {
          this.options.onError(error)
        }
        return
      }

      // 继续轮询
      this.timer = setTimeout(() => {
        this.poll()
      }, this.options.interval)

    } catch (error) {
      console.error('轮询任务状态失败:', error)
      
      // 如果是网络错误，继续尝试
      if (this.attempts < this.options.maxAttempts) {
        this.timer = setTimeout(() => {
          this.poll()
        }, this.options.interval)
      } else {
        this.stop()
        if (this.options.onError) {
          this.options.onError(error)
        }
      }
    }
  }
}

/**
 * 转文案轮询器类
 */
export class TranscriptionPoller {
  constructor(taskId, onUpdate, options = {}) {
    this.taskId = taskId
    this.onUpdate = onUpdate
    this.options = {
      interval: 2000, // 轮询间隔（毫秒）
      maxAttempts: 150, // 最大尝试次数（5分钟）
      onError: null,
      onComplete: null,
      onFailed: null,
      ...options
    }
    
    this.isRunning = false
    this.attempts = 0
    this.timer = null
  }

  /**
   * 开始轮询
   */
  start() {
    if (this.isRunning) {
      return
    }
    
    this.isRunning = true
    this.attempts = 0
    this.poll()
  }

  /**
   * 停止轮询
   */
  stop() {
    this.isRunning = false
    this.attempts = 0
    
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  /**
   * 执行轮询
   */
  async poll() {
    if (!this.isRunning) {
      return
    }

    this.attempts++

    try {
      const result = await videoApi.getTranscriptionResult(this.taskId)
      
      // 调用更新回调
      if (this.onUpdate) {
        this.onUpdate(result)
      }

      // 检查转文案状态
      if (result.transcription && result.transcription.status === 'completed') {
        this.stop()
        if (this.options.onComplete) {
          this.options.onComplete(result)
        }
        return
      }

      if (result.transcription && result.transcription.status === 'failed') {
        this.stop()
        if (this.options.onFailed) {
          this.options.onFailed(result)
        }
        return
      }

      // 检查是否超过最大尝试次数
      if (this.attempts >= this.options.maxAttempts) {
        this.stop()
        const error = new Error(`转文案轮询超时：已尝试 ${this.attempts} 次`)
        if (this.options.onError) {
          this.options.onError(error)
        }
        return
      }

      // 继续轮询
      this.timer = setTimeout(() => {
        this.poll()
      }, this.options.interval)

    } catch (error) {
      console.error('轮询转文案状态失败:', error)
      
      // 404错误可能表示转文案还未开始或不存在
      if (error.response?.status === 404) {
        // 继续轮询
        if (this.attempts < this.options.maxAttempts) {
          this.timer = setTimeout(() => {
            this.poll()
          }, this.options.interval)
        } else {
          this.stop()
          if (this.options.onError) {
            this.options.onError(new Error('转文案任务不存在'))
          }
        }
      } else {
        // 其他错误，停止轮询
        this.stop()
        if (this.options.onError) {
          this.options.onError(error)
        }
      }
    }
  }
}

/**
 * 视频服务工具函数
 */
export const videoUtils = {
  /**
   * 检测视频平台
   * @param {string} url - 视频链接
   * @returns {string|null} 平台名称
   */
  detectPlatform(url) {
    if (!url) return null
    
    const platformMap = {
      'douyin.com': 'douyin',
      'dy.com': 'douyin',
      'bilibili.com': 'bilibili',
      'b23.tv': 'bilibili',
      'youtube.com': 'youtube',
      'youtu.be': 'youtube',
      'kuaishou.com': 'kuaishou',
      'ixigua.com': 'ixigua'
    }
    
    for (const [domain, platform] of Object.entries(platformMap)) {
      if (url.includes(domain)) {
        return platform
      }
    }
    
    return null
  },

  /**
   * 验证视频链接
   * @param {string} url - 视频链接
   * @returns {boolean} 是否有效
   */
  isValidVideoUrl(url) {
    if (!url || typeof url !== 'string') {
      return false
    }
    
    // 简单的URL验证
    try {
      new URL(url)
      return this.detectPlatform(url) !== null
    } catch {
      return false
    }
  },

  /**
   * 清理视频链接
   * @param {string} url - 原始链接
   * @returns {string} 清理后的链接
   */
  cleanVideoUrl(url) {
    if (!url) return ''
    
    // 移除多余的空格和换行符
    url = url.trim().replace(/\s+/g, ' ')
    
    // 提取URL
    const urlMatch = url.match(/(https?:\/\/[^\s]+)/i)
    if (urlMatch) {
      return urlMatch[1]
    }
    
    return url
  },

  /**
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @returns {string} 格式化后的大小
   */
  formatFileSize(bytes) {
    if (!bytes) return '0 B'
    
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  },

  /**
   * 获取平台显示名称
   * @param {string} platform - 平台代码
   * @returns {string} 显示名称
   */
  getPlatformDisplayName(platform) {
    const nameMap = {
      'douyin': '抖音',
      'bilibili': '哔哩哔哩',
      'youtube': 'YouTube',
      'kuaishou': '快手',
      'ixigua': '西瓜视频'
    }
    
    return nameMap[platform] || platform || '未知平台'
  },

  /**
   * 获取平台颜色
   * @param {string} platform - 平台代码
   * @returns {string} 颜色值
   */
  getPlatformColor(platform) {
    const colorMap = {
      'douyin': '#ff6b6b',
      'bilibili': '#fb7299',
      'youtube': '#ff0000',
      'kuaishou': '#ff6600',
      'ixigua': '#20b2aa'
    }
    
    return colorMap[platform] || '#666eea'
  }
}

/**
 * 视频清理管理器
 */
export class VideoCleaner {
  constructor() {
    this.currentTaskId = null
    this.shouldCleanOnUnload = true
    this.setupCleanupListeners()
  }

  /**
   * 设置当前任务ID
   * @param {string} taskId - 任务ID
   */
  setCurrentTask(taskId) {
    // 清理之前的任务
    if (this.currentTaskId && this.currentTaskId !== taskId) {
      this.cleanTask(this.currentTaskId)
    }
    this.currentTaskId = taskId
  }

  /**
   * 清理指定任务
   * @param {string} taskId - 任务ID
   */
  async cleanTask(taskId) {
    if (!taskId) return
    
    try {
      await videoApi.cleanVideo(taskId)
      console.log(`已清理视频缓存: ${taskId}`)
    } catch (error) {
      console.warn(`清理视频缓存失败: ${taskId}`, error)
    }
  }

  /**
   * 清理当前任务
   */
  async cleanCurrentTask() {
    if (this.currentTaskId) {
      await this.cleanTask(this.currentTaskId)
      this.currentTaskId = null
    }
  }

  /**
   * 设置页面卸载时是否自动清理
   * @param {boolean} shouldClean - 是否清理
   */
  setShouldCleanOnUnload(shouldClean) {
    this.shouldCleanOnUnload = shouldClean
  }

  /**
   * 设置清理监听器
   */
  setupCleanupListeners() {
    // 页面刷新或关闭时清理
    window.addEventListener('beforeunload', () => {
      if (this.shouldCleanOnUnload && this.currentTaskId) {
        // 使用 navigator.sendBeacon 确保清理请求能够发送
        const cleanUrl = `${api.defaults.baseURL}/video/clean/${this.currentTaskId}`
        navigator.sendBeacon(cleanUrl, JSON.stringify({ method: 'DELETE' }))
      }
    })

    // 页面隐藏时清理（移动端兼容）
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && this.shouldCleanOnUnload && this.currentTaskId) {
        const cleanUrl = `${api.defaults.baseURL}/video/clean/${this.currentTaskId}`
        navigator.sendBeacon(cleanUrl, JSON.stringify({ method: 'DELETE' }))
      }
    })

    // 浏览器导航离开时清理
    window.addEventListener('pagehide', () => {
      if (this.shouldCleanOnUnload && this.currentTaskId) {
        const cleanUrl = `${api.defaults.baseURL}/video/clean/${this.currentTaskId}`
        navigator.sendBeacon(cleanUrl, JSON.stringify({ method: 'DELETE' }))
      }
    })
  }
}

// 创建全局清理器实例
export const videoCleaner = new VideoCleaner() 