<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Item</h2>

    <div v-if="!item" class="text-center py-8 text-gray-600 dark:text-gray-400">
      No item selected for editing
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Name *
        </label>
        <input
          v-model="formData.name"
          type="text"
          required
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter item name"
        />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          v-model="formData.description"
          rows="4"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter item description"
        ></textarea>
      </div>

      <!-- Category -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <div class="flex gap-2">
          <select
            v-model="selectedCategory"
            class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select or create new</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.name">
              {{ cat.name }}
            </option>
          </select>
          <input
            v-model="newCategoryName"
            type="text"
            placeholder="Or enter new category"
            class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Price -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Price
        </label>
        <input
          v-model.number="formData.price"
          type="number"
          step="0.01"
          min="0"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0.00"
        />
      </div>

      <!-- Stock -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Stock
        </label>
        <input
          v-model.number="formData.stock"
          type="number"
          min="0"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0"
        />
      </div>

      <!-- Submit Buttons -->
      <div class="flex gap-4">
        <button
          type="submit"
          :disabled="loading"
          class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
        >
          {{ loading ? 'Updating...' : 'Update Item' }}
        </button>
        <button
          type="button"
          @click="$emit('updated')"
          class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Cancel
        </button>
      </div>
    </form>
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

const formData = ref({
  name: '',
  description: '',
  price: 0,
  stock: 0
})

const selectedCategory = ref('')
const newCategoryName = ref('')

const loading = computed(() => store.loading)
const categories = computed(() => store.categories)

// Watch for item changes and populate form
watch(() => props.item, (newItem) => {
  if (newItem) {
    formData.value = {
      name: newItem.name || '',
      description: newItem.description || '',
      price: newItem.price || 0,
      stock: newItem.stock || 0
    }
    selectedCategory.value = newItem.category?.name || ''
    newCategoryName.value = ''
  }
}, { immediate: true })

const handleSubmit = async () => {
  if (!props.item) return
  
  try {
    const categoryName = newCategoryName.value.trim() || selectedCategory.value
    const itemData = {
      ...formData.value,
      category: categoryName ? { name: categoryName } : null
    }
    
    await store.updateItem(props.item.id, itemData)
    emit('updated')
  } catch (error) {
    console.error('Error updating item:', error)
  }
}
</script>
