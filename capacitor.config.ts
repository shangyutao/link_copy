import { CapacitorConfig } from '@capacitor/cli';

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
      style: 'dark',
      backgroundColor: '#667eea'
    },
    
    Clipboard: {
      // 剪贴板权限配置
    }
  },
  
  server: {
    // 开发时的配置
    allowNavigation: ['47.109.155.18'],
    androidScheme: 'https',
    iosScheme: 'capacitor'
  }
};

export default config; 