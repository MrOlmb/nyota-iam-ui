import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Password requirements visibility
  showPasswordRequirements: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  get f() {
    return this.registerForm.controls;
  }

  // Check if password meets all requirements
  get passwordRequirements() {
    const password = this.registerForm.get('password')?.value || '';
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  }

  get allPasswordRequirementsMet(): boolean {
    const req = this.passwordRequirements;
    return req.minLength && req.hasUppercase && req.hasLowercase && req.hasNumber && req.hasSpecial;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    if (!this.allPasswordRequirementsMet) {
      this.errorMessage = 'Password does not meet all security requirements.';
      return;
    }

    this.isLoading = true;
    this.registerForm.disable(); // Disable form programmatically
    this.errorMessage = '';
    this.successMessage = '';

    const userData = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      first_name: this.registerForm.value.first_name,
      last_name: this.registerForm.value.last_name,
      phone: this.registerForm.value.phone || undefined,
      password: this.registerForm.value.password
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.successMessage = 'Registration successful! You can now log in.';

        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: { registered: 'true' }
          });
        }, 2000);
      },
      error: (error) => {
        console.error('Registration error:', error);

        // Extract error message from Kratos response
        if (error.response?.data?.ui?.messages) {
          const messages = error.response.data.ui.messages;
          this.errorMessage = messages.map((msg: any) => msg.text).join('. ');
        } else if (error.response?.data?.error?.message) {
          this.errorMessage = error.response.data.error.message;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }

        this.isLoading = false;
        this.registerForm.enable(); // Re-enable form on error
      },
      complete: () => {
        this.isLoading = false;
        this.registerForm.enable(); // Re-enable form when complete
      }
    });
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
