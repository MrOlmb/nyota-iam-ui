import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { UserFormModalComponent } from '../../shared/components/user-form-modal/user-form-modal.component';
import { format } from 'date-fns';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, PaginationComponent, UserFormModalComponent],
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';

  currentPage: number = 1;
  totalPages: number = 1;
  hasNext: boolean = false;
  hasPrev: boolean = false;

  // Modal state
  isModalOpen: boolean = false;
  selectedUser: User | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(page: number = 1): void {
    this.isLoading = true;
    this.hasError = false;
    this.userService.getUsers(page, 20).subscribe({
      next: (response) => {
        this.users = response.data || [];
        this.currentPage = response.meta.page;
        this.totalPages = response.meta.total_pages;
        this.hasNext = response.meta.has_next;
        this.hasPrev = response.meta.has_prev;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users', error);
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = 'Unable to load users. The API endpoint may not be implemented yet.';
      }
    });
  }

  onPageChange(page: number): void {
    this.loadUsers(page);
  }

  openCreateModal(): void {
    this.selectedUser = null;
    this.isModalOpen = true;
  }

  openEditModal(user: User): void {
    this.selectedUser = user;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedUser = null;
  }

  onUserSaved(user: User): void {
    this.loadUsers(this.currentPage);
  }

  toggleUserStatus(user: User): void {
    const action = user.status === 'ACTIVE' ? 'deactivate' : 'activate';
    const confirmMessage = user.status === 'ACTIVE'
      ? `Are you sure you want to deactivate ${user.first_name} ${user.last_name}?`
      : `Are you sure you want to activate ${user.first_name} ${user.last_name}?`;

    if (confirm(confirmMessage)) {
      const request = user.status === 'ACTIVE'
        ? this.userService.deactivateUser(user.id)
        : this.userService.activateUser(user.id);

      request.subscribe({
        next: () => {
          this.loadUsers(this.currentPage);
        },
        error: (error) => {
          console.error(`Error ${action}ing user`, error);
          alert(`Failed to ${action} user. Please try again.`);
        }
      });
    }
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers(this.currentPage);
        },
        error: (error) => {
          console.error('Error deleting user', error);
          alert('Failed to delete user. Please try again.');
        }
      });
    }
  }

  formatDate(date: string): string {
    return format(new Date(date), 'MMM dd, yyyy');
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'INACTIVE': 'bg-gray-100 text-gray-800',
      'SUSPENDED': 'bg-yellow-100 text-yellow-800',
      'LOCKED': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }
}