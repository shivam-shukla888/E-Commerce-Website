const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const config = require('../config');

let dbInstance = null;

function getDb(customPath = null) {
  if (dbInstance) {
    return dbInstance;
  }

  const dbFilePath = customPath || config.dbPath;

  // If in-memory (e.g. for testing)
  if (dbFilePath === ':memory:') {
    dbInstance = new Database(':memory:');
    dbInstance.pragma('foreign_keys = ON');
    return dbInstance;
  }

  // Ensure storage directory exists
  const dir = path.dirname(dbFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  dbInstance = new Database(dbFilePath);
  // Pragmas for performance and data integrity
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');

  return dbInstance;
}

function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

module.exports = {
  getDb,
  closeDb,
};
