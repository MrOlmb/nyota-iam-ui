import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucideDownload,
  lucideMoreVertical,
  lucidePencil,
  lucideTrash2,
  lucideShield,
  lucidePlus,
  lucideEye,
} from '@ng-icons/lucide';
import { RoleService } from '../../services/role.service';
import { Role } from '../../models/role.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { RoleFormModalComponent } from '../../shared/components/role-form-modal/role-form-modal.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    LoadingSpinnerComponent,
    RoleFormModalComponent,
  ],
  providers: [
    provideIcons({
      lucideSearch,
      lucideDownload,
      lucideMoreVertical,
      lucidePencil,
      lucideTrash2,
      lucideShield,
      lucidePlus,
      lucideEye,
    }),
  ],
  templateUrl: './roles.component.html',
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  filteredRoles: Role[] = [];
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';

  // Search
  searchQuery = signal<string>('');

  // Dropdown states
  openDropdownRoleId = signal<string | null>(null);

  // Modal state
  isModalOpen: boolean = false;
  selectedRole: Role | null = null;

  scopeLabels: Record<string, string> = {
    SYSTEM: 'System',
    TENANT: 'Ministry/Region',
    OU: 'School/Department',
    SITE: 'Campus/Building',
  };

  constructor(private roleService: RoleService, private router: Router) {}

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
        this.filterRoles();
      },
      error: (error) => {
        console.error('Error loading roles', error);
        // Use mock data for UI development
        this.loadMockData();
        this.isLoading = false;
      },
    });
  }

  loadMockData(): void {
    // Mock data for UI development
    this.roles = [
      {
        id: '1',
        code: 'SUPER_ADMIN',
        name: 'Super Administrator',
        description: 'Full system access with all permissions',
        scope: 'SYSTEM',
        level: 1000,
        is_system_role: true,
        is_assignable: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        code: 'ADMIN',
        name: 'Administrator',
        description: 'Administrative access to manage users and settings',
        scope: 'TENANT',
        level: 900,
        is_system_role: true,
        is_assignable: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '3',
        code: 'MANAGER',
        name: 'Manager',
        description: 'Can manage team members and view reports',
        scope: 'OU',
        level: 500,
        is_system_role: false,
        is_assignable: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '4',
        code: 'USER',
        name: 'User',
        description: 'Basic access to system resources',
        scope: 'TENANT',
        level: 100,
        is_system_role: true,
        is_assignable: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '5',
        code: 'AUDITOR',
        name: 'Auditor',
        description: 'Read-only access to audit logs and reports',
        scope: 'SYSTEM',
        level: 300,
        is_system_role: false,
        is_assignable: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    this.filterRoles();
  }

  filterRoles(): void {
    let filtered = [...this.roles];

    // Filter by search query
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.code.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query)
      );
    }

    this.filteredRoles = filtered;
  }

  onSearchChange(): void {
    this.filterRoles();
  }

  openCreateModal(): void {
    this.selectedRole = null;
    this.isModalOpen = true;
  }

  openEditModal(role: Role): void {
    this.selectedRole = role;
    this.isModalOpen = true;
    this.openDropdownRoleId.set(null);
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
    this.openDropdownRoleId.set(null);
  }

  deleteRole(role: Role): void {
    if (role.is_system_role) {
      alert('System roles cannot be deleted.');
      return;
    }

    if (
      confirm(
        `Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`
      )
    ) {
      this.roleService.deleteRole(role.id).subscribe({
        next: () => {
          this.loadRoles();
        },
        error: (error) => {
          console.error('Error deleting role', error);
          alert('Failed to delete role. It may still be assigned to users.');
        },
      });
    }
  }

  toggleActionDropdown(roleId: string): void {
    this.openDropdownRoleId.update((current) =>
      current === roleId ? null : roleId
    );
  }

  getScopeClass(scope: string): string {
    const classes: Record<string, string> = {
      SYSTEM: 'bg-purple-100 text-purple-800',
      TENANT: 'bg-blue-100 text-blue-800',
      OU: 'bg-green-100 text-green-800',
      SITE: 'bg-orange-100 text-orange-800',
    };
    return classes[scope] || 'bg-gray-100 text-gray-800';
  }

  getMockPermissionsCount(role: Role): number {
    // Mock permission counts based on role level
    if (role.level >= 1000) return 45;
    if (role.level >= 900) return 38;
    if (role.level >= 500) return 22;
    if (role.level >= 300) return 12;
    return 8;
  }

  getMockPermissionsList(role: Role): string[] {
    // Mock permission examples
    const allPermissions = [
      'users:read',
      'users:write',
      'users:delete',
      'roles:read',
      'roles:write',
      'roles:delete',
      'audit:read',
      'settings:read',
      'settings:write',
    ];

    const count = Math.min(this.getMockPermissionsCount(role), 3);
    return allPermissions.slice(0, count);
  }
}
