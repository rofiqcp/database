<template>
  <div>
    <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Edit Item</h2>
    
    <div v-if="!item" class="text-center py-8 text-gray-600 dark:text-gray-400">
      No item selected. Please select an item from the list.
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-4">
      <div class="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg mb-4">
        <p class="text-sm text-blue-800 dark:text-blue-200">
          <strong>Document ID:</strong> {{ item.id }}
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Name <span class="text-red-500">*</span>
        </label>
        <input
          v-model="formData.name"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          placeholder="Enter item name"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          v-model="formData.description"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          placeholder="Enter item description"
        ></textarea>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            v-model="formData.category"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select category</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Books">Books</option>
            <option value="Home">Home</option>
            <option value="Sports">Sports</option>
            <option value="Toys">Toys</option>
            <option value="Food">Food</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Price
          </label>
          <input
            v-model.number="formData.price"
            type="number"
            step="0.01"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Stock
          </label>
          <input
            v-model.number="formData.stock"
            type="number"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            User ID
          </label>
          <input
            v-model="formData.userId"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            placeholder="anonymous"
          />
        </div>
      </div>

      <div class="flex items-center">
        <input
          v-model="formData.featured"
          type="checkbox"
          id="featured-edit"
          class="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
        />
        <label for="featured-edit" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Featured Item ⭐
        </label>
      </div>

      <div class="flex gap-2">
        <button
          type="submit"
          :disabled="loading"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {{ loading ? 'Updating...' : 'Update Item' }}
        </button>
        <button
          type="button"
          @click="$emit('updated')"
          class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
        >
          Cancel
        </button>
      </div>
    </form>

    <div v-if="successMessage" class="mt-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 rounded-lg">
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDataStore } from '../stores/dataStore'

const props = defineProps({
  item: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['updated'])

const store = useDataStore()
const loading = computed(() => store.loading)

const formData = ref({
  name: '',
  description: '',
  category: '',
  price: 0,
  stock: 0,
  featured: false,
  userId: ''
})

const successMessage = ref('')

// Watch for item changes
watch(() => props.item, (newItem) => {
  if (newItem) {
    formData.value = {
      name: newItem.name || '',
      description: newItem.description || '',
      category: newItem.category || '',
      price: newItem.price || 0,
      stock: newItem.stock || 0,
      featured: newItem.featured || false,
      userId: newItem.userId || ''
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  if (!props.item?.id) return
  
  const result = await store.updateItem(props.item.id, formData.value)
  
  if (result) {
    successMessage.value = 'Item updated successfully!'
    setTimeout(() => {
      successMessage.value = ''
      emit('updated')
    }, 1500)
  }
}
</script>
