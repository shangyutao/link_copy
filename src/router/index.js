import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: 'Link Copy - 链接转文案',
      keepAlive: false
    }
  },
  {
    path: '/preview/:taskId',
    name: 'VideoPreview',
    component: () => import('@/views/VideoPreview.vue'),
    meta: {
      title: '视频预览',
      keepAlive: true
    }
  },
  {
    path: '/text-result/:taskId',
    name: 'TextResult',
    component: () => import('@/views/TextResult.vue'),
    meta: {
      title: '文案结果',
      keepAlive: true
    }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/History.vue'),
    meta: {
      title: '历史记录',
      keepAlive: true
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: {
      title: '关于我们',
      keepAlive: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面未找到'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // 这里可以添加权限验证等逻辑
  next()
})

export default router 