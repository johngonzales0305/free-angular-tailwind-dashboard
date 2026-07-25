import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../services/product.service';
import { TableDropdownComponent } from '../../common/table-dropdown/table-dropdown.component';
import { AddProductFormComponent } from '../add-product-form/add-product-form.component'; 
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-product-list-table',
  standalone: true,
  imports: [CommonModule, FormsModule, TableDropdownComponent, AddProductFormComponent, ButtonComponent],
  templateUrl: './product-list-table.component.html'
})
export class ProductListTableComponent {
  protected readonly Math = Math; 
  private productService = inject(ProductService);
  
  products = this.productService.allProducts;
  
  // UI State
  searchQuery = signal<string>(''); 
  selected = signal<number[]>([]);
  sort = signal<{ key: keyof Product; asc: boolean }>({ key: 'name', asc: true });
  page = signal<number>(1);
  perPage = signal<number>(5); 
  isAddModalOpen = signal<boolean>(false);

  // Full Row Editing State
  editingId = signal<number | null>(null);
  tempProduct = signal<Product | null>(null);
  
  // Image Upload State
  isUploading = signal<boolean>(false);

  // --- Logic ---
  changePerPage(event: Event) {
    const val = parseInt((event.target as HTMLSelectElement).value, 10);
    this.perPage.set(val);
    this.page.set(1); // Reset to page 1
  }

  startEdit(product: Product) {
    this.editingId.set(product.id);
    this.tempProduct.set({ ...product });
  }

  saveEdit() {
    const product = this.tempProduct();
    if (product) {
      this.productService.updateProduct(product);
      this.resetEditState();
    }
  }

  cancelEdit() { this.resetEditState(); }

  private resetEditState() {
    this.editingId.set(null);
    this.tempProduct.set(null);
    this.isUploading.set(false);
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id);
      
      // Cleanup state if the deleted row was active
      if (this.editingId() === id) {
        this.resetEditState();
      }
      this.selected.update(list => list.filter(i => i !== id));
    }
  }

  openAddModal() { this.isAddModalOpen.set(true); }
  closeAddModal() { this.isAddModalOpen.set(false); }
  
  onProductAdded(newProduct: any) {
    this.productService.addProduct(newProduct);
    this.closeAddModal();
  }

  // --- Real Base64 Upload Logic for LocalStorage Persistence ---
  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Set loading state
      this.isUploading.set(true);
      
      const reader = new FileReader();
      reader.onload = () => {
        const base64ImageUrl = reader.result as string;
        
        // Update the temp product with persistent Base64 image
        this.tempProduct.update(currentProduct => {
          if (currentProduct) {
            return { 
              ...currentProduct, 
              imageUrl: base64ImageUrl,
              image: base64ImageUrl 
            } as Product;
          }
          return currentProduct;
        });
        
        this.isUploading.set(false);
      };

      reader.onerror = () => {
        console.error('Failed to read uploaded image file');
        this.isUploading.set(false);
      };

      // Read file as Base64 Data URL
      reader.readAsDataURL(file);
    }
  }

  // --- Computed ---
  filteredAndSorted = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.products().filter(p => 
      p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query)
    ).sort((a, b) => {
      const { key, asc } = this.sort();
      let valA: any = a[key];
      let valB: any = b[key];
      return asc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  });

  paginatedProducts = computed(() => {
    const start = (this.page() - 1) * this.perPage();
    return this.filteredAndSorted().slice(start, start + this.perPage());
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredAndSorted().length / this.perPage())));

  // --- Table Actions ---
  toggleSelect(id: number) { 
    this.selected.update(list => list.includes(id) ? list.filter(i => i !== id) : [...list, id]); 
  }

  toggleAll() {
    const pageIds = this.paginatedProducts().map(p => p.id);
    this.isAllSelected() 
      ? this.selected.update(l => l.filter(id => !pageIds.includes(id))) 
      : this.selected.update(l => [...new Set([...l, ...pageIds])]);
  }

  isAllSelected = computed(() => this.paginatedProducts().length > 0 && this.paginatedProducts().every(p => this.selected().includes(p.id)));
  
  sortBy(key: keyof Product) { this.sort.update(s => ({ key, asc: s.key === key ? !s.asc : true })); }
  
  prevPage() { if (this.page() > 1) this.page.update(p => p - 1); }
  nextPage() { if (this.page() < this.totalPages()) this.page.update(p => p + 1); }
  goToPage(n: number) { this.page.set(n); }
}