<template>
  <div :class="{ 'dark': darkMode }">
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <!-- Header -->
      <header class="bg-white dark:bg-gray-800 shadow-md">
        <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                MariaDB Learning Module
              </h1>
              <p class="text-sm text-gray-600 dark:text-gray-400">Full-stack CRUD application</p>
            </div>
            <button
              @click="toggleDarkMode"
              class="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              {{ darkMode ? '☀️' : '🌙' }}
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <!-- Error Alert -->
        <div v-if="error" class="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg">
          {{ error }}
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
          MariaDB Learning Module - Built with Vue 3, Vite, and TailwindCSS
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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

onMounted(() => {
  store.fetchItems()
})
</script>
