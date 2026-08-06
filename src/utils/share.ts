import { toPng } from 'html-to-image'
import { t } from 'virtual:ai-i18n'
import { toast } from './toast'

/**
 * 将 DOM 元素转换为 PNG 图片的 Base64 数据
 */
export async function generateShareImage(element: HTMLElement): Promise<string> {
  return await toPng(element, {
    quality: 1,
    pixelRatio: 3,
    backgroundColor: '#ffffff',
  })
}

/**
 * 尝试调用系统原生分享 (Web Share API) 分享图片
 * 如果不支持，则返回 false
 */
export async function shareImageNative(dataUrl: string, filename: string): Promise<boolean> {
  // 检查是否支持分享文件
  if (!navigator.share || !navigator.canShare) {
    return false
  }

  try {
    // 将 Base64 转换为 Blob
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    const file = new File([blob], filename, { type: 'image/png' })

    if (navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'ScaleTrack',
      })
      return true
    }
  } catch (err: unknown) {
    const error = err as Error
    if (error.name !== 'AbortError') {
      console.error('Share failed:', error)
    }
    // AbortError 是用户取消分享，也算作"已处理"但不算成功
    if (error.name === 'AbortError') {
      return true
    }
  }

  return false
}

/**
 * 触发浏览器下载图片
 */
export function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}

/**
 * 统一的分享处理流程
 * 1. 尝试系统分享
 * 2. 如果失败或不支持，则回退为下载
 */
export async function processShareOrDownload(dataUrl: string, filename: string) {
  const shared = await shareImageNative(dataUrl, filename)
  if (!shared) {
    downloadImage(dataUrl, filename)
    toast.success(t('已保存图片，如未生效请长按海报保存'))
  }
}
