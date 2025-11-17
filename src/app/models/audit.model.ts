export interface AuditLog {
    id: string;
    user_id?: string;
    action: string;
    resource_type: string;
    resource_id?: string;
    description?: string;
    status: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
    ip_address?: string;
    occurred_at: string;
  }