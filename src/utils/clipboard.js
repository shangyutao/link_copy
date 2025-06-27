/**
 * 剪贴板工具函数
 */

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>} - 复制是否成功
 */
export async function copyToClipboard(text) {
  try {
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
    
    // 降级到传统方法
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    const success = document.execCommand('copy')
    document.body.removeChild(textArea)
    
    return success
  } catch (error) {
    console.error('复制到剪贴板失败:', error)
    return false
  }
}

/**
 * 从剪贴板读取文本
 * @returns {Promise<string>} - 剪贴板中的文本
 */
export async function readFromClipboard() {
  try {
    // 只有在安全上下文中才能使用 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      const text = await navigator.clipboard.readText()
      return text
    }
    
    // 无法在非安全上下文中读取剪贴板
    throw new Error('无法读取剪贴板：需要安全上下文')
  } catch (error) {
    console.error('读取剪贴板失败:', error)
    return ''
  }
}

/**
 * 检查是否支持剪贴板操作
 * @returns {boolean} - 是否支持剪贴板操作
 */
export function isClipboardSupported() {
  return !!(navigator.clipboard && window.isSecureContext)
}

/**
 * 检查文本是否可能是视频链接
 * @param {string} text - 要检查的文本
 * @returns {boolean} - 是否可能是视频链接
 */
export function isPossibleVideoLink(text) {
  if (!text || typeof text !== 'string') {
    return false
  }
  
  // 常见视频平台域名
  const videoPatterns = [
    /douyin\.com/i,
    /dy\.com/i,
    /bilibili\.com/i,
    /b23\.tv/i,
    /youtube\.com/i,
    /youtu\.be/i,
    /kuaishou\.com/i,
    /ixigua\.com/i,
    /weibo\.com/i,
    /xiaohongshu\.com/i
  ]
  
  // 检查是否包含视频平台域名
  return videoPatterns.some(pattern => pattern.test(text))
}

/**
 * 提取文本中的链接
 * @param {string} text - 要提取链接的文本
 * @returns {string[]} - 提取到的链接数组
 */
export function extractLinks(text) {
  if (!text || typeof text !== 'string') {
    return []
  }
  
  // URL正则表达式
  const urlRegex = /(https?:\/\/[^\s]+)/gi
  const matches = text.match(urlRegex)
  
  return matches || []
}

/**
 * 清理和标准化文本
 * @param {string} text - 要清理的文本
 * @returns {string} - 清理后的文本
 */
export function cleanText(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }
  
  return text
    .trim()
    .replace(/\s+/g, ' ') // 合并多个空格
    .replace(/[\r\n]+/g, ' ') // 换行符转空格
} 