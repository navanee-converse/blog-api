import { Role } from "../enums/role.enum";

export interface TokenInterface {
  id: string;
  email: string;
  role: Role;
}
