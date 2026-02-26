const fs = require('fs');
const path = require('path');
const os = require('os');

const initSqlJsMod = require('sql.js');
const initSqlJs = initSqlJsMod.default ?? initSqlJsMod;

const dbPath = path.join(os.tmpdir(), 'carpet-shop.db');

const migrations = [
  // Add image_url and measurement_unit to products
  `ALTER TABLE products ADD COLUMN image_url TEXT;`,
  `ALTER TABLE products ADD COLUMN measurement_unit TEXT DEFAULT 'pce';`,
  
  // Create notes table
  `CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );`,
];

(async () => {
  try {
    const SQL = await initSqlJs();

    const db = fs.existsSync(dbPath)
      ? new SQL.Database(new Uint8Array(fs.readFileSync(dbPath)))
      : new SQL.Database();

    console.log('Connected to database');

    migrations.forEach((migration, index) => {
      try {
        db.exec(migration);
        console.log(`Migration ${index + 1} completed`);
      } catch (err) {
        // Column might already exist, that's okay
        console.log(`Migration ${index + 1} skipped or completed:`, err.message);
      }
    });

    fs.writeFileSync(dbPath, Buffer.from(db.export()));
    db.close();
    console.log('Database migration completed');
  } catch (err) {
    console.error('Error running migrations:', err);
    process.exit(1);
  }
})();
