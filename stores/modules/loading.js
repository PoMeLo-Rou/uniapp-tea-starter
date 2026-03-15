import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
	const visible = ref(false)
	const title = ref('加载中...')
	const logo = ref('')
	const styleType = ref('tea')
	const logoSpin = ref(true)
	const blur = ref(true)

	function showLoading(options = {}) {
		visible.value = true
		title.value = options.title ?? '加载中...'
		logo.value = options.logo ?? ''
		styleType.value = options.styleType ?? 'tea'
		logoSpin.value = options.logoSpin !== false
		blur.value = options.blur !== false
	}

	function hideLoading() {
		visible.value = false
	}

	return { visible, title, logo, styleType, logoSpin, blur, showLoading, hideLoading }
})
