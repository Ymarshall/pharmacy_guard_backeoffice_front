import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { ZoneService } from '../../services/zone.service';
import { ZoneCreateRequest, ZoneType } from '../../models/zone.model';

@Component({
  selector: 'app-zone-form',
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
    MatCheckboxModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './zone-form.component.html',
  styleUrl: './zone-form.component.css'
})
export class ZoneFormComponent implements OnInit {
  zoneForm: FormGroup;
  isEditMode = false;
  zoneId?: number;
  isLoading = false;
  isSubmitting = false;
  types = Object.values(ZoneType);
  typeLabels: { [key: string]: string } = {
    'VILLE': 'Ville',
    'COMMUNE': 'Commune',
    'DEPARTEMENT': 'Département',
    'REGION': 'Région'
  };

  constructor(
    private fb: FormBuilder,
    private zoneService: ZoneService,
    public router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.zoneForm = this.fb.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
      region: ['', [Validators.required]],
      departement: ['', [Validators.required]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.zoneId = +id;
      this.loadZone(this.zoneId);
    }
  }

  loadZone(id: number): void {
    this.isLoading = true;
    this.zoneService.getById(id).subscribe({
      next: (zone) => {
        this.zoneForm.patchValue({
          name: zone.name,
          type: zone.type,
          region: zone.region,
          departement: zone.departement,
          isActive: zone.isActive
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la zone:', error);
        this.snackBar.open('Erreur lors du chargement de la zone', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.zoneForm.valid) {
      this.isSubmitting = true;
      const formValue = this.zoneForm.value;
      const zoneData: ZoneCreateRequest = {
        name: formValue.name,
        type: formValue.type,
        region: formValue.region,
        departement: formValue.departement,
        isActive: formValue.isActive
      };

      if (this.isEditMode && this.zoneId) {
        this.zoneService.update(this.zoneId, zoneData).subscribe({
          next: () => {
            this.snackBar.open('Zone mise à jour avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/zones']);
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour:', error);
            this.snackBar.open('Erreur lors de la mise à jour de la zone', 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isSubmitting = false;
          }
        });
      } else {
        this.zoneService.create(zoneData).subscribe({
          next: () => {
            this.snackBar.open('Zone créée avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/zones']);
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            this.snackBar.open('Erreur lors de la création de la zone', 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isSubmitting = false;
          }
        });
      }
    } else {
      this.zoneForm.markAllAsTouched();
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.zoneForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Ce champ est requis';
    }
    return '';
  }
}
