<template>
  <div>
    <!-- Drop zone -->
    <div
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="handleDrop"
      :class="['border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors mb-5',
        dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50']"
      @click="triggerFileInput"
    >
      <svg class="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
      </svg>
      <p class="text-gray-600 font-medium mb-1">Drag & drop files here</p>
      <p class="text-sm text-gray-400">or click to browse — max 100 MB</p>
    </div>

    <input ref="fileInput" type="file" class="hidden" multiple @change="handleFileInput" />

    <!-- Optional folder ID -->
    <div class="mb-5">
      <p class="text-xs text-gray-500">
        📁 Uploading to:
        <span class="font-medium text-gray-700">
          {{ currentFolderName }}
        </span>
      </p>
    </div>

    <!-- Pending files list -->
    <div v-if="pendingFiles.length" class="space-y-2 mb-5">
      <div
        v-for="(pf, i) in pendingFiles"
        :key="i"
        class="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
      >
        <span class="text-xl">{{ fileIcon(pf.file.type) }}</span>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">{{ pf.file.name }}</p>
          <p class="text-xs text-gray-400">{{ formatSize(pf.file.size) }}</p>
        </div>
        <!-- Progress / Status -->
        <div class="w-36 text-right">
          <div v-if="pf.status === 'uploading'" class="text-xs text-blue-600 mb-1">{{ pf.progress }}%</div>
          <div v-if="pf.status === 'uploading'" class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-blue-500 transition-all duration-300" :style="{ width: pf.progress + '%' }" />
          </div>
          <span v-else-if="pf.status === 'done'" class="text-xs text-green-600 font-medium">✓ Uploaded</span>
          <span v-else-if="pf.status === 'error'" class="text-xs text-red-600">✗ Failed</span>
          <span v-else class="text-xs text-gray-400">Pending</span>
        </div>
        <button
          v-if="pf.status !== 'uploading'"
          @click="pendingFiles.splice(i, 1)"
          class="text-gray-400 hover:text-red-500 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Upload all button -->
    <div class="flex items-center gap-4">
      <button
        @click="uploadAll"
        :disabled="!pendingFiles.filter(f => f.status === 'pending').length || uploading"
        class="btn-primary"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
        </svg>
        {{ uploading ? 'Uploading…' : 'Upload All' }}
      </button>
      <button
        v-if="pendingFiles.length"
        @click="pendingFiles = pendingFiles.filter(f => f.status !== 'done')"
        class="btn-secondary text-sm"
      >
        Clear Completed
      </button>
    </div>

    <!-- Error -->
    <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDriveStore } from '../stores/driveStore.js'

const store = useDriveStore()
const fileInput = ref(null)
const pendingFiles = ref([])
const dragging = ref(false)
const uploading = ref(false)
const error = ref(null)

const currentFolderName = computed(() => {
  if (!store.breadcrumb.length) return 'Database Root'
  return store.breadcrumb[store.breadcrumb.length - 1]?.name || 'Database Root'
})

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileInput(e) {
  addFiles(Array.from(e.target.files))
  e.target.value = ''
}

function handleDrop(e) {
  dragging.value = false
  const files = Array.from(e.dataTransfer.files)
  addFiles(files)
}

function addFiles(files) {
  files.forEach(file => {
    pendingFiles.value.push({ file, status: 'pending', progress: 0, result: null })
  })
}

async function uploadAll() {
  uploading.value = true
  error.value = null
  const pending = pendingFiles.value.filter(f => f.status === 'pending')
  for (const pf of pending) {
    pf.status = 'uploading'
    pf.progress = 0
    try {
      const formData = new FormData()
      formData.append('file', pf.file)
      // Always upload to the currently browsed folder (backend defaults to rootFolderId)
      const targetFolder = store.currentFolderId || store.rootFolderId
      if (targetFolder) formData.append('folderId', targetFolder)

      const { data } = await import('../api.js').then(m => m.default.post('/drive/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => {
          pf.progress = Math.round((e.loaded / e.total) * 100)
        }
      }))
      pf.result = data
      pf.status = 'done'
    } catch (e) {
      pf.status = 'error'
      error.value = e.message
    }
  }
  uploading.value = false
}

function fileIcon(type) {
  if (!type) return '📄'
  if (type.startsWith('image/')) return '🖼️'
  if (type.startsWith('video/')) return '🎬'
  if (type.startsWith('audio/')) return '🎵'
  if (type === 'application/pdf') return '📑'
  if (type.includes('zip') || type.includes('compressed')) return '🗜️'
  if (type.startsWith('text/')) return '📄'
  return '📦'
}

function formatSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}
</script>
