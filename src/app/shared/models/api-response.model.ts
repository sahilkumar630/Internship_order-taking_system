export interface ApiResponse<T> {

  responseStatus: number;

  responseCode: number;

  message: string;

  data: T;

}