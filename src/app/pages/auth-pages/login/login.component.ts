import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  // NOTE: Firebase authenticates by email, so this field is used as the email.
  username = '';
  password = '';
  errorMessage = '';
  showPassword = false;
  loading = false;

  private router = inject(Router);
  private authService = inject(AuthService);

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = '';

    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    this.loading = true;
    try {
      await this.authService.login(this.username, this.password);
      // Successful login - navigate to the dashboard
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = this.mapFirebaseError(error?.code);
    } finally {
      this.loading = false;
    }
  }

  private mapFirebaseError(code: string): string {
    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return 'Login failed. Please try again.';
    }
  }
}
