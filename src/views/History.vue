<template>
  <div class="history-page">
    <div class="page-container">
      <div class="header">
        <van-nav-bar
          title="历史记录"
          left-arrow
          @click-left="goBack"
        />
      </div>
      
      <div class="content">
        <div class="loading-placeholder text-center">
          <van-loading size="24px" />
          <p class="mt-md">正在开发中...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.history-page {
  min-height: 100vh;
  background: $bg-secondary;
}

.content {
  padding: $space-xl;
}

.loading-placeholder {
  padding: $space-2xl;
  color: $text-secondary;
}
</style> 