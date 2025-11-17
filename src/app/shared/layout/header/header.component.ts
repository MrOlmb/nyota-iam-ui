import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm">
      <div class="flex flex-1"></div>
      <div class="flex items-center gap-x-4">
        <div class="flex items-center gap-x-2">
          <svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm font-semibold">{{ username }}</span>
        </div>
        <button (click)="logout()" class="btn btn-secondary btn-sm">
          Sign out
        </button>
      </div>
    </header>
  `
})
export class HeaderComponent {
  username: string = '';

  constructor(private authService: AuthService) {
    const user = this.authService.getCurrentUser();
    this.username = user?.username || 'User';
  }

  logout(): void {
    this.authService.logout();
  }
}