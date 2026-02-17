# DynamoDB Frontend - Vue 3 + Vite + TailwindCSS

Frontend application for the DynamoDB Learning Module.

## Features

- Vue 3 with Composition API
- Vite for fast development
- Pinia for state management
- TailwindCSS for styling
- Axios for API calls
- Dark mode support
- Responsive design
- Component-based architecture

## Prerequisites

- Node.js 18+
- npm 9+

## Installation

```bash
npm install
```

## Configuration

Create `.env` file from example:

```bash
cp .env.example .env
```

### Environment Variables

```env
VITE_API_URL=http://localhost:3000/api
```

## Running

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Vue components
│   │   ├── DataTable.vue
│   │   ├── CreateForm.vue
│   │   ├── EditForm.vue
│   │   ├── DetailView.vue
│   │   └── SearchFilter.vue
│   ├── stores/          # Pinia stores
│   │   └── dataStore.js
│   ├── App.vue          # Main component
│   ├── main.js          # Entry point
│   ├── api.js           # API client
│   └── style.css        # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Components

- **DataTable**: Display items in table format with actions
- **CreateForm**: Form to create new items
- **EditForm**: Form to edit existing items
- **DetailView**: View item details
- **SearchFilter**: Search and filter items

## State Management

Using Pinia for centralized state:

```javascript
// Available actions
store.fetchItems()           // Get all items
store.fetchItem(id)          // Get single item
store.createItem(data)       // Create item
store.updateItem(id, data)   // Update item
store.deleteItem(id)         // Delete item
store.searchItems(filters)   // Search items
store.fetchCategories()      // Get categories
store.toggleDarkMode()       // Toggle dark mode
```

## Dependencies

- **vue**: JavaScript framework
- **pinia**: State management
- **axios**: HTTP client

## Dev Dependencies

- **@vitejs/plugin-vue**: Vite Vue plugin
- **vite**: Build tool
- **tailwindcss**: CSS framework
- **postcss**: CSS processing
- **autoprefixer**: CSS vendor prefixes

## Building for Production

```bash
npm run build
```

Output will be in `dist/` directory.

## License

MIT
