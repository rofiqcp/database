import { defineStore } from 'pinia'
import api from '../api'

export const useDataStore = defineStore('data', {
  state: () => ({
    items: [],
    categories: [],
    tags: [],
    currentItem: null,
    relatedItems: [],
    graphPath: null,
    loading: false,
    error: null,
    darkMode: false
  }),

  actions: {
    async fetchItems() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/items')
        this.items = response.data.data || []
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
        const response = await api.get(`/items/${id}`)
        this.currentItem = response.data.data
        return response.data.data
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
        const response = await api.post('/items', item)
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
        const response = await api.put(`/items/${id}`, item)
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
        await api.delete(`/items/${id}`)
        this.items = this.items.filter(i => i.id !== id)
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to delete item'
        console.error('Error deleting item:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async searchItems(filters) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/search', filters)
        this.items = response.data.data || []
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to search items'
        console.error('Error searching items:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchCategories() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/categories')
        this.categories = response.data.data || []
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch categories'
        console.error('Error fetching categories:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchTags() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/tags')
        this.tags = response.data.data || []
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch tags'
        console.error('Error fetching tags:', error)
      } finally {
        this.loading = false
      }
    },

    async addTagToItem(itemId, tag) {
      this.loading = true
      this.error = null
      try {
        await api.post(`/items/${itemId}/tags`, tag)
        // Refresh the item to get updated tags
        await this.fetchItem(itemId)
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to add tag'
        console.error('Error adding tag:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async removeTagFromItem(itemId, tagId) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/items/${itemId}/tags/${tagId}`)
        // Refresh the item to get updated tags
        await this.fetchItem(itemId)
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to remove tag'
        console.error('Error removing tag:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchRelatedItems(itemId) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`/items/${itemId}/related`)
        this.relatedItems = response.data.data || []
        return response.data.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch related items'
        console.error('Error fetching related items:', error)
      } finally {
        this.loading = false
      }
    },

    async findPath(fromId, toId) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`/graph/path/${fromId}/${toId}`)
        this.graphPath = response.data.data
        return response.data.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to find path'
        console.error('Error finding path:', error)
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
    },

    clearError() {
      this.error = null
    }
  }
})
