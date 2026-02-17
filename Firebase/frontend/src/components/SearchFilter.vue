<template>
  <div>
    <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Search & Filter</h2>
    
    <form @submit.prevent="handleSearch" class="space-y-4 mb-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Search Query
        </label>
        <input
          v-model="searchData.query"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          placeholder="Search by name or description..."
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            v-model="searchData.category"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Min Price
          </label>
          <input
            v-model.number="searchData.minPrice"
            type="number"
            step="0.01"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Price
          </label>
          <input
            v-model.number="searchData.maxPrice"
            type="number"
            step="0.01"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            placeholder="999.99"
          />
        </div>
      </div>

      <div class="flex items-center">
        <input
          v-model="searchData.featured"
          type="checkbox"
          id="featured-filter"
          class="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
        />
        <label for="featured-filter" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Featured items only ⭐
        </label>
      </div>

      <div class="flex gap-2">
        <button
          type="submit"
          :disabled="loading"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {{ loading ? 'Searching...' : 'Search' }}
        </button>
        <button
          type="button"
          @click="resetSearch"
          class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
        >
          Reset
        </button>
        <button
          type="button"
          @click="showAll"
          class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
        >
          Show All
        </button>
      </div>
    </form>

    <!-- Results -->
    <div>
      <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
        Results ({{ items.length }})
      </h3>

      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Searching...</p>
      </div>

      <div v-else-if="items.length === 0" class="text-center py-8 text-gray-600 dark:text-gray-400">
        No items found matching your criteria.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="item in items"
          :key="item.id"
          class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow bg-white dark:bg-gray-700"
        >
          <div class="flex justify-between items-start mb-2">
            <h4 class="font-semibold text-gray-900 dark:text-white">{{ item.name }}</h4>
            <span v-if="item.featured" class="text-yellow-500">⭐</span>
          </div>
          
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
            {{ item.description || 'No description' }}
          </p>
          
          <div class="flex justify-between items-center">
            <span class="text-lg font-semibold text-green-600 dark:text-green-400">
              ${{ item.price?.toFixed(2) || '0.00' }}
            </span>
            <span v-if="item.category" class="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
              {{ item.category }}
            </span>
          </div>
          
          <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Stock: {{ item.stock || 0 }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '../stores/dataStore'

const store = useDataStore()
const items = computed(() => store.items)
const loading = computed(() => store.loading)
const categories = computed(() => store.categories)

const searchData = ref({
  query: '',
  category: '',
  minPrice: undefined,
  maxPrice: undefined,
  featured: false
})

const handleSearch = async () => {
  const filters = {}
  
  if (searchData.value.query) filters.query = searchData.value.query
  if (searchData.value.category) filters.category = searchData.value.category
  if (searchData.value.minPrice !== undefined && searchData.value.minPrice !== '') {
    filters.minPrice = searchData.value.minPrice
  }
  if (searchData.value.maxPrice !== undefined && searchData.value.maxPrice !== '') {
    filters.maxPrice = searchData.value.maxPrice
  }
  if (searchData.value.featured) filters.featured = true
  
  await store.searchItems(filters)
}

const resetSearch = () => {
  searchData.value = {
    query: '',
    category: '',
    minPrice: undefined,
    maxPrice: undefined,
    featured: false
  }
}

const showAll = async () => {
  resetSearch()
  await store.fetchItems()
}
</script>
