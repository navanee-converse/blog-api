import request from "supertest";
import app from "../../src/main";
import "../setup/setup";
import { Role } from "../../src/enums/role.enum";
import { randomUUID } from "crypto";

describe("Tag E2E API", () => {
  let tagId: string;
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

    const tagResponse = await request(app)
      .post("/tags")
      .set("authorization", `Bearer ${token}`)
      .send({ name: "React" });
    tagId = tagResponse.body.data.id;
  });

  describe("Create Tag", () => {
    it("should create tag", async () => {
      const res = await request(app)
        .post("/tags")
        .set("authorization", `Bearer ${token}`)
        .send({ name: "NodeJS" });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Tag created successfully");
      expect(res.body.data).toHaveProperty("id");
    });
  });

  describe("Get All Tags", () => {
    it("should return all tags", async () => {
      const res = await request(app)
        .get("/tags")
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(expect.any(Array));
    });
  });

  describe("Get Tag by Id", () => {
    it("should return tag", async () => {
      const res = await request(app)
        .get(`/tags/${tagId}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(tagId);
    });

    it("should return 404 if not found", async () => {
      const res = await request(app)
        .get(`/tags/${randomUUID()}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBeFalsy();
    });
  });

  describe("Update Tag", () => {
    it("should update tag", async () => {
      const res = await request(app)
        .put(`/tags/${tagId}`)
        .set("authorization", `Bearer ${token}`)
        .send({ name: "ExpressJS" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Tag updated successfully");
    });
  });

  describe("Delete Tag", () => {
    it("should delete tag", async () => {
      const res = await request(app)
        .delete(`/tags/${tagId}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Tag deleted successfully");
    });

    it("should return 404 if already deleted", async () => {
      const res = await request(app)
        .delete(`/tags/${tagId}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Tag not found");
    });
  });
});
