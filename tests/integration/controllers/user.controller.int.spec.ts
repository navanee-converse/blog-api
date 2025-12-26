import { Request, Response } from "express";
import {
  getCurrentUser,
  login,
  userCreate,
  userDelete,
  userUpdate,
} from "../../../src/controllers/user.controller";
import * as bcrypt from "bcrypt";
import { sendResponse } from "../../../src/utils/response.util";
import { AppDataSource } from "../../../src/database/data-source";
import { User } from "../../../src/models/user.entity";
import "../../setup/setup";
import { Role } from "../../../src/enums/role.enum";
import { TokenInterface } from "../../../src/dtos/jwt-payload.dto";
import { randomUUID } from "crypto";

jest.mock("../../../src/utils/response.util", () => ({
  sendResponse: jest.fn(),
}));

describe("User Controller Service Integration Test", () => {
  let req: Partial<Request> & { user?: TokenInterface };
  let res: Partial<Response>;

  beforeEach(async () => {
    req = { body: {}, params: {} } as Request;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();

    await AppDataSource.getRepository(User)
      .createQueryBuilder()
      .delete()
      .execute();
  });

  describe("Create User", () => {
    const userDto = {
      name: "test user",
      email: "test@gmail.com",
      password: "password",
      role: Role.Admin,
    };
    it("should create user", async () => {
      req.body = userDto;
      await userCreate(req as Request, res as Response);

      const users = await AppDataSource.getRepository(User).find();
      expect(users.length).toBe(1);
      expect(users[0].name).toBe("test user");

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.objectContaining({ email: "test@gmail.com" }),
        "User created successfully",
        201
      );
    });
    it("should throw error when user create new account with existing email", async () => {
      const user = await AppDataSource.getRepository(User).save(userDto);
      req.body = userDto;
      await expect(userCreate(req as Request, res as Response)).rejects.toThrow(
        "User with this mail is already present"
      );
    });
  });

  describe("Get User", () => {
    const userDto = {
      name: "test user",
      email: "test@gmail.com",
      password: "password",
      role: Role.Admin,
    };
    it("should fetch user", async () => {
      const user = await AppDataSource.getRepository(User).save(userDto);

      req.user = { id: user.id, email: user.email, role: user.role };
      await getCurrentUser(req as Request, res as Response);

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.objectContaining({ email: "test@gmail.com" }),
        "User fetched successfully"
      );
    });
  });

  describe("Update User", () => {
    const userDto = {
      name: "test user",
      email: "test@gmail.com",
      password: "password",
      role: Role.Admin,
    };
    const newUser = {
      name: "test user",
      email: "newuser@gmail.com",
      password: "password",
      role: Role.Admin,
    };
    it("should update user", async () => {
      const user = await AppDataSource.getRepository(User).save(userDto);

      req.user = { id: user.id, email: user.email, role: user.role };
      req.body = { name: "updated user" };
      await userUpdate(req as Request, res as Response);

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.objectContaining({ name: "updated user" }),
        "User updated successfully"
      );
    });
    it("should throw error when user try to update existing email", async () => {
      const user = await AppDataSource.getRepository(User).save(userDto);
      await AppDataSource.getRepository(User).save(newUser);

      req.user = { id: user.id, email: user.email, role: user.role };
      req.body = { name: "updated user", email: "newuser@gmail.com" };
      await expect(userUpdate(req as Request, res as Response)).rejects.toThrow(
        "Email is already in use"
      );
    });
  });

  describe("Delete User", () => {
    const userDto = {
      name: "test user",
      email: "test@gmail.com",
      password: "password",
      role: Role.Admin,
    };
    it("should delete user", async () => {
      const user = await AppDataSource.getRepository(User).save(userDto);

      req.user = { id: user.id, email: user.email, role: user.role };
      await userDelete(req as Request, res as Response);

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        null,
        "User deleted successfully"
      );
    });
    it("should throw error when user is already deleted", async () => {
      req.user = {
        id: randomUUID(),
        email: "user@gmail.com",
        role: Role.Admin,
      };
      await expect(userDelete(req as Request, res as Response)).rejects.toThrow(
        "User not found"
      );
    });
  });

  describe("Login User", () => {
    const userDto = {
      name: "test user",
      email: "test@gmail.com",
      password: "password",
      role: Role.Admin,
    };
    it("should allow user login", async () => {
      userDto.password = await bcrypt.hash(userDto.password, 10);
      const user = await AppDataSource.getRepository(User).save(userDto);

      req.body = { email: user.email, password: "password" };
      await login(req as Request, res as Response);

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.objectContaining({ token: expect.any(String) }),
        "Login successfull"
      );
    });
  });
});
