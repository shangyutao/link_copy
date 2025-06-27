// URL验证
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  
  try {
    new URL(url)
    return true
  } catch {
    // 如果不是完整URL，检查是否包含常见视频平台域名
    const videoPatterns = [
      /douyin\.com/i,
      /dy\.com/i,
      /bilibili\.com/i,
      /b23\.tv/i,
      /youtube\.com/i,
      /youtu\.be/i
    ]
    
    return videoPatterns.some(pattern => pattern.test(url))
  }
}

// 视频URL验证
export const isVideoUrl = (url) => {
  if (!isValidUrl(url)) return false
  
  const videoPatterns = [
    /douyin\.com/i,
    /dy\.com/i,
    /bilibili\.com/i,
    /b23\.tv/i,
    /youtube\.com/i,
    /youtu\.be/i,
    /tiktok\.com/i
  ]
  
  return videoPatterns.some(pattern => pattern.test(url))
}

// 检测视频平台
export const detectPlatform = (url) => {
  if (!url) return null
  
  const lowerUrl = url.toLowerCase()
  
  if (lowerUrl.includes('douyin.com') || lowerUrl.includes('dy.com')) {
    return 'douyin'
  }
  
  if (lowerUrl.includes('bilibili.com') || lowerUrl.includes('b23.tv')) {
    return 'bilibili'
  }
  
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube'
  }
  
  if (lowerUrl.includes('tiktok.com')) {
    return 'tiktok'
  }
  
  return null
}

// 提取分享文本中的URL
export const extractUrlFromText = (text) => {
  if (!text) return null
  
  // 匹配URL的正则表达式
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const matches = text.match(urlRegex)
  
  if (matches && matches.length > 0) {
    return matches[0].replace(/[.,;!?]$/, '') // 移除末尾的标点符号
  }
  
  return null
}

// 验证任务ID格式
export const isValidTaskId = (taskId) => {
  if (!taskId || typeof taskId !== 'string') return false
  
  // 任务ID应该是非空字符串，通常包含字母、数字、下划线、连字符
  return /^[a-zA-Z0-9_-]+$/.test(taskId) && taskId.length > 0
} 