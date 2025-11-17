import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Role, RoleWithPermissions, CreateRoleDto, UpdateRoleDto } from '../models/role.model';
import { ApiResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}${environment.apiPrefix}/roles`;

  constructor(private http: HttpClient) {}

  getRoles(scope?: string): Observable<ApiResponse<Role[]>> {
    let params = new HttpParams();
    if (scope) {
      params = params.set('scope', scope);
    }
    return this.http.get<ApiResponse<Role[]>>(this.apiUrl, { params });
  }

  getRole(id: string): Observable<ApiResponse<RoleWithPermissions>> {
    return this.http.get<ApiResponse<RoleWithPermissions>>(`${this.apiUrl}/${id}`);
  }

  createRole(data: CreateRoleDto): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>(this.apiUrl, data);
  }

  updateRole(id: string, data: UpdateRoleDto): Observable<ApiResponse<Role>> {
    return this.http.put<ApiResponse<Role>>(`${this.apiUrl}/${id}`, data);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignPermissions(roleId: string, permissionIds: string[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${roleId}/permissions`, { permission_ids: permissionIds });
  }

  removePermission(roleId: string, permissionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${roleId}/permissions/${permissionId}`);
  }
}