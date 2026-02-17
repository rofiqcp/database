import { defineStore } from 'pinia'
import api from '../api'

export const useDataStore = defineStore('data', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
    darkMode: localStorage.getItem('darkMode') === 'true',
    wsConnected: false,
    wsError: null,
    ws: null,
    lastUpdate: null,
  }),

  getters: {
    itemCount: (state) => state.items.length,
    
    categories: (state) => {
      const cats = new Set(state.items.map(item => item.category).filter(Boolean))
      return Array.from(cats).sort()
    },
    
    featuredItems: (state) => {
      return state.items.filter(item => item.featured)
    },
  },

  actions: {
    // WebSocket connection
    connectWebSocket() {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws'
      
      try {
        this.ws = new WebSocket(wsUrl)
        
        this.ws.onopen = () => {
          console.log('✓ WebSocket connected')
          this.wsConnected = true
          this.wsError = null
        }
        
        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            
            if (message.type === 'connected') {
              console.log('WebSocket:', message.message)
            } else if (message.type === 'data_change') {
              this.handleRealtimeUpdate(message)
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.wsError = 'WebSocket connection error'
          this.wsConnected = false
        }
        
        this.ws.onclose = () => {
          console.log('✗ WebSocket disconnected')
          this.wsConnected = false
          
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            if (!this.wsConnected) {
              console.log('Attempting to reconnect WebSocket...')
              this.connectWebSocket()
            }
          }, 5000)
        }
      } catch (error) {
        console.error('Error creating WebSocket:', error)
        this.wsError = error.message
      }
    },
    
    disconnectWebSocket() {
      if (this.ws) {
        this.ws.close()
        this.ws = null
        this.wsConnected = false
      }
    },
    
    handleRealtimeUpdate(message) {
      this.lastUpdate = new Date().toISOString()
      const { changeType, data } = message
      
      switch (changeType) {
        case 'added':
          // Check if item already exists
          if (!this.items.find(item => item.id === data.id)) {
            this.items.unshift(data)
          }
          break
          
        case 'modified':
          const index = this.items.findIndex(item => item.id === data.id)
          if (index !== -1) {
            this.items[index] = data
          }
          break
          
        case 'removed':
          this.items = this.items.filter(item => item.id !== data.id)
          break
      }
    },

    // Fetch all items
    async fetchItems() {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.get('/data')
        if (response.data.success) {
          this.items = response.data.data
        } else {
          this.error = response.data.error || 'Failed to fetch items'
        }
      } catch (error) {
        this.error = error.response?.data?.error || error.message || 'Failed to fetch items'
        console.error('Error fetching items:', error)
      } finally {
        this.loading = false
      }
    },

    // Create new item
    async createItem(itemData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.post('/data', itemData)
        if (response.data.success) {
          // Item will be added via WebSocket real-time update
          return response.data.data
        } else {
          this.error = response.data.error || 'Failed to create item'
          return null
        }
      } catch (error) {
        this.error = error.response?.data?.error || error.message || 'Failed to create item'
        console.error('Error creating item:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    // Update item
    async updateItem(id, itemData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.put(`/data/${id}`, itemData)
        if (response.data.success) {
          // Item will be updated via WebSocket real-time update
          return response.data.data
        } else {
          this.error = response.data.error || 'Failed to update item'
          return null
        }
      } catch (error) {
        this.error = error.response?.data?.error || error.message || 'Failed to update item'
        console.error('Error updating item:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    // Delete item
    async deleteItem(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.delete(`/data/${id}`)
        if (response.data.success) {
          // Item will be removed via WebSocket real-time update
          return true
        } else {
          this.error = response.data.error || 'Failed to delete item'
          return false
        }
      } catch (error) {
        this.error = error.response?.data?.error || error.message || 'Failed to delete item'
        console.error('Error deleting item:', error)
        return false
      } finally {
        this.loading = false
      }
    },

    // Search items
    async searchItems(filters) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.post('/search', filters)
        if (response.data.success) {
          this.items = response.data.data
        } else {
          this.error = response.data.error || 'Failed to search items'
        }
      } catch (error) {
        this.error = error.response?.data?.error || error.message || 'Failed to search items'
        console.error('Error searching items:', error)
      } finally {
        this.loading = false
      }
    },

    // Toggle dark mode
    toggleDarkMode() {
      this.darkMode = !this.darkMode
      localStorage.setItem('darkMode', this.darkMode)
    },

    // Clear error
    clearError() {
      this.error = null
    },
  },
})
