<script>
	import { loadingState } from '@/store/loading'
	import { showLoading, hideLoading } from '@/store/loading'

	export default {
		data() {
			return {
				loadingState
			}
		},
		onLaunch: function() {
			// 挂到 getApp() 上，页面里可用 getApp().$showLoading() / getApp().$hideLoading()
			const app = this
			app.$showLoading = function(options) {
				showLoading(options)
			}
			app.$hideLoading = function() {
				hideLoading()
			}
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<template>
	<view>
		<loading-mask
			:visible="loadingState.visible"
			:title="loadingState.title"
			:logo="loadingState.logo"
			:style-type="loadingState.styleType"
			:logo-spin="loadingState.logoSpin"
			:blur="loadingState.blur"
		/>
	</view>
</template>

<style>
	/*每个页面公共css */
</style>
