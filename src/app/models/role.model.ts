export interface Role {
    id: string;
    code: string;
    name: string;
    description?: string;
    scope: RoleScope;
    level: number;
    is_system_role: boolean;
    is_assignable: boolean;
    tenant_id?: string;
    ou_id?: string;
    site_id?: string;
    created_at: string;
    updated_at: string;
  }

  export type RoleScope = 'SYSTEM' | 'TENANT' | 'OU' | 'SITE';

  export interface RoleWithPermissions extends Role {
    permissions: Permission[];
  }

  export interface Permission {
    id: string;
    code: string;
    name: string;
    description?: string;
    resource: string;
    action: string;
    created_at: string;
    updated_at: string;
  }

  export interface CreateRoleDto {
    code: string;
    name: string;
    description?: string;
    scope: RoleScope;
    tenant_id?: string;
    ou_id?: string;
    site_id?: string;
    is_assignable?: boolean;
  }

  export interface UpdateRoleDto {
    name?: string;
    description?: string;
    is_assignable?: boolean;
  }