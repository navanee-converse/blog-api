import request from "supertest";
import app from "../../src/main";
import { Role } from "../../src/enums/role.enum";
import "../setup/setup";

describe("User e2e test case", () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app).post("/user").send({
      name: "testUser",
      email: "test@gmail.com",
      password: "myPassword",
      role: Role.Admin,
    });
    const loginRes = await request(app)
      .post("/user/login")
      .send({ email: "test@gmail.com", password: "myPassword" });

    token = loginRes.body.data.token;
  });

  describe("Create user", () => {
    it("should create new user", async () => {
      const res = await request(app).post("/user").send({
        name: "testUser",
        email: "tests@gmail.com",
        password: "myPassword",
        role: Role.Admin,
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data).toHaveProperty("id");
    });
    it("should throw error when create new user using existing mail", async () => {
      const res = await request(app).post("/user").send({
        name: "newuser",
        email: "tests@gmail.com",
        password: "myPassword",
        role: Role.Admin,
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBeFalsy();
    });
  });

  describe("Fetch user", () => {
    it("should get current user data", async () => {
      const res = await request(app)
        .get("/user")
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBeTruthy();
    });
  });
  describe("Update user", () => {
    it("should update current user details", async () => {
      const res = await request(app)
        .put("/user")
        .set("authorization", `Bearer ${token}`)
        .send({ name: "newTestUser", email: "newtest@gmail.com" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data).toMatchObject({
        name: "newTestUser",
        email: "newtest@gmail.com",
      });
    });

    it("should throw error on update mail which is already present", async () => {
      const res = await request(app)
        .put("/user")
        .set("authorization", `Bearer ${token}`)
        .send({ name: "newTestUser", email: "tests@gmail.com" });

      expect(res.status).toBe(409);
      expect(res.body.success).toBeFalsy();
    });
  });

  describe("Delete user", () => {
    it("should delete current user details", async () => {
      const res = await request(app)
        .delete("/user")
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBeTruthy();
    });

    it("should through error if user not found or already deleted", async () => {
      const res = await request(app)
        .delete("/user")
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBeFalsy();
    });
  });
});
