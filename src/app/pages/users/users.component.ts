import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucideDownload,
  lucideMoreVertical,
  lucidePencil,
  lucideTrash2,
  lucideShield,
  lucideUserCheck,
  lucideUserX,
  lucidePlus,
  lucideChevronDown,
} from '@ng-icons/lucide';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { UserFormModalComponent } from '../../shared/components/user-form-modal/user-form-modal.component';
import { format } from 'date-fns';

type UserStatus = 'all' | 'active' | 'inactive' | 'pending';
type UserRole = 'admin' | 'manager' | 'user';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    LoadingSpinnerComponent,
    PaginationComponent,
    UserFormModalComponent,
  ],
  providers: [
    provideIcons({
      lucideSearch,
      lucideDownload,
      lucideMoreVertical,
      lucidePencil,
      lucideTrash2,
      lucideShield,
      lucideUserCheck,
      lucideUserX,
      lucidePlus,
      lucideChevronDown,
    }),
  ],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';

  currentPage: number = 1;
  totalPages: number = 1;
  hasNext: boolean = false;
  hasPrev: boolean = false;

  // Tab state
  activeTab = signal<UserStatus>('all');
  tabs: { label: string; value: UserStatus; count: number }[] = [
    { label: 'All Users', value: 'all', count: 0 },
    { label: 'Active', value: 'active', count: 0 },
    { label: 'Inactive', value: 'inactive', count: 0 },
    { label: 'Pending', value: 'pending', count: 0 },
  ];

  // Search
  searchQuery = signal<string>('');

  // Dropdown states
  isAddUserDropdownOpen = signal(false);
  openDropdownUserId = signal<string | null>(null);

  // Modal state
  isModalOpen: boolean = false;
  selectedUser: User | null = null;
  selectedUserRole: UserRole | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(page: number = 1): void {
    this.isLoading = true;
    this.hasError = false;

    // For demo purposes, using mock data if API fails
    this.userService.getUsers(page, 20).subscribe({
      next: (response) => {
        this.users = response.data || [];
        this.currentPage = response.meta.page;
        this.totalPages = response.meta.total_pages;
        this.hasNext = response.meta.has_next;
        this.hasPrev = response.meta.has_prev;
        this.isLoading = false;
        this.updateTabCounts();
        this.filterUsers();
      },
      error: (error) => {
        console.error('Error loading users', error);
        // Use mock data for UI development
        this.loadMockData();
        this.isLoading = false;
      },
    });
  }

  loadMockData(): void {
    // Mock data for UI development
    this.users = [
      {
        id: '1',
        username: 'john.doe',
        email: 'john.doe@nyota.cg',
        first_name: 'John',
        last_name: 'Doe',
        status: 'ACTIVE',
        is_active: true,
        email_verified: true,
        phone_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      },
      {
        id: '2',
        username: 'jane.smith',
        email: 'jane.smith@nyota.cg',
        first_name: 'Jane',
        last_name: 'Smith',
        status: 'ACTIVE',
        is_active: true,
        email_verified: true,
        phone_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: '3',
        username: 'bob.johnson',
        email: 'bob.johnson@nyota.cg',
        first_name: 'Bob',
        last_name: 'Johnson',
        status: 'INACTIVE',
        is_active: false,
        email_verified: false,
        phone_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    this.updateTabCounts();
    this.filterUsers();
  }

  updateTabCounts(): void {
    this.tabs[0].count = this.users.length;
    this.tabs[1].count = this.users.filter((u) => u.status === 'ACTIVE').length;
    this.tabs[2].count = this.users.filter(
      (u) => u.status === 'INACTIVE' || u.status === 'SUSPENDED'
    ).length;
    this.tabs[3].count = this.users.filter((u) => !u.email_verified).length;
  }

  filterUsers(): void {
    let filtered = [...this.users];

    // Filter by tab
    const tab = this.activeTab();
    if (tab === 'active') {
      filtered = filtered.filter((u) => u.status === 'ACTIVE');
    } else if (tab === 'inactive') {
      filtered = filtered.filter(
        (u) => u.status === 'INACTIVE' || u.status === 'SUSPENDED'
      );
    } else if (tab === 'pending') {
      filtered = filtered.filter((u) => !u.email_verified);
    }

    // Filter by search query
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(
        (u) =>
          u.first_name.toLowerCase().includes(query) ||
          u.last_name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.username.toLowerCase().includes(query)
      );
    }

    this.filteredUsers = filtered;
  }

  onTabChange(tab: UserStatus): void {
    this.activeTab.set(tab);
    this.filterUsers();
  }

  onSearchChange(): void {
    this.filterUsers();
  }

  onPageChange(page: number): void {
    this.loadUsers(page);
  }

  toggleAddUserDropdown(): void {
    this.isAddUserDropdownOpen.update((value) => !value);
  }

  openCreateModal(role: UserRole = 'user'): void {
    this.selectedUser = null;
    this.selectedUserRole = role;
    this.isModalOpen = true;
    this.isAddUserDropdownOpen.set(false);
  }

  openEditModal(user: User): void {
    this.selectedUser = user;
    this.isModalOpen = true;
    this.openDropdownUserId.set(null);
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedUser = null;
    this.selectedUserRole = null;
  }

  onUserSaved(user: User): void {
    this.loadUsers(this.currentPage);
  }

  toggleUserStatus(user: User): void {
    const action = user.status === 'ACTIVE' ? 'deactivate' : 'activate';
    const confirmMessage =
      user.status === 'ACTIVE'
        ? `Are you sure you want to deactivate ${user.first_name} ${user.last_name}?`
        : `Are you sure you want to activate ${user.first_name} ${user.last_name}?`;

    if (confirm(confirmMessage)) {
      const request =
        user.status === 'ACTIVE'
          ? this.userService.deactivateUser(user.id)
          : this.userService.activateUser(user.id);

      request.subscribe({
        next: () => {
          this.loadUsers(this.currentPage);
        },
        error: (error) => {
          console.error(`Error ${action}ing user`, error);
          alert(`Failed to ${action} user. Please try again.`);
        },
      });
    }
  }

  deleteUser(id: string): void {
    if (
      confirm(
        'Are you sure you want to delete this user? This action cannot be undone.'
      )
    ) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers(this.currentPage);
        },
        error: (error) => {
          console.error('Error deleting user', error);
          alert('Failed to delete user. Please try again.');
        },
      });
    }
  }

  toggleActionDropdown(userId: string): void {
    this.openDropdownUserId.update((current) =>
      current === userId ? null : userId
    );
  }

  formatDate(date?: string): string {
    if (!date) return 'Never';
    return format(new Date(date), 'MMM dd, yyyy');
  }

  formatLastLogin(date?: string): string {
    if (!date) return 'Never logged in';
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      SUSPENDED: 'bg-yellow-100 text-yellow-800',
      LOCKED: 'bg-red-100 text-red-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getUserInitials(user: User): string {
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  }

  getUserRole(user: User): string {
    // TODO: Get from user data when available
    return user.id === '1' ? 'Administrator' : 'User';
  }

  getRoleClass(role: string): string {
    if (role === 'Administrator') {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-blue-100 text-blue-800';
  }
}
