import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pg-brand">
      <span class="pg-brand-mark" aria-hidden="true">+</span>
      <div>
        <strong>Pharmacie de garde</strong>
        <small>Côte d’Ivoire</small>
      </div>
    </div>
    <nav class="pg-nav" aria-label="Navigation principale">
      @for (item of visible(); track item.route) {
        <a [routerLink]="item.route"
           routerLinkActive="is-active"
           [routerLinkActiveOptions]="{ exact: !!item.exact }">
          <mat-icon>{{ item.icon }}</mat-icon>
          <span>{{ item.label }}</span>
        </a>
      }
    </nav>
  `
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly items: NavItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard', route: '/dashboard', exact: true, roles: ['ADMIN', 'OPERATOR', 'READER'] },
    { label: 'Pharmacies', icon: 'local_pharmacy', route: '/pharmacies', roles: ['ADMIN', 'OPERATOR'] },
    { label: 'Import d’affiches', icon: 'upload_file', route: '/import-affiches', roles: ['ADMIN', 'OPERATOR'] },
    { label: 'Périodes de garde', icon: 'calendar_month', route: '/duty-periods', roles: ['ADMIN', 'OPERATOR'] },
    { label: 'Fichiers de garde', icon: 'description', route: '/duties', roles: ['ADMIN', 'OPERATOR'] },
    { label: 'Assurances', icon: 'verified_user', route: '/assurances', roles: ['ADMIN', 'OPERATOR'] },
    { label: 'Numéros d’urgence', icon: 'emergency', route: '/emergency-numbers', roles: ['ADMIN', 'OPERATOR'] },
    { label: 'Zones', icon: 'location_on', route: '/zones', roles: ['ADMIN', 'OPERATOR'] },
    { label: 'Clients', icon: 'people', route: '/clients', roles: ['ADMIN', 'OPERATOR'] },
    { label: 'Utilisateurs', icon: 'admin_panel_settings', route: '/users', roles: ['ADMIN'] },
    { label: 'Rapports', icon: 'monitoring', route: '/rapports', roles: ['ADMIN', 'OPERATOR', 'READER'] },
    { label: 'Paramètres', icon: 'settings', route: '/parametres', roles: ['ADMIN'] }
  ];

  readonly visible = computed(() => {
    const role = this.auth.user()?.role;
    if (!role) {
      return this.items;
    }
    return this.items.filter(item => item.roles.includes(role));
  });
}
