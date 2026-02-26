import fs from 'fs';
import path from 'path';
import os from 'os';
import initSqlJs from 'sql.js';

const dbPath = path.join(os.tmpdir(), 'carpet-shop.db');

let db: import('sql.js').Database | null = null;
let sqlJsPromise: Promise<import('sql.js').SqlJsStatic> | undefined;

function getSqlJs(): Promise<import('sql.js').SqlJsStatic> {
  if (!sqlJsPromise) {
    sqlJsPromise = initSqlJs();
  }
  return sqlJsPromise!;
}

async function persistDb(): Promise<void> {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

async function ensureDb(): Promise<import('sql.js').Database> {
  if (db) return db;

  const SQL = await getSqlJs();

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(new Uint8Array(fileBuffer));
  } else {
    db = new SQL.Database();
  }

  return db;
}

export function getDb(): never {
  throw new Error('getDb() is not supported with sql.js. Use runAsync/getAsync/allAsync/execAsync instead.');
}

export function runAsync(sql: string, params: any[] = []): Promise<void> {
  return Promise.resolve().then(async () => {
    const database = await ensureDb();
    const stmt = database.prepare(sql);
    try {
      stmt.bind(params);
      while (stmt.step()) {
        // intentionally drain
      }
    } finally {
      stmt.free();
    }
    await persistDb();
  });
}

export function getAsync<T>(sql: string, params: any[] = []): Promise<T | undefined> {
  return Promise.resolve().then(async () => {
    const database = await ensureDb();
    const stmt = database.prepare(sql);
    try {
      stmt.bind(params);
      if (!stmt.step()) return undefined;
      return stmt.getAsObject() as T;
    } finally {
      stmt.free();
    }
  });
}

export function allAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
  return Promise.resolve().then(async () => {
    const database = await ensureDb();
    const stmt = database.prepare(sql);
    const results: T[] = [];
    try {
      stmt.bind(params);
      while (stmt.step()) {
        results.push(stmt.getAsObject() as T);
      }
    } finally {
      stmt.free();
    }
    return results;
  });
}

export function execAsync(sql: string): Promise<void> {
  return Promise.resolve().then(async () => {
    const database = await ensureDb();
    database.exec(sql);
    await persistDb();
  });
}

export async function initializeDatabase(): Promise<void> {
  console.log('Database is already initialized from init-db.js');
}
