<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Item</h2>

    <form @submit.prevent="handleSubmit" class="space-y-6">
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
              {{ cat.name }} ({{ cat.itemCount }} items)
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

      <!-- Tags -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags
        </label>
        <div class="mb-2">
          <div class="flex gap-2 mb-2">
            <input
              v-model="newTagName"
              type="text"
              placeholder="Enter tag name"
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @keyup.enter="addTag"
            />
            <button
              type="button"
              @click="addTag"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add Tag
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tag in availableTags"
              :key="tag.id"
              type="button"
              @click="toggleTag(tag)"
              :class="[
                'px-3 py-1 rounded-lg text-sm transition',
                selectedTags.some(t => t.id === tag.id)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              ]"
            >
              {{ tag.name }} ({{ tag.itemCount }})
            </button>
          </div>
        </div>
        <div v-if="selectedTags.length > 0" class="flex flex-wrap gap-2 mt-2">
          <span
            v-for="tag in selectedTags"
            :key="tag.id || tag.name"
            class="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg flex items-center gap-2"
          >
            {{ tag.name }}
            <button type="button" @click="removeTag(tag)" class="hover:text-red-600">✕</button>
          </span>
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
          {{ loading ? 'Creating...' : 'Create Item' }}
        </button>
        <button
          type="button"
          @click="resetForm"
          class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Reset
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '../stores/dataStore'

const emit = defineEmits(['created'])
const store = useDataStore()

const formData = ref({
  name: '',
  description: '',
  price: 0,
  stock: 0
})

const selectedCategory = ref('')
const newCategoryName = ref('')
const selectedTags = ref([])
const newTagName = ref('')

const loading = computed(() => store.loading)
const categories = computed(() => store.categories)
const availableTags = computed(() => store.tags)

const addTag = () => {
  if (newTagName.value.trim()) {
    const tag = { name: newTagName.value.trim() }
    if (!selectedTags.value.some(t => t.name === tag.name)) {
      selectedTags.value.push(tag)
    }
    newTagName.value = ''
  }
}

const toggleTag = (tag) => {
  const index = selectedTags.value.findIndex(t => t.id === tag.id)
  if (index !== -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

const removeTag = (tag) => {
  selectedTags.value = selectedTags.value.filter(t => t !== tag)
}

const handleSubmit = async () => {
  try {
    const categoryName = newCategoryName.value.trim() || selectedCategory.value
    const itemData = {
      ...formData.value,
      category: categoryName ? { name: categoryName } : null,
      tags: selectedTags.value
    }
    
    await store.createItem(itemData)
    resetForm()
    emit('created')
  } catch (error) {
    console.error('Error creating item:', error)
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    price: 0,
    stock: 0
  }
  selectedCategory.value = ''
  newCategoryName.value = ''
  selectedTags.value = []
  newTagName.value = ''
}
</script>
