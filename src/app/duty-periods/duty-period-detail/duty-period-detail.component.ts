import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { DutyPeriodService } from '../../services/duty-period.service';
import { DutyService } from '../../services/duty.service';
import { DutyPeriod, DutyPeriodCreateRequest } from '../../models/duty-period.model';
import { Duty, DutyCreateRequest } from '../../models/duty.model';
import { DutyVerificationDialogComponent } from '../duty-verification-dialog/duty-verification-dialog.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-duty-period-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatChipsModule,
    MatDialogModule,
    MatTableModule,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './duty-period-detail.component.html',
  styleUrl: './duty-period-detail.component.css'
})
export class DutyPeriodDetailComponent implements OnInit {
  periodForm: FormGroup;
  period?: DutyPeriod;
  periodId?: number;
  isNewPeriod = false;
  isLoading = false;
  isSubmitting = false;
  isProcessing = false;
  
  // Fichiers uploadés
  uploadedFiles: File[] = [];
  uploadedExcelFile: File | null = null;
  duties: Duty[] = [];
  verificationDuties: Duty[] = [];
  dutiesByZone: Array<{ zone: string; duties: Duty[] }> = [];
  processingDutyIds: Set<number> = new Set(); // Track which duties are being processed
  isLoadingVerification = false;
  isUploadingExcel = false;
  
  // Étapes du workflow
  currentStep = 1;
  steps = [
    { number: 1, label: 'Créer la période', completed: false },
    { number: 2, label: 'Upload des fichiers', completed: false },
    { number: 3, label: 'Traiter les fichiers', completed: false },
    { number: 4, label: 'Vérifier les données', completed: false },
    { number: 5, label: 'Activer la période', completed: false }
  ];

