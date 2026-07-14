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
import { AssuranceService } from '../../services/assurance.service';
import { Assurance } from '../../models/pharmacy.model';

@Component({
  selector: 'app-assurance-list',
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
  templateUrl: './assurance-list.component.html',
  styleUrl: './assurance-list.component.css'
})
export class AssuranceListComponent implements OnInit {
  assurances: Assurance[] = [];
  filteredAssurances: Assurance[] = [];
  displayedColumns: string[] = ['id', 'name', 'description', 'actions'];
  isLoading = false;
  searchTerm = '';

  constructor(
    private assuranceService: AssuranceService,
    public router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAssurances();
  }

  loadAssurances(): void {
    this.isLoading = true;
    this.assuranceService.getAll().subscribe({
      next: (assurances) => {
        this.assurances = assurances;
        this.filteredAssurances = assurances;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des assurances:', error);
        this.snackBar.open('Erreur lors du chargement des assurances', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredAssurances = this.assurances;
      return;
    }

    const search = this.searchTerm.toLowerCase().trim();
    this.filteredAssurances = this.assurances.filter(assurance =>
      assurance.name.toLowerCase().includes(search) ||
      (assurance.description && assurance.description.toLowerCase().includes(search))
    );
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  editAssurance(id: number): void {
    this.router.navigate(['/assurances/edit', id]);
  }

  deleteAssurance(id: number, name: string): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'assurance "${name}" ?`)) {
      this.assuranceService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Assurance supprimée avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadAssurances();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression de l\'assurance', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}
