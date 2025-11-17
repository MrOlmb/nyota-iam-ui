import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuditLog } from '../models/audit.model';
import { PaginatedResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private apiUrl = `${environment.apiUrl}${environment.apiPrefix}/audit/logs`;

  constructor(private http: HttpClient) {}

  getAuditLogs(page: number = 1, perPage: number = 20): Observable<PaginatedResponse<AuditLog>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<PaginatedResponse<AuditLog>>(this.apiUrl, { params });
  }
}