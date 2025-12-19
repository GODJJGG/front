import { defineStore } from 'pinia'
import { ref } from 'vue'
import config from '@/config'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem(config.TOKEN_KEY) || '')
  const permissions = ref([])

  const setUser = (userData) => {
    user.value = userData
    permissions.value = userData.permissions || []
  }

  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem(config.TOKEN_KEY, newToken)
  }

  const logout = () => {
    user.value = null
    token.value = ''
    permissions.value = []
    localStorage.removeItem(config.TOKEN_KEY)
  }

  const hasPermission = (permission) => {
    return permissions.value.includes(permission)
  }

  return {
    user,
    token,
    permissions,
    setUser,
    setToken,
    logout,
    hasPermission
  }
})