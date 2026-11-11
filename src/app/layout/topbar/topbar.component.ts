import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { LoadingService } from '../../core/http/loading.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatMenuModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="pg-topbar">
      <button mat-icon-button type="button" class="pg-menu-btn" (click)="menuToggle.emit()" aria-label="Ouvrir le menu">
        <mat-icon>menu</mat-icon>
      </button>
      <div class="pg-topbar-title">
        <span>Back-office</span>
        <strong>{{ title() }}</strong>
      </div>
      <button mat-button type="button" [matMenuTriggerFor]="menu" class="pg-user">
        <mat-icon>account_circle</mat-icon>
        <span>{{ userName() }}</span>
      </button>
      <mat-menu #menu="matMenu">
        <button mat-menu-item type="button" (click)="logout()">
          <mat-icon>logout</mat-icon>
          <span>Déconnexion</span>
        </button>
      </mat-menu>
      @if (loading.active()) {
        <mat-progress-bar class="pg-loading-bar" mode="indeterminate" />
      }
    </header>
  `
})
export class TopbarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly loading = inject(LoadingService);
  readonly menuToggle = output<void>();
  readonly title = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null),
      map(() => readTitle(this.router))
    ),
    { initialValue: 'Pharmacie de garde' }
  );

  userName(): string {
    const user = this.auth.user();
    return user ? `${user.firstName} ${user.lastName}` : '';
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}

function readTitle(router: Router): string {
  let route = router.routerState.snapshot.root;
  let title = 'Pharmacie de garde';
  while (route.firstChild) {
    route = route.firstChild;
    title = (route.data['title'] as string) || title;
  }
  return title;
}
