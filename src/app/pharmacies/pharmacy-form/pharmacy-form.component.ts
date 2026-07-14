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
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { PharmacyService } from '../../services/pharmacy.service';
import { AssuranceService } from '../../services/assurance.service';
import { Pharmacy, PharmacyCreateRequest, Assurance } from '../../models/pharmacy.model';

@Component({
  selector: 'app-pharmacy-form',
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
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './pharmacy-form.component.html',
  styleUrl: './pharmacy-form.component.css'
})
export class PharmacyFormComponent implements OnInit {
  pharmacyForm: FormGroup;
  assurances: Assurance[] = [];
  selectedAssurances: number[] = [];
  isEditMode = false;
  pharmacyId?: number;
  isLoading = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private pharmacyService: PharmacyService,
    private assuranceService: AssuranceService,
    public router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.pharmacyForm = this.fb.group({
      name: ['', [Validators.required]],
      pharmacistName: [''],
      phone1: ['', [Validators.required]],
      phone2: [''],
      email: ['', [Validators.required, Validators.email]],
      horaires: ['', [Validators.required]],
      city: ['', [Validators.required]],
      commune: ['', [Validators.required]],
      district: ['', [Validators.required]],
      description: [''],
      photo: [''],
      statut: ['ACTIF', [Validators.required]],
      location: ['', [Validators.required]],
      assuranceIds: [[]]
    });
  }

  ngOnInit(): void {
    this.loadAssurances();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.pharmacyId = +id;
      this.loadPharmacy(this.pharmacyId);
    }
  }

  loadAssurances(): void {
    this.assuranceService.getAll().subscribe({
      next: (assurances) => {
        this.assurances = assurances;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des assurances:', error);
        this.snackBar.open('Erreur lors du chargement des assurances', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadPharmacy(id: number): void {
    this.isLoading = true;
    this.pharmacyService.getById(id).subscribe({
      next: (pharmacy) => {
        this.pharmacyForm.patchValue({
          name: pharmacy.name,
          pharmacistName: pharmacy.pharmacistName || '',
          phone1: pharmacy.phone1,
          phone2: pharmacy.phone2 || '',
          email: pharmacy.email,
          horaires: pharmacy.horaires,
          city: pharmacy.city,
          commune: pharmacy.commune,
          district: pharmacy.district,
          description: pharmacy.description || '',
          photo: pharmacy.photo || '',
          statut: pharmacy.statut,
          location: pharmacy.location
        });
        
        // Extraire les IDs des assurances depuis le tableau assurances
        if (pharmacy.assurances && pharmacy.assurances.length > 0) {
          this.selectedAssurances = pharmacy.assurances.map(a => a.id!);
        } else if (pharmacy.assuranceIds) {
          this.selectedAssurances = pharmacy.assuranceIds;
        } else {
          this.selectedAssurances = [];
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la pharmacie:', error);
        this.snackBar.open('Erreur lors du chargement de la pharmacie', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  toggleAssurance(assuranceId: number): void {
    const index = this.selectedAssurances.indexOf(assuranceId);
    if (index > -1) {
      // Supprimer l'assurance
      this.selectedAssurances.splice(index, 1);
    } else {
      // Ajouter l'assurance
      this.selectedAssurances.push(assuranceId);
    }
    // Mettre à jour le formulaire
    this.pharmacyForm.patchValue({ assuranceIds: [...this.selectedAssurances] });
  }

  isAssuranceSelected(assuranceId: number): boolean {
    return this.selectedAssurances.includes(assuranceId);
  }

  removeAssurance(assuranceId: number): void {
    const index = this.selectedAssurances.indexOf(assuranceId);
    if (index > -1) {
      this.selectedAssurances.splice(index, 1);
      this.pharmacyForm.patchValue({ assuranceIds: [...this.selectedAssurances] });
    }
  }

  getSelectedAssurances(): Assurance[] {
    return this.assurances.filter(a => this.selectedAssurances.includes(a.id!));
  }

  getUnselectedAssurances(): Assurance[] {
    return this.assurances.filter(a => !this.selectedAssurances.includes(a.id!));
  }

  onSubmit(): void {
    if (this.pharmacyForm.valid) {
      this.isSubmitting = true;
      const formValue = this.pharmacyForm.value;
      const pharmacyData: PharmacyCreateRequest = {
        ...formValue,
        assuranceIds: this.selectedAssurances
      };

      if (this.isEditMode && this.pharmacyId) {
        this.pharmacyService.update(this.pharmacyId, pharmacyData).subscribe({
          next: () => {
            this.snackBar.open('Pharmacie mise à jour avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/pharmacies']);
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour:', error);
            this.snackBar.open('Erreur lors de la mise à jour de la pharmacie', 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isSubmitting = false;
          }
        });
      } else {
        this.pharmacyService.create(pharmacyData).subscribe({
          next: () => {
            this.snackBar.open('Pharmacie créée avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/pharmacies']);
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            this.snackBar.open('Erreur lors de la création de la pharmacie', 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isSubmitting = false;
          }
        });
      }
    } else {
      this.pharmacyForm.markAllAsTouched();
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.pharmacyForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (field?.hasError('email')) {
      return 'Email invalide';
    }
    return '';
  }
}
