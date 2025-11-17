import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { Role } from '../../models/role.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { RoleFormModalComponent } from '../../shared/components/role-form-modal/role-form-modal.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, RoleFormModalComponent],
  templateUrl: './roles.component.html'
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';

  // Modal state
  isModalOpen: boolean = false;
  selectedRole: Role | null = null;

  scopeLabels: Record<string, string> = {
    'SYSTEM': 'System',
    'TENANT': 'Ministry/Region',
    'OU': 'School/Department',
    'SITE': 'Campus/Building'
  };

  constructor(
    private roleService: RoleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoading = true;
    this.hasError = false;
    this.roleService.getRoles().subscribe({
      next: (response) => {
        this.roles = response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading roles', error);
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = 'Unable to load roles. The API endpoint may not be implemented yet.';
      }
    });
  }

  openCreateModal(): void {
    this.selectedRole = null;
    this.isModalOpen = true;
  }

  openEditModal(role: Role): void {
    this.selectedRole = role;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedRole = null;
  }

  onRoleSaved(role: Role): void {
    this.loadRoles();
  }

  viewRoleDetails(role: Role): void {
    this.router.navigate(['/roles', role.id]);
  }

  deleteRole(role: Role): void {
    if (role.is_system_role) {
      alert('System roles cannot be deleted.');
      return;
    }

    if (confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
      this.roleService.deleteRole(role.id).subscribe({
        next: () => {
          this.loadRoles();
        },
        error: (error) => {
          console.error('Error deleting role', error);
          alert('Failed to delete role. It may still be assigned to users.');
        }
      });
    }
  }
}