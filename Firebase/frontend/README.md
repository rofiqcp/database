# Firebase Frontend

Vue 3 frontend application for the Firebase Learning Module with real-time data synchronization.

## Features

- 🎨 Modern UI with TailwindCSS
- ⚡ Vue 3 with Composition API
- 🗃️ Pinia state management
- 🔌 WebSocket real-time updates
- 🌓 Dark mode support
- 📱 Responsive design
- 🔍 Search and filter
- ⭐ Featured items indicator
- 🔄 Live connection status

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000/ws
VITE_API_KEY=your-secret-api-key-here
```

## Development

Start development server:

```bash
npm run dev
```

Application will run on http://localhost:5173

## Build for Production

```bash
npm run build
```

Built files will be in `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── main.js                 # Application entry point
│   ├── App.vue                 # Main app component
│   ├── api.js                  # Axios configuration
│   ├── style.css               # Global styles
│   ├── components/
│   │   ├── DataTable.vue       # Items list table
│   │   ├── CreateForm.vue      # Create item form
│   │   ├── EditForm.vue        # Edit item form
│   │   ├── DetailView.vue      # Item details view
│   │   └── SearchFilter.vue    # Search and filter
│   └── stores/
│       └── dataStore.js        # Pinia store + WebSocket
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Components

### DataTable
Displays all items in a table format with actions (view, edit, delete).

### CreateForm
Form to create new items with validation.

### EditForm
Form to edit existing items with pre-populated data.

### DetailView
Displays detailed information about a selected item.

### SearchFilter
Advanced search and filtering with multiple criteria.

## State Management

The application uses Pinia for state management with WebSocket integration for real-time updates.

**Features:**
- Centralized state
- Real-time data sync
- WebSocket connection management
- Automatic reconnection
- Dark mode persistence

## Real-time Updates

WebSocket connection automatically syncs data changes:

```javascript
// Automatic connection on mount
connectWebSocket()

// Handles three change types:
// - added: New item created
// - modified: Item updated
// - removed: Item deleted
```

**Connection Indicator:**
- 🟢 Green dot (pulsing): Connected and live
- 🔴 Red dot: Disconnected

## API Integration

All API calls use Axios with automatic API key injection:

```javascript
// API key automatically added to POST, PUT, DELETE requests
headers: {
  'x-api-key': import.meta.env.VITE_API_KEY
}
```

## Styling

Uses TailwindCSS with custom dark mode:

- Light mode: Default
- Dark mode: Toggle button in header
- Persistent: Stored in localStorage

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

## Troubleshooting

**Port already in use:**
```bash
# Change port in vite.config.js
server: { port: 5174 }
```

**API connection failed:**
- Verify backend is running
- Check VITE_API_URL in .env
- Check browser console for errors

**WebSocket not connecting:**
- Verify backend WebSocket server is running
- Check VITE_WS_URL in .env
- Check browser console for connection errors

**Dark mode not persisting:**
- Check localStorage is enabled
- Clear browser cache

## Development Tips

**Hot Module Replacement (HMR):**
- Changes auto-reload without full page refresh
- State preserved during development

**Vue DevTools:**
- Install Vue DevTools browser extension
- Inspect components and state
- Debug Pinia store

**Network Debugging:**
- Use browser DevTools Network tab
- Monitor API requests
- Check WebSocket frames

## Technologies

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next generation frontend tooling
- **Pinia** - Vue state management
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **WebSocket API** - Real-time communication

## License

MIT
