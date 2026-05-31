import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService, Product } from '../../../services/product.service';
import { TableDropdownComponent } from '../../common/table-dropdown/table-dropdown.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { AddProductFormComponent } from '../add-product-form/add-product-form.component'; 

@Component({
  selector: 'app-product-list-table',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    TableDropdownComponent, 
    ButtonComponent, 
    FormsModule,
    AddProductFormComponent
  ],
  templateUrl: './product-list-table.component.html'
})
export class ProductListTableComponent {
  protected readonly Math = Math; 
  private productService = inject(ProductService);
  
  // Data State
  products = this.productService.allProducts;
  
  // UI State
  searchQuery = signal<string>(''); 
  selected = signal<number[]>([]);
  sort = signal<{ key: keyof Product; asc: boolean }>({ key: 'name', asc: true });
  page = signal<number>(1);
  perPage = 7;
  isAddModalOpen = signal<boolean>(false);

  constructor() {
    effect(() => {
      this.searchQuery(); 
      this.page.set(1);
    });
  }

  // --- Modal Interaction ---
  openAddModal() { this.isAddModalOpen.set(true); }
  closeAddModal() { this.isAddModalOpen.set(false); }

  /**
   * Called when AddProductFormComponent emits the (save) event.
   * @param newProductData The raw form value from the child component.
   */
  onProductAdded(newProduct: any) {
    console.log('Received product from form:', newProduct);
    this.productService.addProduct(newProduct); // This adds it to the signal
    this.closeAddModal(); // This closes the modal
  }

  // --- Table Data Logic ---
  filteredAndSorted = computed(() => {
    const query = this.searchQuery().toLowerCase();
    let data = this.products().filter(p => 
      p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query)
    );

    return data.sort((a, b) => {
      const { key, asc } = this.sort();
      let valA: any = a[key];
      let valB: any = b[key];
      
      // Handle Date sorting specifically
      if (valA instanceof Date) valA = valA.getTime();
      if (valB instanceof Date) valB = valB.getTime();
      
      return asc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  });

  paginatedProducts = computed(() => {
    const start = (this.page() - 1) * this.perPage;
    return this.filteredAndSorted().slice(start, start + this.perPage);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredAndSorted().length / this.perPage)));

  // --- UI Interactions ---
  toggleSelect(id: number) {
    this.selected.update(list => list.includes(id) ? list.filter(i => i !== id) : [...list, id]);
  }

  isAllSelected = computed(() => {
    const pageIds = this.paginatedProducts().map(p => p.id);
    return pageIds.length > 0 && pageIds.every(id => this.selected().includes(id));
  });

  toggleAll() {
    const pageIds = this.paginatedProducts().map(p => p.id);
    this.isAllSelected() 
      ? this.selected.update(list => list.filter(id => !pageIds.includes(id)))
      : this.selected.update(list => [...new Set([...list, ...pageIds])]);
  }

  sortBy(key: keyof Product) {
    this.sort.update(s => ({ key, asc: s.key === key ? !s.asc : true }));
  }

  prevPage() { if (this.page() > 1) this.page.update(p => p - 1); }
  nextPage() { if (this.page() < this.totalPages()) this.page.update(p => p + 1); }
  goToPage(n: number) { this.page.set(n); }
}