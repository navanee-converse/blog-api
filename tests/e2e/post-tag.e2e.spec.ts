import request from "supertest";
import app from "../../src/main";
import { Role } from "../../src/enums/role.enum";
import { randomUUID } from "crypto";
import "../setup/setup";

describe("Post-Tag E2E Test", () => {
  let token: string;
  let postId: string;
  let tagId: string[] = [];
  let postTagId: string;
  let authorId: string;
  let categoryId: string;

  beforeAll(async () => {
    await request(app).post("/user").send({
      name: "PostTagUser",
      email: "newuser@gmail.com",
      password: "password",
      role: Role.Admin,
    });

    const loginRes = await request(app)
      .post("/user/login")
      .send({ email: "newuser@gmail.com", password: "password" });

    token = loginRes.body.data.token;
    authorId = loginRes.body.data.id;

    const categoryRes = await request(app)
      .post("/categories")
      .set("authorization", `Bearer ${token}`)
      .send({
        name: "engineering",
        description: "This name is used to categories engineering based blogs",
      });
    categoryId = categoryRes.body.data.id;

    const tagResponse = await request(app)
      .post("/tags")
      .set("authorization", `Bearer ${token}`)
      .send({ name: "React" });
    tagId.push(tagResponse.body.data.id);

    const postRes = await request(app)
      .post("/posts")
      .set("authorization", `Bearer ${token}`)
      .send({
        title: "Post with tags",
        content: "Testing post-tag relation",
        authorId,
        categoryId,
        tagId,
      });

    postId = postRes.body.data.id;
  });

  describe("Assign Tag To Post", () => {
    it("should assign tag to post", async () => {
      const res = await request(app)
        .post("/post-tags")
        .set("authorization", `Bearer ${token}`)
        .send({
          postId,
          tagId: tagId[0],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data).toHaveProperty("id");

      postTagId = res.body.data.id;
    });
  });

  describe("Get Tags By Post", () => {
    it("should return tags for given post", async () => {
      const res = await request(app)
        .get(`/post-tags?postId=${postId}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data).toEqual(expect.any(Array));
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("should throw error for invalid postId", async () => {
      const res = await request(app)
        .get(`/post-tags?postId=${randomUUID()}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual("Invalid Post ID");
    });
  });

  describe("Remove Tag From Post", () => {
    it("should remove tag from post", async () => {
      const res = await request(app)
        .delete(`/post-tags/${postTagId}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.message).toBe("Tag removed from post successfully");
    });

    it("should return 404 if postTag not found", async () => {
      const res = await request(app)
        .delete(`/post-tags/${postTagId}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBeFalsy();
      expect(res.body.message).toBe("PostTag not found");
    });
  });
});
