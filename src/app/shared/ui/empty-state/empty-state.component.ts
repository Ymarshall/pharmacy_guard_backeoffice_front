import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pg-empty">
      <mat-icon>{{ icon() }}</mat-icon>
      <h2>{{ title() }}</h2>
      @if (hint()) {
        <p>{{ hint() }}</p>
      }
      <ng-content />
    </div>
  `
})
export class EmptyStateComponent {
  readonly title = input('Aucune donnée');
  readonly hint = input('');
  readonly icon = input('inbox');
}
