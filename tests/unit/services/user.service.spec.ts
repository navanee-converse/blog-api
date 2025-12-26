import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  loginUser,
} from "../../../src/services/user.service";
import * as dataSourceMock from "../../../src/database/data-source";
import bcrypt from "bcrypt";
import * as jwtUtil from "../../../src/utils/jwt";
import { HttpError } from "../../../src/utils/http-error";

jest.mock("../../../src/database/data-source", () => {
  const mockUserRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  return {
    AppDataSource: {
      getRepository: jest.fn(() => mockUserRepo),
    },
    mockRepoUser: mockUserRepo,
  };
});

jest.mock("bcrypt");
jest.mock("../../../src/utils/jwt", () => ({
  generateToken: jest.fn(),
}));

const { mockRepoUser } = dataSourceMock as any;

const userPayload = {
  id: "user-1",
  email: "test@mail.com",
  role: "USER",
};

describe("UserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      mockRepoUser.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_pwd");

      const createdUser = { id: "1", email: "test@mail.com" };
      mockRepoUser.create.mockReturnValue(createdUser);
      mockRepoUser.save.mockResolvedValue(createdUser);

      const result = await createUser({
        email: "test@mail.com",
        password: "123456",
      } as any);

      expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);
      expect(mockRepoUser.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });

    it("should throw error if email already exists", async () => {
      mockRepoUser.findOne.mockResolvedValue({ id: "1" });

      await expect(
        createUser({ email: "test@mail.com" } as any)
      ).rejects.toThrow(
        new HttpError(409, "User with this mail is already present")
      );
    });
  });

  describe("getUser", () => {
    it("should return user if valid token", async () => {
      mockRepoUser.findOne.mockResolvedValue(userPayload);

      const result = await getUser(userPayload as any);

      expect(result).toEqual(userPayload);
    });

    it("should throw error if user not found", async () => {
      mockRepoUser.findOne.mockResolvedValue(null);

      await expect(getUser(userPayload as any)).rejects.toThrow(
        new HttpError(401, "Invalid Token")
      );
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const existingUser = { ...userPayload, name: "Old" };

      mockRepoUser.findOne
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce(null);
      mockRepoUser.save.mockResolvedValue({
        ...existingUser,
        name: "New",
      });

      const result = await updateUser(
        { name: "New" } as any,
        userPayload as any
      );

      expect(result.name).toBe("New");
      expect(mockRepoUser.save).toHaveBeenCalled();
    });

    it("should throw error if email already in use", async () => {
      const existingUser = { ...userPayload };

      mockRepoUser.findOne
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce({ id: "other-user" });

      await expect(
        updateUser({ email: "new@mail.com" } as any, userPayload as any)
      ).rejects.toThrow(new HttpError(409, "Email is already in use"));
    });
  });

  describe("deleteUser", () => {
    it("should return true if deleted", async () => {
      mockRepoUser.delete.mockResolvedValue({ affected: 1 });

      const result = await deleteUser(userPayload as any);

      expect(result).toBe(true);
    });

    it("should return false if nothing deleted", async () => {
      mockRepoUser.delete.mockResolvedValue({ affected: 0 });

      const result = await deleteUser(userPayload as any);

      expect(result).toBe(false);
    });
  });

  describe("loginUser", () => {
    it("should return token if credentials valid", async () => {
      mockRepoUser.findOne.mockResolvedValue({
        id: "1",
        email: "test@mail.com",
        password: "hashed",
        role: "USER",
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtUtil.generateToken as jest.Mock).mockReturnValue("jwt-token");

      const result = await loginUser("test@mail.com", "123456");

      expect(result).toEqual({ token: "jwt-token" });
    });

    it("should return null if user not found", async () => {
      mockRepoUser.findOne.mockResolvedValue(null);

      await expect(loginUser("test@mail.com", "123456")).rejects.toBeInstanceOf(
        HttpError
      );
    });

    it("should return null if password invalid", async () => {
      mockRepoUser.findOne.mockResolvedValue({
        password: "hashed",
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(loginUser("test@mail.com", "wrong")).rejects.toBeInstanceOf(
        HttpError
      );
    });
  });
});
