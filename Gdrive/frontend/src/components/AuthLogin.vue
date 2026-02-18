<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="card max-w-md w-full text-center">
      <!-- Google logo colours -->
      <div class="flex justify-center mb-6">
        <div class="flex gap-1 text-4xl font-bold">
          <span class="text-google-blue">G</span>
          <span class="text-google-red">o</span>
          <span class="text-google-yellow">o</span>
          <span class="text-google-blue">g</span>
          <span class="text-google-green">l</span>
          <span class="text-google-red">e</span>
        </div>
      </div>

      <h1 class="text-2xl font-bold text-gray-800 mb-2">Drive Manager</h1>
      <p class="text-gray-500 mb-8">
        Connect your Google account to manage files, spreadsheets, and documents.
      </p>

      <button
        @click="handleLogin"
        :disabled="loading"
        class="btn-primary w-full justify-center text-base py-3"
      >
        <svg v-if="!loading" class="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        {{ loading ? 'Redirecting…' : 'Sign in with Google' }}
      </button>

      <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>

      <p class="mt-6 text-xs text-gray-400">
        Your credentials are stored locally on the server and never shared.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore.js'

const authStore = useAuthStore()
const loading = ref(false)
const error = ref(null)

async function handleLogin() {
  loading.value = true
  error.value = null
  try {
    const url = await authStore.getAuthUrl()
    window.location.href = url
  } catch (e) {
    error.value = e.message
    loading.value = false
  }
}
</script>
