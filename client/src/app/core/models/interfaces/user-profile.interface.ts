import { IUserIdentity } from './user-identity.interface';

export interface IUserProfile {
  email?: string;
  userId?: string;
  username?: string;
  appMetadata?: string | any[];
  blocked?: boolean;
  created_at?: Date;
  email_verified?: boolean;
  identities?: IUserIdentity[];
  multifactor?: string[];
  lastIp?: string[];
  last_login?: Date;
  logins_count?: number;
  name?: string;
  nickname?: string;
  family_name?: string;
  given_name?: string;
  phoneNumber?: string;
  phone_verified?: boolean;
  picture?: string;
  updated_at?: Date;
  user_metadata?: string | any[];
}
