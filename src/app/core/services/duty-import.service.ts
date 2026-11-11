import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, concat, forkJoin, from, of, throwError } from 'rxjs';
import { catchError, concatMap, filter, map, switchMap, toArray } from 'rxjs/operators';
import { Duty } from '../models/duty.model';
import { DutyPeriod } from '../models/duty-period.model';
import { Pharmacy } from '../models/pharmacy.model';
import { similarity } from '../../shared/util/similarity';
import { ApiClient } from '../api/api-client';
import { DutyService } from './duty.service';
import { PharmacyService } from './pharmacy.service';

/**
 * Contrat de prévisualisation attendu (pas encore exposé par pharmaciegarde).
 *
 * POST /api/duty-files/preview
 * multipart : files[] (images/PDF), dutyPeriodId
 * 200 PosterPreviewResponse
 *
 * POST /api/duty-files/preview/{previewId}/commit
 * { decisions: [{ lineId, action: 'ACCEPT' | 'IGNORE', pharmacyId: number | null }] }
 *
 * PUT /api/duties/{id}/pharmacy
 * { pharmacyId: number }
 *
 * Tant que /preview répond 404, 405 ou 501, le service retombe sur l'API actuelle :
 * upload + process (qui crée les gardes tout de suite) puis relecture des duties.
 */
export interface PosterPreviewLineContract {
  lineId: string;
  sourceFileName: string;
  extractedName: string;
  extractedZone?: string;
  proposedPharmacyId: number | null;
  proposedPharmacyName?: string | null;
  confidence: number;
}

export interface PosterPreviewResponse {
  previewId: string;
  dutyPeriodId: number;
  lines: PosterPreviewLineContract[];
}

export interface ReviewLine {
  key: string;
  dutyId?: number;
  sourceFileName: string;
  extractedName: string;
  zone?: string;
  proposedPharmacyId: number | null;
  confidence: number;
  action: 'ACCEPT' | 'IGNORE';
  pharmacyId: number | null;
  filter: string;
}

export interface ImportPreview {
  mode: 'preview' | 'legacy';
  previewId?: string;
  dutyPeriodId: number;
  lines: ReviewLine[];
}

export type ImportEvent =
  | { type: 'upload'; progress: number }
  | { type: 'processing' }
  | { type: 'preview'; preview: ImportPreview };

export interface ImportCommitResult {
  ignored: number;
  reassigned: number;
  unsupported: string[];
}

