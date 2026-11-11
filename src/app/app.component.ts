import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotifyService } from './shared/notify/notify.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <router-outlet />
    <div class="pg-toasts" aria-live="polite">
      @for (toast of notify.toasts(); track toast.id) {
        <button type="button" class="pg-toast" [attr.data-tone]="toast.tone" (click)="notify.dismiss(toast.id)">
          {{ toast.message }}
        </button>
      }
    </div>
  `
})
export class AppComponent {
  title = 'pharmacy_guard';
  readonly notify = inject(NotifyService);
}
