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
import { DutyService } from '../../services/duty.service';
import { DutyCreateRequest } from '../../models/duty.model';

@Component({
  selector: 'app-duty-form',
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
  templateUrl: './duty-form.component.html',
  styleUrl: './duty-form.component.css'
})
export class DutyFormComponent implements OnInit {
  dutyForm: FormGroup;
  isEditMode = false;
  dutyId?: number;
  isLoading = false;
  isSubmitting = false;
  selectedFile: File | null = null;
  fileName: string = '';

  constructor(
    private fb: FormBuilder,
    private dutyService: DutyService,
    public router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.dutyForm = this.fb.group({
      name: [''],
      description: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.dutyId = +id;
      this.loadDuty(this.dutyId);
    }
  }

  loadDuty(id: number): void {
    this.isLoading = true;
    this.dutyService.getById(id).subscribe({
      next: (duty) => {
        this.dutyForm.patchValue({
          name: duty.name || '',
          description: duty.description || ''
        });
        this.fileName = duty.fileName || '';
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la garde:', error);
        this.snackBar.open('Erreur lors du chargement de la garde', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
      const allowedExtensions = ['.pdf', '.jpg', '.jpeg'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidType = allowedTypes.includes(file.type) || 
                         allowedExtensions.includes(fileExtension);
      
      if (isValidType) {
        this.selectedFile = file;
        this.fileName = this.selectedFile.name;
      } else {
        this.snackBar.open('Seuls les fichiers PDF et JPEG sont autorisés', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        // Réinitialiser l'input
        if (input) {
          input.value = '';
        }
      }
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.fileName = '';
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    if (this.dutyForm.valid) {
      this.isSubmitting = true;
      const formValue = this.dutyForm.value;
      const dutyData: DutyCreateRequest = {
        name: formValue.name || undefined,
        description: formValue.description || undefined,
        file: this.selectedFile || undefined
      };

      if (this.isEditMode && this.dutyId) {
        this.dutyService.update(this.dutyId, dutyData).subscribe({
          next: () => {
            this.snackBar.open('Garde mise à jour avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/duties']);
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour:', error);
            this.snackBar.open('Erreur lors de la mise à jour de la garde', 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isSubmitting = false;
          }
        });
      } else {
        this.dutyService.create(dutyData).subscribe({
          next: () => {
            this.snackBar.open('Garde créée avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/duties']);
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            this.snackBar.open('Erreur lors de la création de la garde', 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isSubmitting = false;
          }
        });
      }
    } else {
      this.dutyForm.markAllAsTouched();
      this.snackBar.open('Veuillez remplir les champs correctement', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
