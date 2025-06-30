# Link Copy - 智能视频解析与文案提取

智能视频解析与文案提取工具，支持多平台视频链接解析和本地文件上传。

## 🚀 功能特性

### 📁 视频处理方式
- **链接解析**: 支持抖音、哔哩哔哩等主流视频平台链接解析
- **文件上传**: 直接上传本地视频文件，支持多种格式
  - 支持格式：MP4、AVI、MOV、WMV、FLV、WEBM、MKV、M4V、3GP、OGV
  - 文件大小限制：500MB
  - 支持拖拽上传和点击选择

### 🎯 核心功能
- **智能解析**: 自动识别视频平台，快速解析下载链接
- **高清下载**: 支持多种分辨率，保证视频质量  
- **音频转文案**: 利用AI技术将视频音频转换为文字
- **文案优化**: 智能优化文案内容，提升可读性
- **实时进度**: 上传和处理进度实时显示

### 💡 用户体验
- 现代化UI设计，玻璃拟态风格
- 响应式布局，支持移动端
- PWA支持，可安装到桌面
- 选项卡切换，操作直观便捷

## 📱 使用方式

### 链接解析
1. 选择"链接解析"选项卡
2. 粘贴视频链接或分享文本
3. 点击"开始解析"按钮
4. 等待处理完成，查看结果

### 文件上传 🆕
1. 选择"文件上传"选项卡
2. 点击选择文件或直接拖拽视频文件到上传区域
3. 系统会自动验证文件格式和大小
4. 点击"开始上传"按钮
5. 实时查看上传进度
6. 上传完成后自动跳转到视频预览页面

## 🛠️ 技术栈

- **前端框架**: Vue 3 + Vite
- **UI组件**: Vant 4
- **状态管理**: Pinia
- **样式预处理**: SCSS
- **文件上传**: FormData + 进度监控
- **拖拽支持**: HTML5 Drag & Drop API
- **PWA**: Service Worker + Web App Manifest

## 🔧 开发说明

### 启动项目
```bash
npm install
npm run dev
```

### 构建部署
```bash
npm run build
```

## 📁 项目结构

```
src/
├── components/     # 可复用组件
│   └── InstallPrompt.vue
├── views/         # 页面组件
│   ├── Home.vue           # 主页(含文件上传)
│   ├── VideoPreview.vue   # 视频预览
│   └── TextResult.vue     # 文案结果
├── services/      # API服务
│   ├── api.js            # 基础API配置
│   └── video.js          # 视频相关API
├── stores/        # 状态管理
│   └── task.js           # 任务状态管理
├── utils/         # 工具函数
│   ├── clipboard.js      # 剪贴板操作
│   ├── format.js         # 格式化工具
│   ├── storage.js        # 本地存储
│   └── validate.js       # 验证工具
└── styles/        # 全局样式
    ├── global.scss       # 全局样式
    └── variables.scss    # SCSS变量
```

## 🌐 API接口

### 链接解析
- `POST /api/video/download` - 创建下载任务
- `GET /api/video/status/{taskId}` - 查询任务状态

### 文件上传 🆕
- `POST /api/video/upload` - 上传视频文件
  - Content-Type: `multipart/form-data`
  - 参数: `video` (文件)
  - 支持格式: MP4, AVI, MOV, WMV, FLV, WEBM, MKV, M4V, 3GP, OGV
  - 文件限制: 500MB

### 通用接口
- `GET /api/video/preview/{taskId}` - 获取视频预览
- `POST /api/video/transcribe/{taskId}` - 转换音频为文案
- `POST /api/video/optimize-text` - AI优化文案
- `DELETE /api/video/clean/{taskId}` - 清理视频文件

默认后端服务: `http://47.109.155.18:2222`

## 🎯 新功能说明

### 文件上传功能
文件上传功能与链接解析功能具有**完全相同**的后续处理流程：

1. **上传阶段**: 文件验证 → 上传进度 → 任务创建
2. **处理阶段**: 视频处理 → 状态轮询 → 完成通知
3. **预览阶段**: 视频预览 → 转文案 → 文案优化
4. **结果页面**: 文案展示 → 复制分享 → 历史记录

### 技术实现要点
- 使用 `FormData` 进行文件上传
- 实现上传进度实时监控
- 支持 HTML5 拖拽上传体验
- 文件类型和大小验证
- 与现有任务管理系统无缝集成

## 📋 后续功能规划

- [ ] 批量文件上传
- [ ] 视频格式转换
- [ ] 支持更多视频平台
- [ ] 云端存储集成
- [ ] 分享功能增强
- [ ] 视频剪辑功能 