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
        if (valA instanceof Date) valA = new Date(valA).getTime();
        if (valB instanceof Date) valB = new Date(valB).getTime();
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

  toggleEdit() { 
    this.isEditing.set(!this.isEditing()); 
  }

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

  setQty(productId: number, newQty: any) {
    const quantity = Math.max(0, parseInt(newQty, 10) || 0);
    const product = this.products().find(p => p.id === productId);
    if (!product) return;

    const validatedQty = Math.min(quantity, product.stock);
    this.productService.updateProduct({
      ...product,
      toSell: validatedQty
    });
  }

  updateBaseStock(productId: number, newStock: any) {
    const stock = parseInt(newStock, 10) || 0;
    const product = this.products().find(p => p.id === productId);
    if (!product) return;

    this.productService.updateProduct({
      ...product,
      stock: Math.max(stock, product.toSell),
      lastUpdated: new Date()
    });
  }

  updateUnitPrice(productId: number, newPrice: any) {
    const price = parseFloat(newPrice) || 0;
    const product = this.products().find(p => p.id === productId);
    if (!product) return;

    this.productService.updateProduct({
      ...product,
      price: Math.max(price, 0),
      priceLastUpdated: new Date()
    });
  }

  updateQty(productId: number, change: number) {
    const product = this.products().find(p => p.id === productId);
    if (!product) return;

    const nextQty = product.toSell + change;
    if (nextQty >= 0 && nextQty <= product.stock) {
      this.productService.updateProduct({
        ...product,
        toSell: nextQty
      });
    }
  }

  submitTransaction() {
    const activeSales = this.products().filter(p => p.toSell > 0);
    if (activeSales.length === 0) return;

    const newTransaction: Transaction = {
      id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date(),
      itemsCount: activeSales.reduce((acc, p) => acc + p.toSell, 0),
      totalRevenue: this.totalToSell(),
      details: activeSales.map((p: any) => ({ 
        productName: p.name, 
        qtySold: p.toSell, 
        subtotal: p.price * p.toSell,
        image: p.image || p.imageUrl || '',
        imageUrl: p.imageUrl || p.image || ''
      }))
    };

    // Deduct stock, clear qty to sell & update local storage state
    activeSales.forEach(p => {
      this.productService.updateProduct({
        ...p,
        stock: p.stock - p.toSell,
        toSell: 0,
        lastUpdated: new Date()
      });
    });

    // Save transaction
    this.productService.addTransaction(newTransaction);
  }
}