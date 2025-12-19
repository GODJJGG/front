import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const permissions = ref([])

  const setUser = (userData) => {
    user.value = userData
    permissions.value = userData.permissions || []
  }

  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const logout = () => {
    user.value = null
    token.value = ''
    permissions.value = []
    localStorage.removeItem('token')
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