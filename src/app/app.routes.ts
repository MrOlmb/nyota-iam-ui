import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () => import('./shared/layout/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'roles',
        loadComponent: () => import('./pages/roles/roles.component').then(m => m.RolesComponent)
      },
      {
        path: 'roles/:id',
        loadComponent: () => import('./pages/role-details/role-details.component').then(m => m.RoleDetailsComponent)
      },
      {
        path: 'permissions',
        loadComponent: () => import('./pages/permissions/permissions.component').then(m => m.PermissionsComponent)
      },
      {
        path: 'audit',
        loadComponent: () => import('./pages/audit/audit.component').then(m => m.AuditComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'organizations',
        loadComponent: () => import('./pages/organizations/organizations.component').then(m => m.OrganizationsComponent)
      },
      {
        path: 'help',
        loadComponent: () => import('./pages/help/help.component').then(m => m.HelpComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];