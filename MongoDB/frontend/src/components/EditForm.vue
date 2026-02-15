<template>
  <div>
    <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Edit Item</h2>
    
    <div v-if="!item" class="text-center py-8 text-gray-600 dark:text-gray-400">
      No item selected for editing
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea
          v-model="form.description"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        ></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
        <input
          v-model="form.category"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
          <input
            v-model.number="form.price"
            type="number"
            step="0.01"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
          <input
            v-model.number="form.quantity"
            type="number"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <button
          type="submit"
          :disabled="loading"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {{ loading ? 'Updating...' : 'Update Item' }}
        </button>
      </div>
    </form>

    <div v-if="successMessage" class="mt-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-200 rounded-lg">
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDataStore } from '../stores/dataStore'

const props = defineProps({
  item: Object
})

const emit = defineEmits(['updated'])

const store = useDataStore()
const loading = computed(() => store.loading)

const form = ref({
  name: '',
  description: '',
  category: '',
  price: 0,
  quantity: 0
})

const successMessage = ref('')

watch(() => props.item, (newItem) => {
  if (newItem) {
    form.value = { ...newItem }
  }
}, { immediate: true })

const handleSubmit = async () => {
  try {
    await store.updateItem(props.item._id, form.value)
    successMessage.value = 'Item updated successfully!'
    setTimeout(() => {
      successMessage.value = ''
      emit('updated')
    }, 1500)
  } catch (error) {
    console.error('Failed to update item:', error)
  }
}
</script>
