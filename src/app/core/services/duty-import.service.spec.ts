import { toReviewLine } from '../../core/services/duty-import.service';

describe('prévisualisation d’import', () => {
  it('préselectionne uniquement une correspondance sûre', () => {
    const matched = toReviewLine(4, 'affiche.jpg', {
      lineIndex: 0,
      pharmacyName: 'PHARMACIE DU PLATEAU',
      matchStatus: 'MATCHED',
      confidence: 0.97,
      suggestedPharmacyId: 1,
      suggestedPharmacyName: 'PHARMACIE DU PLATEAU',
      dutyAlreadyExists: false,
      alternatives: []
    });
    const ambiguous = toReviewLine(4, 'affiche.jpg', {
      lineIndex: 1,
      pharmacyName: 'PHARMACIE DE LA PAI',
      matchStatus: 'AMBIGUOUS',
      confidence: 0.86,
      suggestedPharmacyId: 2,
      dutyAlreadyExists: false,
      alternatives: []
    });
    expect(matched.pharmacyId).toBe(1);
    expect(ambiguous.pharmacyId).toBeNull();
    expect(matched.skip).toBeFalse();
  });
});
