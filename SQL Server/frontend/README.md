# SQL Server Frontend - Learning Module

Vue 3 + Vite frontend application for SQL Server database with full CRUD UI.

## Features

- ✅ Vue 3 Composition API
- ✅ Vite for fast development
- ✅ Pinia state management
- ✅ TailwindCSS styling
- ✅ Dark mode toggle
- ✅ Responsive design
- ✅ Full CRUD interface
- ✅ Search and filter UI
- ✅ Loading states
- ✅ Error handling

## Tech Stack

- **Framework**: Vue 3
- **Build Tool**: Vite 5.x
- **State Management**: Pinia
- **HTTP Client**: Axios
- **Styling**: TailwindCSS 3.x
- **PostCSS**: Autoprefixer

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend server running on port 3000

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env if needed
```

## Configuration

Edit `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

## Running the Application

### Development Mode
```bash
npm run dev
```
Application runs on `http://localhost:5173`

### Production Build
```bash
npm run build
```
Builds to `dist/` directory

### Preview Production Build
```bash
npm run preview
```
Serves production build on `http://localhost:4173`

## Features Overview

### 1. List View
- Display all items in a table
- View, edit, and delete actions
- Responsive table design

### 2. Create Form
- Add new items
- Form validation
- Success feedback

### 3. Edit Form
- Update existing items
- Pre-filled form data
- Validation

### 4. Detail View
- View full item details
- Formatted display

### 5. Search & Filter
- Search by name/description
- Filter by category
- Price range filtering
- Real-time results

### 6. Dark Mode
- Toggle light/dark theme
- Persistent across components
- Smooth transitions

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── DataTable.vue      # List all items
│   │   ├── CreateForm.vue     # Create new item
│   │   ├── EditForm.vue       # Edit existing item
│   │   ├── DetailView.vue     # View item details
│   │   └── SearchFilter.vue   # Search & filter UI
│   ├── stores/
│   │   └── dataStore.js       # Pinia store
│   ├── App.vue                # Main app component
│   ├── main.js                # App entry point
│   ├── api.js                 # Axios configuration
│   └── style.css              # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Components

### DataTable.vue
Displays all items in a responsive table with actions.

### CreateForm.vue
Form for creating new items with validation.

### EditForm.vue
Form for editing existing items.

### DetailView.vue
Displays detailed view of a single item.

### SearchFilter.vue
Advanced search and filter interface.

## State Management

Using Pinia for centralized state management:

```javascript
// Store actions
- fetchItems()      // Get all items
- fetchItem(id)     // Get single item
- createItem(data)  // Create new item
- updateItem(id, data) // Update item
- deleteItem(id)    // Delete item
- searchItems(filters) // Search items
- toggleDarkMode()  // Toggle dark mode
```

## API Integration

All API calls go through `src/api.js` using Axios.

Base URL: `http://localhost:3000/api`

## Styling

TailwindCSS with dark mode support:
- Light theme: Default
- Dark theme: `class="dark"` on root element
- Responsive breakpoints: sm, md, lg, xl, 2xl

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Development Tips

1. **Hot Reload**: Vite provides instant hot reload
2. **Vue DevTools**: Install for better debugging
3. **TailwindCSS IntelliSense**: VS Code extension recommended

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -i :5173
kill -9 <PID>
```

### API Connection Failed
- Verify backend is running on port 3000
- Check VITE_API_URL in .env
- Check CORS settings in backend

### Build Errors
```bash
# Clean install
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Vite Cache Issues
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## License

MIT
