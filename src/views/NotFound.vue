<template>
  <div class="not-found-page">
    <div class="page-container text-center">
      <div class="error-icon">
        <van-icon name="warning-o" />
      </div>
      <h2 class="error-title">页面未找到</h2>
      <p class="error-message">抱歉，您访问的页面不存在</p>
      <van-button 
        type="primary" 
        size="large" 
        class="back-btn"
        @click="goHome"
      >
        返回首页
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.not-found-page {
  min-height: 100vh;
  min-height: calc(var(--vh, 1vh) * 100);
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-icon {
  font-size: 64px;
  color: $warning-color;
  margin-bottom: $space-lg;
}

.error-title {
  font-size: $font-2xl;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: $space-md;
}

.error-message {
  font-size: $font-base;
  color: $text-secondary;
  margin-bottom: $space-xl;
}

.back-btn {
  @include gradient-bg;
  border-radius: $radius-lg;
}
</style> 