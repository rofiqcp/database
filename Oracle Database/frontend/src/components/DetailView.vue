<template>
  <div>
    <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Item Details</h2>
    
    <div v-if="!item" class="text-center py-8 text-gray-600 dark:text-gray-400">
      No item selected
    </div>

    <div v-else class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">ID</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ item.id }}</p>
        </div>

        <div class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Name</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ item.name }}</p>
        </div>

        <div class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Category</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ item.category || '-' }}</p>
        </div>

        <div class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Price</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">${{ item.price?.toFixed(2) || '0.00' }}</p>
        </div>

        <div class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Quantity</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ item.quantity || 0 }}</p>
        </div>

        <div class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Created At</p>
          <p class="text-sm text-gray-900 dark:text-white">{{ formatDate(item.created_at) }}</p>
        </div>
      </div>

      <div class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Description</p>
        <p class="text-gray-900 dark:text-white">{{ item.description || 'No description' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  item: Object
})

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString()
}
</script>
