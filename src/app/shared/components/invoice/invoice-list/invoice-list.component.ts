import { Component, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  toSell: number; // The quantity selected via + / -
}

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-list.component.html',
})
export class InvoiceListComponent {
  // Use a Signal for the product list for automatic UI updates
  public products = signal<Product[]>([
    { id: 1, name: 'Premium watches', sku: 'BP-001', price: 1250.00, stock: 45, toSell: 0 },
    { id: 2, name: 'Premium bags', sku: 'EO-102', price: 2800.00, stock: 12, toSell: 0 },
    { id: 3, name: 'Air cooler', sku: 'AF-552', price: 450.00, stock: 30, toSell: 0 },
  ]);

  // Automatically calculate the total whenever a 'toSell' value changes
  public totalToSell = computed(() => {
    return this.products().reduce((acc, p) => acc + (p.price * p.toSell), 0);
  });

  updateQty(index: number, change: number) {
    this.products.update(prev => {
      const updated = [...prev];
      const product = { ...updated[index] }; // Create a shallow copy of the object
      const newQty = product.toSell + change;
  
      // Boundary Checks: 
      // 1. Cannot go below 0
      // 2. Cannot exceed the physical stock available
      if (newQty >= 0 && newQty <= product.stock) {
        product.toSell = newQty;
        updated[index] = product; // Re-insert the updated object
      }
      return updated;
    });
  }
}