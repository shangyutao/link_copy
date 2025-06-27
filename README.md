# Link Copy 前端项目

Link Copy 是一个视频链接转文案的工具，支持抖音、哔哩哔哩等主流视频平台。

## 🚀 技术栈

- **前端框架**: Vue 3 + Composition API
- **构建工具**: Vite
- **移动端方案**: Capacitor (打包原生APP)
- **UI组件库**: Vant 4
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP客户端**: Axios
- **样式方案**: SCSS + 设计系统
- **图标**: Vant Icons

## 📱 功能特性

- ✅ 视频链接解析
- ✅ 视频预览
- ✅ 视频下载
- ✅ 音频转文案
- ✅ AI文案优化
- ✅ 历史记录
- ✅ 移动端原生APP
- ✅ 响应式设计

## 🛠️ 开发环境

### 环境要求
- Node.js >= 16.x
- npm >= 8.x

### 安装依赖
```bash
npm install
```

### 开发运行
```bash
# 启动开发服务器
npm run dev

# 在移动设备上调试
npm run dev -- --host
```

### 构建项目
```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 📱 移动端APP打包

### 添加平台
```bash
# 添加Android平台
npm run cap:add:android

# 添加iOS平台
npm run cap:add:ios
```

### 构建和同步
```bash
# 构建并同步到原生平台
npm run cap:build
```

### 在IDE中打开
```bash
# 在Android Studio中打开
npm run cap:open:android

# 在Xcode中打开
npm run cap:open:ios
```

## 📁 项目结构

```
src/
├── components/         # 公共组件
├── views/             # 页面组件
├── stores/            # Pinia状态管理
├── services/          # API服务
├── utils/             # 工具函数
├── styles/            # 样式文件
├── router/            # 路由配置
├── App.vue            # 根组件
└── main.js            # 入口文件
```

## 🎨 设计系统

项目使用统一的设计系统，主要配色：
- 主色调: 科技蓝紫渐变 (#667eea - #764ba2)
- 辅助色: 成功绿 (#10b981)、警告橙 (#f59e0b)、错误红 (#ef4444)

## 🔗 API集成

后端API地址: `http://47.109.155.18:2222/api`

主要接口：
- POST `/video/download` - 创建下载任务
- GET `/video/status/{taskId}` - 查询任务状态
- POST `/video/transcribe/{taskId}` - 转换文案
- POST `/video/optimize-text` - AI优化文案

## 📈 开发计划

- [x] 项目架构搭建
- [x] 基础页面框架
- [x] API集成
- [ ] 视频预览功能
- [ ] 转文案功能
- [ ] AI优化功能
- [ ] 历史记录功能
- [ ] APP打包测试

## 🤝 开发规范

1. 使用 Vue 3 Composition API
2. 组件命名采用 PascalCase
3. 文件名采用 kebab-case
4. 样式使用SCSS + 设计系统变量
5. 提交信息遵循 Conventional Commits

## 📞 联系方式

如有问题，请联系开发团队。 