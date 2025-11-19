import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideUsers,
  lucideShield,
  lucideUserCheck,
  lucideUserX,
  lucideActivity,
  lucideArrowUpRight,
  lucideArrowDownRight,
  lucideClock,
} from '@ng-icons/lucide';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { AuditService } from '../../services/audit.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { AuditLog } from '../../models/audit.model';
import { format } from 'date-fns';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalRoles: number;
  recentLogins: number;
  failedLogins: number;
}

interface StatCard {
  title: string;
  value: number;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  change?: number;
  changeLabel?: string;
  route?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, NgIconComponent],
  providers: [
    provideIcons({
      lucideUsers,
      lucideShield,
      lucideUserCheck,
      lucideUserX,
      lucideActivity,
      lucideArrowUpRight,
      lucideArrowDownRight,
      lucideClock,
    }),
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalRoles: 0,
    recentLogins: 0,
    failedLogins: 0,
  };

  recentActivity: AuditLog[] = [];
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';

  statCards: StatCard[] = [];

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private auditService: AuditService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Load mock data for demo
    this.loadMockData();
    this.isLoading = false;
  }

  loadMockData(): void {
    // Mock statistics
    this.stats = {
      totalUsers: 1247,
      activeUsers: 1134,
      inactiveUsers: 113,
      totalRoles: 5,
      recentLogins: 89,
      failedLogins: 3,
    };

    // Mock recent activity
    const now = new Date();
    this.recentActivity = [
      {
        id: '1',
        user_id: 'user-1',
        action: 'LOGIN',
        resource_type: 'User',
        description: 'John Doe logged in successfully',
        status: 'SUCCESS',
        ip_address: '192.168.1.100',
        occurred_at: new Date(now.getTime() - 5 * 60000).toISOString(),
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
        occurred_at: new Date(now.getTime() - 15 * 60000).toISOString(),
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
        occurred_at: new Date(now.getTime() - 30 * 60000).toISOString(),
      },
      {
        id: '4',
        user_id: 'user-3',
        action: 'LOGIN',
        resource_type: 'User',
        description: 'Failed login attempt',
        status: 'FAILURE',
        ip_address: '192.168.1.200',
        occurred_at: new Date(now.getTime() - 45 * 60000).toISOString(),
      },
      {
        id: '5',
        user_id: 'user-4',
        action: 'ACCESS',
        resource_type: 'Settings',
        resource_id: 'security-settings',
        description: 'Alice Brown accessed security settings',
        status: 'SUCCESS',
        ip_address: '192.168.1.103',
        occurred_at: new Date(now.getTime() - 60 * 60000).toISOString(),
      },
    ];

    this.updateStatCards();
  }

  updateStatCards(): void {
    this.statCards = [
      {
        title: 'Total Users',
        value: this.stats.totalUsers,
        icon: 'lucideUsers',
        iconBgClass: 'bg-blue-100',
        iconColorClass: 'text-blue-600',
        change: 12,
        changeLabel: 'vs last month',
        route: '/users',
      },
      {
        title: 'Active Users',
        value: this.stats.activeUsers,
        icon: 'lucideUserCheck',
        iconBgClass: 'bg-green-100',
        iconColorClass: 'text-green-600',
        change: 8,
        changeLabel: 'vs last month',
        route: '/users',
      },
      {
        title: 'Inactive Users',
        value: this.stats.inactiveUsers,
        icon: 'lucideUserX',
        iconBgClass: 'bg-gray-100',
        iconColorClass: 'text-gray-600',
        change: -3,
        changeLabel: 'vs last month',
        route: '/users',
      },
      {
        title: 'Total Roles',
        value: this.stats.totalRoles,
        icon: 'lucideShield',
        iconBgClass: 'bg-purple-100',
        iconColorClass: 'text-purple-600',
        route: '/roles',
      },
      {
        title: 'Recent Logins (24h)',
        value: this.stats.recentLogins,
        icon: 'lucideActivity',
        iconBgClass: 'bg-primary-100',
        iconColorClass: 'text-primary-600',
        change: 15,
        changeLabel: 'vs yesterday',
      },
      {
        title: 'Failed Logins (24h)',
        value: this.stats.failedLogins,
        icon: 'lucideUserX',
        iconBgClass: 'bg-red-100',
        iconColorClass: 'text-red-600',
        change: -2,
        changeLabel: 'vs yesterday',
        route: '/audit',
      },
    ];
  }

  navigateToCard(card: StatCard): void {
    if (card.route) {
      this.router.navigate([card.route]);
    }
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return format(date, 'MMM dd, yyyy HH:mm');
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

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      SUCCESS: 'bg-green-100 text-green-800',
      FAILURE: 'bg-red-100 text-red-800',
      PARTIAL: 'bg-yellow-100 text-yellow-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getUserName(userId: string): string {
    const userNames: Record<string, string> = {
      'user-1': 'John Doe',
      'user-2': 'Jane Smith',
      'user-3': 'Bob Johnson',
      'user-4': 'Alice Brown',
    };
    return userNames[userId] || userId;
  }

  viewAllActivity(): void {
    this.router.navigate(['/audit']);
  }
}