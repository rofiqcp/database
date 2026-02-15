<template>
  <div>
    <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Search & Filter</h2>
    
    <form @submit.prevent="handleSearch" class="space-y-4 mb-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Query</label>
        <input
          v-model="filters.query"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Search by name or description"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
        <input
          v-model="filters.category"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Filter by category"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Price</label>
          <input
            v-model.number="filters.minPrice"
            type="number"
            step="0.01"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="0.00"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Price</label>
          <input
            v-model.number="filters.maxPrice"
            type="number"
            step="0.01"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="999.99"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <button
          type="submit"
          :disabled="loading"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {{ loading ? 'Searching...' : 'Search' }}
        </button>
        <button
          type="button"
          @click="clearFilters"
          class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
        >
          Clear
        </button>
      </div>
    </form>

    <!-- Results -->
    <div v-if="items.length > 0" class="mt-6">
      <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Results ({{ items.length }})</h3>
      <div class="grid gap-4">
        <div
          v-for="item in items"
          :key="item._id"
          class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition"
        >
          <div class="flex justify-between items-start">
            <div>
              <h4 class="font-semibold text-gray-900 dark:text-white">{{ item.name }}</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ item.category || 'Uncategorized' }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">{{ item.description }}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold text-blue-600 dark:text-blue-400">${{ item.price?.toFixed(2) }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Qty: {{ item.quantity }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="searched" class="mt-6 text-center py-8 text-gray-600 dark:text-gray-400">
      No results found
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '../stores/dataStore'

const store = useDataStore()
const loading = computed(() => store.loading)
const items = computed(() => store.items)

const filters = ref({
  query: '',
  category: '',
  minPrice: undefined,
  maxPrice: undefined
})

const searched = ref(false)

const handleSearch = async () => {
  searched.value = true
  await store.searchItems(filters.value)
}

const clearFilters = () => {
  filters.value = {
    query: '',
    category: '',
    minPrice: undefined,
    maxPrice: undefined
  }
  searched.value = false
  store.fetchItems()
}
</script>