  constructor(
    private fb: FormBuilder,
    private dutyPeriodService: DutyPeriodService,
    private dutyService: DutyService,
    public router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.periodForm = this.fb.group({
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.periodId = +id;
      this.loadPeriod(this.periodId);
    } else {
      this.isNewPeriod = true;
      this.currentStep = 1;
    }
  }

  loadPeriod(id: number): void {
    this.isLoading = true;
    this.dutyPeriodService.getById(id).subscribe({
      next: (period) => {
        this.period = period;
        this.periodId = period.id;
        this.periodForm.patchValue({
          startDate: this.parseDate(period.startDate),
          endDate: this.parseDate(period.endDate)
        });
        
        // Charger les fichiers de la période via l'API dédiée
        this.loadDutiesForPeriod(id);
        
        this.updateSteps();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
        this.snackBar.open('Erreur lors du chargement de la période', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  loadDutiesForPeriod(periodId: number): void {
    this.dutyService.getByPeriodId(periodId).subscribe({
      next: (duties) => {
        this.duties = duties || [];
        this.updateSteps();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des fichiers:', error);
        this.duties = [];
        // Ne pas afficher d'erreur si c'est juste qu'il n'y a pas de fichiers
        if (error.status !== 404) {
          this.snackBar.open('Erreur lors du chargement des fichiers', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }

  updateSteps(): void {
    if (!this.period) return;
    
    this.steps[0].completed = !!this.period.id;
    this.steps[1].completed = this.duties.length > 0;
    this.steps[2].completed = this.duties.some(d => d.status === 'PROCESSED');
    this.steps[3].completed = this.duties.length > 0 && this.duties.some(d => d.status === 'PROCESSED');
    this.steps[4].completed = this.period.status === 'ACTIVE';

    // Déterminer l'étape actuelle seulement si on n'est pas en mode manuel
    // La navigation manuelle sera gérée par goToStep()
  }

  goToStep(stepNumber: number): void {
    if (stepNumber < 1 || stepNumber > 5) return;
    
    // L'étape 4 (vérification) est juste visuelle, aucune action n'est requise
    // L'étape 5 (activation) peut être atteinte directement depuis n'importe quelle étape
    // Permettre toujours de passer aux étapes 4 et 5, et permettre de revenir en arrière
    const stepsWithoutPrerequisites = [4, 5];
    const isFromStep4ToStep5 = this.currentStep === 4 && stepNumber === 5;
    const canSkipValidation = stepsWithoutPrerequisites.includes(stepNumber) || isFromStep4ToStep5 || stepNumber <= this.currentStep;
    
    // Vérifier les prérequis uniquement pour les étapes qui nécessitent une validation
    // et uniquement si on avance (pas si on recule)
    if (!canSkipValidation && stepNumber > this.currentStep && stepNumber > 1) {
      const previousStepCompleted = this.steps[stepNumber - 2].completed;
      if (!previousStepCompleted && stepNumber > 2) {
        this.snackBar.open('Veuillez compléter les étapes précédentes d\'abord', 'Fermer', {
          duration: 3000,
          panelClass: ['warn-snackbar']
        });
        return;
      }
    }
    
    // Recharger les données si nécessaire
    if (stepNumber === 2 && this.periodId) {
      this.loadDutiesForPeriod(this.periodId);
    } else if (stepNumber === 4 && this.periodId) {
      // Charger les duties pour la vérification
      this.loadVerificationDuties();
    }
    
    this.currentStep = stepNumber;
  }

  loadVerificationDuties(): void {
    if (!this.periodId) return;

    this.isLoadingVerification = true;
    this.dutyService.getDutiesByPeriod(this.periodId).subscribe({
      next: (duties) => {
        this.verificationDuties = duties || [];
        // Debug: afficher les statuts pour vérifier
        console.log('Duties chargées avec statuts:', this.verificationDuties.map(d => ({ id: d.id, status: d.status, pharmacyName: d.pharmacyName })));
        this.groupDutiesByZone();
        this.isLoadingVerification = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des duties:', error);
        this.verificationDuties = [];
        this.dutiesByZone = [];
        this.isLoadingVerification = false;
        if (error.status !== 404) {
          this.snackBar.open('Erreur lors du chargement des gardes', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }

  groupDutiesByZone(): void {
    // Grouper les duties par zone (utiliser pharmacyZone du modèle traité)
    const zoneMap = new Map<string, Duty[]>();
    
    this.verificationDuties.forEach(duty => {
      // Utiliser pharmacyZone pour les duties traitées, sinon zone ou zoneName pour les fichiers
      const zone = duty.pharmacyZone || duty.zone || duty.zoneName || 'Zone non définie';
      if (!zoneMap.has(zone)) {
        zoneMap.set(zone, []);
      }
      zoneMap.get(zone)!.push(duty);
    });

    // Convertir en tableau et trier par ordre alphabétique de zone
    this.dutiesByZone = Array.from(zoneMap.entries())
      .map(([zone, duties]) => ({
        zone,
        duties: duties.sort((a, b) => {
          // Utiliser pharmacyName pour les duties traitées, sinon name ou fileName pour les fichiers
          const nameA = (a.pharmacyName || a.name || a.dutyFileName || a.fileName || '').toLowerCase();
          const nameB = (b.pharmacyName || b.name || b.dutyFileName || b.fileName || '').toLowerCase();
          return nameA.localeCompare(nameB);
        })
      }))
      .sort((a, b) => a.zone.localeCompare(b.zone));
  }

  createPeriod(): void {
    if (this.periodForm.valid) {
      this.isSubmitting = true;
      const formValue = this.periodForm.value;
      const periodData: DutyPeriodCreateRequest = {
        startDate: this.formatDate(formValue.startDate),
        endDate: this.formatDate(formValue.endDate)
      };

      this.dutyPeriodService.create(periodData).subscribe({
        next: (period) => {
          this.period = period;
          this.periodId = period.id;
          this.isNewPeriod = false;
          this.steps[0].completed = true;
          this.currentStep = 2;
          this.snackBar.open('Période créée avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.snackBar.open('Erreur lors de la création de la période', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isSubmitting = false;
        }
      });
    } else {
      this.periodForm.markAllAsTouched();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
      const allowedExtensions = ['.pdf', '.jpg', '.jpeg'];
      
      Array.from(input.files).forEach(file => {
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const isValidType = allowedTypes.includes(file.type) || 
                           allowedExtensions.includes(fileExtension);
        
        if (isValidType) {
          this.uploadedFiles.push(file);
        } else {
          this.snackBar.open(`Le fichier "${file.name}" n'est pas un PDF ou JPEG valide`, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
      
      // Réinitialiser l'input pour permettre de sélectionner le même fichier à nouveau
      if (input) {
        input.value = '';
      }
    }
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  onExcelFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validation : seulement Excel
      const fileExtension = file.name.toLowerCase().split('.').pop();
      const fileType = file.type.toLowerCase();
      
      const isValid = 
        fileExtension === 'xlsx' || 
        fileExtension === 'xls' ||
        fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        fileType === 'application/vnd.ms-excel';
      
      if (isValid) {
        this.uploadedExcelFile = file;
      } else {
        this.snackBar.open(
          'Fichier invalide. Seuls les fichiers Excel (.xlsx, .xls) sont acceptés.',
          'Fermer',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
        input.value = '';
      }
    }
  }

  uploadExcelFile(): void {
    if (!this.uploadedExcelFile || !this.periodId) {
      this.snackBar.open('Veuillez sélectionner un fichier Excel et créer une période d\'abord', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isUploadingExcel = true;
    this.dutyService.uploadExcel(this.uploadedExcelFile, this.periodId).subscribe({
      next: () => {
        this.snackBar.open('Fichier Excel uploadé avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.uploadedExcelFile = null;
        this.isUploadingExcel = false;
        // Recharger les duties pour voir les nouvelles données
        if (this.periodId) {
          this.loadDutiesForPeriod(this.periodId);
        }
      },
      error: (error) => {
        console.error('Erreur lors de l\'upload du fichier Excel:', error);
        this.snackBar.open('Erreur lors de l\'upload du fichier Excel', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isUploadingExcel = false;
      }
    });
  }

  uploadFiles(): void {
    if (this.uploadedFiles.length === 0 || !this.periodId) {
      this.snackBar.open('Veuillez sélectionner au moins un fichier', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isProcessing = true;
    const filesToUpload = [...this.uploadedFiles];

    // Upload multiple avec la méthode dédiée
    this.dutyService.uploadMultiple(filesToUpload, this.periodId).subscribe({
      next: (duties) => {
        this.snackBar.open(`${filesToUpload.length} fichier(s) uploadé(s) avec succès`, 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Recharger les fichiers pour afficher les nouveaux fichiers
        setTimeout(() => {
          if (this.periodId) {
            this.loadDutiesForPeriod(this.periodId);
          }
          this.steps[1].completed = true;
          // Ne pas passer automatiquement, laisser l'utilisateur voir les fichiers d'abord
        }, 500);
        
        this.uploadedFiles = [];
        this.isProcessing = false;
      },
      error: (error) => {
        console.error('Erreur lors de l\'upload:', error);
        this.snackBar.open('Erreur lors de l\'upload des fichiers', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isProcessing = false;
      }
    });
  }

  processFiles(): void {
    if (!this.periodId) {
      this.snackBar.open('Période non trouvée', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Charger les duties de la période avant de traiter
    this.dutyService.getByPeriodId(this.periodId).subscribe({
      next: (allDuties) => {
        const pendingDuties = allDuties.filter(d => d.status === 'PENDING' || !d.status);
        
        if (pendingDuties.length === 0) {
          this.snackBar.open('Aucun fichier à traiter', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          return;
        }

        this.isProcessing = true;
        const processRequest = {
          startDate: this.period!.startDate,
          endDate: this.period!.endDate
        };

        let processedCount = 0;
        const totalDuties = pendingDuties.length;

        pendingDuties.forEach(duty => {
          this.dutyService.process(duty.id!, processRequest).subscribe({
            next: () => {
              processedCount++;
              if (processedCount === totalDuties) {
                this.steps[2].completed = true;
                this.currentStep = 4;
                this.snackBar.open('Tous les fichiers ont été traités', 'Fermer', {
                  duration: 3000,
                  panelClass: ['success-snackbar']
                });
                // Recharger les fichiers pour voir les statuts mis à jour
                if (this.periodId) {
                  this.loadDutiesForPeriod(this.periodId);
                  // Charger aussi les données pour la vérification
                  this.loadVerificationDuties();
                }
                this.isProcessing = false;
              }
            },
            error: (error) => {
              console.error('Erreur lors du traitement:', error);
              this.snackBar.open(`Erreur lors du traitement du fichier`, 'Fermer', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
              this.isProcessing = false;
            }
          });
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement des duties:', error);
        this.snackBar.open('Erreur lors du chargement des fichiers', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  verifyData(): void {
    if (!this.periodId) return;

    this.dutyPeriodService.getById(this.periodId).subscribe({
      next: (period) => {
        this.duties = period.duties || [];
        const dialogRef = this.dialog.open(DutyVerificationDialogComponent, {
          width: '800px',
          data: { duties: this.duties }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result === 'clear') {
            this.clearData();
          } else if (result === 'continue') {
            this.steps[3].completed = true;
            this.currentStep = 5;
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors de la vérification:', error);
      }
    });
  }

  clearData(): void {
    if (!this.periodId) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les données de cette période ? Cette action est irréversible.')) {
      this.isProcessing = true;
      this.dutyPeriodService.clear(this.periodId).subscribe({
        next: () => {
          this.snackBar.open('Données supprimées avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.uploadedFiles = [];
          this.duties = [];
          this.steps[1].completed = false;
          this.steps[2].completed = false;
          this.steps[3].completed = false;
          this.currentStep = 2;
          if (this.periodId) {
            this.loadDutiesForPeriod(this.periodId);
          }
          this.isProcessing = false;
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression des données', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isProcessing = false;
        }
      });
    }
  }

  activatePeriod(): void {
    if (!this.periodId) return;

    if (confirm('Êtes-vous sûr de vouloir activer cette période de garde ?')) {
      this.isProcessing = true;
      this.dutyPeriodService.activate(this.periodId).subscribe({
        next: () => {
          this.steps[4].completed = true;
          this.snackBar.open('Période activée avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          // Recharger les données de la période
          if (this.periodId) {
            this.loadPeriod(this.periodId);
          }
          this.isProcessing = false;
        },
        error: (error) => {
          console.error('Erreur lors de l\'activation:', error);
          this.snackBar.open('Erreur lors de l\'activation de la période', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isProcessing = false;
        }
      });
    }
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  parseDate(dateString: string): Date {
    return new Date(dateString);
  }

  formatDateDisplay(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  }

  getStatusLabel(status?: string): string {
    const labels: { [key: string]: string } = {
      'DRAFT': 'Brouillon',
      'PROCESSING': 'En traitement',
      'PROCESSED': 'Traité',
      'ACTIVE': 'Active',
      'COMPLETED': 'Terminée'
    };
    return labels[status || ''] || status || 'Brouillon';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getPendingDutiesCount(): number {
    return this.duties.filter(d => d.status === 'PENDING' || !d.status).length;
  }

  getDutyStatusLabel(status?: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'En attente',
      'PROCESSED': 'Traité',
      'FAILED': 'Échec',
      'ACTIVE': 'Actif',
      'TO_VERIFY': 'À vérifier',
      'DISABLE': 'Désactivé'
    };
    return labels[status || ''] || status || 'En attente';
  }

  getDutyStatusColor(status?: string): string {
    switch (status) {
      case 'PENDING':
        return 'warn';
      case 'PROCESSED':
        return 'primary';
      case 'FAILED':
        return 'warn';
      case 'ACTIVE':
        return 'primary';
      case 'TO_VERIFY':
        return 'accent';
      case 'DISABLE':
        return 'warn';
      default:
        return 'warn';
    }
  }

  getDutyVerificationStatusLabel(status?: string): string {
    const labels: { [key: string]: string } = {
      'ACTIVE': 'Actif',
      'TO_VERIFY': 'À vérifier',
      'DISABLED': 'Désactivé',
      'DISABLE': 'Désactivé' // Compatibilité
    };
    return labels[status || ''] || status || 'Non défini';
  }

  getDutyVerificationStatusColor(status?: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'primary';
      case 'TO_VERIFY':
        return 'accent';
      case 'DISABLED':
      case 'DISABLE': // Compatibilité
        return 'warn';
      default:
        return '';
    }
  }

  disableDuty(duty: Duty): void {
    if (!duty.id) {
      this.snackBar.open('Impossible de désactiver cette garde', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Vérifier que le statut permet la désactivation
    if (duty.status !== 'ACTIVE' && duty.status !== 'TO_VERIFY') {
      this.snackBar.open('Cette garde ne peut pas être désactivée', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const pharmacyName = duty.pharmacyName || duty.name || 'cette garde';
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Désactiver la garde',
        message: `Êtes-vous sûr de vouloir désactiver la garde de "${pharmacyName}" ?`,
        confirmText: 'Désactiver',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dutyService.disableDuty(duty.id!).subscribe({
          next: () => {
            this.snackBar.open('Garde désactivée avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            // Recharger les gardes pour mettre à jour le statut
            if (this.periodId) {
              this.loadVerificationDuties();
            }
          },
          error: (error) => {
            console.error('Erreur lors de la désactivation:', error);
            this.snackBar.open('Erreur lors de la désactivation de la garde', 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  enableDuty(duty: Duty): void {
    if (!duty.id) {
      this.snackBar.open('Impossible de réactiver cette garde', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Vérifier que le statut permet la réactivation
    if (duty.status !== 'DISABLED') {
      this.snackBar.open('Cette garde ne peut pas être réactivée', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const pharmacyName = duty.pharmacyName || duty.name || 'cette garde';
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Réactiver la garde',
        message: `Êtes-vous sûr de vouloir réactiver la garde de "${pharmacyName}" ?`,
        confirmText: 'Réactiver',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dutyService.enableDuty(duty.id!).subscribe({
          next: () => {
            this.snackBar.open('Garde réactivée avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            // Recharger les gardes pour mettre à jour le statut
            if (this.periodId) {
              this.loadVerificationDuties();
            }
          },
          error: (error) => {
            console.error('Erreur lors de la réactivation:', error);
            this.snackBar.open('Erreur lors de la réactivation de la garde', 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  deleteDuty(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      this.dutyService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Fichier supprimé avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          // Recharger les fichiers de la période
          if (this.periodId) {
            this.loadDutiesForPeriod(this.periodId);
          }
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression du fichier', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  viewDuties(): void {
    const processedDuties = this.duties.filter(d => d.status === 'PROCESSED');
    if (processedDuties.length > 0) {
      const dialogRef = this.dialog.open(DutyVerificationDialogComponent, {
        width: '800px',
        data: { duties: processedDuties }
      });
    } else {
      this.snackBar.open('Aucune garde traitée pour le moment', 'Fermer', {
        duration: 3000,
        panelClass: ['warn-snackbar']
      });
    }
  }

  hasProcessedDuties(): boolean {
    return this.duties.length > 0 && this.duties.some(d => d.status === 'PROCESSED');
  }

  processSingleDuty(duty: Duty): void {
    if (!this.periodId || !duty.id) {
      this.snackBar.open('Impossible de traiter ce fichier', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!this.period) {
      this.snackBar.open('Période non trouvée', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const dutyId = duty.id; // Stocker l'ID dans une variable locale
    const fileName = duty.fileName || 'sans nom';

    const processRequest = {
      startDate: this.period.startDate,
      endDate: this.period.endDate
    };

    // Marquer ce duty comme en cours de traitement
    this.processingDutyIds.add(dutyId);

    this.dutyService.process(dutyId, processRequest).subscribe({
      next: () => {
        this.processingDutyIds.delete(dutyId);
        this.snackBar.open(`Fichier "${fileName}" traité avec succès`, 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Recharger les fichiers pour voir le statut mis à jour
        if (this.periodId) {
          this.loadDutiesForPeriod(this.periodId);
        }
        
        // Mettre à jour les étapes
        this.updateSteps();
      },
      error: (error) => {
        this.processingDutyIds.delete(dutyId);
        console.error('Erreur lors du traitement:', error);
        this.snackBar.open(`Erreur lors du traitement du fichier "${fileName}"`, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  isDutyPending(duty: Duty): boolean {
    return duty.status === 'PENDING' || !duty.status;
  }

  isProcessingDuty(dutyId?: number): boolean {
    if (!dutyId) return false;
    return this.processingDutyIds.has(dutyId);
  }
}
