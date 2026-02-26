import fs from 'fs';
import path from 'path';
import os from 'os';

const dbPath = path.join(os.tmpdir(), 'carpet-shop-data.json');

interface DataStore {
  products: any[];
  sales: any[];
  customerDebts: any[];
  supplierDebts: any[];
  debtPayments: any[];
  notes: any[];
}

let data: DataStore = {
  products: [],
  sales: [],
  customerDebts: [],
  supplierDebts: [],
  debtPayments: [],
  notes: [],
};

function loadData() {
  try {
    if (fs.existsSync(dbPath)) {
      const content = fs.readFileSync(dbPath, 'utf-8');
      data = JSON.parse(content);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

function saveData() {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Load data on initialization
loadData();

export const dataStore = {
  getProducts: () => data.products,
  addProduct: (product: any) => {
    product.id = Date.now();
    product.created_at = new Date().toISOString();
    product.updated_at = new Date().toISOString();
    data.products.push(product);
    saveData();
    return product;
  },
  updateProduct: (id: number, updates: any) => {
    const index = data.products.findIndex(p => p.id === id);
    if (index !== -1) {
      data.products[index] = { ...data.products[index], ...updates, updated_at: new Date().toISOString() };
      saveData();
      return data.products[index];
    }
    return null;
  },
  deleteProduct: (id: number) => {
    data.products = data.products.filter(p => p.id !== id);
    saveData();
  },

  getSales: () => data.sales,
  addSale: (sale: any) => {
    sale.id = Date.now();
    sale.created_at = new Date().toISOString();
    data.sales.push(sale);
    saveData();
    return sale;
  },
  deleteSale: (id: number) => {
    data.sales = data.sales.filter(s => s.id !== id);
    saveData();
  },

  getCustomerDebts: () => data.customerDebts,
  addCustomerDebt: (debt: any) => {
    debt.id = Date.now();
    debt.created_at = new Date().toISOString();
    debt.updated_at = new Date().toISOString();
    data.customerDebts.push(debt);
    saveData();
    return debt;
  },
  updateCustomerDebt: (id: number, updates: any) => {
    const index = data.customerDebts.findIndex(d => d.id === id);
    if (index !== -1) {
      data.customerDebts[index] = { ...data.customerDebts[index], ...updates, updated_at: new Date().toISOString() };
      saveData();
      return data.customerDebts[index];
    }
    return null;
  },
  deleteCustomerDebt: (id: number) => {
    data.customerDebts = data.customerDebts.filter(d => d.id !== id);
    saveData();
  },

  getSupplierDebts: () => data.supplierDebts,
  addSupplierDebt: (debt: any) => {
    debt.id = Date.now();
    debt.created_at = new Date().toISOString();
    debt.updated_at = new Date().toISOString();
    data.supplierDebts.push(debt);
    saveData();
    return debt;
  },
  updateSupplierDebt: (id: number, updates: any) => {
    const index = data.supplierDebts.findIndex(d => d.id === id);
    if (index !== -1) {
      data.supplierDebts[index] = { ...data.supplierDebts[index], ...updates, updated_at: new Date().toISOString() };
      saveData();
      return data.supplierDebts[index];
    }
    return null;
  },
  deleteSupplierDebt: (id: number) => {
    data.supplierDebts = data.supplierDebts.filter(d => d.id !== id);
    saveData();
  },

  getNotes: (productId?: number) => {
    if (productId) {
      return data.notes.filter(n => n.product_id === productId);
    }
    return data.notes;
  },
  addNote: (note: any) => {
    note.id = Date.now();
    note.created_at = new Date().toISOString();
    note.updated_at = new Date().toISOString();
    data.notes.push(note);
    saveData();
    return note;
  },
  updateNote: (id: number, content: string) => {
    const index = data.notes.findIndex(n => n.id === id);
    if (index !== -1) {
      data.notes[index] = { ...data.notes[index], content, updated_at: new Date().toISOString() };
      saveData();
      return data.notes[index];
    }
    return null;
  },
  deleteNote: (id: number) => {
    data.notes = data.notes.filter(n => n.id !== id);
    saveData();
  },
};
