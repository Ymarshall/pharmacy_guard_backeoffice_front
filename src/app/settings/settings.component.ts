import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { HeaderComponent } from '../layout/header/header.component';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatSnackBarModule,
    MatListModule,
    MatChipsModule,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  generalForm: FormGroup;
  notificationForm: FormGroup;
  securityForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    // Formulaire paramètres généraux
    this.generalForm = this.fb.group({
      appName: ['Pharmacy Guard', Validators.required],
      appLanguage: ['fr', Validators.required],
      timeZone: ['Africa/Abidjan', Validators.required],
      dateFormat: ['DD/MM/YYYY', Validators.required],
      itemsPerPage: ['25', Validators.required]
    });

    // Formulaire paramètres notifications
    this.notificationForm = this.fb.group({
      emailNotifications: [true],
      smsNotifications: [false],
      pushNotifications: [true],
      newPeriodAlert: [true],
      newPharmacyAlert: [true],
      fileProcessAlert: [true],
      systemMaintenanceAlert: [true]
    });

    // Formulaire paramètres sécurité
    this.securityForm = this.fb.group({
      sessionTimeout: ['30', Validators.required],
      passwordExpiry: ['90', Validators.required],
      twoFactorAuth: [false],
      ipWhitelist: ['']
    });
  }

  onSaveGeneral(): void {
    if (this.generalForm.valid) {
      this.snackBar.open('Paramètres généraux sauvegardés avec succès', 'Fermer', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }

  onSaveNotifications(): void {
    this.snackBar.open('Paramètres de notification sauvegardés avec succès', 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  onSaveSecurity(): void {
    if (this.securityForm.valid) {
      this.snackBar.open('Paramètres de sécurité sauvegardés avec succès', 'Fermer', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }

  onResetPassword(): void {
    this.snackBar.open('Email de réinitialisation de mot de passe envoyé', 'Fermer', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }
}
