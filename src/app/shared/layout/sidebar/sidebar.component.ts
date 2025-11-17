import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavItem {
  name: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { name: 'Dashboard', route: '/', icon: 'home' },
    { name: 'Users', route: '/users', icon: 'users' },
    { name: 'Roles', route: '/roles', icon: 'shield' },
    { name: 'Permissions', route: '/permissions', icon: 'key' },
    { name: 'Audit Logs', route: '/audit', icon: 'clipboard' }
  ];
}