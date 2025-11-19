import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SpartanSidebarComponent } from '../spartan-sidebar/spartan-sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SpartanSidebarComponent],
  template: `
    <div class="flex h-screen overflow-hidden">
      <app-spartan-sidebar></app-spartan-sidebar>
      <main class="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class AppLayoutComponent {}
