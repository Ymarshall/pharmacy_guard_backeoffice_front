import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export interface StagedFile {
  file: File;
  previewUrl: string | null;
}

@Component({
  selector: 'app-file-uploader',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="pg-drop"
      [class.is-over]="over()"
      (dragover)="onDrag($event, true)"
      (dragleave)="onDrag($event, false)"
      (drop)="onDrop($event)">
      <input #picker type="file" [accept]="accept()" [multiple]="multiple()" (change)="onPick($event)" hidden />
      <mat-icon>cloud_upload</mat-icon>
      <p><strong>Glissez-déposez</strong> vos affiches ici</p>
      <p class="pg-muted">{{ hint() }}</p>
      <button mat-stroked-button type="button" (click)="picker.click()">Parcourir les fichiers</button>
      @if (progress() !== null) {
        <mat-progress-bar mode="determinate" [value]="progress()!" />
      }
    </div>
    @if (files().length) {
      <ul class="pg-file-grid">
        @for (item of files(); track item.file.name + item.file.size; let index = $index) {
          <li>
            @if (item.previewUrl) {
              <img [src]="item.previewUrl" [alt]="'Aperçu de ' + item.file.name" />
            } @else {
              <mat-icon>description</mat-icon>
            }
            <span>{{ item.file.name }}</span>
            <button mat-icon-button type="button" aria-label="Retirer le fichier" (click)="remove(index)">
              <mat-icon>close</mat-icon>
            </button>
          </li>
        }
      </ul>
    }
  `
})
export class FileUploaderComponent {
  readonly accept = input('image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf');
  readonly multiple = input(true);
  readonly hint = input('JPEG, PNG, WEBP ou PDF');
  readonly progress = input<number | null>(null);
  readonly filesChange = output<StagedFile[]>();

  readonly files = signal<StagedFile[]>([]);
  readonly over = signal(false);

  onDrag(event: DragEvent, over: boolean): void {
    event.preventDefault();
    this.over.set(over);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.over.set(false);
    this.add(event.dataTransfer?.files);
  }

  onPick(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.add(input.files);
    input.value = '';
  }

  remove(index: number): void {
    const next = [...this.files()];
    const [removed] = next.splice(index, 1);
    if (removed?.previewUrl) {
      URL.revokeObjectURL(removed.previewUrl);
    }
    this.files.set(next);
    this.filesChange.emit(next);
  }

  private add(list: FileList | null | undefined): void {
    if (!list?.length) {
      return;
    }
    const accepted = this.accept().split(',').map(value => value.trim().toLowerCase());
    const next = [...this.files()];
    Array.from(list).forEach(file => {
      const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      const ok = accepted.includes(file.type.toLowerCase()) || accepted.includes(extension);
      if (!ok) {
        return;
      }
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
      next.push({ file, previewUrl });
    });
    this.files.set(next);
    this.filesChange.emit(next);
  }
}
