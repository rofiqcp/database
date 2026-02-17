<template>
  <div :class="{ 'dark': darkMode }">
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <!-- Header -->
      <header class="bg-white dark:bg-gray-800 shadow-md">
        <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                🔥 Firebase Learning Module
              </h1>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Real-time Firestore CRUD with WebSocket sync
              </p>
            </div>
            <div class="flex items-center gap-3">
              <!-- Real-time indicator -->
              <div class="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700">
                <div :class="['w-2 h-2 rounded-full', wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500']"></div>
                <span class="text-xs text-gray-700 dark:text-gray-300">
                  {{ wsConnected ? 'Live' : 'Offline' }}
                </span>
              </div>
              <!-- Dark mode toggle -->
              <button
                @click="toggleDarkMode"
                class="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                {{ darkMode ? '☀️' : '🌙' }}
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <!-- Error Alert -->
        <div v-if="error" class="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg flex justify-between items-center">
          <span>{{ error }}</span>
          <button @click="store.clearError()" class="text-red-700 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100">
            ✕
          </button>
        </div>

        <!-- WebSocket Error Alert -->
        <div v-if="wsError" class="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-200 rounded-lg">
          ⚠️ {{ wsError }} - Real-time updates may be unavailable
        </div>

        <!-- Last Update Indicator -->
        <div v-if="lastUpdate" class="mb-4 text-sm text-gray-600 dark:text-gray-400 text-right">
          Last update: {{ formatTime(lastUpdate) }}
        </div>

        <!-- Tabs -->
        <div class="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            v-for="tab in tabs"
            :key="tab"
            @click="activeTab = tab"
            :class="[
              'px-4 py-2 font-medium transition',
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            ]"
          >
            {{ tab }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <DataTable v-if="activeTab === 'List'" @edit="handleEdit" @view="handleView" />
          <CreateForm v-if="activeTab === 'Create'" @created="handleCreated" />
          <EditForm v-if="activeTab === 'Edit'" :item="selectedItem" @updated="handleUpdated" />
          <DetailView v-if="activeTab === 'Detail'" :item="selectedItem" />
          <SearchFilter v-if="activeTab === 'Search'" />
        </div>
      </main>

      <!-- Footer -->
      <footer class="mt-12 py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
          Firebase Learning Module - Built with Vue 3, Vite, Firebase, and TailwindCSS
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDataStore } from './stores/dataStore'
import DataTable from './components/DataTable.vue'
import CreateForm from './components/CreateForm.vue'
import EditForm from './components/EditForm.vue'
import DetailView from './components/DetailView.vue'
import SearchFilter from './components/SearchFilter.vue'

const store = useDataStore()
const activeTab = ref('List')
const selectedItem = ref(null)
const tabs = ['List', 'Create', 'Edit', 'Detail', 'Search']

const darkMode = computed(() => store.darkMode)
const error = computed(() => store.error)
const wsConnected = computed(() => store.wsConnected)
const wsError = computed(() => store.wsError)
const lastUpdate = computed(() => store.lastUpdate)

const toggleDarkMode = () => {
  store.toggleDarkMode()
}

const handleEdit = (item) => {
  selectedItem.value = item
  activeTab.value = 'Edit'
}

const handleView = (item) => {
  selectedItem.value = item
  activeTab.value = 'Detail'
}

const handleCreated = () => {
  activeTab.value = 'List'
}

const handleUpdated = () => {
  activeTab.value = 'List'
  selectedItem.value = null
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}

onMounted(() => {
  store.fetchItems()
  store.connectWebSocket()
})

onUnmounted(() => {
  store.disconnectWebSocket()
})
</script>
