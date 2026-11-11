import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, SidebarComponent, TopbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-sidenav-container class="pg-shell">
      <mat-sidenav [mode]="tablet() ? 'over' : 'side'" [opened]="opened()" (closedStart)="opened.set(false)">
        <app-sidebar />
      </mat-sidenav>
      <mat-sidenav-content>
        <app-topbar (menuToggle)="toggle()" />
        <main class="pg-content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `
})
export class ShellComponent {
  private readonly breakpoints = inject(BreakpointObserver);
  readonly tablet = signal(false);
  readonly opened = signal(true);

  constructor() {
    this.breakpoints.observe('(max-width: 1024px)').pipe(takeUntilDestroyed()).subscribe(state => {
      this.tablet.set(state.matches);
      this.opened.set(!state.matches);
    });
  }

  toggle(): void {
    this.opened.update(value => !value);
  }
}
