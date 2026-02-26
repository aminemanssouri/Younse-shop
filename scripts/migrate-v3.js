const fs = require('fs');
const path = require('path');
const os = require('os');

const initSqlJsMod = require('sql.js');
const initSqlJs = initSqlJsMod.default ?? initSqlJsMod;

const dbPath = path.join(os.tmpdir(), 'carpet-shop.db');

(async () => {
  try {
    console.log('Running migration v3 - adding color to products...');

    const SQL = await initSqlJs();
    const db = fs.existsSync(dbPath)
      ? new SQL.Database(new Uint8Array(fs.readFileSync(dbPath)))
      : new SQL.Database();

    // Add color column to products table
    db.exec(`
      ALTER TABLE products ADD COLUMN color TEXT DEFAULT 'blue'
    `);

    console.log('Migration v3 complete: Added color column to products table');
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
    db.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error.message);
    // Ignore if column already exists
    if (error.message.includes('duplicate column')) {
      console.log('Color column already exists');
    }
    process.exit(0);
  }
})();
