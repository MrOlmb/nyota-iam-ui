import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucideUsers,
  lucideKey,
  lucideShield,
  lucideFileText,
  lucideSettings,
  lucideBell,
  lucideBuilding2,
  lucideLock,
  lucideShare2,
  lucideMail,
  lucideServer,
  lucideDatabase,
} from '@ng-icons/lucide';

interface SettingCard {
  title: string;
  description: string;
  icon: string;
  route?: string;
  comingSoon?: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  providers: [
    provideIcons({
      lucideSearch,
      lucideUsers,
      lucideKey,
      lucideShield,
      lucideFileText,
      lucideSettings,
      lucideBell,
      lucideBuilding2,
      lucideLock,
      lucideShare2,
      lucideMail,
      lucideServer,
      lucideDatabase,
    }),
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  searchQuery = signal<string>('');

  settingCards: SettingCard[] = [
    {
      title: 'User Management',
      description: 'View and manage user roles in your organization.',
      icon: 'lucideUsers',
      route: '/users',
    },
    {
      title: 'Roles & Permissions',
      description: 'Configure roles and permissions for your system.',
      icon: 'lucideShield',
      route: '/roles',
    },
    {
      title: 'Authentication',
      description:
        'Configure login methods, multi-factor authentication, and SSO.',
      icon: 'lucideKey',
      comingSoon: true,
    },
    {
      title: 'Security & Identity',
      description:
        'Manage password policies, session settings, and security configurations.',
      icon: 'lucideLock',
      comingSoon: true,
    },
    {
      title: 'Audit Logs',
      description: 'View and manage audit logs on an organization level.',
      icon: 'lucideFileText',
      route: '/audit',
    },
    {
      title: 'API Tokens',
      description: 'View, manage and create API Tokens.',
      icon: 'lucideKey',
      comingSoon: true,
    },
    {
      title: 'Notifications',
      description:
        'Manage your notification related to attendance, security and shift scheduling.',
      icon: 'lucideBell',
      comingSoon: true,
    },
    {
      title: 'Organization',
      description: 'Manage organization basic info about your company.',
      icon: 'lucideBuilding2',
      comingSoon: true,
    },
    {
      title: 'Privacy',
      description:
        'View and change privacy-related settings on an organizational level.',
      icon: 'lucideShield',
      comingSoon: true,
    },
    {
      title: 'Integrations',
      description: 'View and configure your Insightful integrations.',
      icon: 'lucideShare2',
      comingSoon: true,
    },
    {
      title: 'Email Configuration',
      description: 'Manage email reports on an organization level.',
      icon: 'lucideMail',
      comingSoon: true,
    },
    {
      title: 'System Settings',
      description: 'View and configure general system settings.',
      icon: 'lucideServer',
      comingSoon: true,
    },
    {
      title: 'Backup & Recovery',
      description: 'View and manage backup settings for your organization.',
      icon: 'lucideDatabase',
      comingSoon: true,
    },
  ];

  get filteredCards(): SettingCard[] {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      return this.settingCards;
    }

    return this.settingCards.filter(
      (card) =>
        card.title.toLowerCase().includes(query) ||
        card.description.toLowerCase().includes(query)
    );
  }

  constructor(private router: Router) {}

  navigateToCard(card: SettingCard): void {
    if (card.comingSoon) {
      return;
    }
    if (card.route) {
      this.router.navigate([card.route]);
    }
  }
}
