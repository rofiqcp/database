import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api.js'

export const useAuthStore = defineStore('auth', () => {
  const authenticated = ref(false)
  const loading = ref(false)
  const error = ref(null)

  async function checkStatus() {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get('/auth/status')
      authenticated.value = data.authenticated
    } catch (e) {
      authenticated.value = false
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function getAuthUrl() {
    const { data } = await api.get('/auth/url')
    return data.authUrl
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } finally {
      authenticated.value = false
    }
  }

  return { authenticated, loading, error, checkStatus, getAuthUrl, logout }
})
