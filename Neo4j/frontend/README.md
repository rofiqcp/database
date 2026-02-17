# Neo4j Frontend

Frontend application for the Neo4j Learning Module built with Vue 3, Vite, Pinia, and TailwindCSS.

## Prerequisites

- Node.js (v16 or higher)
- Running Neo4j backend server

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env if backend URL is different
```

3. Start the development server:
```bash
npm run dev
```

The app will run on `http://localhost:5173` by default.

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Features

- **CRUD Operations**: Create, read, update, and delete items
- **Graph Visualization**: View relationships between items, categories, and tags
- **Relationship Management**: Add/remove tags, change categories
- **Search & Filter**: Search by text, filter by category, price range, and tags
- **Related Items**: Find items connected through tags or categories
- **Path Finding**: Discover shortest paths between items
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices

## Components

- **DataTable**: List all items with actions
- **CreateForm**: Create new items with categories and tags
- **EditForm**: Update existing items
- **DetailView**: View item details and relationships
- **SearchFilter**: Advanced search and filtering
- **GraphView**: Visualize graph structure and relationships

## Technology Stack

- Vue 3 (Composition API)
- Vite (Build tool)
- Pinia (State management)
- TailwindCSS (Styling)
- Axios (HTTP client)
