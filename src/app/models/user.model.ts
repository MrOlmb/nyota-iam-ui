export interface User {
    id: string;
    username: string;
    email: string;
    email_verified: boolean;
    first_name: string;
    last_name: string;
    middle_name?: string;
    phone?: string;
    phone_verified: boolean;
    is_active: boolean;
    status: UserStatus;
    last_login?: string;
    created_at: string;
    updated_at: string;
  }

  export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED';

  export interface CreateUserDto {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    phone?: string;
    password: string;
  }

  export interface UpdateUserDto {
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    phone?: string;
    email?: string;
  }