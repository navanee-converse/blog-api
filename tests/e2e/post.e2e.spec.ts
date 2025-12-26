import request from "supertest";
import app from "../../src/main";
import { Role } from "../../src/enums/role.enum";
import "../setup/setup";
import { randomUUID } from "crypto";

describe("Post E2E Test Case", () => {
  let token: string;
  let postId: string;
  let authorId: string;
  let categoryId: string;
  let tagId: string[] = [];

  beforeAll(async () => {
    await request(app).post("/user").send({
      name: "PostUser",
      email: "newuser@gmail.com",
      password: "myPassword",
      role: Role.Admin,
    });

    const loginRes = await request(app)
      .post("/user/login")
      .send({ email: "newuser@gmail.com", password: "myPassword" });

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
        title: "New Post",
        content: "This is my new post",
        authorId,
        categoryId,
        tagId,
      });

    postId = postRes.body.data.id;
  });

  describe("Create Post", () => {
    it("should create a new post", async () => {
      const res = await request(app)
        .post("/posts")
        .set("authorization", `Bearer ${token}`)
        .send({
          title: "First Post",
          content: "This is my first post",
          authorId,
          categoryId,
          tagId,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data).toHaveProperty("id");
    });

    it("should through error when create post with same name", async () => {
      const res = await request(app)
        .post("/posts")
        .set("authorization", `Bearer ${token}`)
        .send({
          title: "First Post",
          content: "This is my first post",
          authorId,
          categoryId,
          tagId,
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBeFalsy();
      expect(res.body.message).toBe("Post with this title is already exists");
    });
  });

  describe("Get All Posts", () => {
    it("should fetch posts", async () => {
      const res = await request(app)
        .get("/posts/")
        .set("authorization", `Bearer ${token}`);        

      expect(res.status).toBe(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data.posts).toEqual(expect.any(Array));
    });
  });

  describe("Get Post By ID", () => {
    it("should fetch post by id", async () => {
      const res = await request(app)
        .get(`/posts/${postId}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data.id).toBe(postId);
    });
  });

  describe("Update Post", () => {
    it("should update post", async () => {
      const res = await request(app)
        .put(`/posts/${postId}`)
        .set("authorization", `Bearer ${token}`)
        .send({
          title: "Updated Post Title",
          content: "Updated content",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data.title).toBe("Updated Post Title");
    });

    it("should throw error when update post name by using existing name", async () => {
      const res = await request(app)
        .put(`/posts/${postId}`)
        .set("authorization", `Bearer ${token}`)
        .send({
          title: "First Post",
          content: "Updated content",
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBeFalsy();
    });

    it("should throw error when category id is invalid", async () => {
      const res = await request(app)
        .put(`/posts/${postId}`)
        .set("authorization", `Bearer ${token}`)
        .send({
          categoryId: randomUUID(),
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBeFalsy();
    });
    it("should throw unauthorized error when one author try to update others post", async () => {
      await request(app).post("/user").send({
        name: "PostUser",
        email: "invaliduser@gmail.com",
        password: "myPassword",
        role: Role.Admin,
      });

      const loginRes = await request(app)
        .post("/user/login")
        .send({ email: "invaliduser@gmail.com", password: "myPassword" });

      const invalidToken = loginRes.body.data.token;
      const res = await request(app)
        .put(`/posts/${postId}`)
        .set("authorization", `Bearer ${invalidToken}`)
        .send({
          content: "This was updated content",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBeFalsy();
    });
  });

  describe("Delete Post", () => {
    it("should delete post", async () => {
      const res = await request(app)
        .delete(`/posts/${postId}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.message).toBe("Post deleted successfully");
    });

    it("should return 404 if post already deleted", async () => {
      const res = await request(app)
        .delete(`/posts/${postId}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBeFalsy();
      expect(res.body.message).toBe("Post not found");
    });
  });
});
