import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, Transaction } from '../../../services/product.service';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-list.component.html',
})
export class InvoiceListComponent {
  private productService = inject(ProductService);
  
  // 1. Expose Math for template calculations (Fixes TS2339 on Math)
  protected readonly Math = Math;
  
  public products = this.productService.allProducts;
  public completedTransactions = this.productService.completedTransactions;
  
  public isEditing = signal<boolean>(false);
  public searchTerm = signal<string>('');
  public sortColumn = signal<keyof Product | null>(null);
  public sortDirection = signal<'asc' | 'desc'>('asc');
  public currentPage = signal<number>(1);
  public pageSize = signal<number>(5);

  public filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    let data = [...this.products().filter(p => 
      p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)
    )];

    const col = this.sortColumn();
    if (col) {
      data.sort((a, b) => {
        let valA: any = a[col];
        let valB: any = b[col];
        if (valA instanceof Date) valA = valA.getTime();
        if (valB instanceof Date) valB = valB.getTime();
        return this.sortDirection() === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
    }
    return data;
  });

  public paginatedProducts = computed(() => {
    return this.productService.getPagedData(this.filteredProducts(), this.currentPage(), this.pageSize());
  });

  public totalToSell = computed(() => this.products().reduce((acc, p) => acc + (p.price * p.toSell), 0));
  public selectedCount = computed(() => this.products().filter(p => p.toSell > 0).length);
  public cumulativeRevenue = computed(() => this.completedTransactions().reduce((acc, tx) => acc + tx.totalRevenue, 0));

  toggleEdit() { this.isEditing.set(!this.isEditing()); }

  setSort(column: keyof Product) {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  changePage(page: number) { this.currentPage.set(page); }

  changePageSize(event: Event) {
    const size = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  private findProductIndex(id: number): number { return this.products().findIndex(p => p.id === id); }

  // 2. Added Implementation for setQty (Fixes TS2339 on setQty)
  setQty(productId: number, newQty: any) {
    // Convert input to a valid number
    const quantity = Math.max(0, parseInt(newQty, 10) || 0);
    const index = this.findProductIndex(productId);
    
    this.products.update(prev => {
      const updated = [...prev];
      const product = updated[index];
  
      // Force the value to not exceed the available stock
      const validatedQty = Math.min(quantity, product.stock);
      
      updated[index] = { ...updated[index], toSell: validatedQty };
      return updated;
    });
  }

  // 3. Added Implementation for updateBaseStock (Fixes TS2339)
  updateBaseStock(productId: number, newStock: any) {
    const stock = parseInt(newStock, 10) || 0;
    const index = this.findProductIndex(productId);
    this.products.update(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], stock: Math.max(stock, updated[index].toSell), lastUpdated: new Date() };
      return updated;
    });
  }

  // 4. Added Implementation for updateUnitPrice (Fixes TS2339 on updateUnitPrice)
  updateUnitPrice(productId: number, newPrice: any) {
    const price = parseFloat(newPrice) || 0;
    const index = this.findProductIndex(productId);
    this.products.update(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], price: Math.max(price, 0), priceLastUpdated: new Date() };
      return updated;
    });
  }

  updateQty(productId: number, change: number) {
    const index = this.findProductIndex(productId);
    this.products.update(prev => {
      const updated = [...prev];
      if (updated[index].toSell + change >= 0 && updated[index].toSell + change <= updated[index].stock) {
        updated[index] = { ...updated[index], toSell: updated[index].toSell + change };
      }
      return updated;
    });
  }

  submitTransaction() {
    const activeSales = this.products().filter(p => p.toSell > 0);
    if (activeSales.length === 0) return;

    const newTransaction: Transaction = {
      id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date(),
      itemsCount: activeSales.reduce((acc, p) => acc + p.toSell, 0),
      totalRevenue: this.totalToSell(),
      details: activeSales.map(p => ({ productName: p.name, qtySold: p.toSell, subtotal: p.price * p.toSell }))
    };

    this.products.update(prev => prev.map(p => p.toSell > 0 ? { ...p, stock: p.stock - p.toSell, toSell: 0, lastUpdated: new Date() } : p));
    this.productService.addTransaction(newTransaction);
  }
}