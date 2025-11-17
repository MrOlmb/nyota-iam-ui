import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditService } from '../../services/audit.service';
import { AuditLog } from '../../models/audit.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { format } from 'date-fns';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, PaginationComponent],
  templateUrl: './audit.component.html'
})
export class AuditComponent implements OnInit {
  logs: AuditLog[] = [];
  isLoading: boolean = true;
  
  currentPage: number = 1;
  totalPages: number = 1;
  hasNext: boolean = false;
  hasPrev: boolean = false;

  constructor(private auditService: AuditService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(page: number = 1): void {
    this.isLoading = true;
    this.auditService.getAuditLogs(page, 20).subscribe({
      next: (response) => {
        this.logs = response.data;
        this.currentPage = response.meta.page;
        this.totalPages = response.meta.total_pages;
        this.hasNext = response.meta.has_next;
        this.hasPrev = response.meta.has_prev;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading audit logs', error);
        this.isLoading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.loadLogs(page);
  }

  formatDateTime(date: string): string {
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'SUCCESS': 'bg-green-100 text-green-800',
      'FAILURE': 'bg-red-100 text-red-800',
      'PARTIAL': 'bg-yellow-100 text-yellow-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }
}