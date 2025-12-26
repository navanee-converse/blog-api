import { User } from "../models/user.entity";
import bcrypt from "bcrypt";
import { CreateUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { generateToken } from "../utils/jwt";
import { TokenInterface } from "../dtos/jwt-payload.dto";
import { AppDataSource } from "../database/data-source";
import { HttpError } from "../utils/http-error";
import { Not } from "typeorm";

const dataSource = AppDataSource;
const userRepo = dataSource.getRepository(User);

export async function createUser(userDto: CreateUserDTO) {
  const existingUser = await userRepo.findOne({
    where: { email: userDto.email },
  });
  if (existingUser) {
    throw new HttpError(409, "User with this mail is already present");
  }
  const hashedPassword = await bcrypt.hash(userDto.password, 10);
  const user = userRepo.create({ ...userDto, password: hashedPassword });
  return userRepo.save(user);
}

export const getUser = async (user: TokenInterface) => {
  const userExists = await userRepo.findOne({ where: { id: user.id } });
  if (!userExists) throw new HttpError(401, "Invalid Token");
  return userExists;
};

export const updateUser = async (dto: UpdateUserDTO, user: TokenInterface) => {
  const userPayload = await getUser(user);
  if (dto.email) {
    const mailInUse = await userRepo.findOne({
      where: { email: dto.email, id: Not(userPayload.id) },
    });
    if (mailInUse) throw new HttpError(409, "Email is already in use");
  }
  Object.assign(userPayload, dto);
  return userRepo.save(userPayload);
};

export const deleteUser = async (user: TokenInterface) => {
  const { id } = user;
  const result = await userRepo.delete(id);
  return result.affected! > 0;
};

export const loginUser = async (email: string, password: string) => {
  const user = await userRepo.findOne({
    where: { email },
    select: ["password", "name", "role", "id", "email"],
  });
  if (!user) throw new HttpError(400, "Invalid mail address");

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw new HttpError(400, "Invalid Password");

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  return { token };
};
