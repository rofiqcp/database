const { Client } = require('@elastic/elasticsearch');

const node = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
const index = process.env.ELASTICSEARCH_INDEX || 'items';

const client = new Client({ node });

// Index mappings for the items index
const indexMappings = {
  properties: {
    name: { type: 'text', fields: { keyword: { type: 'keyword' } } },
    description: { type: 'text' },
    category: { type: 'keyword' },
    price: { type: 'float' },
    quantity: { type: 'integer' },
    created_at: { type: 'date' },
    updated_at: { type: 'date' }
  }
};

// Initialize the Elasticsearch index
async function initializeDatabase() {
  try {
    const exists = await client.indices.exists({ index });
    if (!exists) {
      await client.indices.create({
        index,
        body: {
          mappings: indexMappings
        }
      });
      console.log(`✓ Elasticsearch index "${index}" created successfully`);
    } else {
      console.log(`✓ Elasticsearch index "${index}" already exists`);
    }
    console.log('✓ Connected to Elasticsearch');
  } catch (error) {
    console.error('Error initializing Elasticsearch:', error.message);
  }
}

// Initialize the index
initializeDatabase();

module.exports = { client, index };
