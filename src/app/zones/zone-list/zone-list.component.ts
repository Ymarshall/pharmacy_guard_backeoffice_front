import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { ZoneService } from '../../services/zone.service';
import { Zone, ZoneType } from '../../models/zone.model';

@Component({
  selector: 'app-zone-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatSelectModule,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './zone-list.component.html',
  styleUrl: './zone-list.component.css'
})
export class ZoneListComponent implements OnInit {
  zones: Zone[] = [];
  filteredZones: Zone[] = [];
  displayedColumns: string[] = ['name', 'type', 'region', 'departement', 'isActive', 'actions'];
  isLoading = false;
  searchTerm = '';
  selectedType: string = '';
  selectedRegion: string = '';
  types = Object.values(ZoneType);
  regions: string[] = [];

  constructor(
    private zoneService: ZoneService,
    public router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadZones();
  }

  loadZones(): void {
    this.isLoading = true;
    this.zoneService.getAll().subscribe({
      next: (zones) => {
        this.zones = zones;
        this.filteredZones = zones;
        this.extractRegions();
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des zones:', error);
        this.snackBar.open('Erreur lors du chargement des zones', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  extractRegions(): void {
    const uniqueRegions = new Set(this.zones.map(z => z.region).filter(r => r));
    this.regions = Array.from(uniqueRegions).sort();
  }

  applyFilter(): void {
    let filtered = [...this.zones];

    // Filtre par recherche textuelle
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(zone =>
        zone.name.toLowerCase().includes(search) ||
        zone.region.toLowerCase().includes(search) ||
        zone.departement.toLowerCase().includes(search)
      );
    }

    // Filtre par type
    if (this.selectedType) {
      filtered = filtered.filter(zone => zone.type === this.selectedType);
    }

    // Filtre par région
    if (this.selectedRegion) {
      filtered = filtered.filter(zone => zone.region === this.selectedRegion);
    }

    this.filteredZones = filtered;
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  onTypeChange(): void {
    this.applyFilter();
  }

  onRegionChange(): void {
    this.applyFilter();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedRegion = '';
    this.applyFilter();
  }

  editZone(id: number): void {
    this.router.navigate(['/zones/edit', id]);
  }

  deleteZone(id: number, name: string): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la zone "${name}" ?`)) {
      this.zoneService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Zone supprimée avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadZones();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression de la zone', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  getTypeLabel(type: ZoneType): string {
    const labels: { [key: string]: string } = {
      'VILLE': 'Ville',
      'COMMUNE': 'Commune',
      'DEPARTEMENT': 'Département',
      'REGION': 'Région'
    };
    return labels[type] || type;
  }
}
