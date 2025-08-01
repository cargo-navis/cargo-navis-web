// Generic paginated response type to match API structure
export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  status: string;
}
