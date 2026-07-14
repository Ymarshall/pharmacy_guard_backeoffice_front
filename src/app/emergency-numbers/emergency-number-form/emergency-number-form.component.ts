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
import { EmergencyNumberService } from '../../services/emergency-number.service';
import { EmergencyNumberCreateRequest, EmergencyCategory } from '../../models/emergency-number.model';
import {MatSelectModule} from '@angular/material/select';

@Component({
  selector: 'app-emergency-number-form',
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
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './emergency-number-form.component.html',
  styleUrl: './emergency-number-form.component.css'
})
export class EmergencyNumberFormComponent implements OnInit {
  emergencyNumberForm: FormGroup;
  isEditMode = false;
  emergencyNumberId?: number;
  isLoading = false;
  isSubmitting = false;
  categories = Object.values(EmergencyCategory);
  categoryLabels: { [key: string]: string } = {
    medical: 'Médical',
    fire: 'Pompiers',
    police: 'Police',
    bloodBank: 'Banque de sang',
    other: 'Autre'
  };

  constructor(
    private fb: FormBuilder,
    private emergencyNumberService: EmergencyNumberService,
    public router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.emergencyNumberForm = this.fb.group({
      name: ['', [Validators.required]],
      number: ['', [Validators.required]],
      icon: [''],
      description: [''],
      color: [''],
      category: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.emergencyNumberId = +id;
      this.loadEmergencyNumber(this.emergencyNumberId);
    }
  }

  loadEmergencyNumber(id: number): void {
    this.isLoading = true;
    this.emergencyNumberService.getById(id).subscribe({
      next: (emergencyNumber) => {
        this.emergencyNumberForm.patchValue({
          name: emergencyNumber.name,
          number: emergencyNumber.number,
          icon: emergencyNumber.icon || '',
          description: emergencyNumber.description || '',
          color: emergencyNumber.color || '',
          category: emergencyNumber.category || ''
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du numéro d\'urgence:', error);
        this.snackBar.open('Erreur lors du chargement du numéro d\'urgence', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.emergencyNumberForm.valid) {
      this.isSubmitting = true;
      const formValue = this.emergencyNumberForm.value;
      const emergencyNumberData: EmergencyNumberCreateRequest = {
        name: formValue.name,
        number: formValue.number,
        icon: formValue.icon || undefined,
        description: formValue.description || undefined,
        color: formValue.color || undefined,
        category: formValue.category || undefined
      };

      if (this.isEditMode && this.emergencyNumberId) {
        this.emergencyNumberService.update(this.emergencyNumberId, emergencyNumberData).subscribe({
          next: () => {
            this.snackBar.open('Numéro d\'urgence mis à jour avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/emergency-numbers']);
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour:', error);
            this.snackBar.open('Erreur lors de la mise à jour du numéro d\'urgence', 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isSubmitting = false;
          }
        });
      } else {
        this.emergencyNumberService.create(emergencyNumberData).subscribe({
          next: () => {
            this.snackBar.open('Numéro d\'urgence créé avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/emergency-numbers']);
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            this.snackBar.open('Erreur lors de la création du numéro d\'urgence', 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isSubmitting = false;
          }
        });
      }
    } else {
      this.emergencyNumberForm.markAllAsTouched();
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.emergencyNumberForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Ce champ est requis';
    }
    return '';
  }
}
