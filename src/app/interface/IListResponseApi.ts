export interface IListResponseApi<T> {
  data: T[];
  statusCode?: number;
  status?: string;
}
