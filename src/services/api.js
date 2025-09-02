import axios from 'axios'
import { showToast, showLoadingToast, closeToast } from 'vant'

// 环境配置
const isDevelopment = import.meta.env.DEV
// 优先使用环境变量，便于在生产环境绕过静态站点代理直连后端
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isDevelopment 
  ? 'http://47.109.155.18:2222/api'  // 开发环境
  : '/api'  // 默认生产为相对路径（Netlify 代理）
)

console.log('API环境配置:', { isDevelopment, API_BASE_URL })

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 显示loading
    if (config.showLoading !== false) {
      showLoadingToast({
        message: '请求中...',
        forbidClick: true,
        duration: 0
      })
    }
    
    console.log('API请求:', config.method?.toUpperCase(), config.url, config.data)
    return config
  },
  error => {
    closeToast()
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    closeToast()
    
    const { data } = response
    console.log('API响应:', response.config.url, data)
    
    // 根据业务状态码处理
    if (data.code && data.code !== 200) {
      const errorMessage = data.message || '请求失败'
      showToast({
        type: 'fail',
        message: errorMessage
      })
      return Promise.reject(new Error(errorMessage))
    }
    
    return data
  },
  error => {
    closeToast()
    
    console.error('响应错误:', error)
    
    let errorMessage = '网络错误，请稍后重试'
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          errorMessage = data.message || '请求参数错误'
          break
        case 401:
          errorMessage = '未授权，请重新登录'
          break
        case 403:
          errorMessage = '没有权限访问'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 408:
          errorMessage = '请求超时'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        case 503:
          errorMessage = '服务暂时不可用'
          break
        default:
          if (data && data.message) {
            errorMessage = data.message
          }
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = '请求超时，请检查网络连接'
    } else if (error.message === 'Network Error') {
      errorMessage = '网络连接异常'
    }
    
    showToast({
      type: 'fail',
      message: errorMessage
    })
    
    return Promise.reject(error)
  }
)

export default api
export { API_BASE_URL } 