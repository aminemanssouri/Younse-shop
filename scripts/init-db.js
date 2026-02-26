const fs = require('fs');
const os = require('os');
const path = require('path');

const initSqlJsMod = require('sql.js');
const initSqlJs = initSqlJsMod.default ?? initSqlJsMod;

const dbPath = path.join(os.tmpdir(), 'carpet-shop.db');

const schema = [
  `CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    cost_price REAL NOT NULL,
    selling_price REAL NOT NULL,
    image_url TEXT,
    measurement_unit TEXT DEFAULT 'pce',
    color TEXT DEFAULT '#3b82f6',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity_sold INTEGER NOT NULL,
    selling_price REAL NOT NULL,
    total_amount REAL NOT NULL,
    profit_amount REAL NOT NULL,
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
  )`,
  `CREATE TABLE IF NOT EXISTS customer_debts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    total_debt REAL NOT NULL DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS supplier_debts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    total_debt REAL NOT NULL DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS debt_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_debt_id INTEGER,
    supplier_debt_id INTEGER,
    amount REAL NOT NULL,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    payment_method TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_debt_id) REFERENCES customer_debts(id),
    FOREIGN KEY (supplier_debt_id) REFERENCES supplier_debts(id)
  )`,
  `CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date)`,
  `CREATE INDEX IF NOT EXISTS idx_debt_payments_customer ON debt_payments(customer_debt_id)`,
  `CREATE INDEX IF NOT EXISTS idx_debt_payments_supplier ON debt_payments(supplier_debt_id)`,
];

(async () => {
  try {
    const SQL = await initSqlJs();

    const db = fs.existsSync(dbPath)
      ? new SQL.Database(new Uint8Array(fs.readFileSync(dbPath)))
      : new SQL.Database();

    console.log('Connected to SQLite database at:', dbPath);

    for (const sql of schema) {
      db.exec(sql);
    }
    console.log('Database schema initialized successfully');

    const products = [
      ['Persian Wool Rug 8x10', 'PERSIAN-8x10', 5, 450.00, 899.99, '#8b4513'],
      ['Modern Polyester Rug 6x9', 'MODERN-6x9', 12, 120.00, 249.99, '#d4a574'],
      ['Oriental Silk Rug 5x7', 'ORIENTAL-5x7', 3, 650.00, 1299.99, '#c41e3a'],
      ['Jute Natural Rug 9x12', 'JUTE-9x12', 8, 180.00, 379.99, '#daa520'],
      ['Shag Plush Rug 7x10', 'SHAG-7x10', 6, 200.00, 449.99, '#696969'],
    ];

    const stmt = db.prepare(
      `INSERT OR IGNORE INTO products (name, sku, stock_quantity, cost_price, selling_price, color) VALUES (?, ?, ?, ?, ?, ?)`
    );

    try {
      for (const product of products) {
        stmt.bind(product);
        stmt.step();
        stmt.reset();
      }
    } finally {
      stmt.free();
    }

    console.log('Sample data inserted successfully');

    fs.writeFileSync(dbPath, Buffer.from(db.export()));
    db.close();

    console.log('Database initialization complete');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
})();
