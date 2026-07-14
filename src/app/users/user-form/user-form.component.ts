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
import { UserService } from '../../services/user.service';
import { User, UserCreateRequest, UserUpdateRequest } from '../../models/user.model';

@Component({
  selector: 'app-user-form',
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
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  userId?: number;
  isLoading = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.userId = +id;
      this.loadUser(this.userId);
      // En mode édition, le mot de passe n'est pas obligatoire
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  loadUser(id: number): void {
    this.isLoading = true;
    this.userService.getById(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          password: '' // Ne pas pré-remplir le mot de passe
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        this.snackBar.open('Erreur lors du chargement de l\'utilisateur', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isSubmitting = true;
      
      if (this.isEditMode && this.userId) {
        // Mode édition
        const formValue = this.userForm.value;
        const updateData: UserUpdateRequest = {
          email: formValue.email,
          firstName: formValue.firstName,
          lastName: formValue.lastName
        };
        
        // Inclure le mot de passe seulement s'il a été modifié
        if (formValue.password && formValue.password.trim() !== '') {
          updateData.password = formValue.password;
        }

        this.userService.update(this.userId, updateData).subscribe({
          next: () => {
            this.snackBar.open('Utilisateur mis à jour avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/users']);
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour:', error);
            this.snackBar.open('Erreur lors de la mise à jour de l\'utilisateur', 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isSubmitting = false;
          }
        });
      } else {
        // Mode création
        const userData: UserCreateRequest = {
          email: this.userForm.value.email,
          password: this.userForm.value.password,
          firstName: this.userForm.value.firstName,
          lastName: this.userForm.value.lastName
        };

        this.userService.create(userData).subscribe({
          next: () => {
            this.snackBar.open('Utilisateur créé avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/users']);
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            this.snackBar.open('Erreur lors de la création de l\'utilisateur', 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isSubmitting = false;
          }
        });
      }
    } else {
      this.userForm.markAllAsTouched();
    }
  }
}
