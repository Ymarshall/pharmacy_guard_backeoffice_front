import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  clients: Client[] = [];
  dataSource = new MatTableDataSource<Client>([]);
  isLoading = false;
  searchTerm = '';
  
  displayedColumns: string[] = ['name', 'email', 'phone', 'providerType', 'status', 'createdAt', 'actions'];
  
  // Pagination settings
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50, 100];

  constructor(
    private clientService: ClientService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    this.clientService.getAll().subscribe({
      next: (clients) => {
        this.clients = clients || [];
        this.dataSource.data = this.clients;
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des clients:', error);
        this.snackBar.open('Erreur lors du chargement des clients', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  onSearch(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
    
    // Configuration du filtre personnalisé
    this.dataSource.filterPredicate = (data: Client, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        data.firstName?.toLowerCase().includes(searchStr) ||
        data.lastName?.toLowerCase().includes(searchStr) ||
        data.email?.toLowerCase().includes(searchStr) ||
        data.phone?.toLowerCase().includes(searchStr) ||
        false
      );
    };
    
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  toggleClientStatus(client: Client): void {
    if (!client.id) {
      this.snackBar.open('Impossible de modifier le statut de ce client', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const newStatus = !client.isActive;
    const action = newStatus ? 'activer' : 'désactiver';
    
    if (confirm(`Êtes-vous sûr de vouloir ${action} ce client ?`)) {
      // Utiliser l'API de mise à jour du statut uniquement
      this.clientService.updateStatus(client.id, { isActive: newStatus }).subscribe({
        next: (updatedClient) => {
          const index = this.clients.findIndex(c => c.id === client.id);
          if (index !== -1) {
            this.clients[index] = updatedClient;
          }
          // Mettre à jour la source de données
          this.dataSource.data = [...this.clients];
          this.snackBar.open(`Client ${action} avec succès`, 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du statut:', error);
          this.snackBar.open(`Erreur lors de la ${action} du client`, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  activateClient(client: Client): void {
    if (!client.id) {
      this.snackBar.open('Impossible d\'activer ce client', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir activer ce client ?`)) {
      this.clientService.activate(client.id).subscribe({
        next: (updatedClient) => {
          const index = this.clients.findIndex(c => c.id === client.id);
          if (index !== -1) {
            this.clients[index] = updatedClient;
          }
          // Mettre à jour la source de données
          this.dataSource.data = [...this.clients];
          this.snackBar.open('Client activé avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Erreur lors de l\'activation:', error);
          this.snackBar.open('Erreur lors de l\'activation du client', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  deactivateClient(client: Client): void {
    if (!client.id) {
      this.snackBar.open('Impossible de désactiver ce client', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir désactiver ce client ?`)) {
      this.clientService.deactivate(client.id).subscribe({
        next: (updatedClient) => {
          const index = this.clients.findIndex(c => c.id === client.id);
          if (index !== -1) {
            this.clients[index] = updatedClient;
          }
          // Mettre à jour la source de données
          this.dataSource.data = [...this.clients];
          this.snackBar.open('Client désactivé avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Erreur lors de la désactivation:', error);
          this.snackBar.open('Erreur lors de la désactivation du client', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  getClientFullName(client: Client): string {
    return `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'N/A';
  }

  getProviderTypeLabel(providerType?: string): string {
    const labels: { [key: string]: string } = {
      'EMAIL': 'Email',
      'GOOGLE': 'Google',
      'FACEBOOK': 'Facebook',
      'APPLE': 'Apple'
    };
    return labels[providerType || ''] || providerType || 'N/A';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
