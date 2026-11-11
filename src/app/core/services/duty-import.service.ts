import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, concat, from, of, throwError } from 'rxjs';
import { concatMap, map, toArray } from 'rxjs/operators';
import { ApiClient } from '../api/api-client';
import { DutyService } from './duty.service';

/** Ligne renvoyée par POST /api/duty-files/{id}/preview. Aucune garde n'est créée. */
export interface ImportAlternative {
  pharmacyId: number;
  name: string;
  city?: string;
  commune?: string;
  phone?: string;
  score: number;
}

export interface ImportPreviewLineDto {
  lineIndex: number;
  zone?: string;
  pharmacyName: string;
  normalizedName?: string;
  pharmacistName?: string;
  phoneNumbers?: string;
  location?: string;
  matchStatus: 'MATCHED' | 'AMBIGUOUS' | 'NOT_FOUND' | string;
  confidence: number;
  suggestedPharmacyId: number | null;
  suggestedPharmacyName?: string | null;
  suggestedCity?: string | null;
  dutyAlreadyExists: boolean;
  alternatives: ImportAlternative[];
}

export interface ImportPreviewDto {
  dutyFileId: number;
  dutyPeriodId: number;
  contentHash?: string;
  alreadyProcessed: boolean;
  linesExtracted: number;
  matched: number;
  ambiguous: number;
  notFound: number;
  duplicates: number;
  lines: ImportPreviewLineDto[];
}

export interface ImportLineDecision {
  pharmacyName: string;
  zone?: string;
  pharmacistName?: string;
  phoneNumbers?: string;
  location?: string;
  pharmacyId: number | null;
  createPharmacy: boolean;
  skip: boolean;
}

export interface ImportConfirmResult {
  dutiesCreated: number;
  pharmaciesCreated: number;
  skipped: number;
  duplicates: number;
  errors: number;
}

export interface ReviewLine {
  key: string;
  dutyFileId: number;
  sourceFileName: string;
  lineIndex: number;
  extractedName: string;
  normalizedName?: string;
  zone?: string;
  pharmacistName?: string;
  phoneNumbers?: string;
  location?: string;
  matchStatus: string;
  confidence: number;
  suggestedPharmacyId: number | null;
  suggestedPharmacyName?: string | null;
  dutyAlreadyExists: boolean;
  alternatives: ImportAlternative[];
  pharmacyId: number | null;
  createPharmacy: boolean;
  skip: boolean;
  filter: string;
}

export interface ImportPreview {
  dutyPeriodId: number;
  lines: ReviewLine[];
  matched: number;
  ambiguous: number;
  notFound: number;
  duplicates: number;
}

export type ImportEvent =
  | { type: 'upload'; progress: number }
  | { type: 'previewing'; fileName: string; index: number; total: number }
  | { type: 'preview'; preview: ImportPreview };

