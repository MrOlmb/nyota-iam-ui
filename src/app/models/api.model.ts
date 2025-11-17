export interface ApiResponse<T> {
    success: boolean;
    data: T;
    meta?: {
      timestamp: string;
      request_id: string;
      version: string;
    };
  }

  export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    meta: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  }