import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PharmacyListComponent } from './pharmacies/pharmacy-list/pharmacy-list.component';
import { PharmacyFormComponent } from './pharmacies/pharmacy-form/pharmacy-form.component';
import { AssuranceListComponent } from './assurances/assurance-list/assurance-list.component';
import { AssuranceFormComponent } from './assurances/assurance-form/assurance-form.component';
import { EmergencyNumberListComponent } from './emergency-numbers/emergency-number-list/emergency-number-list.component';
import { EmergencyNumberFormComponent } from './emergency-numbers/emergency-number-form/emergency-number-form.component';
import { DutyListComponent } from './duties/duty-list/duty-list.component';
import { DutyFormComponent } from './duties/duty-form/duty-form.component';
import { ZoneListComponent } from './zones/zone-list/zone-list.component';
import { ZoneFormComponent } from './zones/zone-form/zone-form.component';
import { DutyPeriodListComponent } from './duty-periods/duty-period-list/duty-period-list.component';
import { DutyPeriodDetailComponent } from './duty-periods/duty-period-detail/duty-period-detail.component';
import { ReportsComponent } from './reports/reports.component';
import { SettingsComponent } from './settings/settings.component';
import { ClientListComponent } from './clients/client-list/client-list.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { UserFormComponent } from './users/user-form/user-form.component';
import { authGuard } from './auth.guard';
import { loginGuard } from './login.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'pharmacies', component: PharmacyListComponent, canActivate: [authGuard] },
  { path: 'pharmacies/new', component: PharmacyFormComponent, canActivate: [authGuard] },
  { path: 'pharmacies/edit/:id', component: PharmacyFormComponent, canActivate: [authGuard] },
  { path: 'assurances', component: AssuranceListComponent, canActivate: [authGuard] },
  { path: 'assurances/new', component: AssuranceFormComponent, canActivate: [authGuard] },
  { path: 'assurances/edit/:id', component: AssuranceFormComponent, canActivate: [authGuard] },
  { path: 'emergency-numbers', component: EmergencyNumberListComponent, canActivate: [authGuard] },
  { path: 'emergency-numbers/new', component: EmergencyNumberFormComponent, canActivate: [authGuard] },
  { path: 'emergency-numbers/edit/:id', component: EmergencyNumberFormComponent, canActivate: [authGuard] },
  { path: 'duties', component: DutyListComponent, canActivate: [authGuard] },
  { path: 'duties/new', component: DutyFormComponent, canActivate: [authGuard] },
  { path: 'duties/edit/:id', component: DutyFormComponent, canActivate: [authGuard] },
  { path: 'zones', component: ZoneListComponent, canActivate: [authGuard] },
  { path: 'zones/new', component: ZoneFormComponent, canActivate: [authGuard] },
  { path: 'zones/edit/:id', component: ZoneFormComponent, canActivate: [authGuard] },
  { path: 'duty-periods', component: DutyPeriodListComponent, canActivate: [authGuard] },
  { path: 'duty-periods/new', component: DutyPeriodDetailComponent, canActivate: [authGuard] },
  { path: 'duty-periods/:id', component: DutyPeriodDetailComponent, canActivate: [authGuard] },
  { path: 'rapports', component: ReportsComponent, canActivate: [authGuard] },
  { path: 'parametres', component: SettingsComponent, canActivate: [authGuard] },
  { path: 'clients', component: ClientListComponent, canActivate: [authGuard] },
  { path: 'users', component: UserListComponent, canActivate: [authGuard] },
  { path: 'users/new', component: UserFormComponent, canActivate: [authGuard] },
  { path: 'users/edit/:id', component: UserFormComponent, canActivate: [authGuard] }
];
