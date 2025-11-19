import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideHome,
  lucideUsers,
  lucideShield,
  lucideKey,
  lucideClipboardList,
  lucideChevronLeft,
  lucideChevronRight,
  lucideSettings,
  lucideBuilding2,
  lucideHelpCircle,
  lucideLogOut,
  lucideUser,
  lucideChevronDown,
} from '@ng-icons/lucide';
import { AuthService } from '../../../core/auth.service';

interface NavItem {
  name: string;
  route: string;
  icon: string;
}

interface DropdownItem {
  name: string;
  route?: string;
  action?: () => void;
  icon: string;
  divider?: boolean;
}

@Component({
  selector: 'app-spartan-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgIconComponent],
  providers: [
    provideIcons({
      lucideHome,
      lucideUsers,
      lucideShield,
      lucideKey,
      lucideClipboardList,
      lucideChevronLeft,
      lucideChevronRight,
      lucideSettings,
      lucideBuilding2,
      lucideHelpCircle,
      lucideLogOut,
      lucideUser,
      lucideChevronDown,
    }),
  ],
  templateUrl: './spartan-sidebar.component.html',
  styleUrl: './spartan-sidebar.component.css',
})
export class SpartanSidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isCollapsed = signal(false);
  isDropdownOpen = signal(false);

  currentUser$ = this.authService.currentUser$;

  navItems: NavItem[] = [
    { name: 'Dashboard', route: '/', icon: 'lucideHome' },
    { name: 'Users', route: '/users', icon: 'lucideUsers' },
    { name: 'Roles', route: '/roles', icon: 'lucideShield' },
    { name: 'Permissions', route: '/permissions', icon: 'lucideKey' },
    { name: 'Audit Logs', route: '/audit', icon: 'lucideClipboardList' },
  ];

  dropdownItems: DropdownItem[] = [
    {
      name: 'Personal Settings',
      route: '/settings',
      icon: 'lucideSettings',
    },
    {
      name: 'Organizations',
      route: '/organizations',
      icon: 'lucideBuilding2',
    },
    {
      name: 'Help',
      route: '/help',
      icon: 'lucideHelpCircle',
    },
    {
      name: 'Sign Out',
      action: () => this.logout(),
      icon: 'lucideLogOut',
      divider: true,
    },
  ];

  toggleSidebar() {
    this.isCollapsed.update((value) => !value);
  }

  toggleDropdown() {
    this.isDropdownOpen.update((value) => !value);
  }

  closeDropdown() {
    this.isDropdownOpen.set(false);
  }

  handleDropdownItemClick(item: DropdownItem) {
    if (item.action) {
      item.action();
    } else if (item.route) {
      this.router.navigate([item.route]);
      this.closeDropdown();
    }
  }

  logout() {
    this.authService.logout();
    this.closeDropdown();
  }

  getUserInitials(user: any): string {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    } else if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  }

  getUserRole(user: any): string {
    // TODO: Get role from user object when available
    return 'Administrator';
  }
}
