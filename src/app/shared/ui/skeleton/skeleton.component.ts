import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pg-skel-table" aria-hidden="true">
      @for (row of rowList(); track row) {
        <div class="pg-skel-row">
          @for (column of columnList(); track column) {
            <span class="pg-skel"></span>
          }
        </div>
      }
    </div>
  `
})
export class SkeletonTableComponent {
  readonly rows = input(6);
  readonly columns = input(5);
  readonly rowList = computed(() => range(this.rows()));
  readonly columnList = computed(() => range(this.columns()));
}

@Component({
  selector: 'app-skeleton-cards',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pg-skel-cards" aria-hidden="true">
      @for (card of cards(); track card) {
        <div class="pg-skel-card">
          <span class="pg-skel pg-skel-line"></span>
          <span class="pg-skel pg-skel-value"></span>
        </div>
      }
    </div>
  `
})
export class SkeletonCardsComponent {
  readonly count = input(6);
  readonly cards = computed(() => range(this.count()));
}

@Component({
  selector: 'app-skeleton-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pg-skel-form" aria-hidden="true">
      @for (field of fields(); track field) {
        <span class="pg-skel pg-skel-field"></span>
      }
    </div>
  `
})
export class SkeletonFormComponent {
  readonly count = input(8);
  readonly fields = computed(() => range(this.count()));
}

function range(length: number): number[] {
  return Array.from({ length }, (_, index) => index);
}
