import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { PermissionService } from '../../services/permission.service';
import { RoleWithPermissions, Permission } from '../../models/role.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-role-details',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './role-details.component.html',
  styleUrl: './role-details.component.css'
})
export class RoleDetailsComponent implements OnInit {
  role: RoleWithPermissions | null = null;
  availablePermissions: Permission[] = [];
  isLoading: boolean = true;
  isLoadingPermissions: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';
  roleId: string = '';

  // For permission assignment
  showPermissionSelector: boolean = false;
  selectedPermissionIds: Set<string> = new Set();

  scopeLabels: Record<string, string> = {
    'SYSTEM': 'System',
    'TENANT': 'Ministry/Region',
    'OU': 'School/Department',
    'SITE': 'Campus/Building'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id') || '';
    if (this.roleId) {
      this.loadRole();
    } else {
      this.hasError = true;
      this.errorMessage = 'Invalid role ID';
      this.isLoading = false;
    }
  }

  loadRole(): void {
    this.isLoading = true;
    this.hasError = false;
    this.roleService.getRole(this.roleId).subscribe({
      next: (response) => {
        this.role = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading role:', error);
        this.hasError = true;
        this.errorMessage = 'Unable to load role details.';
        this.isLoading = false;
      }
    });
  }

  loadAvailablePermissions(): void {
    this.isLoadingPermissions = true;
    this.permissionService.getPermissions().subscribe({
      next: (response) => {
        this.availablePermissions = response.data || [];
        this.isLoadingPermissions = false;
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.isLoadingPermissions = false;
        alert('Failed to load available permissions.');
      }
    });
  }

  openPermissionSelector(): void {
    this.showPermissionSelector = true;
    if (this.availablePermissions.length === 0) {
      this.loadAvailablePermissions();
    }
  }

  closePermissionSelector(): void {
    this.showPermissionSelector = false;
    this.selectedPermissionIds.clear();
  }

  togglePermissionSelection(permissionId: string): void {
    if (this.selectedPermissionIds.has(permissionId)) {
      this.selectedPermissionIds.delete(permissionId);
    } else {
      this.selectedPermissionIds.add(permissionId);
    }
  }

  isPermissionSelected(permissionId: string): boolean {
    return this.selectedPermissionIds.has(permissionId);
  }

  isPermissionAlreadyAssigned(permissionId: string): boolean {
    return this.role?.permissions.some(p => p.id === permissionId) || false;
  }

  getUnassignedPermissions(): Permission[] {
    return this.availablePermissions.filter(p => !this.isPermissionAlreadyAssigned(p.id));
  }

  assignSelectedPermissions(): void {
    if (!this.role || this.selectedPermissionIds.size === 0) {
      return;
    }

    const permissionIds = Array.from(this.selectedPermissionIds);
    this.roleService.assignPermissions(this.role.id, permissionIds).subscribe({
      next: () => {
        this.loadRole();
        this.closePermissionSelector();
      },
      error: (error) => {
        console.error('Error assigning permissions:', error);
        alert('Failed to assign permissions. Please try again.');
      }
    });
  }

  removePermission(permission: Permission): void {
    if (!this.role) return;

    if (confirm(`Remove permission "${permission.name}" from this role?`)) {
      this.roleService.removePermission(this.role.id, permission.id).subscribe({
        next: () => {
          this.loadRole();
        },
        error: (error) => {
          console.error('Error removing permission:', error);
          alert('Failed to remove permission. Please try again.');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/roles']);
  }

  groupPermissionsByResource(): Map<string, Permission[]> {
    const grouped = new Map<string, Permission[]>();
    if (this.role) {
      for (const permission of this.role.permissions) {
        const resource = permission.resource || 'Other';
        if (!grouped.has(resource)) {
          grouped.set(resource, []);
        }
        grouped.get(resource)!.push(permission);
      }
    }
    return grouped;
  }
}
