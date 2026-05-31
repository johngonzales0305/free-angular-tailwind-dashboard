import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../ui/button/button.component';
import { LabelComponent } from '../../form/label/label.component';

@Component({
  selector: 'app-add-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    LabelComponent
  ],
  templateUrl: './add-product-form.component.html'
})
export class AddProductFormComponent {
  private fb = inject(FormBuilder);
  
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  // Form definition matched to Product interface
  productForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    sku: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    description: [''] // Included for flexibility
  });

  // Quantity increment/decrement logic
  incrementQuantity() {
    const currentStock = this.productForm.get('stock')?.value || 0;
    this.productForm.patchValue({ stock: currentStock + 1 });
  }

  decrementQuantity() {
    const currentStock = this.productForm.get('stock')?.value || 0;
    if (currentStock > 0) {
      this.productForm.patchValue({ stock: currentStock - 1 });
    }
  }

  onPublish() {
    if (this.productForm.valid) {
      console.log('Form data being emitted:', this.productForm.value); // Add this to debug
      this.save.emit(this.productForm.value);
    } else {
      this.productForm.markAllAsTouched();
      console.log('Form is invalid');
    }
  }
}