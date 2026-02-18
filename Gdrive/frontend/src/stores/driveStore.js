import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api.js'

export const useDriveStore = defineStore('drive', () => {
  const files = ref([])
  const loading = ref(false)
  const error = ref(null)
  const uploadProgress = ref(0)

  async function fetchFiles(query = '', pageSize = 30) {
    loading.value = true
    error.value = null
    try {
      const params = { pageSize }
      if (query) params.query = query
      const { data } = await api.get('/drive/files', { params })
      files.value = data.files
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function uploadFile(file, folderId = null) {
    const formData = new FormData()
    formData.append('file', file)
    if (folderId) formData.append('folderId', folderId)

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

  return { files, loading, error, uploadProgress, fetchFiles, uploadFile, deleteFile, getFile }
})
