import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { loginGuard } from './core/auth/login.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent),
    data: { title: 'Connexion' }
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent), data: { title: 'Tableau de bord' } },
      { path: 'pharmacies', loadComponent: () => import('./features/pharmacies/pharmacy-list/pharmacy-list.component').then(m => m.PharmacyListComponent), data: { title: 'Pharmacies' } },
      { path: 'pharmacies/new', loadComponent: () => import('./features/pharmacies/pharmacy-form/pharmacy-form.component').then(m => m.PharmacyFormComponent), data: { title: 'Nouvelle pharmacie' } },
      { path: 'pharmacies/edit/:id', loadComponent: () => import('./features/pharmacies/pharmacy-form/pharmacy-form.component').then(m => m.PharmacyFormComponent), data: { title: 'Modifier la pharmacie' } },
      { path: 'import-affiches', canActivate: [roleGuard(['ADMIN', 'OPERATOR'])], loadComponent: () => import('./features/poster-import/poster-import.component').then(m => m.PosterImportComponent), data: { title: 'Import d’affiches' } },
      { path: 'assurances', loadComponent: () => import('./features/assurances/assurance-list/assurance-list.component').then(m => m.AssuranceListComponent), data: { title: 'Assurances' } },
      { path: 'assurances/new', loadComponent: () => import('./features/assurances/assurance-form/assurance-form.component').then(m => m.AssuranceFormComponent), data: { title: 'Nouvelle assurance' } },
      { path: 'assurances/edit/:id', loadComponent: () => import('./features/assurances/assurance-form/assurance-form.component').then(m => m.AssuranceFormComponent), data: { title: 'Modifier l’assurance' } },
      { path: 'emergency-numbers', loadComponent: () => import('./features/emergency-numbers/emergency-number-list/emergency-number-list.component').then(m => m.EmergencyNumberListComponent), data: { title: 'Numéros d’urgence' } },
      { path: 'emergency-numbers/new', loadComponent: () => import('./features/emergency-numbers/emergency-number-form/emergency-number-form.component').then(m => m.EmergencyNumberFormComponent), data: { title: 'Nouveau numéro' } },
      { path: 'emergency-numbers/edit/:id', loadComponent: () => import('./features/emergency-numbers/emergency-number-form/emergency-number-form.component').then(m => m.EmergencyNumberFormComponent), data: { title: 'Modifier le numéro' } },
      { path: 'duties', loadComponent: () => import('./features/duties/duty-list/duty-list.component').then(m => m.DutyListComponent), data: { title: 'Fichiers de garde' } },
      { path: 'duties/new', loadComponent: () => import('./features/duties/duty-form/duty-form.component').then(m => m.DutyFormComponent), data: { title: 'Nouveau fichier' } },
      { path: 'duties/edit/:id', loadComponent: () => import('./features/duties/duty-form/duty-form.component').then(m => m.DutyFormComponent), data: { title: 'Modifier le fichier' } },
      { path: 'zones', loadComponent: () => import('./features/zones/zone-list/zone-list.component').then(m => m.ZoneListComponent), data: { title: 'Zones' } },
      { path: 'zones/new', loadComponent: () => import('./features/zones/zone-form/zone-form.component').then(m => m.ZoneFormComponent), data: { title: 'Nouvelle zone' } },
      { path: 'zones/edit/:id', loadComponent: () => import('./features/zones/zone-form/zone-form.component').then(m => m.ZoneFormComponent), data: { title: 'Modifier la zone' } },
      { path: 'duty-periods', loadComponent: () => import('./features/duty-periods/duty-period-list/duty-period-list.component').then(m => m.DutyPeriodListComponent), data: { title: 'Périodes de garde' } },
      { path: 'duty-periods/new', loadComponent: () => import('./features/duty-periods/duty-period-detail/duty-period-detail.component').then(m => m.DutyPeriodDetailComponent), data: { title: 'Nouvelle période' } },
      { path: 'duty-periods/:id', loadComponent: () => import('./features/duty-periods/duty-period-detail/duty-period-detail.component').then(m => m.DutyPeriodDetailComponent), data: { title: 'Période de garde' } },
      { path: 'rapports', loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent), data: { title: 'Rapports' } },
      { path: 'parametres', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent), data: { title: 'Paramètres' } },
      { path: 'clients', loadComponent: () => import('./features/clients/client-list/client-list.component').then(m => m.ClientListComponent), data: { title: 'Clients' } },
      { path: 'users', canActivate: [roleGuard(['ADMIN'])], loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent), data: { title: 'Utilisateurs' } },
      { path: 'users/new', canActivate: [roleGuard(['ADMIN'])], loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent), data: { title: 'Nouvel utilisateur' } },
      { path: 'users/edit/:id', canActivate: [roleGuard(['ADMIN'])], loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent), data: { title: 'Modifier l’utilisateur' } }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
