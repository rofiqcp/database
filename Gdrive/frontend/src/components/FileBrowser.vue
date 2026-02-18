<template>
  <div>
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-3 mb-5">
      <input
        v-model="searchQuery"
        @keyup.enter="loadFiles"
        placeholder="Search files…"
        class="input-field max-w-xs"
      />
      <button @click="loadFiles" class="btn-primary" :disabled="store.loading">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M16.65 16.65A7 7 0 1 0 3 10a7 7 0 0 0 13.65 6.65z"/>
        </svg>
        Search
      </button>
      <button @click="loadFiles" class="btn-secondary" :disabled="store.loading">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        Refresh
      </button>
    </div>

    <!-- Error -->
    <div v-if="store.error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      {{ store.error }}
    </div>

    <!-- Loading skeleton -->
    <div v-if="store.loading" class="space-y-2">
      <div v-for="i in 5" :key="i" class="h-14 bg-gray-100 rounded-lg animate-pulse" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!store.files.length" class="text-center py-16 text-gray-400">
      <svg class="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
      </svg>
      <p class="font-medium">No files found</p>
      <p class="text-sm mt-1">Upload a file or try a different search</p>
    </div>

    <!-- File table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-500 border-b border-gray-200">
            <th class="pb-3 font-medium">Name</th>
            <th class="pb-3 font-medium hidden md:table-cell">Type</th>
            <th class="pb-3 font-medium hidden lg:table-cell">Modified</th>
            <th class="pb-3 font-medium hidden md:table-cell">Size</th>
            <th class="pb-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="file in store.files"
            :key="file.id"
            class="hover:bg-gray-50 transition-colors group"
          >
            <td class="py-3 pr-4">
              <div class="flex items-center gap-2">
                <span class="text-lg">{{ fileIcon(file.mimeType) }}</span>
                <a
                  v-if="file.webViewLink"
                  :href="file.webViewLink"
                  target="_blank"
                  class="text-blue-600 hover:underline font-medium truncate max-w-xs"
                >{{ file.name }}</a>
                <span v-else class="font-medium truncate max-w-xs">{{ file.name }}</span>
              </div>
            </td>
            <td class="py-3 pr-4 text-gray-500 hidden md:table-cell truncate max-w-[12rem]">
              {{ friendlyMime(file.mimeType) }}
            </td>
            <td class="py-3 pr-4 text-gray-500 hidden lg:table-cell whitespace-nowrap">
              {{ formatDate(file.modifiedTime) }}
            </td>
            <td class="py-3 pr-4 text-gray-500 hidden md:table-cell whitespace-nowrap">
              {{ formatSize(file.size) }}
            </td>
            <td class="py-3 text-right">
              <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  v-if="file.webContentLink"
                  :href="file.webContentLink"
                  target="_blank"
                  title="Download"
                  class="p-1.5 text-gray-500 hover:text-blue-600 rounded"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                </a>
                <button
                  @click="confirmDelete(file)"
                  title="Delete"
                  class="p-1.5 text-gray-500 hover:text-red-600 rounded"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="deletingFile" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="card max-w-sm w-full">
        <h3 class="font-semibold text-gray-800 mb-2">Move to Trash?</h3>
        <p class="text-sm text-gray-500 mb-5">
          "<strong>{{ deletingFile.name }}</strong>" will be moved to Google Drive trash.
        </p>
        <div class="flex gap-3 justify-end">
          <button @click="deletingFile = null" class="btn-secondary">Cancel</button>
          <button @click="doDelete" :disabled="deleting" class="btn-danger">
            {{ deleting ? 'Deleting…' : 'Move to Trash' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDriveStore } from '../stores/driveStore.js'

const store = useDriveStore()
const searchQuery = ref('')
const deletingFile = ref(null)
const deleting = ref(false)

onMounted(loadFiles)

async function loadFiles() {
  await store.fetchFiles(searchQuery.value)
}

function confirmDelete(file) {
  deletingFile.value = file
}

async function doDelete() {
  if (!deletingFile.value) return
  deleting.value = true
  try {
    await store.deleteFile(deletingFile.value.id)
  } finally {
    deleting.value = false
    deletingFile.value = null
  }
}

function fileIcon(mimeType) {
  if (!mimeType) return '📄'
  if (mimeType.includes('folder')) return '📁'
  if (mimeType.includes('image')) return '🖼️'
  if (mimeType.includes('video')) return '🎬'
  if (mimeType.includes('audio')) return '🎵'
  if (mimeType.includes('pdf')) return '📑'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊'
  if (mimeType.includes('document') || mimeType.includes('word')) return '📝'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📋'
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return '🗜️'
  return '📄'
}

function friendlyMime(mimeType) {
  if (!mimeType) return 'Unknown'
  const map = {
    'application/vnd.google-apps.folder': 'Folder',
    'application/vnd.google-apps.document': 'Google Doc',
    'application/vnd.google-apps.spreadsheet': 'Google Sheet',
    'application/vnd.google-apps.presentation': 'Google Slides',
    'application/pdf': 'PDF',
    'image/jpeg': 'JPEG Image',
    'image/png': 'PNG Image',
    'video/mp4': 'MP4 Video',
    'text/plain': 'Text File'
  }
  return map[mimeType] || mimeType.split('/').pop().toUpperCase()
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatSize(bytes) {
  if (!bytes || bytes === '0') return '—'
  const n = Number(bytes)
  if (n < 1024) return n + ' B'
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
  if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + ' MB'
  return (n / 1024 / 1024 / 1024).toFixed(1) + ' GB'
}
</script>
