const { v4: uuidv4 } = require('uuid');

// HBase-style in-memory store for learning purposes
// In production, this connects to HBase REST API (Stargate)
class HBaseEmulator {
  constructor() {
    this.tables = new Map();
    this.createTable('items', ['info', 'meta']);
  }

  createTable(tableName, columnFamilies) {
    if (!this.tables.has(tableName)) {
      this.tables.set(tableName, { columnFamilies, rows: new Map() });
    }
  }

  put(tableName, rowKey, columnFamily, qualifier, value) {
    const table = this.tables.get(tableName);
    if (!table) throw new Error(`Table ${tableName} not found`);
    if (!table.columnFamilies.includes(columnFamily)) {
      throw new Error(`Column family ${columnFamily} not found in table ${tableName}`);
    }
    if (!table.rows.has(rowKey)) {
      table.rows.set(rowKey, new Map());
    }
    const row = table.rows.get(rowKey);
    const key = `${columnFamily}:${qualifier}`;
    row.set(key, { value, timestamp: Date.now() });
  }

  get(tableName, rowKey) {
    const table = this.tables.get(tableName);
    if (!table) return null;
    const row = table.rows.get(rowKey);
    if (!row) return null;
    const result = { rowKey };
    row.forEach((cell, key) => {
      result[key] = cell.value;
    });
    return result;
  }

  scan(tableName) {
    const table = this.tables.get(tableName);
    if (!table) return [];
    const results = [];
    table.rows.forEach((row, rowKey) => {
      const item = { rowKey };
      row.forEach((cell, key) => {
        item[key] = cell.value;
      });
      results.push(item);
    });
    return results;
  }

  delete(tableName, rowKey) {
    const table = this.tables.get(tableName);
    if (!table) return false;
    return table.rows.delete(rowKey);
  }

  generateRowKey() {
    return uuidv4();
  }

  listTables() {
    return Array.from(this.tables.keys());
  }

  describeTable(tableName) {
    const table = this.tables.get(tableName);
    if (!table) return null;
    return {
      name: tableName,
      columnFamilies: table.columnFamilies,
      rowCount: table.rows.size
    };
  }
}

const hbase = new HBaseEmulator();
console.log('✓ Connected to HBase (Learning Emulator)');
console.log('✓ Database initialized successfully');

module.exports = hbase;
