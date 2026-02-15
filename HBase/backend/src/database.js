const hbase = require('hbase');

// HBase REST API connection from environment or defaults
const HBASE_HOST = process.env.HBASE_HOST || 'localhost';
const HBASE_PORT = process.env.HBASE_PORT || 8080;

let client;
const TABLE_NAME = 'items';
const COLUMN_FAMILY = 'data';

// Connect to HBase via REST API
async function connectDatabase() {
  try {
    client = hbase({
      host: HBASE_HOST,
      port: HBASE_PORT
    });

    console.log(`✓ Connected to HBase REST API at ${HBASE_HOST}:${HBASE_PORT}`);

    // Initialize table
    await initializeDatabase();
  } catch (err) {
    console.error('Error connecting to HBase:', err);
    throw err;
  }
}

// Initialize table with column family
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const table = client.table(TABLE_NAME);

    table.exists((err, exists) => {
      if (err) {
        console.warn('Warning: Could not check table existence (HBase may not be running):', err.message);
        return resolve();
      }

      if (exists) {
        console.log(`✓ Table '${TABLE_NAME}' already exists`);
        return resolve();
      }

      table.create({
        ColumnSchema: [{ name: COLUMN_FAMILY }]
      }, (err) => {
        if (err) {
          console.warn('Warning: Could not create table:', err.message);
          return resolve();
        }
        console.log(`✓ Table '${TABLE_NAME}' created with column family '${COLUMN_FAMILY}'`);
        resolve();
      });
    });
  });
}

// Get HBase client
function getClient() {
  if (!client) {
    throw new Error('HBase not initialized. Call connectDatabase() first.');
  }
  return client;
}

// Get table reference
function getTable(name) {
  return getClient().table(name || TABLE_NAME);
}

// Get a row by key
function getRow(rowKey) {
  return new Promise((resolve, reject) => {
    const table = getTable();
    table.row(rowKey).get((err, cells) => {
      if (err) return reject(err);
      if (!cells || cells.length === 0) return resolve(null);

      const doc = { id: rowKey };
      cells.forEach((cell) => {
        const qualifier = cell.column.split(':')[1];
        let value = cell.$;
        if (qualifier === 'price') {
          value = parseFloat(value) || 0;
        } else if (qualifier === 'quantity') {
          value = parseInt(value, 10) || 0;
        }
        doc[qualifier] = value;
      });
      resolve(doc);
    });
  });
}

// Scan all rows
function scanAll() {
  return new Promise((resolve, reject) => {
    const table = getTable();
    const scanner = table.scan({
      maxVersions: 1
    });

    const rows = {};

    scanner.on('readable', function () {
      let chunk;
      while ((chunk = scanner.read()) !== null) {
        const rowKey = chunk.key;
        if (!rows[rowKey]) {
          rows[rowKey] = { id: rowKey };
        }
        const qualifier = chunk.column.split(':')[1];
        let value = chunk.$;
        if (qualifier === 'price') {
          value = parseFloat(value) || 0;
        } else if (qualifier === 'quantity') {
          value = parseInt(value, 10) || 0;
        }
        rows[rowKey][qualifier] = value;
      }
    });

    scanner.on('error', (err) => {
      reject(err);
    });

    scanner.on('end', () => {
      const items = Object.values(rows);
      // Sort by created_at descending
      items.sort((a, b) => {
        const dateA = a.created_at || '';
        const dateB = b.created_at || '';
        return dateB.localeCompare(dateA);
      });
      resolve(items);
    });
  });
}

// Put a row (create or update)
function putRow(rowKey, data) {
  return new Promise((resolve, reject) => {
    const table = getTable();
    const row = table.row(rowKey);

    const cells = [];
    for (const [key, value] of Object.entries(data)) {
      cells.push({
        column: `${COLUMN_FAMILY}:${key}`,
        $: String(value != null ? value : '')
      });
    }

    row.put(cells, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// Delete a row
function deleteRow(rowKey) {
  return new Promise((resolve, reject) => {
    const table = getTable();
    table.row(rowKey).delete((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// Close database connection
async function closeDatabase() {
  if (client) {
    console.log('✓ HBase connection closed');
  }
}

module.exports = {
  connectDatabase,
  getClient,
  getTable,
  getRow,
  scanAll,
  putRow,
  deleteRow,
  closeDatabase,
  TABLE_NAME,
  COLUMN_FAMILY
};
