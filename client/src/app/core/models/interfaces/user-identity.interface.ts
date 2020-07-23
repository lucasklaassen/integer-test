export interface IUserIdentity {
  user_id: string;
  // below properties are optional
  connection?: string;
  isSocial?: boolean;
  provider?: string;
}
