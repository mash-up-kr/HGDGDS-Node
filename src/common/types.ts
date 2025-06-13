import { UserRole } from './enums/user-role';

export type JwtPayload = {
  id: number;
  role: UserRole;
};
