import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api.js'

export const useDriveStore = defineStore('drive', () => {
  const files = ref([])
  const loading = ref(false)
  const error = ref(null)
  const uploadProgress = ref(0)
  const rootFolderId = ref(null)
  const currentFolderId = ref(null)

  // Breadcrumb trail: [{id, name}]
  const breadcrumb = ref([])

  async function loadRootFolder() {
    try {
      const { data } = await api.get('/drive/root')
      rootFolderId.value = data.rootFolderId
      if (!currentFolderId.value) {
        currentFolderId.value = data.rootFolderId
        breadcrumb.value = [{ id: data.rootFolderId, name: data.folder?.name || 'Database' }]
      }
    } catch (e) {
      // ignore
    }
  }

  async function fetchFiles(query = '', folderId = null) {
    loading.value = true
    error.value = null
    try {
      const targetFolder = folderId || currentFolderId.value || rootFolderId.value
      const params = { pageSize: 100 }
      if (query) params.query = query
      if (targetFolder) params.folderId = targetFolder
      const { data } = await api.get('/drive/files', { params })
      files.value = data.files
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function navigateToFolder(folder) {
    // Push to breadcrumb if not already there
    const existingIdx = breadcrumb.value.findIndex(b => b.id === folder.id)
    if (existingIdx >= 0) {
      breadcrumb.value = breadcrumb.value.slice(0, existingIdx + 1)
    } else {
      breadcrumb.value.push({ id: folder.id, name: folder.name })
    }
    currentFolderId.value = folder.id
    await fetchFiles()
  }

  async function navigateToBreadcrumb(idx) {
    const crumb = breadcrumb.value[idx]
    breadcrumb.value = breadcrumb.value.slice(0, idx + 1)
    currentFolderId.value = crumb.id
    await fetchFiles()
  }

  async function uploadFile(file, folderId = null) {
    const formData = new FormData()
    formData.append('file', file)
    // Upload into the currently browsed folder (or root)
    const targetFolder = folderId || currentFolderId.value || rootFolderId.value
    if (targetFolder) formData.append('folderId', targetFolder)

    uploadProgress.value = 0
    const { data } = await api.post('/drive/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => {
        uploadProgress.value = Math.round((e.loaded / e.total) * 100)
      }
    })
    return data
  }

  async function deleteFile(id) {
    await api.delete(`/drive/delete/${id}`)
    files.value = files.value.filter(f => f.id !== id)
  }

  async function getFile(id) {
    const { data } = await api.get(`/drive/files/${id}`)
    return data
  }

  return {
    files, loading, error, uploadProgress,
    rootFolderId, currentFolderId, breadcrumb,
    loadRootFolder, fetchFiles, navigateToFolder, navigateToBreadcrumb,
    uploadFile, deleteFile, getFile
  }
})
