import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { ReportService } from '../../core/services/reference.service';
import { AreaChartData, BarChartData, LineChartData, PieChartData } from '../../core/models/report.model';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { SkeletonCardsComponent } from '../../shared/ui/skeleton/skeleton.component';
import { NotifyService } from '../../shared/notify/notify.service';
import { toIsoDate } from '../../shared/util/dates';
import { httpErrorMessage } from '../../shared/util/http-error';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, PageHeaderComponent, SkeletonCardsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' }],
  template: `
    <app-page-header title="Rapports" subtitle="Répartition et tendances du référentiel" [crumbs]="[{label:'Accueil', link:'/dashboard'},{label:'Rapports'}]" />
    @if (loading()) { <app-skeleton-cards [count]="4" /> } @else {
      <section class="pg-chart-row">
        <article class="pg-panel">
          <h2>Statut des pharmacies</h2>
          @if (pie(); as chart) {
            <div class="pg-bars" style="margin-top:12px">
              @for (label of chart.labels; track label; let i = $index) {
                <div class="pg-bar"><span>{{ label }}</span><i [style.width.%]="share(chart, i)" [style.background]="chart.colors?.[i] || (i ? '#C56A12' : '#236B40')"></i><strong>{{ chart.values[i] }}</strong></div>
              }
            </div>
          }
        </article>
        <article class="pg-panel">
          <h2>Top zones</h2>
          @if (bar(); as chart) {
            <div class="pg-bars" style="margin-top:12px">
              @for (label of chart.labels; track label; let i = $index) {
                <div class="pg-bar"><span>{{ label }}</span><i [style.width.%]="barWidth(chart, i)"></i><strong>{{ chart.values[i] }}</strong></div>
              }
            </div>
          }
        </article>
      </section>
      <section class="pg-panel" style="margin-top:16px">
        <h2>Créations de pharmacies</h2>
        <form [formGroup]="range" class="pg-form-grid" (ngSubmit)="loadLines()">
          <mat-form-field appearance="outline"><mat-label>Du</mat-label><input matInput [matDatepicker]="a" formControlName="start" /><mat-datepicker-toggle matIconSuffix [for]="a" /><mat-datepicker #a /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Au</mat-label><input matInput [matDatepicker]="b" formControlName="end" /><mat-datepicker-toggle matIconSuffix [for]="b" /><mat-datepicker #b /></mat-form-field>
          <div><button mat-stroked-button type="submit">Actualiser</button></div>
        </form>
        @if (line(); as chart) {
          <svg viewBox="0 0 640 220" width="100%" role="img" aria-label="Tendance des créations">
            <polyline fill="none" stroke="#236B40" stroke-width="3" [attr.points]="points(chart)" />
          </svg>
        }
        @if (area(); as chart) {
          <p class="pg-muted">Cumul : {{ names(chart) }}</p>
        }
      </section>
    }
  `
})
export class ReportsComponent {
  private readonly reports = inject(ReportService);
  private readonly notify = inject(NotifyService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  readonly loading = signal(true);
  readonly pie = signal<PieChartData | null>(null);
  readonly bar = signal<BarChartData | null>(null);
  readonly line = signal<LineChartData | null>(null);
  readonly area = signal<AreaChartData | null>(null);
  readonly range = this.fb.group({
    start: [new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate())],
    end: [new Date()]
  });
  constructor() { this.loadLines(); this.reports.getPharmacyStatusPie().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: data => { this.pie.set(data); this.loading.set(false); }, error: error => this.fail(error) }); this.reports.getTopZonesBar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: data => this.bar.set(data), error: error => this.fail(error) }); }
  loadLines(): void {
    const start = toIsoDate(this.range.value.start || undefined);
    const end = toIsoDate(this.range.value.end || undefined);
    this.reports.getPharmacyCreationTrendLine(start, end).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: data => { this.line.set(data); this.loading.set(false); }, error: error => this.fail(error) });
    this.reports.getCumulativeTrendArea(start, end).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: data => this.area.set(data), error: error => this.fail(error) });
  }
  share(chart: PieChartData, index: number): number {
    const total = chart.total || chart.values.reduce((sum, value) => sum + value, 0) || 1;
    return (chart.values[index] / total) * 100;
  }
  barWidth(chart: BarChartData, index: number): number {
    const max = Math.max(...chart.values, 1);
    return (chart.values[index] / max) * 100;
  }
  names(chart: AreaChartData): string {
    return (chart.series || []).map(series => series.name).join(' · ');
  }
  points(chart: LineChartData): string {
    const max = Math.max(...chart.values, 1);
    return chart.values.map((value, index) => {
      const x = chart.values.length === 1 ? 20 : (index / (chart.values.length - 1)) * 600 + 20;
      const y = 200 - (value / max) * 180;
      return `${x},${y}`;
    }).join(' ');
  }
  private fail(error: unknown): void {
    this.loading.set(false);
    const message = httpErrorMessage(error, 'Rapport indisponible');
    if (message) this.notify.error(message);
  }
}
