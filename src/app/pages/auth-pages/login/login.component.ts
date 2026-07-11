import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  showPassword = false;

  // Temporary hard-coded credentials (to be replaced by backend auth)
  private readonly validUsername = 'admin';
  private readonly validPassword = 'aaaaaa';

  constructor(private router: Router) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password.';
      return;
    }

    // TODO: Replace this with a real backend authentication call.
    if (
      this.username === this.validUsername &&
      this.password === this.validPassword
    ) {
      // Successful login - navigate to the dashboard
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Invalid username or password.';
    }
  }
}