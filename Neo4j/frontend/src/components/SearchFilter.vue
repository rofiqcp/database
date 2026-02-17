<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Search & Filter</h2>

    <form @submit.prevent="handleSearch" class="space-y-6">
      <!-- Search Query -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Search Query
        </label>
        <input
          v-model="searchFilters.query"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Search by name or description..."
        />
      </div>

      <!-- Category Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <select
          v-model="searchFilters.category"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.name">
            {{ cat.name }} ({{ cat.itemCount }} items)
          </option>
        </select>
      </div>

      <!-- Tags Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in availableTags"
            :key="tag.id"
            type="button"
            @click="toggleTag(tag)"
            :class="[
              'px-3 py-1 rounded-lg text-sm transition',
              searchFilters.tags.includes(tag.name)
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            {{ tag.name }} ({{ tag.itemCount }})
          </button>
        </div>
      </div>

      <!-- Price Range -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Min Price
          </label>
          <input
            v-model.number="searchFilters.minPrice"
            type="number"
            step="0.01"
            min="0"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Price
          </label>
          <input
            v-model.number="searchFilters.maxPrice"
            type="number"
            step="0.01"
            min="0"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="999.99"
          />
        </div>
      </div>

      <!-- Submit Buttons -->
      <div class="flex gap-4">
        <button
          type="submit"
          :disabled="loading"
          class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
        >
          {{ loading ? 'Searching...' : 'Search' }}
        </button>
        <button
          type="button"
          @click="resetFilters"
          class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Reset
        </button>
      </div>
    </form>

    <!-- Results -->
    <div class="mt-8">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Search Results ({{ items.length }})
      </h3>

      <div v-if="items.length === 0" class="text-center py-8 text-gray-600 dark:text-gray-400">
        No items found matching your criteria
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="item in items"
          :key="item.id"
          class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-lg transition"
        >
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ item.name }}</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {{ truncate(item.description, 80) }}
          </p>
          <div class="flex justify-between items-center mb-2">
            <span class="text-lg font-bold text-gray-900 dark:text-white">${{ item.price?.toFixed(2) }}</span>
            <span class="text-sm text-gray-600 dark:text-gray-400">Stock: {{ item.stock }}</span>
          </div>
          <div v-if="item.category" class="mb-2">
            <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
              {{ item.category.name }}
            </span>
          </div>
          <div v-if="item.tags?.length" class="flex flex-wrap gap-1">
            <span
              v-for="tag in item.tags"
              :key="tag.id"
              class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs"
            >
              {{ tag.name }}
            </span>
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

const searchFilters = ref({
  query: '',
  category: '',
  tags: [],
  minPrice: null,
  maxPrice: null
})

const loading = computed(() => store.loading)
const items = computed(() => store.items)
const categories = computed(() => store.categories)
const availableTags = computed(() => store.tags)

const toggleTag = (tag) => {
  const index = searchFilters.value.tags.indexOf(tag.name)
  if (index !== -1) {
    searchFilters.value.tags.splice(index, 1)
  } else {
    searchFilters.value.tags.push(tag.name)
  }
}

const handleSearch = async () => {
  await store.searchItems(searchFilters.value)
}

const resetFilters = async () => {
  searchFilters.value = {
    query: '',
    category: '',
    tags: [],
    minPrice: null,
    maxPrice: null
  }
  await store.fetchItems()
}

const truncate = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}
</script>
