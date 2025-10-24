export enum Mode {
  Encode = 'encode',
  Decode = 'decode',
}

export type UserRole = 'sender' | 'receiver';

export interface User {
  username: string;
  password: string;
  role: UserRole;
}
