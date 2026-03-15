import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMemberStore = defineStore(
	'member',
	() => {
		const userId = ref(null)
		const openid = ref('')
		const nickname = ref('')
		const avatar = ref('')

		const isLoggedIn = computed(() => !!userId.value)

		function setUserInfo(data) {
			userId.value = data.userId || data.id || null
			openid.value = data.openid || ''
			nickname.value = data.nickname || ''
			avatar.value = data.avatar || ''
		}

		function clearUserInfo() {
			userId.value = null
			openid.value = ''
			nickname.value = ''
			avatar.value = ''
		}

		return { userId, openid, nickname, avatar, isLoggedIn, setUserInfo, clearUserInfo }
	},
	{
		persist: { key: 'member' },
	},
)
