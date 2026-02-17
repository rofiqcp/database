const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200'
});

const indexName = process.env.ELASTICSEARCH_INDEX || 'items';

async function initializeDatabase() {
  try {
    // Check connection
    const info = await client.info();
    console.log('✓ Connected to Elasticsearch', info.version.number);
    
    // Check if index exists
    const indexExists = await client.indices.exists({ index: indexName });
    
    if (!indexExists) {
      // Create index with mappings
      await client.indices.create({
        index: indexName,
        body: {
          mappings: {
            properties: {
              name: { type: 'text', fields: { keyword: { type: 'keyword' } } },
              description: { type: 'text' },
              category: { type: 'keyword' },
              price: { type: 'float' },
              quantity: { type: 'integer' },
              created_at: { type: 'date' },
              updated_at: { type: 'date' }
            }
          }
        }
      });
      console.log('✓ Created Elasticsearch index:', indexName);
    } else {
      console.log('✓ Elasticsearch index already exists:', indexName);
    }
    
    console.log('✓ Database initialized successfully');
  } catch (err) {
    console.error('Error initializing Elasticsearch:', err.message);
  }
}

initializeDatabase();

module.exports = { client, indexName };
