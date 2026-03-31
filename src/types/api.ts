export interface ApiMessageResponse {
  success: boolean;
  message: string;
}

export interface ApiErrorResponse extends ApiMessageResponse {
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export interface ApiResponse<T> extends ApiMessageResponse {
  data?: T;
}
