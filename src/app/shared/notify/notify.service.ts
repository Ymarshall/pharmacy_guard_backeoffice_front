import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'error' | 'warn' | 'info';
}

@Injectable({ providedIn: 'root' })
export class NotifyService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 0;

  success(message: string): void { this.push(message, 'success'); }
  error(message: string): void { this.push(message, 'error'); }
  warn(message: string): void { this.push(message, 'warn'); }
  info(message: string): void { this.push(message, 'info'); }

  dismiss(id: number): void {
    this.toasts.update(items => items.filter(item => item.id !== id));
  }

  private push(message: string, tone: Toast['tone']): void {
    const id = ++this.nextId;
    this.toasts.update(items => [...items, { id, message, tone }]);
    setTimeout(() => this.dismiss(id), 4500);
  }
}
