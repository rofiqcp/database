<template>
  <div>
    <!-- Spreadsheet ID input -->
    <div class="flex flex-wrap gap-3 mb-5">
      <input
        v-model="spreadsheetId"
        placeholder="Spreadsheet ID (from Google Sheets URL)"
        class="input-field flex-1 min-w-[200px]"
      />
      <input
        v-model="range"
        placeholder="Range (e.g. Sheet1!A1:E20)"
        class="input-field w-48"
      />
      <button @click="loadSheet" class="btn-primary" :disabled="loading || !spreadsheetId">
        Load Sheet
      </button>
    </div>

    <!-- Metadata bar -->
    <div v-if="metadata" class="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex flex-wrap items-center gap-4 text-sm">
      <div>
        <span class="text-gray-500">Title:</span>
        <span class="font-medium ml-1">{{ metadata.title }}</span>
      </div>
      <div class="flex gap-2">
        <button
          v-for="sheet in metadata.sheets"
          :key="sheet.sheetId"
          @click="switchSheet(sheet.title)"
          :class="['px-3 py-1 rounded-full text-xs font-medium transition-colors', activeSheet === sheet.title ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 hover:bg-gray-50']"
        >{{ sheet.title }}</button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      {{ error }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-2">
      <div v-for="i in 6" :key="i" class="h-10 bg-gray-100 rounded animate-pulse" />
    </div>

    <!-- Table -->
    <div v-else-if="values.length" class="overflow-x-auto mb-5">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="bg-gray-50">
            <th class="p-2 border border-gray-200 text-left text-gray-500 font-medium w-8">#</th>
            <th
              v-for="(cell, ci) in values[0]"
              :key="ci"
              class="p-2 border border-gray-200 text-left text-gray-500 font-medium"
            >{{ columnLabel(ci) }}</th>
          </tr>
          <tr class="bg-white">
            <td class="p-2 border border-gray-200 text-gray-400 text-xs">header</td>
            <td
              v-for="(cell, ci) in values[0]"
              :key="ci"
              class="p-2 border border-gray-200 font-semibold text-gray-700"
            >{{ cell }}</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in values.slice(1)" :key="ri" class="hover:bg-blue-50 transition-colors">
            <td class="p-2 border border-gray-200 text-gray-400 text-xs">{{ ri + 2 }}</td>
            <td
              v-for="(cell, ci) in row"
              :key="ci"
              class="p-2 border border-gray-200 text-gray-700"
            >{{ cell }}</td>
          </tr>
        </tbody>
      </table>
      <p class="text-xs text-gray-400 mt-2">{{ values.length }} rows × {{ maxCols }} columns — range: {{ loadedRange }}</p>
    </div>

    <!-- Write section -->
    <div v-if="spreadsheetId" class="card mt-4">
      <h3 class="font-semibold text-gray-700 mb-4">Write / Append Data</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-xs text-gray-500 mb-1">Target Range</label>
          <input v-model="writeRange" class="input-field" placeholder="Sheet1!A1" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">Action</label>
          <select v-model="writeAction" class="input-field">
            <option value="write">Overwrite (PUT)</option>
            <option value="append">Append rows (POST)</option>
          </select>
        </div>
      </div>
      <div class="mb-4">
        <label class="block text-xs text-gray-500 mb-1">Values (JSON array of rows)</label>
        <textarea
          v-model="writeData"
          class="input-field font-mono text-xs resize-y"
          rows="4"
          placeholder='[["Name","Age"],["Alice","30"]]'
        />
      </div>
      <div class="flex gap-3">
        <button @click="submitWrite" class="btn-primary" :disabled="writing || !writeRange">
          {{ writing ? 'Saving…' : (writeAction === 'append' ? 'Append Rows' : 'Write Data') }}
        </button>
        <span v-if="writeSuccess" class="text-green-600 text-sm flex items-center gap-1">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          Saved!
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '../api.js'

const spreadsheetId = ref('')
const range = ref('Sheet1')
const values = ref([])
const metadata = ref(null)
const loading = ref(false)
const error = ref(null)
const loadedRange = ref('')
const activeSheet = ref('Sheet1')

const writeRange = ref('Sheet1!A1')
const writeAction = ref('write')
const writeData = ref('[["Name","Age","City"],["Alice","30","London"]]')
const writing = ref(false)
const writeSuccess = ref(false)

const maxCols = computed(() => values.value.reduce((m, r) => Math.max(m, r.length), 0))

async function loadSheet() {
  if (!spreadsheetId.value) return
  loading.value = true
  error.value = null
  values.value = []
  metadata.value = null
  try {
    // Load metadata
    const meta = await api.get(`/sheets/${spreadsheetId.value}`)
    metadata.value = meta.data
    if (meta.data.sheets?.length) {
      activeSheet.value = meta.data.sheets[0].title
    }
    // Load values
    const actualRange = range.value || activeSheet.value
    const resp = await api.get(`/sheets/${spreadsheetId.value}/values`, { params: { range: actualRange } })
    values.value = resp.data.values || []
    loadedRange.value = resp.data.range || actualRange
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function switchSheet(sheetTitle) {
  activeSheet.value = sheetTitle
  range.value = sheetTitle
  await loadSheet()
}

async function submitWrite() {
  writing.value = true
  writeSuccess.value = false
  error.value = null
  try {
    let parsed
    try {
      parsed = JSON.parse(writeData.value)
    } catch {
      throw new Error('Invalid JSON in values field')
    }
    if (writeAction.value === 'append') {
      await api.post(`/sheets/${spreadsheetId.value}/values`, { range: writeRange.value, values: parsed })
    } else {
      await api.put(`/sheets/${spreadsheetId.value}/values`, { range: writeRange.value, values: parsed })
    }
    writeSuccess.value = true
    setTimeout(() => { writeSuccess.value = false }, 3000)
    await loadSheet()
  } catch (e) {
    error.value = e.message
  } finally {
    writing.value = false
  }
}

function columnLabel(index) {
  let label = ''
  let n = index + 1
  while (n > 0) {
    n--
    label = String.fromCharCode(65 + (n % 26)) + label
    n = Math.floor(n / 26)
  }
  return label
}
</script>
