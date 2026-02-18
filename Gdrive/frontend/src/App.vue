<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Auth screen -->
    <AuthLogin v-if="!authStore.authenticated && !authStore.loading" />

    <!-- Loading auth -->
    <div v-else-if="authStore.loading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <svg class="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p class="text-gray-500">Checking authentication…</p>
      </div>
    </div>

    <!-- Main app -->
    <div v-else>
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex gap-0.5 text-lg font-bold">
              <span class="text-blue-600">G</span>
              <span class="text-red-500">D</span>
              <span class="text-yellow-500">r</span>
              <span class="text-blue-600">i</span>
              <span class="text-green-500">v</span>
              <span class="text-red-500">e</span>
            </div>
            <span class="text-gray-300">|</span>
            <span class="text-sm text-gray-600 font-medium">Manager</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="hidden sm:flex items-center gap-1.5 text-sm text-green-600">
              <span class="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
              Connected to Google
            </span>
            <button @click="handleLogout" class="btn-secondary text-sm py-1.5">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <!-- Auth success banner -->
      <div v-if="showSuccessBanner" class="bg-green-600 text-white text-sm text-center py-2">
        ✓ Successfully connected to Google! Your session is saved permanently.
        <button @click="showSuccessBanner = false" class="ml-3 opacity-70 hover:opacity-100">✕</button>
      </div>

      <!-- Tab navigation -->
      <div class="max-w-6xl mx-auto px-4 pt-5">
        <div class="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['tab-btn', activeTab === tab.id ? 'tab-btn-active' : 'tab-btn-inactive']"
          >
            {{ tab.icon }} {{ tab.label }}
          </button>
        </div>

        <!-- Tab content -->
        <div class="card min-h-[400px]">
          <h2 class="text-lg font-bold text-gray-800 mb-5">{{ currentTab.label }}</h2>

          <FileBrowser v-if="activeTab === 'files'" />
          <FileUpload v-else-if="activeTab === 'upload'" />
          <SheetsViewer v-else-if="activeTab === 'sheets'" />
          <DocsViewer v-else-if="activeTab === 'docs'" />
        </div>
      </div>

      <!-- Footer -->
      <footer class="max-w-6xl mx-auto px-4 py-6 mt-8 border-t border-gray-200 text-center text-xs text-gray-400">
        Google Drive Manager — Spring Boot + Vue 3 | Tokens stored locally and never shared
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from './stores/authStore.js'
import AuthLogin from './components/AuthLogin.vue'
import FileBrowser from './components/FileBrowser.vue'
import FileUpload from './components/FileUpload.vue'
import SheetsViewer from './components/SheetsViewer.vue'
import DocsViewer from './components/DocsViewer.vue'

const authStore = useAuthStore()
const activeTab = ref('files')
const showSuccessBanner = ref(false)

const tabs = [
  { id: 'files', label: 'Files', icon: '📁' },
  { id: 'upload', label: 'Upload', icon: '⬆️' },
  { id: 'sheets', label: 'Sheets', icon: '📊' },
  { id: 'docs', label: 'Docs', icon: '📝' }
]

const currentTab = computed(() => tabs.find(t => t.id === activeTab.value))

onMounted(async () => {
  // Handle OAuth callback result (?auth=success or ?auth=error)
  const params = new URLSearchParams(window.location.search)
  const authResult = params.get('auth')

  if (authResult === 'success') {
    showSuccessBanner.value = true
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname)
  }

  await authStore.checkStatus()
})

async function handleLogout() {
  await authStore.logout()
}
</script>
