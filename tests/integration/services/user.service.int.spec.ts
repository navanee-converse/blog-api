import {
  createUser,
  deleteUser,
  getUser,
  loginUser,
  updateUser,
} from "../../../src/services/user.service";
import { Role } from "../../../src/enums/role.enum";
import { HttpError } from "../../../src/utils/http-error";
import { verifyToken } from "../../../src/utils/jwt";
import { TokenInterface } from "../../../src/dtos/jwt-payload.dto";
import { User } from "../../../src/models/user.entity";
import { randomUUID } from "crypto";
import "../../setup/setup";

describe("User integration test", () => {
  describe("Create user", () => {
    const userDto = {
      email: "test@gmail.com",
      name: "testuser",
      password: "mY_password",
      role: Role.Admin,
    };
    it("should create new user in database", async () => {
      const user = await createUser(userDto);

      expect(user.id).toBeDefined();
      expect(user.email).toBe("test@gmail.com");
    });
    it("should throw error if new user try to create new account", async () => {
      await expect(createUser(userDto)).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe("Login User", () => {
    let email = "invalidmail@test.com";
    let password = "mY_psassword";
    it("should throw error on invalid mail address", async () => {
      await expect(loginUser(email, password)).rejects.toBeInstanceOf(
        HttpError
      );
    });
    it("should error on incorrect password", async () => {
      email = "test@gmail.com";
      await expect(loginUser(email, password)).rejects.toBeInstanceOf(
        HttpError
      );
    });
    it("should return token on success full login", async () => {
      password = "mY_password";
      const token = await loginUser(email, password);
      expect(token).toBeDefined();
      expect(token).toHaveProperty("token");
    });
  });

  describe("Get user", () => {
    let userPayload: TokenInterface;
    beforeAll(async () => {
      const email = "test@gmail.com";
      const password = "mY_password";
      const token = await loginUser(email, password);
      userPayload = verifyToken(token.token) as TokenInterface;
    });

    it("should get user from database", async () => {
      const user = await getUser(userPayload);

      expect(user.id).toBeDefined();
      expect(user.email).toBe("test@gmail.com");
      expect(user).toBeInstanceOf(User);
    });
    it("should throw error if user not found", async () => {
      userPayload.id = randomUUID();
      await expect(getUser(userPayload)).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe("Update user", () => {
    let userPayload: TokenInterface;
    beforeAll(async () => {
      const email = "test@gmail.com";
      const password = "mY_password";
      const token = await loginUser(email, password);
      userPayload = verifyToken(token.token) as TokenInterface;
    });

    const updateDto = {
      name: "navaneethan",
      email: "test@test.com",
    };
    it("should update user data in database", async () => {
      const user = await updateUser(updateDto, userPayload);

      expect(user.id).toBeDefined();
      expect(user.email).toBe("test@test.com");
      expect(user).toBeInstanceOf(User);
    });
  });

  describe("Delete user", () => {
    let userPayload: TokenInterface;
    beforeAll(async () => {
      const email = "test@test.com";
      const password = "mY_password";
      const token = await loginUser(email, password);
      userPayload = verifyToken(token.token) as TokenInterface;
    });
    it("should delete user data in database", async () => {
      const user = await deleteUser(userPayload);

      expect(user).toBeTruthy;
    });
  });
});
