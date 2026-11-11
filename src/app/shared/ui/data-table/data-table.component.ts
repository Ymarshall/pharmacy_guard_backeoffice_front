import { ChangeDetectionStrategy, Component, computed, contentChildren, input, output, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { Directive, TemplateRef, inject } from '@angular/core';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { SkeletonTableComponent } from '../skeleton/skeleton.component';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { PageQuery } from '../../../core/api/page-query';

export interface TableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  kind?: 'text' | 'status';
  value?: (row: T) => string | number | boolean | null | undefined;
}

@Directive({
  selector: 'ng-template[appTableCell]',
  standalone: true
})
export class TableCellDirective {
  readonly key = input.required<string>({ alias: 'appTableCell' });
  readonly template = inject(TemplateRef);
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatPaginatorModule,
    EmptyStateComponent,
    SkeletonTableComponent,
    StatusBadgeComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MatPaginatorIntl, useFactory: frenchPaginator }],
  template: `
    <div class="pg-table-card">
      <div class="pg-table-toolbar">
        <mat-form-field appearance="outline" class="pg-search" subscriptSizing="dynamic">
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [value]="searchInput()" (input)="onSearch($event)" [placeholder]="searchPlaceholder()" aria-label="Rechercher" />
        </mat-form-field>
        <ng-content select="[tableFilters]" />
        <span class="pg-count">{{ filteredCount() }} résultat(s)</span>
      </div>

      @if (loading()) {
        <app-skeleton-table [rows]="6" [columns]="columns().length" />
      } @else if (!filtered().length) {
        <app-empty-state [title]="emptyTitle()" [hint]="emptyHint()" icon="search_off" />
      } @else {
        <div class="pg-table-scroll">
          <table class="pg-table">
            <thead>
              <tr>
                @for (column of columns(); track column.key) {
                  <th [class.is-sortable]="column.sortable !== false" (click)="toggleSort(column)" scope="col">
                    {{ column.label }}
                    @if (sortKey() === column.key) {
                      <mat-icon>{{ sortDir() === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
                    }
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              @for (row of pageRows(); track track(row)) {
                <tr>
                  @for (column of columns(); track column.key) {
                    <td>
                      @if (templateFor(column.key); as template) {
                        <ng-container *ngTemplateOutlet="template; context: { $implicit: row }" />
                      } @else if (column.kind === 'status') {
                        <app-status-badge [value]="cell(row, column)" />
                      } @else {
                        {{ cell(row, column) }}
                      }
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
        <mat-paginator
          [length]="mode() === 'server' ? (total() ?? filteredCount()) : filteredCount()"
          [pageIndex]="pageIndex()"
          [pageSize]="pageSize()"
          [pageSizeOptions]="[10, 25, 50, 100]"
          (page)="onPage($event)"
          aria-label="Pagination" />
      }
    </div>
  `
})
export class DataTableComponent<T> {
  readonly rows = input<readonly T[]>([]);
  readonly columns = input.required<readonly TableColumn<T>[]>();
  readonly loading = input(false);
  readonly mode = input<'client' | 'server'>('client');
  readonly total = input<number | null>(null);
  readonly searchPlaceholder = input('Rechercher');
  readonly emptyTitle = input('Aucun résultat');
  readonly emptyHint = input('Modifiez la recherche ou ajoutez un élément.');
  readonly textOf = input<(row: T) => string>(row => Object.values(row as object).join(' '));
  readonly trackBy = input<(row: T) => unknown>(row => (row as { id?: unknown }).id ?? row);
  readonly queryChange = output<PageQuery>();

  private readonly cells = contentChildren(TableCellDirective);
  readonly searchInput = signal('');
  private readonly search = toSignal(
    toObservable(this.searchInput).pipe(debounceTime(300), map(value => value.trim().toLowerCase()), distinctUntilChanged()),
    { initialValue: '' }
  );
  readonly sortKey = signal<string | null>(null);
  readonly sortDir = signal<'asc' | 'desc'>('asc');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  readonly filtered = computed(() => {
    const query = this.search();
    const source = this.rows().filter(row => {
      if (!query) {
        return true;
      }
      return this.textOf()(row).toLowerCase().includes(query);
    });
    const key = this.sortKey();
    if (!key) {
      return source;
    }
    const column = this.columns().find(item => item.key === key);
    const direction = this.sortDir() === 'asc' ? 1 : -1;
    return [...source].sort((a, b) => String(this.cell(a, column)).localeCompare(String(this.cell(b, column)), 'fr', { numeric: true }) * direction);
  });

  readonly filteredCount = computed(() => this.mode() === 'server' ? (this.total() ?? this.rows().length) : this.filtered().length);
  readonly pageRows = computed(() => {
    if (this.mode() === 'server') {
      return this.filtered();
    }
    const start = this.pageIndex() * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  onSearch(event: Event): void {
    this.searchInput.set((event.target as HTMLInputElement).value);
    if (this.mode() === 'client') {
      this.pageIndex.set(0);
      this.emitQuery();
    }
  }

  toggleSort(column: TableColumn<T>): void {
    if (column.sortable === false) {
      return;
    }
    if (this.sortKey() === column.key) {
      this.sortDir.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(column.key);
      this.sortDir.set('asc');
    }
    if (this.mode() === 'client') {
      this.emitQuery();
    }
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.emitQuery();
  }

  track(row: T): unknown {
    return this.trackBy()(row);
  }

  templateFor(key: string): TemplateRef<unknown> | null {
    return this.cells().find(cell => cell.key() === key)?.template ?? null;
  }

  cell(row: T, column?: TableColumn<T>): string | number | boolean | null | undefined {
    if (!column) {
      return '';
    }
    return column.value ? column.value(row) : (row as Record<string, string | number | boolean | null | undefined>)[column.key];
  }

  private emitQuery(): void {
    this.queryChange.emit({
      page: this.pageIndex(),
      size: this.pageSize(),
      sort: this.sortKey() ?? undefined,
      direction: this.sortDir(),
      search: this.searchInput().trim()
    });
  }
}

function frenchPaginator(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();
  intl.itemsPerPageLabel = 'Éléments par page';
  intl.nextPageLabel = 'Page suivante';
  intl.previousPageLabel = 'Page précédente';
  intl.firstPageLabel = 'Première page';
  intl.lastPageLabel = 'Dernière page';
  intl.getRangeLabel = (page, pageSize, length) => {
    if (!length || !pageSize) {
      return '0 sur 0';
    }
    const start = page * pageSize;
    return `${start + 1} – ${Math.min(length, start + pageSize)} sur ${length}`;
  };
  return intl;
}
