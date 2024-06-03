export interface PaginatedList<T> {
  count: number;
  page: number;
  pages: number;
  data: T[];
} 