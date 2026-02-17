<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Items List</h2>
      <button
        @click="refreshItems"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        :disabled="loading"
      >
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-600 dark:text-gray-400">
      Loading items...
    </div>

    <div v-else-if="items.length === 0" class="text-center py-8 text-gray-600 dark:text-gray-400">
      No items found. Create your first item!
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="p-3 font-semibold text-gray-900 dark:text-white">Name</th>
            <th class="p-3 font-semibold text-gray-900 dark:text-white">Description</th>
            <th class="p-3 font-semibold text-gray-900 dark:text-white">Category</th>
            <th class="p-3 font-semibold text-gray-900 dark:text-white">Tags</th>
            <th class="p-3 font-semibold text-gray-900 dark:text-white">Price</th>
            <th class="p-3 font-semibold text-gray-900 dark:text-white">Stock</th>
            <th class="p-3 font-semibold text-gray-900 dark:text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="item.id"
            class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <td class="p-3 text-gray-900 dark:text-white font-medium">{{ item.name }}</td>
            <td class="p-3 text-gray-600 dark:text-gray-400">
              {{ truncate(item.description, 50) }}
            </td>
            <td class="p-3">
              <span
                v-if="item.category"
                class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
              >
                {{ item.category.name }}
              </span>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="p-3">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="tag in item.tags"
                  :key="tag.id"
                  class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs"
                >
                  {{ tag.name }}
                </span>
              </div>
            </td>
            <td class="p-3 text-gray-900 dark:text-white">${{ item.price?.toFixed(2) || '0.00' }}</td>
            <td class="p-3 text-gray-900 dark:text-white">{{ item.stock || 0 }}</td>
            <td class="p-3">
              <div class="flex gap-2">
                <button
                  @click="$emit('view', item)"
                  class="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                >
                  View
                </button>
                <button
                  @click="$emit('edit', item)"
                  class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Edit
                </button>
                <button
                  @click="handleDelete(item.id)"
                  class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="items.length > 0" class="mt-4 text-sm text-gray-600 dark:text-gray-400">
      Total: {{ items.length }} items
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDataStore } from '../stores/dataStore'

const store = useDataStore()

const items = computed(() => store.items)
const loading = computed(() => store.loading)

const refreshItems = async () => {
  await store.fetchItems()
}

const handleDelete = async (id) => {
  if (confirm('Are you sure you want to delete this item?')) {
    try {
      await store.deleteItem(id)
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }
}

const truncate = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

defineEmits(['edit', 'view'])
</script>
