import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { AssuranceService, AssuranceCreateRequest } from '../../services/assurance.service';

@Component({
  selector: 'app-assurance-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './assurance-form.component.html',
  styleUrl: './assurance-form.component.css'
})
export class AssuranceFormComponent implements OnInit {
  assuranceForm: FormGroup;
  isEditMode = false;
  assuranceId?: number;
  isLoading = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private assuranceService: AssuranceService,
    public router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.assuranceForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.assuranceId = +id;
      this.loadAssurance(this.assuranceId);
    }
  }

  loadAssurance(id: number): void {
    this.isLoading = true;
    this.assuranceService.getById(id).subscribe({
      next: (assurance) => {
        this.assuranceForm.patchValue({
          name: assurance.name,
          description: assurance.description || ''
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'assurance:', error);
        this.snackBar.open('Erreur lors du chargement de l\'assurance', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.assuranceForm.valid) {
      this.isSubmitting = true;
      const formValue = this.assuranceForm.value;
      const assuranceData: AssuranceCreateRequest = {
        name: formValue.name,
        description: formValue.description || undefined
      };

      if (this.isEditMode && this.assuranceId) {
        this.assuranceService.update(this.assuranceId, assuranceData).subscribe({
          next: () => {
            this.snackBar.open('Assurance mise à jour avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/assurances']);
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour:', error);
            this.snackBar.open('Erreur lors de la mise à jour de l\'assurance', 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isSubmitting = false;
          }
        });
      } else {
        this.assuranceService.create(assuranceData).subscribe({
          next: () => {
            this.snackBar.open('Assurance créée avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/assurances']);
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            this.snackBar.open('Erreur lors de la création de l\'assurance', 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isSubmitting = false;
          }
        });
      }
    } else {
      this.assuranceForm.markAllAsTouched();
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.assuranceForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Ce champ est requis';
    }
    return '';
  }
}
