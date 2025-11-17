import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  totalUsers: number = 0;
  totalRoles: number = 0;
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';

  constructor(
    private userService: UserService,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.userService.getUsers(1, 1).subscribe({
      next: (response) => {
        this.totalUsers = response.meta.total;
      },
      error: (error) => {
        console.error('Error loading users', error);
        this.hasError = true;
        this.errorMessage = 'Unable to load user statistics. The endpoint may not be available yet.';
      }
    });

    this.roleService.getRoles().subscribe({
      next: (response) => {
        this.totalRoles = response.data?.length || 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading roles', error);
        this.hasError = true;
        this.errorMessage = 'Unable to load role statistics. The endpoint may not be available yet.';
        this.isLoading = false;
      }
    });
  }
}