import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideDownload,
  lucideFilter,
  lucideX,
  lucideUser,
  lucideActivity,
  lucideChevronDown,
} from '@ng-icons/lucide';
import { AuditService } from '../../services/audit.service';
import { AuditLog } from '../../models/audit.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { format, subDays } from 'date-fns';

type TabType = 'overview' | 'logs';
type DateRangeType = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'custom';

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    LoadingSpinnerComponent,
    PaginationComponent,
  ],
  providers: [
    provideIcons({
      lucideCalendar,
      lucideDownload,
      lucideFilter,
      lucideX,
      lucideUser,
      lucideActivity,
      lucideChevronDown,
    }),
  ],
  templateUrl: './audit.component.html',
})
export class AuditComponent implements OnInit {
  logs: AuditLog[] = [];
  filteredLogs: AuditLog[] = [];
  isLoading: boolean = true;

  currentPage: number = 1;
  totalPages: number = 1;
  hasNext: boolean = false;
  hasPrev: boolean = false;

  // Tab state
  activeTab = signal<TabType>('logs');

  // Date filter state
  selectedDateRange = signal<DateRangeType>('today');
  isDateDropdownOpen = signal(false);

  // Filter states
  isUserFilterOpen = signal(false);
  isActionFilterOpen = signal(false);
  selectedUsers = signal<string[]>([]);
  selectedActions = signal<string[]>([]);

  // Available filter options
  userOptions: FilterOption[] = [];
  actionOptions: FilterOption[] = [
    { label: 'Create', value: 'CREATE' },
    { label: 'Update', value: 'UPDATE' },
    { label: 'Delete', value: 'DELETE' },
    { label: 'Login', value: 'LOGIN' },
    { label: 'Logout', value: 'LOGOUT' },
    { label: 'Access', value: 'ACCESS' },
    { label: 'Export', value: 'EXPORT' },
  ];

  dateRangeOptions = [
    { label: 'Today', value: 'today' as DateRangeType },
    { label: 'Yesterday', value: 'yesterday' as DateRangeType },
    { label: 'Last 7 days', value: 'last7days' as DateRangeType },
    { label: 'Last 30 days', value: 'last30days' as DateRangeType },
  ];

