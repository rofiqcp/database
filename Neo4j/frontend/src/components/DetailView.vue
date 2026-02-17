<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Item Details</h2>

    <div v-if="!item" class="text-center py-8 text-gray-600 dark:text-gray-400">
      No item selected
    </div>

    <div v-else class="space-y-6">
      <!-- Basic Information -->
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Name</p>
            <p class="text-lg font-medium text-gray-900 dark:text-white">{{ item.name }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">ID</p>
            <p class="text-sm font-mono text-gray-700 dark:text-gray-300">{{ item.id }}</p>
          </div>
          <div class="md:col-span-2">
            <p class="text-sm text-gray-600 dark:text-gray-400">Description</p>
            <p class="text-gray-900 dark:text-white">{{ item.description || 'No description' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Price</p>
            <p class="text-lg font-medium text-gray-900 dark:text-white">${{ item.price?.toFixed(2) || '0.00' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Stock</p>
            <p class="text-lg font-medium text-gray-900 dark:text-white">{{ item.stock || 0 }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Created</p>
            <p class="text-sm text-gray-700 dark:text-gray-300">{{ formatDate(item.createdAt) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Updated</p>
            <p class="text-sm text-gray-700 dark:text-gray-300">{{ formatDate(item.updatedAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Category -->
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Category</h3>
        <div v-if="item.category" class="flex items-center gap-2">
          <span class="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-lg">
            {{ item.category.name }}
          </span>
        </div>
        <p v-else class="text-gray-600 dark:text-gray-400">No category assigned</p>
      </div>

      <!-- Tags -->
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Tags</h3>
          <button
            @click="showAddTag = !showAddTag"
            class="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            {{ showAddTag ? 'Cancel' : 'Add Tag' }}
          </button>
        </div>

        <!-- Add Tag Form -->
        <div v-if="showAddTag" class="mb-4 flex gap-2">
          <input
            v-model="newTagName"
            type="text"
            placeholder="Enter tag name"
            class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            @keyup.enter="handleAddTag"
          />
          <button
            @click="handleAddTag"
            :disabled="loading"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            Add
          </button>
        </div>

        <!-- Tags List -->
        <div v-if="currentItem?.tags?.length" class="flex flex-wrap gap-2">
          <span
            v-for="tag in currentItem.tags"
            :key="tag.id"
            class="px-3 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg flex items-center gap-2"
          >
            {{ tag.name }}
            <button
              @click="handleRemoveTag(tag.id)"
              :disabled="loading"
              class="hover:text-red-600 disabled:opacity-50"
            >
              ✕
            </button>
          </span>
        </div>
        <p v-else class="text-gray-600 dark:text-gray-400">No tags assigned</p>
      </div>

      <!-- Related Items -->
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Related Items</h3>
          <button
            @click="loadRelatedItems"
            :disabled="loading"
            class="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm disabled:bg-gray-400"
          >
            {{ loading ? 'Loading...' : 'Find Related' }}
          </button>
        </div>

        <div v-if="relatedItems.length > 0" class="space-y-2">
          <div
            v-for="relatedItem in relatedItems"
            :key="relatedItem.id"
            class="p-3 bg-white dark:bg-gray-800 rounded-lg flex justify-between items-center"
          >
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ relatedItem.name }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Score: {{ relatedItem.relationScore }} - {{ relatedItem.relationReasons?.join(', ') }}
              </p>
            </div>
            <button
              @click="$emit('edit', relatedItem)"
              class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              View
            </button>
          </div>
        </div>
        <p v-else class="text-gray-600 dark:text-gray-400">No related items found</p>
      </div>

      <!-- Actions -->
      <div class="flex gap-4">
        <button
          @click="$emit('edit', item)"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Edit Item
        </button>
      </div>
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

const emit = defineEmits(['edit'])
const store = useDataStore()

const showAddTag = ref(false)
const newTagName = ref('')

const loading = computed(() => store.loading)
const currentItem = computed(() => store.currentItem)
const relatedItems = computed(() => store.relatedItems)

// Load full item details when item prop changes
watch(() => props.item, async (newItem) => {
  if (newItem?.id) {
    await store.fetchItem(newItem.id)
  }
}, { immediate: true })

const handleAddTag = async () => {
  if (!newTagName.value.trim() || !props.item?.id) return
  
  try {
    await store.addTagToItem(props.item.id, { tagName: newTagName.value.trim() })
    newTagName.value = ''
    showAddTag.value = false
  } catch (error) {
    console.error('Error adding tag:', error)
  }
}

const handleRemoveTag = async (tagId) => {
  if (!props.item?.id) return
  
  if (confirm('Are you sure you want to remove this tag?')) {
    try {
      await store.removeTagFromItem(props.item.id, tagId)
    } catch (error) {
      console.error('Error removing tag:', error)
    }
  }
}

const loadRelatedItems = async () => {
  if (!props.item?.id) return
  await store.fetchRelatedItems(props.item.id)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}
</script>
