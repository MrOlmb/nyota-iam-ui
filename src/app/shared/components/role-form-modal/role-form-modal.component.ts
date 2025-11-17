import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Role, CreateRoleDto, UpdateRoleDto, RoleScope } from '../../../models/role.model';
import { RoleService } from '../../../services/role.service';

@Component({
  selector: 'app-role-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './role-form-modal.component.html',
  styleUrl: './role-form-modal.component.css'
})
export class RoleFormModalComponent implements OnInit {
  @Input() role: Role | null = null; // If provided, it's edit mode
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() roleSaved = new EventEmitter<Role>();

  roleForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  isEditMode: boolean = false;

  scopes: { value: RoleScope; label: string; description: string }[] = [
    { value: 'SYSTEM', label: 'System', description: 'System-wide role (all tenants)' },
    { value: 'TENANT', label: 'Ministry/Region', description: 'Ministry or regional level' },
    { value: 'OU', label: 'School/Department', description: 'School or department level' },
    { value: 'SITE', label: 'Campus/Building', description: 'Campus or building level' }
  ];

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService
  ) {
    this.roleForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Z0-9_]+$/)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      scope: ['TENANT', [Validators.required]],
      is_assignable: [true],
      tenant_id: [''],
      ou_id: [''],
      site_id: ['']
    });
  }

  ngOnInit(): void {
    if (this.role) {
      this.isEditMode = true;
      this.roleForm.patchValue({
        code: this.role.code,
        name: this.role.name,
        description: this.role.description || '',
        scope: this.role.scope,
        is_assignable: this.role.is_assignable,
        tenant_id: this.role.tenant_id || '',
        ou_id: this.role.ou_id || '',
        site_id: this.role.site_id || ''
      });

      // Code and scope cannot be changed in edit mode
      this.roleForm.get('code')?.disable();
      this.roleForm.get('scope')?.disable();
    }
  }

  get f() {
    return this.roleForm.controls;
  }

  onSubmit(): void {
    if (this.roleForm.invalid) {
      Object.keys(this.roleForm.controls).forEach(key => {
        this.roleForm.get(key)?.markAsTouched();
      });
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    if (this.isEditMode && this.role) {
      // Update existing role
      const updateData: UpdateRoleDto = {
        name: this.roleForm.value.name,
        description: this.roleForm.value.description || undefined,
        is_assignable: this.roleForm.value.is_assignable
      };

      this.roleService.updateRole(this.role.id, updateData).subscribe({
        next: (response) => {
          this.roleSaved.emit(response.data);
          this.close();
        },
        error: (error) => {
          console.error('Error updating role:', error);
          this.errorMessage = error.error?.message || 'Failed to update role. Please try again.';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      // Create new role
      const createData: CreateRoleDto = {
        code: this.roleForm.value.code,
        name: this.roleForm.value.name,
        description: this.roleForm.value.description || undefined,
        scope: this.roleForm.value.scope,
        is_assignable: this.roleForm.value.is_assignable,
        tenant_id: this.roleForm.value.tenant_id || undefined,
        ou_id: this.roleForm.value.ou_id || undefined,
        site_id: this.roleForm.value.site_id || undefined
      };

      this.roleService.createRole(createData).subscribe({
        next: (response) => {
          this.roleSaved.emit(response.data);
          this.close();
        },
        error: (error) => {
          console.error('Error creating role:', error);
          this.errorMessage = error.error?.message || 'Failed to create role. Please try again.';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  close(): void {
    this.roleForm.reset({
      scope: 'TENANT',
      is_assignable: true
    });
    this.errorMessage = '';
    this.isLoading = false;
    this.closeModal.emit();
  }
}
