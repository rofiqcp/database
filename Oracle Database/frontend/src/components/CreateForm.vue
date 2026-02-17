<template>
  <div>
    <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Create New Item</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter item name"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea
          v-model="form.description"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter description"
        ></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
        <input
          v-model="form.category"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter category"
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
            placeholder="0.00"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
          <input
            v-model.number="form.quantity"
            type="number"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="0"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <button
          type="submit"
          :disabled="loading"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Creating...' : 'Create Item' }}
        </button>
        <button
          type="button"
          @click="resetForm"
          class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
        >
          Reset
        </button>
      </div>
    </form>

    <div v-if="successMessage" class="mt-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 rounded-lg">
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '../stores/dataStore'

const store = useDataStore()
const loading = computed(() => store.loading)

const emit = defineEmits(['created'])

const form = ref({
  name: '',
  description: '',
  category: '',
  price: 0,
  quantity: 0
})

const successMessage = ref('')

const handleSubmit = async () => {
  try {
    await store.createItem(form.value)
    successMessage.value = 'Item created successfully!'
    resetForm()
    setTimeout(() => {
      successMessage.value = ''
      emit('created')
    }, 1500)
  } catch (error) {
    console.error('Failed to create item:', error)
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    description: '',
    category: '',
    price: 0,
    quantity: 0
  }
}
</script>
