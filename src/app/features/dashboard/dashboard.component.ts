import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/reference.service';
import { AlertLevel, DashboardStats } from '../../core/models/dashboard.model';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { SkeletonCardsComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { NotifyService } from '../../shared/notify/notify.service';
import { httpErrorMessage } from '../../shared/util/http-error';
import { formatFrDate } from '../../shared/util/dates';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe, MatIconModule, MatButtonModule, RouterLink, PageHeaderComponent, SkeletonCardsComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Tableau de bord" subtitle="Pilotage des pharmacies de garde" [crumbs]="[{label:'Accueil'}]" />
    @if (loading()) {
      <app-skeleton-cards [count]="6" />
    }
    @if (stats(); as data) {
      <section class="pg-kpi-grid">
        @for (card of cards(); track card.label) {
          <article class="pg-panel pg-kpi">
            <div><span>{{ card.label }}</span><strong>{{ card.value | number }}</strong></div>
            <mat-icon>{{ card.icon }}</mat-icon>
          </article>
        }
      </section>

      <section class="pg-panel" style="margin-bottom: 16px">
        @if (data.currentPeriod) {
          <div class="pg-split">
            <div>
              <span class="pg-badge-duty pg-badge">De garde</span>
              <h2 style="margin: 8px 0">{{ format(data.currentPeriod.startDate) }} — {{ format(data.currentPeriod.endDate) }}</h2>
              <p class="pg-muted">{{ data.currentPeriod.daysRemaining ?? 0 }} jour(s) restant(s)</p>
            </div>
            <div class="pg-kpi-grid" style="margin:0">
              <div><span class="pg-muted">Pharmacies</span><strong>{{ data.currentPeriod.pharmaciesInDuty || 0 }}</strong></div>
              <div><span class="pg-muted">Zones</span><strong>{{ data.currentPeriod.zonesCovered || 0 }}</strong></div>
              <div><span class="pg-muted">Fichiers</span><strong>{{ data.currentPeriod.filesProcessed || 0 }}/{{ data.currentPeriod.filesUploaded || 0 }}</strong></div>
            </div>
          </div>
        } @else {
          <app-empty-state title="Aucune période active" hint="Créez une période puis importez les affiches." icon="event_busy">
            <a mat-flat-button color="primary" routerLink="/duty-periods/new">Créer une période</a>
          </app-empty-state>
        }
      </section>

      <section class="pg-chart-row">
        <article class="pg-panel">
          <h2>Zones les plus couvertes</h2>
          <div class="pg-bars" style="margin-top: 16px">
            @for (zone of data.pharmacyStats.topZones; track zone.zone) {
              <div class="pg-bar">
                <span>{{ zone.zone }}</span>
                <i [style.width.%]="bar(zone.count, data.pharmacyStats.topZones)"></i>
                <strong>{{ zone.count }}</strong>
              </div>
            } @empty {
              <p class="pg-muted">Aucune donnée.</p>
            }
          </div>
        </article>
        <article class="pg-panel">
          <h2>Pharmacies actives</h2>
          <p style="font-size: 2rem; margin: 12px 0">{{ data.pharmacyStats.activePharmacies }} <span class="pg-muted" style="font-size: 1rem">/ {{ totalPharmacies(data) }}</span></p>
          <p class="pg-muted">{{ data.pharmacyStats.inactivePharmacies }} inactives · {{ data.fileStats.failedFiles }} fichier(s) en erreur · {{ data.fileStats.successRate || 0 }} % de succès</p>
        </article>
      </section>

      @if (data.alerts.length) {
        <section class="pg-panel" style="margin-top: 16px">
          <h2>Alertes</h2>
          <ul>
            @for (alert of data.alerts; track alert.type) {
              <li><strong>{{ level(alert.level) }}</strong> — {{ alert.message }} @if (alert.count) { ({{ alert.count }}) }</li>
            }
          </ul>
        </section>
      }
    }
  `
})
export class DashboardComponent {
  private readonly dashboard = inject(DashboardService);
  private readonly notify = inject(NotifyService);
  private readonly destroyRef = inject(DestroyRef);
  readonly loading = signal(true);
  readonly stats = signal<DashboardStats | null>(null);
  readonly cards = signal<{ label: string; value: number; icon: string }[]>([]);
  readonly format = formatFrDate;

  constructor() {
    this.dashboard.getStats().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: stats => {
        this.stats.set(stats);
        this.cards.set([
          { label: 'Pharmacies', value: stats.overview.totalPharmacies || 0, icon: 'local_pharmacy' },
          { label: 'Périodes', value: stats.overview.totalPeriods || 0, icon: 'calendar_month' },
          { label: 'Gardes', value: stats.overview.totalDuties || 0, icon: 'assignment' },
          { label: 'Clients', value: stats.overview.totalClients || 0, icon: 'people' },
          { label: 'Utilisateurs', value: stats.overview.totalUsers || 0, icon: 'admin_panel_settings' },
          { label: 'Zones', value: stats.overview.totalZones || 0, icon: 'location_on' }
        ]);
        this.loading.set(false);
      },
      error: error => {
        this.loading.set(false);
        const message = httpErrorMessage(error, 'Impossible de charger le tableau de bord');
        if (message) this.notify.error(message);
      }
    });
  }

  bar(count: number, zones: Array<{ count: number }>): number {
    const max = Math.max(...zones.map(zone => zone.count), 1);
    return (count / max) * 100;
  }

  totalPharmacies(stats: DashboardStats): number {
    return (stats.pharmacyStats.activePharmacies || 0) + (stats.pharmacyStats.inactivePharmacies || 0);
  }

  level(value: AlertLevel): string {
    return value === 'HIGH' ? 'Haute' : value === 'MEDIUM' ? 'Moyenne' : 'Faible';
  }
}
