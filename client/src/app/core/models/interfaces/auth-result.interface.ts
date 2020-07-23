export interface IAuthResult {
  accessToken: string;
  idToken: string;
  expiresIn: number;
  expiresAt?: number;
  profile?: any;
}
