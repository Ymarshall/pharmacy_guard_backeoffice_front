import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DutyService } from '../../../core/services/duty.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { FileUploaderComponent, StagedFile } from '../../../shared/ui/file-uploader/file-uploader.component';
import { SkeletonFormComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { fieldError } from '../../../shared/validators/field.validators';
import { NotifyService } from '../../../shared/notify/notify.service';
import { httpErrorMessage } from '../../../shared/util/http-error';

@Component({
  selector: 'app-duty-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, PageHeaderComponent, FileUploaderComponent, SkeletonFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="edit() ? 'Modifier le fichier' : 'Nouveau fichier'" [crumbs]="[{label:'Fichiers', link:'/duties'},{label:'Formulaire'}]"><a mat-button routerLink="/duties">Retour</a></app-page-header>
    @if (loading()) { <app-skeleton-form [count]="3" /> } @else {
      <form class="pg-panel" [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Nom</mat-label><input matInput formControlName="name" />@if (error(form.controls.name)) { <mat-error>{{ error(form.controls.name) }}</mat-error> }</mat-form-field>
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Description</mat-label><textarea matInput rows="3" formControlName="description"></textarea></mat-form-field>
        @if (!edit()) {
          <app-file-uploader [multiple]="false" hint="PDF ou JPEG" accept="application/pdf,image/jpeg,.pdf,.jpg,.jpeg" (filesChange)="onFile($event)" />
        } @else if (fileName()) { <p class="pg-muted">Fichier actuel : {{ fileName() }}</p> }
        <div class="pg-form-actions"><button mat-flat-button color="primary" [disabled]="form.invalid || submitting()">{{ submitting() ? 'Enregistrement…' : 'Enregistrer' }}</button></div>
      </form>
    }
  `
})
export class DutyFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(DutyService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notify = inject(NotifyService);
  private readonly destroyRef = inject(DestroyRef);
  readonly error = fieldError;
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly edit = signal(false);
  readonly fileName = signal('');
  private id?: number;
  private file: File | null = null;
  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.maxLength(120)],
    description: ['', Validators.maxLength(500)]
  });
  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.edit.set(true); this.id = Number(id); this.loading.set(true);
    this.service.getById(this.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: duty => { this.form.patchValue({ name: duty.name || '', description: duty.description || '' }); this.fileName.set(duty.fileName || ''); this.loading.set(false); },
      error: error => { this.loading.set(false); const message = httpErrorMessage(error, 'Fichier introuvable'); if (message) this.notify.error(message); }
    });
  }
  onFile(files: StagedFile[]): void { this.file = files[0]?.file ?? null; }
  submit(): void {
    if (this.submitting() || this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (!this.edit() && !this.file) { this.notify.warn('Sélectionnez un PDF ou un JPEG'); return; }
    this.submitting.set(true);
    const raw = this.form.getRawValue();
    const body = { name: raw.name || undefined, description: raw.description || undefined, file: this.file || undefined };
    const request = this.edit() && this.id ? this.service.update(this.id, body) : this.service.create(body);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.notify.success('Fichier enregistré'); void this.router.navigate(['/duties']); },
      error: error => { this.submitting.set(false); const message = httpErrorMessage(error, 'Enregistrement impossible'); if (message) this.notify.error(message); }
    });
  }
}
