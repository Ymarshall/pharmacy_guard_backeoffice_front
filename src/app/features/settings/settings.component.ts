import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { NotifyService } from '../../shared/notify/notify.service';
import { fieldError } from '../../shared/validators/field.validators';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSlideToggleModule, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Paramètres" subtitle="Préférences d’affichage de ce navigateur. Elles ne sont pas enregistrées côté serveur." [crumbs]="[{label:'Accueil', link:'/dashboard'},{label:'Paramètres'}]" />
    <form class="pg-panel pg-form-grid" [formGroup]="general" (ngSubmit)="save('Préférences générales conservées dans cette session')">
      <h2 class="pg-span-2">Général</h2>
      <mat-form-field appearance="outline"><mat-label>Nom affiché</mat-label><input matInput formControlName="appName" />@if (error(general.controls.appName)) { <mat-error>{{ error(general.controls.appName) }}</mat-error> }</mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Langue</mat-label><mat-select formControlName="appLanguage"><mat-option value="fr">Français</mat-option></mat-select></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Fuseau</mat-label><mat-select formControlName="timeZone"><mat-option value="Africa/Abidjan">Africa/Abidjan</mat-option></mat-select></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Éléments par page</mat-label><mat-select formControlName="itemsPerPage"><mat-option value="10">10</mat-option><mat-option value="25">25</mat-option><mat-option value="50">50</mat-option></mat-select></mat-form-field>
      <div class="pg-form-actions pg-span-2"><button mat-flat-button color="primary" [disabled]="general.invalid">Enregistrer</button></div>
    </form>
    <form class="pg-panel" style="margin-top:16px" [formGroup]="notifications" (ngSubmit)="save('Préférences de notification conservées dans cette session')">
      <h2>Notifications</h2>
      <mat-slide-toggle formControlName="emailNotifications">E-mail</mat-slide-toggle>
      <mat-slide-toggle formControlName="newPeriodAlert">Nouvelle période</mat-slide-toggle>
      <mat-slide-toggle formControlName="fileProcessAlert">Traitement de fichier</mat-slide-toggle>
      <div class="pg-form-actions"><button mat-flat-button color="primary">Enregistrer</button></div>
    </form>
  `
})
export class SettingsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly notify = inject(NotifyService);
  readonly error = fieldError;
  readonly general = this.fb.nonNullable.group({
    appName: ['Pharmacie de garde', Validators.required],
    appLanguage: ['fr', Validators.required],
    timeZone: ['Africa/Abidjan', Validators.required],
    itemsPerPage: ['25', Validators.required]
  });
  readonly notifications = this.fb.nonNullable.group({
    emailNotifications: [true],
    newPeriodAlert: [true],
    fileProcessAlert: [true]
  });
  save(message: string): void {
    if (this.general.invalid) { this.general.markAllAsTouched(); return; }
    this.notify.success(message);
  }
}
