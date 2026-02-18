<template>
  <div>
    <!-- Document ID input -->
    <div class="flex flex-wrap gap-3 mb-5">
      <input
        v-model="documentId"
        placeholder="Document ID (from Google Docs URL)"
        class="input-field flex-1 min-w-[200px]"
      />
      <button @click="loadDocument" class="btn-primary" :disabled="loading || !documentId">
        Load Document
      </button>
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      {{ error }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <div class="h-7 w-64 bg-gray-100 rounded animate-pulse" />
      <div v-for="i in 5" :key="i" class="h-4 bg-gray-100 rounded animate-pulse" :style="{ width: (60 + i * 8) + '%' }" />
    </div>

    <!-- Document content -->
    <div v-else-if="doc" class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-xl font-bold text-gray-800">{{ doc.title }}</h3>
          <a
            :href="`https://docs.google.com/document/d/${documentId}/edit`"
            target="_blank"
            class="text-xs text-blue-500 hover:underline"
          >Open in Google Docs ↗</a>
        </div>
        <span class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">ID: {{ documentId }}</span>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg p-5 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 max-h-96 overflow-y-auto font-mono">
        {{ doc.plainText || '(empty document)' }}
      </div>
      <p class="text-xs text-gray-400 mt-2">Revision: {{ doc.revisionId }}</p>
    </div>

    <!-- Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <!-- Append text -->
      <div class="card">
        <h4 class="font-semibold text-gray-700 mb-3">Append Text</h4>
        <textarea
          v-model="appendText"
          class="input-field resize-y mb-3 font-mono text-sm"
          rows="4"
          placeholder="Text to append to the end of the document…"
        />
        <button @click="submitAppend" class="btn-primary" :disabled="appending || !documentId || !appendText">
          {{ appending ? 'Appending…' : 'Append to Document' }}
        </button>
        <span v-if="appendSuccess" class="text-green-600 text-sm mt-2 block">✓ Appended successfully!</span>
      </div>

      <!-- Create new document -->
      <div class="card">
        <h4 class="font-semibold text-gray-700 mb-3">Create New Document</h4>
        <input
          v-model="newDocTitle"
          class="input-field mb-3"
          placeholder="Document title"
        />
        <button @click="createNewDoc" class="btn-primary" :disabled="creating || !newDocTitle">
          {{ creating ? 'Creating…' : 'Create Document' }}
        </button>
        <div v-if="createdDocId" class="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
          <p class="text-green-700 font-medium">Document created!</p>
          <a
            :href="`https://docs.google.com/document/d/${createdDocId}/edit`"
            target="_blank"
            class="text-blue-600 hover:underline break-all text-xs"
          >Open: docs.google.com/document/d/{{ createdDocId }}/edit</a>
          <button @click="loadCreated" class="btn-secondary mt-2 text-xs py-1">View Here</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api.js'

const documentId = ref('')
const doc = ref(null)
const loading = ref(false)
const error = ref(null)

const appendText = ref('')
const appending = ref(false)
const appendSuccess = ref(false)

const newDocTitle = ref('')
const creating = ref(false)
const createdDocId = ref(null)

async function loadDocument() {
  if (!documentId.value) return
  loading.value = true
  error.value = null
  doc.value = null
  try {
    const { data } = await api.get(`/docs/${documentId.value}`)
    doc.value = data
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function submitAppend() {
  appending.value = true
  appendSuccess.value = false
  error.value = null
  try {
    await api.post(`/docs/${documentId.value}/append`, { text: appendText.value })
    appendSuccess.value = true
    appendText.value = ''
    setTimeout(() => { appendSuccess.value = false }, 3000)
    await loadDocument()
  } catch (e) {
    error.value = e.message
  } finally {
    appending.value = false
  }
}

async function createNewDoc() {
  creating.value = true
  error.value = null
  createdDocId.value = null
  try {
    const { data } = await api.post('/docs/create', { title: newDocTitle.value })
    createdDocId.value = data.documentId
    newDocTitle.value = ''
  } catch (e) {
    error.value = e.message
  } finally {
    creating.value = false
  }
}

function loadCreated() {
  documentId.value = createdDocId.value
  loadDocument()
}
</script>