@Injectable({ providedIn: 'root' })
export class DutyImportService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiClient);
  private readonly duties = inject(DutyService);
  private readonly pharmacies = inject(PharmacyService);

  analyze(files: File[], period: DutyPeriod): Observable<ImportEvent> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('dutyPeriodId', String(period.id));
    return this.http.post<PosterPreviewResponse>(this.api.url('/duty-files/preview'), formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => this.mapPreviewHttp(event, period.id!)),
      filter((event): event is ImportEvent => event !== null),
      catchError(error => {
        if (error instanceof HttpErrorResponse && [404, 405, 501].includes(error.status)) {
          return this.legacyAnalyze(files, period);
        }
        return throwError(() => error);
      })
    );
  }

  commit(preview: ImportPreview, lines: ReviewLine[]): Observable<ImportCommitResult> {
    if (preview.mode === 'preview' && preview.previewId) {
      return this.http.post<ImportCommitResult>(this.api.url(`/duty-files/preview/${preview.previewId}/commit`), {
        decisions: lines.map(line => ({
          lineId: line.key,
          action: line.action,
          pharmacyId: line.action === 'ACCEPT' ? line.pharmacyId : null
        }))
      });
    }
    return this.commitLegacy(lines);
  }

  private mapPreviewHttp(event: { type: number; loaded?: number; total?: number; body?: PosterPreviewResponse | null }, periodId: number): ImportEvent | null {
    if (event.type === HttpEventType.UploadProgress) {
      const progress = event.total ? Math.round((100 * (event.loaded ?? 0)) / event.total) : 0;
      return { type: 'upload', progress };
    }
    if (event.type === HttpEventType.Response && event.body) {
      return { type: 'preview', preview: this.fromContract(event.body, periodId) };
    }
    return null;
  }

  private fromContract(body: PosterPreviewResponse, periodId: number): ImportPreview {
    return {
      mode: 'preview',
      previewId: body.previewId,
      dutyPeriodId: body.dutyPeriodId || periodId,
      lines: body.lines.map(line => ({
        key: line.lineId,
        sourceFileName: line.sourceFileName,
        extractedName: line.extractedName,
        zone: line.extractedZone,
        proposedPharmacyId: line.proposedPharmacyId,
        confidence: clamp(line.confidence),
        action: 'ACCEPT',
        pharmacyId: line.proposedPharmacyId,
        filter: ''
      }))
    };
  }

  private legacyAnalyze(files: File[], period: DutyPeriod): Observable<ImportEvent> {
    return this.duties.getDutiesByPeriod(period.id!).pipe(
      catchError(() => of([] as Duty[])),
      switchMap(before => {
        const known = new Set(before.map(duty => duty.id));
        return this.duties.uploadMultipleWithProgress(files, period.id).pipe(
          concatMap(event => {
            if ('progress' in event) {
              return of({ type: 'upload', progress: event.progress } as ImportEvent);
            }
            return concat(
              of({ type: 'processing' } as ImportEvent),
              this.processAll(event.files, period).pipe(
                switchMap(() => forkJoin({
                  duties: this.duties.getDutiesByPeriod(period.id!).pipe(catchError(() => of([] as Duty[]))),
                  pharmacies: this.pharmacies.getAll()
                })),
                map(({ duties, pharmacies }) => {
                  const fresh = duties.filter(duty => duty.id != null && !known.has(duty.id));
                  return {
                    type: 'preview',
                    preview: this.fromDuties(period.id!, fresh.length ? fresh : duties, pharmacies)
                  } as ImportEvent;
                })
              )
            );
          })
        );
      })
    );
  }

  private processAll(files: Duty[], period: DutyPeriod): Observable<unknown> {
    const pending = files.filter(file => file.id != null);
    if (!pending.length) {
      return of(null);
    }
    return from(pending).pipe(
      concatMap(file => this.duties.process(file.id!, {
        startDate: period.startDate,
        endDate: period.endDate
      })),
      toArray()
    );
  }

  private fromDuties(periodId: number, duties: Duty[], pharmacies: Pharmacy[]): ImportPreview {
    return {
      mode: 'legacy',
      dutyPeriodId: periodId,
      lines: duties.map(duty => {
        const extracted = duty.pharmacyName || duty.name || duty.fileName || 'Nom non lu';
        const proposed = pharmacies.find(pharmacy => pharmacy.id === duty.pharmacyId) ?? null;
        const best = bestPharmacy(extracted, pharmacies);
        const confidence = proposed ? similarity(extracted, proposed.name) : best.score;
        const pharmacyId = proposed?.id ?? (best.score >= 0.72 ? best.pharmacy?.id ?? null : null);
        return {
          key: String(duty.id ?? extracted),
          dutyId: duty.id,
          sourceFileName: duty.dutyFileName || duty.fileName || 'affiche',
          extractedName: extracted,
          zone: duty.pharmacyZone || duty.zone || duty.zoneName,
          proposedPharmacyId: proposed?.id ?? pharmacyId,
          confidence: clamp(confidence),
          action: 'ACCEPT' as const,
          pharmacyId,
          filter: ''
        };
      })
    };
  }

  private commitLegacy(lines: ReviewLine[]): Observable<ImportCommitResult> {
    const unsupported: string[] = [];
    const calls: Observable<unknown>[] = [];
    lines.forEach(line => {
      if (!line.dutyId) {
        return;
      }
      if (line.action === 'IGNORE') {
        calls.push(this.duties.disableDuty(line.dutyId).pipe(catchError(() => of(null))));
        return;
      }
      if (line.pharmacyId && line.pharmacyId !== line.proposedPharmacyId) {
        calls.push(this.duties.reassignPharmacy(line.dutyId, line.pharmacyId).pipe(
          catchError((error: HttpErrorResponse) => {
            if ([404, 405, 400, 415, 501].includes(error.status)) {
              unsupported.push(line.extractedName);
              return of(null);
            }
            return throwError(() => error);
          })
        ));
      }
    });
    const result = (): ImportCommitResult => ({
      ignored: lines.filter(line => line.action === 'IGNORE').length,
      reassigned: lines.filter(line => line.action === 'ACCEPT' && line.pharmacyId && line.pharmacyId !== line.proposedPharmacyId).length - unsupported.length,
      unsupported
    });
    return calls.length ? forkJoin(calls).pipe(map(() => result())) : of(result());
  }
}

function bestPharmacy(extracted: string, pharmacies: Pharmacy[]): { pharmacy: Pharmacy | null; score: number } {
  let pharmacy: Pharmacy | null = null;
  let score = 0;
  pharmacies.forEach(candidate => {
    const value = similarity(extracted, candidate.name);
    if (value > score) {
      score = value;
      pharmacy = candidate;
    }
  });
  return { pharmacy, score };
}

function clamp(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}
