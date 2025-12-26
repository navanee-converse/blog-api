import request from "supertest";
import app from "../../src/main";
import { Role } from "../../src/enums/role.enum";
import { randomUUID } from "crypto";
import "../setup/setup";

describe("Category e2e test case", () => {
  let token: string;
  let categoryId: string;

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

    const categoryRes = await request(app)
      .post("/categories")
      .set("authorization", `Bearer ${token}`)
      .send({
        name: "engineering",
        description: "This name is used to categories engineering based blogs",
      });

    categoryId = categoryRes.body.data.id;
  });

  describe("Create category", () => {
    it("should create new category", async () => {
      const res = await request(app)
        .post("/categories")
        .set("authorization", `Bearer ${token}`)
        .send({
          name: "technology",
          description: "This name is used to categories tech based blogs",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data).toHaveProperty("id");
    });
  });

  describe("Get category by id", () => {
    it("should get category", async () => {
      const res = await request(app)
        .get(`/categories/${categoryId}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data.id).toBe(categoryId);
    });

    it("should throw error when category id is invalid ", async () => {
      const res = await request(app)
        .get(`/categories/${randomUUID()}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBeFalsy();
    });
  });
  describe("Get All Categories", () => {
    it("should update current user details", async () => {
      const res = await request(app)
        .get("/categories")
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data[0]).toHaveProperty("name");
    });
  });

  describe("Update category by id", () => {
    it("should update category", async () => {
      const res = await request(app)
        .put(`/categories/${categoryId}`)
        .set("authorization", `Bearer ${token}`)
        .send({ name: "learning" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data).toMatchObject({ name: "learning" });
    });

    it("should throw error when category id is invalid ", async () => {
      const res = await request(app)
        .put(`/categories/${randomUUID()}`)
        .set("authorization", `Bearer ${token}`)
        .send({ name: "learning" });

      expect(res.status).toBe(404);
      expect(res.body.success).toBeFalsy();
    });
  });

  describe("Delete category by id", () => {
    it("should delete category", async () => {
      const res = await request(app)
        .delete(`/categories/${categoryId}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBeTruthy();
    });

    it("should throw error when category id is invalid ", async () => {
      const res = await request(app)
        .delete(`/categories/${randomUUID()}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBeFalsy();
    });
  });
});
