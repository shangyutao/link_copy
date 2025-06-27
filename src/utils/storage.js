// 本地存储键名常量
export const STORAGE_KEYS = {
  TASK_HISTORY: 'link_copy_task_history',
  USER_SETTINGS: 'link_copy_user_settings',
  RECENT_PLATFORMS: 'link_copy_recent_platforms'
}

// 安全的本地存储操作
export const storage = {
  // 获取数据
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('读取本地存储失败:', error)
      return defaultValue
    }
  },

  // 设置数据
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('保存到本地存储失败:', error)
      return false
    }
  },

  // 删除数据
  remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('删除本地存储失败:', error)
      return false
    }
  },

  // 清空所有数据
  clear() {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('清空本地存储失败:', error)
      return false
    }
  },

  // 获取存储大小
  getSize() {
    try {
      let total = 0
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length
        }
      }
      return total
    } catch (error) {
      console.error('计算存储大小失败:', error)
      return 0
    }
  }
}

// 任务历史相关操作
export const taskHistory = {
  // 获取历史记录
  getHistory() {
    return storage.get(STORAGE_KEYS.TASK_HISTORY, [])
  },

  // 添加到历史记录
  addTask(task) {
    const history = this.getHistory()
    
    // 检查是否已存在
    const existingIndex = history.findIndex(item => item.taskId === task.taskId)
    
    if (existingIndex >= 0) {
      // 更新现有记录
      history[existingIndex] = { ...history[existingIndex], ...task }
    } else {
      // 添加新记录到开头
      history.unshift(task)
    }
    
    // 限制历史记录数量
    const limitedHistory = history.slice(0, 50)
    
    return storage.set(STORAGE_KEYS.TASK_HISTORY, limitedHistory)
  },

  // 更新任务
  updateTask(taskId, updateData) {
    const history = this.getHistory()
    const index = history.findIndex(item => item.taskId === taskId)
    
    if (index >= 0) {
      history[index] = { ...history[index], ...updateData }
      return storage.set(STORAGE_KEYS.TASK_HISTORY, history)
    }
    
    return false
  },

  // 删除任务
  removeTask(taskId) {
    const history = this.getHistory()
    const filteredHistory = history.filter(item => item.taskId !== taskId)
    
    return storage.set(STORAGE_KEYS.TASK_HISTORY, filteredHistory)
  },

  // 清空历史记录
  clearHistory() {
    return storage.set(STORAGE_KEYS.TASK_HISTORY, [])
  }
}

// 用户设置相关操作
export const userSettings = {
  // 获取设置
  getSettings() {
    return storage.get(STORAGE_KEYS.USER_SETTINGS, {
      autoDownload: false,
      videoQuality: 'high',
      saveHistory: true,
      notifications: true
    })
  },

  // 更新设置
  updateSettings(newSettings) {
    const currentSettings = this.getSettings()
    const updatedSettings = { ...currentSettings, ...newSettings }
    
    return storage.set(STORAGE_KEYS.USER_SETTINGS, updatedSettings)
  },

  // 重置设置
  resetSettings() {
    return storage.remove(STORAGE_KEYS.USER_SETTINGS)
  }
} 