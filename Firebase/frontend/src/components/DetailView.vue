<template>
  <div>
    <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Item Details</h2>
    
    <div v-if="!item" class="text-center py-8 text-gray-600 dark:text-gray-400">
      No item selected. Please select an item from the list.
    </div>

    <div v-else class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Document ID</p>
          <p class="text-lg font-mono text-gray-900 dark:text-gray-100">{{ item.id }}</p>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Name</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ item.name }}</p>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Category</p>
          <p class="text-lg text-gray-900 dark:text-gray-100">
            <span v-if="item.category" class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
              {{ item.category }}
            </span>
            <span v-else class="text-gray-400">Not specified</span>
          </p>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Price</p>
          <p class="text-lg font-semibold text-green-600 dark:text-green-400">
            ${{ item.price?.toFixed(2) || '0.00' }}
          </p>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Stock</p>
          <p class="text-lg text-gray-900 dark:text-gray-100">{{ item.stock || 0 }} units</p>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Featured</p>
          <p class="text-lg">
            <span v-if="item.featured" class="text-yellow-500">⭐ Yes</span>
            <span v-else class="text-gray-400">No</span>
          </p>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">User ID</p>
          <p class="text-lg text-gray-900 dark:text-gray-100">{{ item.userId || 'anonymous' }}</p>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Created At</p>
          <p class="text-lg text-gray-900 dark:text-gray-100">{{ formatDate(item.createdAt) }}</p>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg md:col-span-2">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Description</p>
          <p class="text-lg text-gray-900 dark:text-gray-100">
            {{ item.description || 'No description provided' }}
          </p>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Updated</p>
          <p class="text-lg text-gray-900 dark:text-gray-100">{{ formatDate(item.updatedAt) }}</p>
        </div>
      </div>

      <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">JSON Data</h3>
        <pre class="p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-sm">{{ JSON.stringify(item, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    default: null
  }
})

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  
  // Handle Firestore Timestamp
  let date
  if (timestamp && timestamp.toDate) {
    date = timestamp.toDate()
  } else if (timestamp && timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000)
  } else if (timestamp) {
    date = new Date(timestamp)
  } else {
    return 'N/A'
  }
  
  return date.toLocaleString()
}
</script>
