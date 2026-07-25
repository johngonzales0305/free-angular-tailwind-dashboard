import { Injectable, signal } from '@angular/core';

export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  toSell: number;
  lastUpdated: Date;
  priceLastUpdated: Date;
  imageUrl?: string;
  image?: string;
}

export interface TransactionDetail {
  productName: string;
  qtySold: number;
  subtotal: number;
  imageUrl?: string;
  image?: string;
}

export interface Transaction {
  id: string;
  timestamp: Date;
  itemsCount: number;
  totalRevenue: number;
  details: TransactionDetail[];
}

const STORAGE_KEY_PRODUCTS = 'app_products_data';
const STORAGE_KEY_TRANSACTIONS = 'app_transactions_data';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private initialData: Product[] = [
    { id: 1, name: 'Premium watches', sku: 'BP-001', price: 1250.00, stock: 45, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 2, name: 'Premium bags', sku: 'EO-102', price: 2800.00, stock: 12, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 3, name: 'Air cooler', sku: 'AF-552', price: 450.00, stock: 30, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 4, name: 'Wireless Mouse', sku: 'WM-889', price: 850.00, stock: 100, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 5, name: 'Mechanical Keyboard', sku: 'KB-202', price: 3200.00, stock: 25, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 6, name: 'Gaming Monitor 27"', sku: 'GM-270', price: 12500.00, stock: 15, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 7, name: 'Noise Cancelling Headphones', sku: 'NC-700', price: 6490.00, stock: 20, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 8, name: 'USB-C Multiport Hub', sku: 'HB-088', price: 1150.00, stock: 60, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 9, name: 'Ergonomic Desk Chair', sku: 'EC-505', price: 8900.00, stock: 8, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 10, name: 'Smart Fitness Band', sku: 'FB-110', price: 1850.00, stock: 50, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 11, name: 'Portable SSD 1TB', sku: 'HD-100', price: 4990.00, stock: 35, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 12, name: 'Desk LED Lamp', sku: 'DL-012', price: 650.00, stock: 40, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 13, name: 'Bluetooth Speaker', sku: 'BS-303', price: 2100.00, stock: 18, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 14, name: '4K Action Camera', sku: 'AC-404', price: 7800.00, stock: 14, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 15, name: 'Smart Video Doorbell', sku: 'VD-505', price: 3450.00, stock: 22, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 16, name: 'Fast Wireless Charger', sku: 'WC-606', price: 990.00, stock: 80, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 17, name: 'Power Bank 20,000mAh', sku: 'PB-707', price: 1590.00, stock: 42, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 18, name: 'Laptop Cooling Pad', sku: 'CP-808', price: 750.00, stock: 30, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 19, name: 'Smart RGB Bulb Pack', sku: 'LB-909', price: 1290.00, stock: 65, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 20, name: 'HD Webcam 1080p', sku: 'WC-101', price: 1890.00, stock: 28, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 21, name: 'Condenser Microphone', sku: 'CM-202', price: 2950.00, stock: 16, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 22, name: 'Graphic Drawing Tablet', sku: 'GT-303', price: 4200.00, stock: 11, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 23, name: 'Electric Air Duster', sku: 'AD-404', price: 1100.00, stock: 33, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 24, name: 'Wi-Fi 6 Router', sku: 'WR-505', price: 3600.00, stock: 19, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() },
    { id: 25, name: 'Cable Management Box', sku: 'CB-606', price: 380.00, stock: 95, toSell: 0, lastUpdated: new Date(), priceLastUpdated: new Date() }
  ];

  public allProducts = signal<Product[]>(this.loadProducts());
  public completedTransactions = signal<Transaction[]>(this.loadTransactions());

  private loadProducts(): Product[] {
    const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored products', e);
      }
    }
    return this.initialData;
  }

  private loadTransactions(): Transaction[] {
    const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored transactions', e);
      }
    }
    return [];
  }

  private saveProducts(products: Product[]) {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  }

  private saveTransactions(txs: Transaction[]) {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(txs));
  }

  addProduct(newProduct: any) {
    const img = newProduct.imageUrl || newProduct.image || '';
    const product: Product = {
      id: Date.now(),
      name: newProduct.name,
      sku: newProduct.sku,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
      toSell: 0,
      lastUpdated: new Date(),
      priceLastUpdated: new Date(),
      imageUrl: img,
      image: img
    };

    this.allProducts.update(products => {
      const next = [...products, product];
      this.saveProducts(next);
      return next;
    });
  }

  updateProduct(updatedProduct: Product) {
    const img = updatedProduct.imageUrl || updatedProduct.image || '';

    this.allProducts.update(products => {
      const next = products.map(p =>
        p.id === updatedProduct.id
          ? { ...p, ...updatedProduct, imageUrl: img, image: img }
          : p
      );
      this.saveProducts(next);
      return next;
    });
  }

  deleteProduct(id: number) {
    this.allProducts.update(products => {
      const next = products.filter(p => p.id !== id);
      this.saveProducts(next);
      return next;
    });
  }

  addTransaction(tx: Transaction) {
    this.completedTransactions.update(prev => {
      const next = [tx, ...prev];
      this.saveTransactions(next);
      return next;
    });
  }

  getPagedData(data: Product[], page: number, pageSize: number): Product[] {
    const startIndex = (page - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }
}