@Injectable({ providedIn: 'root' })
export class DutyImportService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiClient);
  private readonly duties = inject(DutyService);

  /**
   * Upload, puis POST /api/duty-files/{id}/preview pour chaque fichier.
   * Un échec de prévisualisation remonte tel quel : aucune garde n'est créée.
   */
  analyze(files: File[], dutyPeriodId: number): Observable<ImportEvent> {
    return this.duties.uploadMultipleWithProgress(files, dutyPeriodId).pipe(
      concatMap(event => {
        if ('progress' in event) {
          return of({ type: 'upload', progress: event.progress } as ImportEvent);
        }
        const uploaded = event.files.filter(file => file.id != null);
        if (!uploaded.length) {
          return throwError(() => new Error('Aucun fichier n’a été accepté'));
        }
        const collected: Array<{ body: ImportPreviewDto; fileName: string }> = [];
        return from(uploaded).pipe(
          concatMap((file, index) => {
            const fileName = file.fileName || file.name || 'affiche';
            return concat(
              of({ type: 'previewing', fileName, index, total: uploaded.length } as ImportEvent),
              this.preview(file.id!).pipe(map(body => {
                collected.push({ body, fileName });
                return collected.length === uploaded.length
                  ? { type: 'preview', preview: mergePreviews(dutyPeriodId, collected) } as ImportEvent
                  : null;
              }))
            );
          }),
          concatMap(item => item ? of(item) : of())
        );
      })
    );
  }

  preview(dutyFileId: number): Observable<ImportPreviewDto> {
    return this.http.post<ImportPreviewDto>(this.api.url(`/duty-files/${dutyFileId}/preview`), {});
  }

  confirm(lines: ReviewLine[]): Observable<ImportConfirmResult> {
    const groups = new Map<number, ReviewLine[]>();
    lines.forEach(line => {
      const current = groups.get(line.dutyFileId) ?? [];
      current.push(line);
      groups.set(line.dutyFileId, current);
    });
    const calls = [...groups.entries()].map(([dutyFileId, group]) => this.http.post<ImportConfirmResult>(
      this.api.url(`/duty-files/${dutyFileId}/confirm`),
      { lines: group.sort((a, b) => a.lineIndex - b.lineIndex).map(toDecision) }
    ));
    if (!calls.length) {
      return of({ dutiesCreated: 0, pharmaciesCreated: 0, skipped: 0, duplicates: 0, errors: 0 });
    }
    return from(calls).pipe(
      concatMap(call => call),
      toArray(),
      map(results => results.reduce((sum, item) => ({
        dutiesCreated: sum.dutiesCreated + item.dutiesCreated,
        pharmaciesCreated: sum.pharmaciesCreated + item.pharmaciesCreated,
        skipped: sum.skipped + item.skipped,
        duplicates: sum.duplicates + item.duplicates,
        errors: sum.errors + item.errors
      }), { dutiesCreated: 0, pharmaciesCreated: 0, skipped: 0, duplicates: 0, errors: 0 }))
    );
  }
}

export function mergePreviews(dutyPeriodId: number, parts: Array<{ body: ImportPreviewDto; fileName: string }>): ImportPreview {
  const lines = parts.flatMap(part => (part.body.lines || []).map(line => toReviewLine(part.body.dutyFileId, part.fileName, line)));
  return {
    dutyPeriodId,
    lines,
    matched: parts.reduce((sum, part) => sum + (part.body.matched || 0), 0),
    ambiguous: parts.reduce((sum, part) => sum + (part.body.ambiguous || 0), 0),
    notFound: parts.reduce((sum, part) => sum + (part.body.notFound || 0), 0),
    duplicates: parts.reduce((sum, part) => sum + (part.body.duplicates || 0), 0)
  };
}

export function toReviewLine(dutyFileId: number, fileName: string, line: ImportPreviewLineDto): ReviewLine {
  return {
    key: `${dutyFileId}-${line.lineIndex}`,
    dutyFileId,
    sourceFileName: fileName,
    lineIndex: line.lineIndex,
    extractedName: line.pharmacyName,
    normalizedName: line.normalizedName,
    zone: line.zone,
    pharmacistName: line.pharmacistName,
    phoneNumbers: line.phoneNumbers,
    location: line.location,
    matchStatus: line.matchStatus,
    confidence: line.confidence,
    suggestedPharmacyId: line.suggestedPharmacyId,
    suggestedPharmacyName: line.suggestedPharmacyName,
    dutyAlreadyExists: line.dutyAlreadyExists,
    alternatives: line.alternatives || [],
    pharmacyId: line.matchStatus === 'MATCHED' ? line.suggestedPharmacyId : null,
    createPharmacy: false,
    skip: false,
    filter: ''
  };
}

function toDecision(line: ReviewLine): ImportLineDecision {
  return {
    pharmacyName: line.extractedName,
    zone: line.zone,
    pharmacistName: line.pharmacistName,
    phoneNumbers: line.phoneNumbers,
    location: line.location,
    pharmacyId: line.skip ? null : line.pharmacyId,
    createPharmacy: !line.skip && line.createPharmacy && line.pharmacyId == null,
    skip: line.skip
  };
}

export function matchStatusLabel(status: string): string {
  switch (status) {
    case 'MATCHED': return 'Correspondance';
    case 'AMBIGUOUS': return 'Ambiguë';
    case 'NOT_FOUND': return 'Introuvable';
    default: return status;
  }
}
