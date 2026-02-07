/* eslint-disable no-redeclare */
// @ts-nocheck  // 条件编译导致 TS 误报重复声明，运行时只保留其中一段
/**
 * 全局 Loading 状态，供自定义 loading 组件使用。
 *
 * 使用方式一（推荐）：直接调用
 *   import { showLoading, hideLoading } from '@/store/loading'
 *   showLoading({ title: '请稍候', logo: '/static/logo.png', styleType: 'spinner' })
 *   hideLoading()
 *
 * 使用方式二：getApp()
 *   getApp().$showLoading({ title: '加载中...' })
 *   getApp().$hideLoading()
 *
 * showLoading(options)：可选 title、logo、styleType('tea'|'spinner'|'dots')、logoSpin、blur
 */

// #ifdef VUE3
import { reactive } from 'vue'
export const loadingState = reactive({
  visible: false,
  title: '加载中...',
  logo: '',
  styleType: 'tea',
  logoSpin: true,
  blur: true
})
// #endif

// #ifndef VUE3
export const loadingState = {
  visible: false,
  title: '加载中...',
  logo: '',
  styleType: 'tea',
  logoSpin: true,
  blur: true
}
// #endif

export function showLoading(options = {}) {
  loadingState.visible = true
  loadingState.title = options.title != null ? options.title : '加载中...'
  loadingState.logo = options.logo != null ? options.logo : ''
  loadingState.styleType = options.styleType != null ? options.styleType : 'tea'
  loadingState.logoSpin = options.logoSpin !== false
  loadingState.blur = options.blur !== false
}

export function hideLoading() {
  loadingState.visible = false
}
