import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

let ffmpegInstance = null
let ffmpegLoadingPromise = null

async function getFFmpeg() {
  if (ffmpegInstance) {
    console.log('✅ 使用已加载的 FFmpeg 实例')
    return ffmpegInstance
  }
  
  if (ffmpegLoadingPromise) {
    console.log('⏳ FFmpeg 正在加载中，等待...')
    return ffmpegLoadingPromise
  }
  
  console.log('🚀 开始加载 FFmpeg...')
  ffmpegLoadingPromise = new Promise(async (resolve, reject) => {
    // 添加超时机制
    const timeout = setTimeout(() => {
      console.error('❌ FFmpeg 加载超时 (30秒)')
      ffmpegLoadingPromise = null
      reject(new Error('FFmpeg 加载超时'))
    }, 30000)
    
    try {
      const ffmpeg = new FFmpeg()
      console.log('📦 FFmpeg 实例创建成功')
      
      // 添加事件监听器
      ffmpeg.on('log', ({ message }) => {
        console.log('FFmpeg log:', message)
      })
      
      ffmpeg.on('progress', ({ progress, time }) => {
        console.log(`FFmpeg progress: ${Math.round(progress * 100)}% (time: ${time}s)`)
      })
      
      console.log('🔄 开始加载 FFmpeg 核心文件...')
      console.log('📥 尝试下载核心文件...')
      
      // 先测试网络连接
      try {
        const testResponse = await fetch('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js', { 
          method: 'HEAD',
          mode: 'cors'
        })
        console.log('✅ 网络连接测试成功:', testResponse.status)
      } catch (networkError) {
        console.warn('⚠️ 网络连接测试失败:', networkError)
      }
      
      await ffmpeg.load({
        coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
        wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
        workerURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.worker.js'
      })
      console.log('✅ FFmpeg 核心文件加载完成')
      
      clearTimeout(timeout)
      ffmpegInstance = ffmpeg
      console.log('🎉 FFmpeg 完全加载成功')
      resolve(ffmpeg)
    } catch (error) {
      clearTimeout(timeout)
      console.error('❌ FFmpeg 加载失败:', error)
      console.error('错误详情:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      ffmpegInstance = null
      reject(error)
    } finally {
      ffmpegLoadingPromise = null
    }
  })
  
  return ffmpegLoadingPromise
}

/**
 * 将视频转为仅音频的 MP4（AAC），大幅减小体积
 * - 音频参数：单声道、48kHz、64kbps
 * - 失败时抛出错误，调用方可回退原文件
 * @param {File} inputFile 视频文件
 * @returns {Promise<Object>} 压缩结果 {file, compressed}
 */
export async function transcodeToAudioOnlyMp4(inputFile) {
  console.log('🎬 开始压缩视频:', {
    name: inputFile.name,
    size: inputFile.size,
    type: inputFile.type
  })
  
  try {
    const ffmpeg = await getFFmpeg()
    console.log('✅ FFmpeg 加载成功')

    const inputName = 'input.mp4'
    const outputName = 'output_audio.mp4'

    console.log('📝 写入输入文件...')
    await ffmpeg.writeFile(inputName, await fetchFile(inputFile))
    console.log('✅ 输入文件写入完成')

    console.log('🔄 开始转码...')
    await ffmpeg.exec([
      '-i', inputName,
      '-vn',
      '-ac', '1',
      '-ar', '48000',
      '-b:a', '64k',
      '-c:a', 'aac',
      '-movflags', '+faststart',
      outputName
    ])
    console.log('✅ 转码完成')

    console.log('📖 读取输出文件...')
    const data = await ffmpeg.readFile(outputName)
    console.log('✅ 输出文件读取完成，大小:', data.buffer.byteLength)

    const blob = new Blob([data.buffer], { type: 'video/mp4' })
    const file = new File([blob], inputFile.name.replace(/\.[^.]+$/, '') + '_audio.mp4', { type: 'video/mp4' })
    
    console.log('🎉 压缩完成:', {
      originalSize: inputFile.size,
      newSize: file.size,
      reduction: Math.round((1 - file.size / inputFile.size) * 100) + '%'
    })

    // 清理
    try { await ffmpeg.deleteFile(inputName) } catch (e) { console.warn('清理输入文件失败:', e) }
    try { await ffmpeg.deleteFile(outputName) } catch (e) { console.warn('清理输出文件失败:', e) }

    return { file, compressed: true }
  } catch (error) {
    console.error('❌ 压缩失败:', error)
    throw error
  }
}

/**
 * 若原文件超过阈值，则尝试仅音频转码；否则直接返回原文件。
 * @param {File} inputFile
 * @param {number} thresholdBytes 默认 20MB
 * @returns {Promise<{file: File, compressed: boolean}>}
 */
export async function maybeCompressForNetlify(inputFile, thresholdBytes = 20 * 1024 * 1024) {
  if (!inputFile) throw new Error('无效文件')
  
  // 临时完全禁用压缩功能
  console.log('⚠️ 压缩功能暂时禁用，直接使用原文件')
  console.log('📝 原因：FFmpeg 核心文件加载失败')
  console.log('💡 建议：文件大小超过阈值时，请手动压缩后再上传')
  console.log('📊 文件信息:', {
    name: inputFile.name,
    size: (inputFile.size / (1024 * 1024)).toFixed(2) + 'MB',
    threshold: (thresholdBytes / (1024 * 1024)).toFixed(2) + 'MB'
  })
  
  return { file: inputFile, compressed: false }
}


