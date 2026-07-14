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
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { EmergencyNumberService } from '../../services/emergency-number.service';
import { EmergencyNumber, EmergencyCategory } from '../../models/emergency-number.model';

@Component({
  selector: 'app-emergency-number-list',
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
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './emergency-number-list.component.html',
  styleUrl: './emergency-number-list.component.css'
})
export class EmergencyNumberListComponent implements OnInit {
  emergencyNumbers: EmergencyNumber[] = [];
  filteredEmergencyNumbers: EmergencyNumber[] = [];
  displayedColumns: string[] = ['name', 'number', 'category', 'icon', 'color', 'description', 'actions'];
  isLoading = false;
  searchTerm = '';
  categoryLabels: { [key: string]: string } = {
    medical: 'Médical',
    fire: 'Pompiers',
    police: 'Police',
    bloodBank: 'Banque de sang',
    other: 'Autre'
  };

  constructor(
    private emergencyNumberService: EmergencyNumberService,
    public router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEmergencyNumbers();
  }

  loadEmergencyNumbers(): void {
    this.isLoading = true;
    this.emergencyNumberService.getAll().subscribe({
      next: (numbers) => {
        this.emergencyNumbers = numbers;
        this.filteredEmergencyNumbers = numbers;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des numéros d\'urgence:', error);
        this.snackBar.open('Erreur lors du chargement des numéros d\'urgence', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredEmergencyNumbers = this.emergencyNumbers;
      return;
    }

    const search = this.searchTerm.toLowerCase().trim();
    this.filteredEmergencyNumbers = this.emergencyNumbers.filter(number =>
      number.name.toLowerCase().includes(search) ||
      number.number.toLowerCase().includes(search) ||
      (number.description && number.description.toLowerCase().includes(search))
    );
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  editEmergencyNumber(id: number): void {
    this.router.navigate(['/emergency-numbers/edit', id]);
  }

  deleteEmergencyNumber(id: number, name: string): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le numéro d'urgence "${name}" ?`)) {
      this.emergencyNumberService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Numéro d\'urgence supprimé avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadEmergencyNumbers();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression du numéro d\'urgence', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}
