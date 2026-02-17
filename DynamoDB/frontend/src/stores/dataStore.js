import { defineStore } from 'pinia'
import api from '../api'

export const useDataStore = defineStore('data', {
  state: () => ({
    items: [],
    categories: [],
    currentItem: null,
    loading: false,
    error: null,
    darkMode: false,
    lastEvaluatedKey: null,
    hasMore: false
  }),

  actions: {
    async fetchItems(loadMore = false) {
      this.loading = true
      this.error = null
      try {
        const params = {}
        if (loadMore && this.lastEvaluatedKey) {
          params.lastKey = this.lastEvaluatedKey
        }
        
        const response = await api.get('/data', { params })
        
        if (loadMore) {
          this.items = [...this.items, ...(response.data.data.items || [])]
        } else {
          this.items = response.data.data.items || []
        }
        
        this.lastEvaluatedKey = response.data.data.lastEvaluatedKey
        this.hasMore = response.data.data.hasMore
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch items'
        console.error('Error fetching items:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchItem(id) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`/data/${id}`)
        this.currentItem = response.data.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch item'
        console.error('Error fetching item:', error)
      } finally {
        this.loading = false
      }
    },

    async createItem(item) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/data', item)
        this.items.unshift(response.data.data)
        return response.data.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to create item'
        console.error('Error creating item:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateItem(id, item) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(`/data/${id}`, item)
        const index = this.items.findIndex(i => i.id === id)
        if (index !== -1) {
          this.items[index] = response.data.data
        }
        return response.data.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to update item'
        console.error('Error updating item:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteItem(id) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/data/${id}`)
        this.items = this.items.filter(i => i.id !== id)
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to delete item'
        console.error('Error deleting item:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async searchItems(filters, loadMore = false) {
      this.loading = true
      this.error = null
      try {
        const payload = { ...filters }
        if (loadMore && this.lastEvaluatedKey) {
          payload.lastKey = this.lastEvaluatedKey
        }
        
        const response = await api.post('/search', payload)
        
        if (loadMore) {
          this.items = [...this.items, ...(response.data.data.items || [])]
        } else {
          this.items = response.data.data.items || []
        }
        
        this.lastEvaluatedKey = response.data.data.lastEvaluatedKey
        this.hasMore = response.data.data.hasMore
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to search items'
        console.error('Error searching items:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchCategories() {
      try {
        const response = await api.get('/categories')
        this.categories = response.data.data || []
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    },

    async fetchByCategory(category, loadMore = false) {
      this.loading = true
      this.error = null
      try {
        const params = {}
        if (loadMore && this.lastEvaluatedKey) {
          params.lastKey = this.lastEvaluatedKey
        }
        
        const response = await api.get(`/category/${category}`, { params })
        
        if (loadMore) {
          this.items = [...this.items, ...(response.data.data.items || [])]
        } else {
          this.items = response.data.data.items || []
        }
        
        this.lastEvaluatedKey = response.data.data.lastEvaluatedKey
        this.hasMore = response.data.data.hasMore
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch items by category'
        console.error('Error fetching by category:', error)
      } finally {
        this.loading = false
      }
    },

    toggleDarkMode() {
      this.darkMode = !this.darkMode
      if (this.darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }
})
