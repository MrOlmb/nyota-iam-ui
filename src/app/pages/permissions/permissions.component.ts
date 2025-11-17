import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionService } from '../../services/permission.service';
import { Permission } from '../../models/role.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.css'
})
export class PermissionsComponent implements OnInit {
  permissions: Permission[] = [];
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';

  // Filter and search
  searchTerm: string = '';
  selectedResource: string = 'all';
  selectedAction: string = 'all';

  constructor(private permissionService: PermissionService) {}

  ngOnInit(): void {
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.isLoading = true;
    this.hasError = false;
    this.permissionService.getPermissions().subscribe({
      next: (response) => {
        this.permissions = response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.hasError = true;
        this.errorMessage = 'Unable to load permissions. The API endpoint may not be implemented yet.';
        this.isLoading = false;
      }
    });
  }

  // Get unique resources for filtering
  getUniqueResources(): string[] {
    const resources = this.permissions.map(p => p.resource);
    return Array.from(new Set(resources)).sort();
  }

  // Get unique actions for filtering
  getUniqueActions(): string[] {
    const actions = this.permissions.map(p => p.action);
    return Array.from(new Set(actions)).sort();
  }

  // Filter permissions based on search and filters
  getFilteredPermissions(): Permission[] {
    return this.permissions.filter(permission => {
      // Search filter
      const matchesSearch = !this.searchTerm ||
        permission.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        permission.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        permission.description?.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Resource filter
      const matchesResource = this.selectedResource === 'all' || permission.resource === this.selectedResource;

      // Action filter
      const matchesAction = this.selectedAction === 'all' || permission.action === this.selectedAction;

      return matchesSearch && matchesResource && matchesAction;
    });
  }

  // Group permissions by resource
  getGroupedPermissions(): Map<string, Permission[]> {
    const filtered = this.getFilteredPermissions();
    const grouped = new Map<string, Permission[]>();

    for (const permission of filtered) {
      const resource = permission.resource || 'Other';
      if (!grouped.has(resource)) {
        grouped.set(resource, []);
      }
      grouped.get(resource)!.push(permission);
    }

    return grouped;
  }

  onSearchChange(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  onResourceFilterChange(event: Event): void {
    this.selectedResource = (event.target as HTMLSelectElement).value;
  }

  onActionFilterChange(event: Event): void {
    this.selectedAction = (event.target as HTMLSelectElement).value;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedResource = 'all';
    this.selectedAction = 'all';
  }
}
