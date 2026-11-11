import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const LABELS: Record<string, string> = {
  ACTIF: 'Actif',
  INACTIF: 'Inactif',
  ACTIVE: 'Active',
  DISABLED: 'Désactivée',
  DISABLE: 'Désactivée',
  PENDING: 'En attente',
  PROCESSING: 'En traitement',
  PROCESSED: 'Traité',
  FAILED: 'Échec',
  TO_VERIFY: 'À vérifier',
  DRAFT: 'Brouillon',
  COMPLETED: 'Terminée',
  EMAIL: 'E-mail',
  GOOGLE: 'Google',
  FACEBOOK: 'Facebook',
  APPLE: 'Apple',
  true: 'Actif',
  false: 'Inactif'
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="pg-badge" [attr.data-status]="tone()">{{ label() }}</span>`
})
export class StatusBadgeComponent {
  readonly value = input<string | number | boolean | null | undefined>(null);
  readonly label = computed(() => {
    const raw = this.value();
    if (raw === null || raw === undefined || raw === '') {
      return '—';
    }
    const key = String(raw);
    return LABELS[key] ?? key;
  });
  readonly tone = computed(() => String(this.value() ?? 'unknown').toUpperCase());
}