  constructor(private auditService: AuditService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(page: number = 1): void {
    this.isLoading = true;

    this.auditService.getAuditLogs(page, 20).subscribe({
      next: (response) => {
        this.logs = response.data;
        this.currentPage = response.meta.page;
        this.totalPages = response.meta.total_pages;
        this.hasNext = response.meta.has_next;
        this.hasPrev = response.meta.has_prev;
        this.isLoading = false;
        this.extractFilterOptions();
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading audit logs', error);
        // Use mock data for UI development
        this.loadMockData();
        this.isLoading = false;
      },
    });
  }

  loadMockData(): void {
    // Mock audit log data
    const now = new Date();
    this.logs = [
      {
        id: '1',
        user_id: 'user-1',
        action: 'LOGIN',
        resource_type: 'User',
        resource_id: 'user-1',
        description: 'John Doe logged in successfully',
        status: 'SUCCESS',
        ip_address: '192.168.1.100',
        occurred_at: now.toISOString(),
      },
      {
        id: '2',
        user_id: 'user-2',
        action: 'CREATE',
        resource_type: 'User',
        resource_id: 'user-5',
        description: 'Jane Smith created a new user account',
        status: 'SUCCESS',
        ip_address: '192.168.1.101',
        occurred_at: subDays(now, 0).toISOString(),
      },
      {
        id: '3',
        user_id: 'user-1',
        action: 'UPDATE',
        resource_type: 'Role',
        resource_id: 'role-3',
        description: 'John Doe updated role permissions',
        status: 'SUCCESS',
        ip_address: '192.168.1.100',
        occurred_at: subDays(now, 0).toISOString(),
      },
      {
        id: '4',
        user_id: 'user-3',
        action: 'DELETE',
        resource_type: 'User',
        resource_id: 'user-10',
        description: 'Bob Johnson deleted user account',
        status: 'SUCCESS',
        ip_address: '192.168.1.102',
        occurred_at: subDays(now, 1).toISOString(),
      },
      {
        id: '5',
        user_id: 'user-2',
        action: 'LOGIN',
        resource_type: 'User',
        resource_id: 'user-2',
        description: 'Failed login attempt',
        status: 'FAILURE',
        ip_address: '192.168.1.200',
        occurred_at: subDays(now, 1).toISOString(),
      },
      {
        id: '6',
        user_id: 'user-1',
        action: 'EXPORT',
        resource_type: 'AuditLog',
        description: 'John Doe exported audit logs',
        status: 'SUCCESS',
        ip_address: '192.168.1.100',
        occurred_at: subDays(now, 2).toISOString(),
      },
      {
        id: '7',
        user_id: 'user-4',
        action: 'ACCESS',
        resource_type: 'Settings',
        resource_id: 'security-settings',
        description: 'Alice Brown accessed security settings',
        status: 'SUCCESS',
        ip_address: '192.168.1.103',
        occurred_at: subDays(now, 3).toISOString(),
      },
    ];

    this.extractFilterOptions();
    this.applyFilters();
  }

  extractFilterOptions(): void {
    // Extract unique users from logs
    const userMap = new Map<string, number>();
    this.logs.forEach((log) => {
      if (log.user_id) {
        userMap.set(log.user_id, (userMap.get(log.user_id) || 0) + 1);
      }
    });

    this.userOptions = Array.from(userMap.entries()).map(([userId, count]) => ({
      label: this.getUserName(userId),
      value: userId,
      count,
    }));
  }

  applyFilters(): void {
    let filtered = [...this.logs];

    // Apply date range filter
    const dateRange = this.selectedDateRange();
    const now = new Date();
    filtered = filtered.filter((log) => {
      const logDate = new Date(log.occurred_at);
      switch (dateRange) {
        case 'today':
          return logDate.toDateString() === now.toDateString();
        case 'yesterday':
          return logDate.toDateString() === subDays(now, 1).toDateString();
        case 'last7days':
          return logDate >= subDays(now, 7);
        case 'last30days':
          return logDate >= subDays(now, 30);
        default:
          return true;
      }
    });

    // Apply user filter
    const users = this.selectedUsers();
    if (users.length > 0) {
      filtered = filtered.filter((log) => log.user_id && users.includes(log.user_id));
    }

    // Apply action filter
    const actions = this.selectedActions();
    if (actions.length > 0) {
      filtered = filtered.filter((log) => actions.includes(log.action));
    }

    this.filteredLogs = filtered;
  }

  onTabChange(tab: TabType): void {
    this.activeTab.set(tab);
  }

  toggleDateDropdown(): void {
    this.isDateDropdownOpen.update((value) => !value);
  }

  selectDateRange(range: DateRangeType): void {
    this.selectedDateRange.set(range);
    this.isDateDropdownOpen.set(false);
    this.applyFilters();
  }

  toggleUserFilter(): void {
    this.isUserFilterOpen.update((value) => !value);
  }

  toggleActionFilter(): void {
    this.isActionFilterOpen.update((value) => !value);
  }

  toggleUserSelection(userId: string): void {
    this.selectedUsers.update((users) => {
      const index = users.indexOf(userId);
      if (index > -1) {
        return users.filter((u) => u !== userId);
      } else {
        return [...users, userId];
      }
    });
    this.applyFilters();
  }

  toggleActionSelection(action: string): void {
    this.selectedActions.update((actions) => {
      const index = actions.indexOf(action);
      if (index > -1) {
        return actions.filter((a) => a !== action);
      } else {
        return [...actions, action];
      }
    });
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedUsers.set([]);
    this.selectedActions.set([]);
    this.selectedDateRange.set('today');
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return (
      this.selectedUsers().length > 0 ||
      this.selectedActions().length > 0 ||
      this.selectedDateRange() !== 'today'
    );
  }

  onPageChange(page: number): void {
    this.loadLogs(page);
  }

  formatDateTime(date: string): string {
    return format(new Date(date), 'MMM dd, yyyy HH:mm:ss');
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      SUCCESS: 'bg-green-100 text-green-800',
      FAILURE: 'bg-red-100 text-red-800',
      PARTIAL: 'bg-yellow-100 text-yellow-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getActionClass(action: string): string {
    const classes: Record<string, string> = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
      LOGIN: 'bg-purple-100 text-purple-800',
      LOGOUT: 'bg-gray-100 text-gray-800',
      ACCESS: 'bg-orange-100 text-orange-800',
      EXPORT: 'bg-yellow-100 text-yellow-800',
    };
    return classes[action] || 'bg-gray-100 text-gray-800';
  }

  getUserName(userId: string): string {
    // Mock user names mapping
    const userNames: Record<string, string> = {
      'user-1': 'John Doe',
      'user-2': 'Jane Smith',
      'user-3': 'Bob Johnson',
      'user-4': 'Alice Brown',
    };
    return userNames[userId] || userId;
  }

  getDateRangeLabel(): string {
    const range = this.selectedDateRange();
    const option = this.dateRangeOptions.find((opt) => opt.value === range);
    return option ? option.label : 'Today';
  }
}
