import { Role } from "../enums/role.enum";

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
}
