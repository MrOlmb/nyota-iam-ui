import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User, CreateUserDto, UpdateUserDto } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form-modal.component.html',
  styleUrl: './user-form-modal.component.css'
})
export class UserFormModalComponent implements OnInit {
  @Input() user: User | null = null; // If provided, it's edit mode
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() userSaved = new EventEmitter<User>();

  userForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      middle_name: [''],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    if (this.user) {
      this.isEditMode = true;
      this.userForm.patchValue({
        username: this.user.username,
        email: this.user.email,
        first_name: this.user.first_name,
        last_name: this.user.last_name,
        middle_name: this.user.middle_name || '',
        phone: this.user.phone || ''
      });

      // Remove password requirement for edit mode
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();

      // Username cannot be changed in edit mode
      this.userForm.get('username')?.disable();
    }
  }

  get f() {
    return this.userForm.controls;
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    if (this.isEditMode && this.user) {
      // Update existing user
      const updateData: UpdateUserDto = {
        first_name: this.userForm.value.first_name,
        last_name: this.userForm.value.last_name,
        middle_name: this.userForm.value.middle_name || undefined,
        phone: this.userForm.value.phone || undefined,
        email: this.userForm.value.email
      };

      this.userService.updateUser(this.user.id, updateData).subscribe({
        next: (response) => {
          this.userSaved.emit(response.data);
          this.close();
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.errorMessage = error.error?.message || 'Failed to update user. Please try again.';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      // Create new user
      const createData: CreateUserDto = {
        username: this.userForm.value.username,
        email: this.userForm.value.email,
        first_name: this.userForm.value.first_name,
        last_name: this.userForm.value.last_name,
        middle_name: this.userForm.value.middle_name || undefined,
        phone: this.userForm.value.phone || undefined,
        password: this.userForm.value.password
      };

      this.userService.createUser(createData).subscribe({
        next: (response) => {
          this.userSaved.emit(response.data);
          this.close();
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.errorMessage = error.error?.message || 'Failed to create user. Please try again.';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  close(): void {
    this.userForm.reset();
    this.errorMessage = '';
    this.isLoading = false;
    this.closeModal.emit();
  }
}
