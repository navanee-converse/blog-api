import { Request, Response } from "express";
import * as userService from "../../../src/services/user.service";
import {
  userCreate,
  getCurrentUser,
  userUpdate,
  userDelete,
  login,
} from "../../../src/controllers/user.controller";
import { HttpError } from "../../../src/utils/http-error";
import { sendResponse } from "../../../src/utils/response.util";

jest.mock("../../../src/services/user.service");
jest.mock("../../../src/utils/response.util");

describe("User Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: "user-1", email: "test@mail.com", role: "user" },
    } as unknown as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe("userCreate", () => {
    it("should create user and send response", async () => {
      const user = { id: "1", email: "test@mail.com" };
      req.body = { email: "test@mail.com", password: "123456" };

      (userService.createUser as jest.Mock).mockResolvedValue(user);

      await userCreate(req as Request, res as Response);

      expect(userService.createUser).toHaveBeenCalledWith(req.body);
      expect(sendResponse).toHaveBeenCalledWith(
        res,
        user,
        "User created successfully",
        201
      );
    });
  });

  describe("getCurrentUser", () => {
    it("should return current user", async () => {
      const user = { id: "1", email: "test@mail.com" };

      (userService.getUser as jest.Mock).mockResolvedValue(user);

      await getCurrentUser(req as Request, res as Response);

      expect(userService.getUser).toHaveBeenCalledWith((req as any).user);
      expect(sendResponse).toHaveBeenCalledWith(
        res,
        user,
        "User fetched successfully"
      );
    });
  });

  describe("userUpdate", () => {
    it("should update user", async () => {
      const user = { id: "1", name: "Updated" };
      req.body = { name: "Updated" };

      (userService.updateUser as jest.Mock).mockResolvedValue(user);

      await userUpdate(req as Request, res as Response);

      expect(userService.updateUser).toHaveBeenCalledWith(
        req.body,
        (req as any).user
      );
      expect(sendResponse).toHaveBeenCalledWith(
        res,
        user,
        "User updated successfully"
      );
    });
  });

  describe("userDelete", () => {
    it("should delete user", async () => {
      (userService.deleteUser as jest.Mock).mockResolvedValue(true);

      await userDelete(req as Request, res as Response);

      expect(userService.deleteUser).toHaveBeenCalledWith((req as any).user);
      expect(sendResponse).toHaveBeenCalledWith(
        res,
        null,
        "User deleted successfully"
      );
    });

    it("should throw 404 if user not found", async () => {
      (userService.deleteUser as jest.Mock).mockResolvedValue(false);

      await expect(userDelete(req as Request, res as Response)).rejects.toThrow(
        new HttpError(404, "User not found")
      );
    });
  });

  describe("login", () => {
    it("should login user successfully", async () => {
      const tokenResult = { token: "jwt-token" };
      req.body = { email: "test@mail.com", password: "123456" };

      (userService.loginUser as jest.Mock).mockResolvedValue(tokenResult);

      await login(req as Request, res as Response);

      expect(userService.loginUser).toHaveBeenCalledWith(
        "test@mail.com",
        "123456"
      );

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        tokenResult,
        "Login successfull"
      );
    });
  });
});
