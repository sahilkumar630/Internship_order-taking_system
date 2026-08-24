import { User } from './user.model';


export interface LoginData {

  user: User;

  token: string;

  refreshToken: string;

}


export interface LoginResponse {

  responseStatus: number;

  responseCode: number;

  message: string;

  data: LoginData;

}