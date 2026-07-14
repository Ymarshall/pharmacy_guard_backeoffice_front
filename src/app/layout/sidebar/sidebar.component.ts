import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  menuItems: MenuItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard', route: '/dashboard' },
    { label: 'Pharmacies', icon: 'local_pharmacy', route: '/pharmacies' },
    { label: 'Assurances', icon: 'verified_user', route: '/assurances' },
    { label: 'Numéros d\'urgence', icon: 'emergency', route: '/emergency-numbers' },
    { label: 'Périodes de garde', icon: 'schedule', route: '/duty-periods' },
    { label: 'Zones', icon: 'location_on', route: '/zones' },
    { label: 'Clients', icon: 'people', route: '/clients' },
    { label: 'Utilisateurs', icon: 'admin_panel_settings', route: '/users' },
    { label: 'Rapports', icon: 'assessment', route: '/rapports' },
    { label: 'Paramètres', icon: 'settings', route: '/parametres' }
  ];

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
