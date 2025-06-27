# 🔍 iOS黑屏问题排查指南

## 📱 您遇到的问题

iOS模拟器/设备运行后显示黑屏，这是常见的问题，通常可以快速解决。

## 🛠️ 立即排查步骤

### 第一步：查看Xcode控制台日志 ⭐️ 最重要

**在Xcode中：**
1. 确保应用正在运行（黑屏状态）
2. 在Xcode底部点击显示"Debug Area"（或按 Cmd+Shift+Y）
3. 查看控制台输出的错误信息

**常见错误信息：**
```
❌ Failed to load resource: net::ERR_FILE_NOT_FOUND
❌ Mixed Content: The page was loaded over HTTPS, but requested an insecure HTTP resource
❌ Uncaught TypeError: Cannot read property 'xxx' of undefined
❌ Network request failed
```

### 第二步：快速修复方案

#### 方案1：重新同步项目 🚀 成功率最高
```bash
# 在终端执行（项目根目录）
npm run build
npx cap sync
```

#### 方案2：清理并重新构建
```bash
# 1. 在Xcode中: Product → Clean Build Folder
# 2. 然后重新运行: Cmd+R
```

#### 方案3：修复HTTP请求问题
iOS默认阻止HTTP请求，需要配置允许HTTP。

### 第三步：检查启动屏幕配置

启动屏幕可能遮盖了内容，让我们调整配置：

```typescript
// capacitor.config.ts 中的 SplashScreen 配置
SplashScreen: {
  launchShowDuration: 500,  // 减少到500ms
  backgroundColor: '#ffffff',  // 改为白色背景
  showSpinner: true,  // 显示加载指示器
  androidSpinnerStyle: 'large',
  iosSpinnerStyle: 'small',
  spinnerColor: '#000000'  // 黑色spinner
}
```

## 🔧 详细解决方案

### 解决方案1：修复网络请求问题

iOS对HTTP请求有严格限制，需要配置Info.plist文件：

**在Xcode中：**
1. 打开 `ios/App/App/Info.plist`
2. 添加以下配置：

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>47.109.155.18</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
            <key>NSExceptionPortNumber</key>
            <integer>2222</integer>
        </dict>
    </dict>
</dict>
```

### 解决方案2：修复Capacitor配置

更新 `capacitor.config.ts`：

```typescript
const config: CapacitorConfig = {
  appId: 'com.linkcopy.app',
  appName: 'Link Copy',
  webDir: 'dist',
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 500,
      backgroundColor: '#ffffff',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#000000'
    },
    
    StatusBar: {
      style: 'default',
      backgroundColor: '#ffffff'
    }
  },
  
  server: {
    allowNavigation: ['47.109.155.18'],
    androidScheme: 'https',
    iosScheme: 'capacitor'
  }
};
```

### 解决方案3：添加调试信息

在 `src/main.js` 中添加调试代码：

```javascript
// 在文件开头添加
console.log('App starting...');

// 在 app.mount('#app') 之前添加
console.log('Mounting app...');
app.mount('#app')
console.log('App mounted successfully!');
```

## 🎯 立即执行的命令

**请先执行这个命令重新同步：**
```bash
cd /path/to/your/project
npm run build && npx cap sync
```

**然后在Xcode中：**
1. Product → Clean Build Folder
2. 重新运行: Cmd+R
3. 查看控制台输出

## 📋 问题检查清单

- [ ] 查看Xcode控制台是否有错误信息
- [ ] 执行 `npm run build && npx cap sync`
- [ ] 在Xcode中清理构建缓存
- [ ] 检查网络请求配置
- [ ] 调整启动屏幕时间
- [ ] 添加调试日志

## 🚨 如果仍然黑屏

**请提供以下信息：**
1. Xcode控制台的错误信息
2. 选择的是iPhone模拟器还是真机
3. 网络连接是否正常
4. 是否能在浏览器中正常访问 `npm run dev`

---

**大多数黑屏问题都可以通过重新同步项目解决！** 🎉 