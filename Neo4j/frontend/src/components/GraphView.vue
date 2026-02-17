<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Graph Visualization</h2>

    <!-- Path Finder -->
    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Find Shortest Path</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            From Item
          </label>
          <select
            v-model="fromItemId"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select item...</option>
            <option v-for="item in items" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            To Item
          </label>
          <select
            v-model="toItemId"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select item...</option>
            <option v-for="item in items" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>
        </div>
      </div>

      <button
        @click="handleFindPath"
        :disabled="!fromItemId || !toItemId || loading"
        class="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
      >
        {{ loading ? 'Finding Path...' : 'Find Path' }}
      </button>

      <!-- Path Result -->
      <div v-if="graphPath" class="mt-6">
        <div v-if="graphPath.found" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 class="font-semibold text-green-900 dark:text-green-200 mb-2">
            ✓ Path Found! Length: {{ graphPath.pathLength }}
          </h4>
          
          <!-- Nodes in Path -->
          <div class="mb-4">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nodes:</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(node, index) in graphPath.nodes"
                :key="node.id"
                class="px-3 py-2 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded-lg text-sm"
              >
                {{ index + 1 }}. {{ node.name }}
              </span>
            </div>
          </div>

          <!-- Relationships -->
          <div>
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Relationships:</p>
            <div class="space-y-2">
              <div
                v-for="(rel, index) in graphPath.relationships"
                :key="index"
                class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <span class="font-mono px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">{{ rel.type }}</span>
                <span class="text-gray-500">→</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p class="text-yellow-900 dark:text-yellow-200">{{ graphPath.message }}</p>
        </div>
      </div>
    </div>

    <!-- Graph Structure Overview -->
    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Graph Structure</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-semibold text-gray-900 dark:text-white">Items</h4>
            <span class="text-2xl">📦</span>
          </div>
          <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ items.length }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Total items in graph</p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-semibold text-gray-900 dark:text-white">Categories</h4>
            <span class="text-2xl">📁</span>
          </div>
          <p class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ categories.length }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Unique categories</p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-semibold text-gray-900 dark:text-white">Tags</h4>
            <span class="text-2xl">🏷️</span>
          </div>
          <p class="text-3xl font-bold text-green-600 dark:text-green-400">{{ tags.length }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Unique tags</p>
        </div>
      </div>
    </div>

    <!-- Graph Visualization (Text-based) -->
    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Relationship Visualization</h3>
      
      <div class="space-y-4">
        <div
          v-for="item in itemsWithRelations"
          :key="item.id"
          class="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500"
        >
          <h4 class="font-semibold text-gray-900 dark:text-white mb-2">{{ item.name }}</h4>
          
          <div class="ml-4 space-y-2">
            <!-- Category Relationship -->
            <div v-if="item.category" class="flex items-start gap-2">
              <span class="text-gray-500 dark:text-gray-400 text-sm font-mono">BELONGS_TO →</span>
              <span class="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-sm">
                {{ item.category.name }}
              </span>
            </div>

            <!-- Tag Relationships -->
            <div v-if="item.tags?.length" class="flex items-start gap-2">
              <span class="text-gray-500 dark:text-gray-400 text-sm font-mono">HAS_TAG →</span>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="tag in item.tags"
                  :key="tag.id"
                  class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs"
                >
                  {{ tag.name }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="itemsWithRelations.length === 0" class="text-center py-8 text-gray-600 dark:text-gray-400">
          No items with relationships found
        </div>
      </div>
    </div>

    <!-- Graph Info -->
    <div class="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <h4 class="font-semibold text-blue-900 dark:text-blue-200 mb-2">ℹ️ About Graph Database</h4>
      <ul class="text-sm text-blue-800 dark:text-blue-300 space-y-1">
        <li>• <strong>Nodes:</strong> Item, Category, Tag</li>
        <li>• <strong>Relationships:</strong> BELONGS_TO (Item → Category), HAS_TAG (Item → Tag)</li>
        <li>• <strong>Graph Traversal:</strong> Find connections between items through shared tags and categories</li>
        <li>• <strong>Path Finding:</strong> Discover shortest paths between any two items in the graph</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '../stores/dataStore'

const store = useDataStore()

const fromItemId = ref('')
const toItemId = ref('')

const loading = computed(() => store.loading)
const items = computed(() => store.items)
const categories = computed(() => store.categories)
const tags = computed(() => store.tags)
const graphPath = computed(() => store.graphPath)

const itemsWithRelations = computed(() => {
  return items.value.filter(item => item.category || (item.tags && item.tags.length > 0))
})

const handleFindPath = async () => {
  if (!fromItemId.value || !toItemId.value) return
  await store.findPath(fromItemId.value, toItemId.value)
}
</script>
