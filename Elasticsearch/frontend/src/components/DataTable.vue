<template>
  <div>
    <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">All Items</h2>
    
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>

    <div v-else-if="items.length === 0" class="text-center py-8 text-gray-600 dark:text-gray-400">
      No items found. Create your first item!
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Category</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Price</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Quantity</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-mono">{{ item.id?.substring(0, 8) }}...</td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{{ item.name }}</td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ item.category || '-' }}</td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">${{ item.price?.toFixed(2) || '0.00' }}</td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{{ item.quantity || 0 }}</td>
            <td class="px-6 py-4 text-sm space-x-2">
              <button @click="$emit('view', item)" class="text-blue-600 hover:text-blue-800 dark:text-blue-400">View</button>
              <button @click="$emit('edit', item)" class="text-green-600 hover:text-green-800 dark:text-green-400">Edit</button>
              <button @click="handleDelete(item.id)" class="text-red-600 hover:text-red-800 dark:text-red-400">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDataStore } from '../stores/dataStore'

const store = useDataStore()
const items = computed(() => store.items)
const loading = computed(() => store.loading)

defineEmits(['edit', 'view'])

const handleDelete = async (id) => {
  if (confirm('Are you sure you want to delete this item?')) {
    await store.deleteItem(id)
  }
}
</script>
