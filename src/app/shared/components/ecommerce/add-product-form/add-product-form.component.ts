import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
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

  // Mock Upload Signals
  isUploading = signal<boolean>(false);
  previewUrl = signal<string | null>(null);

  // Form definition matched to Product interface
  productForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    sku: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    imageUrl: [''],
    description: ['']
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

  // --- Mock Image Upload Logic ---
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  private handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    this.isUploading.set(true);

    // Simulate network delay for frontend upload
    setTimeout(() => {
      const url = URL.createObjectURL(file);
      this.previewUrl.set(url);
      this.productForm.patchValue({ imageUrl: url });
      this.isUploading.set(false);
    }, 800);
  }

  removeImage() {
    this.previewUrl.set(null);
    this.productForm.patchValue({ imageUrl: '' });
  }

  onPublish() {
    if (this.productForm.valid) {
      console.log('Form data being emitted:', this.productForm.value);
      this.save.emit(this.productForm.value);
    } else {
      this.productForm.markAllAsTouched();
      console.log('Form is invalid');
    }
  }
}